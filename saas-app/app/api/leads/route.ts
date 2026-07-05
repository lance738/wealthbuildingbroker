import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { score } from "@/lib/scoring/engine";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/leads
 * Body: { name: string, email: string, answers: number[] }
 * Saves the lead + score snapshot, emails the personalized report via Resend.
 */
export async function POST(req: NextRequest) {
  const { name, email, answers } = await req.json();
  if (!email || !Array.isArray(answers)) {
    return NextResponse.json({ error: "email and answers required" }, { status: 400 });
  }

  const result = score(answers);
  const db = supabaseAdmin();

  const { data: lead, error: leadErr } = await db
    .from("leads")
    .upsert({ email, name, source: "scorecard" }, { onConflict: "email" })
    .select()
    .single();
  if (leadErr) return NextResponse.json({ error: leadErr.message }, { status: 500 });

  await db.from("score_snapshots").insert({
    lead_id: lead.id,
    total: result.total,
    tier: result.tier,
    pillars: result.pillars,
    answers,
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.REPORT_FROM_EMAIL!,
    to: email,
    subject: `Your Financial Strength Score: ${result.total}/100 (${result.tierLabel})`,
    html: reportHtml(name, result),
  });

  return NextResponse.json({ ok: true, total: result.total, tier: result.tier });
}

function reportHtml(name: string, r: ReturnType<typeof score>): string {
  const pillarRows = Object.entries(r.pillars)
    .map(([p, s]) => `<tr><td style="padding:6px 12px">${p}</td><td style="padding:6px 12px"><strong>${s}/25</strong></td></tr>`)
    .join("");
  const moves = r.moves.map((m) => `<li style="margin-bottom:10px">${m}</li>`).join("");
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a2332">
      <h1 style="color:#12203a">Your Financial Strength Report</h1>
      <p>Hi ${name || "there"},</p>
      <p>You scored <strong>${r.total}/100 — ${r.tierLabel}</strong>.</p>
      <p>${r.tierMessage}</p>
      <h3>Pillar breakdown</h3>
      <table style="border-collapse:collapse;background:#f6f8fb;border-radius:8px">${pillarRows}</table>
      <h3>Your top 3 moves</h3>
      <ol>${moves}</ol>
      <h3>${r.recommendation.headline}</h3>
      <p>${r.recommendation.body}</p>
      <p><a href="https://www.wealthbuildingbroker.com/${r.recommendation.product}.html">See it here →</a></p>
      <p style="font-size:12px;color:#8a94a6;margin-top:32px">
        Lance Hulsey · California Real Estate Broker · DRE# 01724888<br>
        Informational and educational only — not tax, legal, or investment advice.
      </p>
    </div>`;
}

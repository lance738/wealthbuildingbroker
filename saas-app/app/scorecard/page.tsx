"use client";

import { useState } from "react";
import { QUESTIONS } from "@/lib/scoring/questions";
import { score } from "@/lib/scoring/engine";
import type { ScoreResult } from "@/lib/scoring/types";

/**
 * Free public Scorecard — no auth. Same engine the paid Dashboard uses.
 * On submit, posts the lead to /api/leads which saves to Supabase and
 * emails the report via Resend.
 */
export default function ScorecardPage() {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);

  const q = QUESTIONS[current];

  function select(i: number) {
    const next = [...answers];
    next[current] = i;
    setAnswers(next);
  }

  function nextQ() {
    if (answers[current] === null) return;
    if (current === QUESTIONS.length - 1) {
      setResult(score(answers as number[]));
    } else {
      setCurrent(current + 1);
    }
  }

  async function sendReport(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, answers }),
    });
    setSent(true);
  }

  const box: React.CSSProperties = { maxWidth: 680, margin: "60px auto", padding: "0 24px" };

  if (result) {
    return (
      <main style={box}>
        <h1>
          {result.total}/100 — {result.tierLabel}
        </h1>
        <p>{result.tierMessage}</p>
        <h3>Pillar breakdown</h3>
        <ul>
          {Object.entries(result.pillars).map(([p, s]) => (
            <li key={p}>
              {p}: <strong>{s}/25</strong>
            </li>
          ))}
        </ul>
        <h3>Your top 3 moves</h3>
        <ol>
          {result.moves.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ol>
        <h3>{result.recommendation.headline}</h3>
        <p>{result.recommendation.body}</p>
        {sent ? (
          <p>✅ Report sent — check your inbox.</p>
        ) : (
          <form onSubmit={sendReport} style={{ display: "grid", gap: 12, maxWidth: 380 }}>
            <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit">Send me the full report →</button>
          </form>
        )}
      </main>
    );
  }

  return (
    <main style={box}>
      <p style={{ color: "#8a94a6" }}>
        {q.pillar} · {current + 1} of {QUESTIONS.length}
      </p>
      <h2>{q.q}</h2>
      <div style={{ display: "grid", gap: 10 }}>
        {q.options.map((o, i) => (
          <label key={i} style={{ border: "1px solid #dde3ec", borderRadius: 8, padding: "12px 16px", cursor: "pointer", background: answers[current] === i ? "#fdecec" : "#fff" }}>
            <input type="radio" name={`q${current}`} checked={answers[current] === i} onChange={() => select(i)} /> {o.t}
          </label>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
          ← Back
        </button>
        <button onClick={nextQ} disabled={answers[current] === null}>
          {current === QUESTIONS.length - 1 ? "See my score →" : "Next →"}
        </button>
      </div>
    </main>
  );
}

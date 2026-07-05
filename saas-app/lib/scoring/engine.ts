import { QUESTIONS } from "./questions";
import type { Pillar, ScoreResult, Tier } from "./types";

export const PILLARS: Pillar[] = [
  "Structure & Protection",
  "Visibility & Numbers",
  "Cash Flow & Taxes",
  "Wealth & Investing",
];

const MOVES: Record<Pillar, string> = {
  "Structure & Protection":
    "Get your entity right. If you're past ~$80K net commissions and still a sole prop, the S-corp conversation could be costing you real money every year. Separate business banking, fix commingling, and get the entity matched to your income.",
  "Visibility & Numbers":
    "Install a real P&L. Set up QuickBooks or Wave (or hire a bookkeeper) and review your numbers monthly — not annually. You can't manage what you can't see.",
  "Cash Flow & Taxes":
    "Install a commission cash-flow system. Fixed percentages from every check go to taxes/profit/owner pay/operating immediately — Profit First-style. Then get a CPA you talk to quarterly, not annually.",
  "Wealth & Investing":
    "Set a written investment net-worth target. Specific dollar, specific date. Then route a fixed percentage of every commission into investment assets. Start with one property in the next 12 months.",
};

const TIERS: Record<Tier, { label: string; message: string }> = {
  "at-risk": {
    label: "At Risk",
    message:
      "You're producing on willpower. One bad quarter or one tax bill could hurt. Start with Structure & Visibility — that's where the foundation lives.",
  },
  "earning-not-keeping": {
    label: "Earning, Not Keeping",
    message:
      "You make good money but it's leaking out. Entity structure and a real cash-flow system are your fastest wins. The next $10K of your earnings is sitting in plain sight.",
  },
  "building-wealth": {
    label: "Building Wealth",
    message:
      "Strong foundation. Time to shift from defense to offense — convert business profit into an income-producing portfolio. The MREI track is where you go next.",
  },
};

/**
 * Score a completed scorecard.
 * @param answers index of the selected option for each question, in QUESTIONS order
 */
export function score(answers: number[]): ScoreResult {
  if (answers.length !== QUESTIONS.length) {
    throw new Error(`Expected ${QUESTIONS.length} answers, got ${answers.length}`);
  }

  const raw: Record<Pillar, number> = Object.fromEntries(PILLARS.map((p) => [p, 0])) as Record<Pillar, number>;
  const max: Record<Pillar, number> = Object.fromEntries(PILLARS.map((p) => [p, 0])) as Record<Pillar, number>;

  QUESTIONS.forEach((q, i) => {
    const opt = q.options[answers[i]];
    if (!opt) throw new Error(`Invalid option index ${answers[i]} for question ${i}`);
    raw[q.pillar] += opt.v;
    max[q.pillar] += Math.max(...q.options.map((o) => o.v));
  });

  // Normalize each pillar to 25 points — identical to the static-site logic
  const pillars = Object.fromEntries(
    PILLARS.map((p) => [p, max[p] ? Math.round((raw[p] / max[p]) * 25) : 0])
  ) as Record<Pillar, number>;

  const total = PILLARS.reduce((sum, p) => sum + pillars[p], 0);
  const tier: Tier = total <= 40 ? "at-risk" : total <= 70 ? "earning-not-keeping" : "building-wealth";
  const weakestPillars = [...PILLARS].sort((a, b) => pillars[a] - pillars[b]);

  const recommendation =
    tier === "at-risk"
      ? {
          product: "toolkit" as const,
          headline: "Start with the Broker Financial Toolkit",
          body: "Your foundation needs the models: entity structure decision kit, commission cash-flow system, and quarterly tax set-aside.",
        }
      : tier === "earning-not-keeping"
        ? {
            product: "toolkit" as const,
            headline: "The Toolkit will find your leak",
            body: "The commission cash-flow model and S-corp threshold math typically recover more than the price in the first quarter. Then the Dashboard keeps it fixed automatically.",
          }
        : {
            product: "dashboard" as const,
            headline: "Track it — and go on offense",
            body: "The Dashboard re-scores you monthly so the discipline holds, and Boomerang turns your past clients into your next pipeline.",
          };

  return {
    total,
    pillars,
    tier,
    tierLabel: TIERS[tier].label,
    tierMessage: TIERS[tier].message,
    weakestPillars,
    moves: weakestPillars.slice(0, 3).map((p) => MOVES[p]),
    recommendation,
  };
}

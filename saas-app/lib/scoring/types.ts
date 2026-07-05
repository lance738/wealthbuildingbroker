export type Pillar =
  | "Structure & Protection"
  | "Visibility & Numbers"
  | "Cash Flow & Taxes"
  | "Wealth & Investing";

export interface Option {
  t: string; // option text
  v: number; // raw point value
}

export interface Question {
  pillar: Pillar;
  q: string;
  options: Option[];
}

export type Tier = "at-risk" | "earning-not-keeping" | "building-wealth";

export interface ScoreResult {
  /** 0–100 total (each pillar normalized to 25) */
  total: number;
  /** per-pillar score, each normalized to 0–25 */
  pillars: Record<Pillar, number>;
  tier: Tier;
  tierLabel: string;
  tierMessage: string;
  /** pillars ranked weakest-first */
  weakestPillars: Pillar[];
  /** top 3 recommended moves, weakest pillars first */
  moves: string[];
  /** product recommendation for this tier */
  recommendation: { product: "toolkit" | "dashboard" | "boomerang"; headline: string; body: string };
}

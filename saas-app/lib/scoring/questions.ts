import type { Question } from "./types";

/**
 * SINGLE SOURCE OF TRUTH for the Financial Strength Scorecard.
 * Ported 1:1 from the static site (scorecard.html). If you change these,
 * update the static scorecard too — or better, retire the inline copy
 * and serve this via the free /scorecard route.
 */
export const QUESTIONS: Question[] = [
  // Pillar 1 — Structure & Protection
  {
    pillar: "Structure & Protection",
    q: "What's your business entity structure today?",
    options: [
      { t: "Sole proprietor / no entity", v: 0 },
      { t: "Single-member LLC (no S-corp election)", v: 4 },
      { t: "LLC with S-corp election OR straight S-corp", v: 8 },
      { t: "S-corp with proper reasonable compensation + payroll", v: 10 },
    ],
  },
  {
    pillar: "Structure & Protection",
    q: "How separated are your business and personal finances?",
    options: [
      { t: "Same accounts. Commissions hit my personal checking.", v: 0 },
      { t: "Separate business checking, but I move money in/out casually", v: 4 },
      { t: "Dedicated business account + business credit card; some discipline", v: 7 },
      { t: "Fully separated: business banking, payroll to me as the owner, no commingling", v: 9 },
    ],
  },
  {
    pillar: "Structure & Protection",
    q: "Do you have basic liability protection (E&O + umbrella + entity)?",
    options: [
      { t: "E&O only (broker provides it). Nothing else.", v: 0 },
      { t: "E&O + personal umbrella, but no entity protection", v: 3 },
      { t: "E&O + umbrella + LLC/S-corp shield", v: 6 },
    ],
  },

  // Pillar 2 — Visibility & Numbers
  {
    pillar: "Visibility & Numbers",
    q: "Could you tell me your last 12-month NET income (after expenses) right now, within 10%?",
    options: [
      { t: "I know my gross commissions. Net? Not really.", v: 0 },
      { t: "Roughly, but I'd want to check.", v: 4 },
      { t: "Yes — I review my P&L monthly and know it within 5%.", v: 9 },
    ],
  },
  {
    pillar: "Visibility & Numbers",
    q: "How are you tracking business expenses through the year?",
    options: [
      { t: "Shoebox / I'll figure it out at tax time", v: 0 },
      { t: "Spreadsheet I update sporadically", v: 3 },
      { t: "QuickBooks/Xero/Wave with monthly categorization", v: 7 },
      { t: "Bookkeeper handles it; I review monthly", v: 9 },
    ],
  },
  {
    pillar: "Visibility & Numbers",
    q: "Do you have a real Profit & Loss statement for last year you could pull up right now?",
    options: [
      { t: "No.", v: 0 },
      { t: "My CPA prepared one for tax purposes, somewhere.", v: 3 },
      { t: "Yes, current within 30 days, I can read it.", v: 7 },
    ],
  },

  // Pillar 3 — Cash Flow & Taxes
  {
    pillar: "Cash Flow & Taxes",
    q: "When a commission check hits, what happens first?",
    options: [
      { t: "It goes into checking and gets spent on whatever's due", v: 0 },
      { t: "I move some to savings, no fixed system", v: 4 },
      { t: "Fixed percentages go to taxes/profit/owner pay/operating immediately (Profit First-style)", v: 9 },
    ],
  },
  {
    pillar: "Cash Flow & Taxes",
    q: "Are you setting tax money aside as commissions come in?",
    options: [
      { t: "I get a surprise tax bill every April.", v: 0 },
      { t: "I try to set some aside but it's inconsistent.", v: 4 },
      { t: "Fixed % goes to a dedicated tax account every commission. I pay quarterly estimates.", v: 9 },
    ],
  },
  {
    pillar: "Cash Flow & Taxes",
    q: "What's your relationship with a CPA?",
    options: [
      { t: "I file with TurboTax or H&R Block.", v: 0 },
      { t: "A CPA prepares my return once a year. No other contact.", v: 3 },
      { t: "Quarterly check-ins with a CPA who knows my business.", v: 7 },
    ],
  },

  // Pillar 4 — Wealth & Investing
  {
    pillar: "Wealth & Investing",
    q: "Do you currently own any investment real estate (not your primary)?",
    options: [
      { t: "No.", v: 0 },
      { t: "One property.", v: 5 },
      { t: "Two to five properties.", v: 8 },
      { t: "More than five.", v: 10 },
    ],
  },
  {
    pillar: "Wealth & Investing",
    q: "Do you have a specific written net-worth target with a date?",
    options: [
      { t: "No.", v: 0 },
      { t: "Vaguely in my head.", v: 3 },
      { t: "Yes, specific dollar amount and date, reviewed quarterly.", v: 8 },
    ],
  },
  {
    pillar: "Wealth & Investing",
    q: "What percentage of your business profit gets routed into investment assets each year?",
    options: [
      { t: "0% — it all gets consumed", v: 0 },
      { t: "1–10%", v: 3 },
      { t: "10–25%", v: 6 },
      { t: "25%+", v: 8 },
    ],
  },
];

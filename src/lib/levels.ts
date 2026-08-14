// ------------------------------------------------------------------
// AS vs A2.
//
// Cambridge splits each of these three syllabuses into an AS half (first
// year, assessed on the early papers) and an A Level half — the extra
// content sat in the second year, which everyone calls A2. AS content is
// assumed knowledge in the A Level papers, so A2 means "the topics you only
// meet in year two", not "everything you sit in year two".
//
// Verified against the current Cambridge syllabuses (Aug 2026):
//   Physics 9702 (2025–27): AS = topics 1–11, A Level adds 12–25.
//                           Papers 1–3 are AS, Papers 4–5 are A Level.
//   Economics 9708 (2026–28): AS = topics 1–6, A Level adds 7–11.
//                             Papers 1–2 are AS, Papers 3–4 are A Level.
//   Computer Science 9618: AS = sections 1–12, A Level adds 13–20.
//                          Papers 1–2 are AS, Papers 3–4 are A Level.
// ------------------------------------------------------------------

import type { SubjectCode } from "./questions";

export type SyllabusLevel = "AS" | "A2";

export const LEVEL_LABEL: Record<SyllabusLevel, string> = {
  AS: "AS",
  A2: "A2",
};

export const LEVEL_FULL: Record<SyllabusLevel, string> = {
  AS: "AS Level",
  A2: "A2 — the second-year content",
};

/**
 * Physics 9702. The syllabus splits cleanly: topics 1–11 are AS, everything
 * from Motion in a Circle onwards is A Level only.
 */
const PHYSICS_A2 = new Set([
  "phy-circular-motion", // 12
  "phy-gravitation", // 13
  "phy-thermal", // 14 Temperature + 16 Thermodynamics
  "phy-ideal-gases", // 15
  "phy-oscillations", // 17
  "phy-electric-fields", // 18
  "phy-capacitance", // 19
  "phy-magnetic-fields", // 20
  "phy-alternating-currents", // 21
  "phy-quantum", // 22
  "phy-nuclear", // 23
  "phy-medical", // 24
  "phy-astronomy", // 25
]);

/**
 * Economics 9708. AS is topics 1–6 (the core micro and macro plus
 * international trade); A Level adds 7–11 — theory of the firm, the labour
 * market, money and banking, and the deeper macro policy content.
 */
const ECON_A2 = new Set([
  "ec-firms-costs", // 7 Theory of the firm
  "ec-market-structure", // 7 Market structures
  "ec-labour", // 8 Labour market forces
  "ec-national-income", // 9 Circular flow and the multiplier
  "ec-money-banking", // 9 Money and banking
  "ec-inflation-unemployment", // 9 Employment / unemployment
  "ec-macro-policy", // 10 Government macro intervention
  "ec-growth-development", // 9/11 Growth, sustainability, development
  "ec-exchange-rates", // 11 Exchange rates and the balance of payments
]);

/**
 * Computer Science 9618 topic ids carry their syllabus section — `cs-14-…`
 * is section 14 — so the level falls straight out of the number: sections
 * 1–12 are AS, 13–20 are A Level.
 */
function csSectionOf(topicId: string): number | undefined {
  const n = Number(topicId.match(/^cs-(\d{2})-/)?.[1]);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * The economics diagram gallery is keyed by diagram, not by syllabus topic,
 * so it needs its own map. Only theory-of-the-firm material (topic 7) is
 * A Level; the rest is introduced at AS even where A2 goes deeper.
 */
const ECON_DIAGRAM_A2 = new Set([
  "monopoly", // 7 Market structures
  "cost-curves", // 7 Costs and revenue
  "kinked-demand", // 7 Market structures — oligopoly
  "indifference-budget", // 7 Utility and indifference curve analysis
  "lorenz-curve", // 8 Equity and redistribution of income and wealth
  "phillips-curve", // 9/10 Inflation, unemployment and macro policy
]);

export function diagramLevel(diagramId: string): SyllabusLevel {
  return ECON_DIAGRAM_A2.has(diagramId) ? "A2" : "AS";
}

/** The level a topic belongs to, or undefined for an unrecognised topic. */
export function topicLevel(topicId: string): SyllabusLevel | undefined {
  if (topicId.startsWith("phy-")) return PHYSICS_A2.has(topicId) ? "A2" : "AS";
  if (topicId.startsWith("ec-")) return ECON_A2.has(topicId) ? "A2" : "AS";
  if (topicId.startsWith("cs-")) {
    const s = csSectionOf(topicId);
    return s === undefined ? undefined : s >= 13 ? "A2" : "AS";
  }
  return undefined;
}

/**
 * The level a paper is sat at. Physics is the odd one out — its Paper 3 is
 * the AS practical, whereas Paper 3 in Economics and Computer Science is an
 * A Level paper.
 */
export function paperLevel(
  subject: SubjectCode,
  paper: string,
): SyllabusLevel | undefined {
  const n = Number(paper.match(/\b([1-5])\b/)?.[1]);
  if (!n) return undefined;
  if (subject === "9702") return n <= 3 ? "AS" : "A2";
  return n <= 2 ? "AS" : "A2";
}

/**
 * The level of a single question. An explicit level on the question wins
 * (useful for imported past papers); otherwise the topic decides, falling
 * back to the paper it came from.
 */
export function questionLevel(q: {
  level?: SyllabusLevel;
  subject: SubjectCode;
  topicId: string;
  paper: string;
}): SyllabusLevel {
  return q.level ?? topicLevel(q.topicId) ?? paperLevel(q.subject, q.paper) ?? "AS";
}

/** What the user is currently studying — drives the default filters. */
export type LevelFilter = SyllabusLevel | "both";

export function matchesLevel(level: SyllabusLevel, filter: LevelFilter): boolean {
  return filter === "both" || filter === level;
}

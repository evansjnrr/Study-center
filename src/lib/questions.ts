// ------------------------------------------------------------------
// The exam-performance engine: questions, mark schemes, attempts,
// mistake analysis and the redo schedule.
// ------------------------------------------------------------------

export type SubjectCode = "9702" | "9708" | "9618";

/** What a mark is actually awarded for — lets us show a Cambridge-style breakdown. */
export type Criterion =
  // Physics-style
  | "formula"
  | "substitution"
  | "working"
  | "unit"
  | "answer"
  // Economics assessment objectives
  | "knowledge"
  | "application"
  | "analysis"
  | "evaluation"
  | "diagram"
  // Computer Science
  | "algorithm"
  | "syntax"
  | "explanation";

export const CRITERION_LABEL: Record<Criterion, string> = {
  formula: "Formula",
  substitution: "Substitution",
  working: "Working",
  unit: "Unit",
  answer: "Final answer",
  knowledge: "Knowledge",
  application: "Application",
  analysis: "Analysis",
  evaluation: "Evaluation",
  diagram: "Diagram",
  algorithm: "Algorithm",
  syntax: "Syntax",
  explanation: "Explanation",
};

/**
 * Economics topics only exist as question-bank ids (there's no econ topic
 * dataset the way there is for physics and CS), so their display names live
 * here. Kept in this file because it has no feature-module imports.
 */
export const ECON_TOPIC_NAME: Record<string, string> = {
  "ec-basic-economic-problem": "The Basic Economic Problem",
  "ec-price-system": "The Price System",
  "ec-elasticity": "Elasticity",
  "ec-market-failure": "Market Failure",
  "ec-government-intervention": "Government Intervention",
  "ec-firms-costs": "Firms, Costs & Revenue",
  "ec-market-structure": "Market Structure",
  "ec-labour": "The Labour Market",
  "ec-national-income": "National Income & the Multiplier",
  "ec-ad-as": "Aggregate Demand & Supply",
  "ec-inflation-unemployment": "Inflation & Unemployment",
  "ec-money-banking": "Money & Banking",
  "ec-macro-policy": "Macroeconomic Policy",
  "ec-trade": "International Trade",
  "ec-exchange-rates": "Exchange Rates & the Balance of Payments",
  "ec-growth-development": "Growth & Development",
};

/** Last-resort display name for a topic id (e.g. one you imported yourself). */
export function prettifyTopicId(id: string): string {
  return (
    ECON_TOPIC_NAME[id] ??
    id
      .replace(/^(ec|cs|phy)-/, "")
      .replace(/-/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase())
  );
}

export interface MarkPoint {
  id: string;
  /** Exactly what earns this mark, in mark-scheme language. */
  text: string;
  marks: number;
  criterion: Criterion;
}

export type Difficulty = 1 | 2 | 3; // 1 = standard, 2 = harder, 3 = stretch

export interface Question {
  id: string;
  subject: SubjectCode;
  paper: string; // "Paper 2", "Paper 4"…
  topicId: string;
  subtopic?: string;
  marks: number;
  difficulty: Difficulty;
  /** Question text — may contain $LaTeX$ and **bold**. */
  stem: string;
  data?: string;
  markScheme: MarkPoint[];
  guidance?: string;
  source: "original" | "imported";
  /**
   * AS or A2. Normally left unset and derived from the topic — see
   * `questionLevel()` in lib/levels.ts. Set it explicitly only to override
   * that, e.g. on an imported past-paper question.
   *
   * Declared inline rather than importing SyllabusLevel because levels.ts
   * imports from this file.
   */
  level?: "AS" | "A2";
}

/** Why a mark was lost — the user's own diagnosis. */
export type MistakeReason =
  | "knowledge"
  | "calculation"
  | "misread"
  | "application"
  | "analysis"
  | "evaluation"
  | "structure"
  | "careless"
  | "time";

export const MISTAKE_LABEL: Record<MistakeReason, string> = {
  knowledge: "Didn't know it",
  calculation: "Calculation slip",
  misread: "Misread the question",
  application: "Couldn't apply it",
  analysis: "Weak analysis",
  evaluation: "No evaluation",
  structure: "Poor structure",
  careless: "Careless mistake",
  time: "Ran out of time",
};

export type PracticeMode = "practice" | "timed" | "exam" | "redo";

export interface QAttempt {
  id: string;
  questionId: string;
  subject: SubjectCode;
  topicId: string;
  at: number;
  marksAwarded: number;
  marksTotal: number;
  /** Which mark-scheme points were hit. */
  earnedPointIds: string[];
  mistakeReasons: MistakeReason[];
  secondsTaken?: number;
  mode: PracticeMode;
  answerText?: string;
}

/**
 * A question queued for redo. Wrong → tomorrow → 3d → 7d → 14d.
 * Getting it right once does NOT mean mastered.
 */
export interface RedoItem {
  questionId: string;
  subject: SubjectCode;
  topicId: string;
  due: number;
  stage: number; // index into REDO_STAGES
  wrongCount: number;
  correctStreak: number;
  /** True once answered correctly twice AND at least once under time pressure. */
  mastered: boolean;
  timedCorrect: boolean;
  lastAt: number;
}

const DAY = 86_400_000;
/** Wrong → redo tomorrow, then 3, 7, 14, 30 days. */
export const REDO_STAGES = [1, 3, 7, 14, 30];

export function scheduleAfterAttempt(
  prev: RedoItem | undefined,
  q: Question,
  correct: boolean,
  mode: PracticeMode,
  now = Date.now(),
): RedoItem {
  const base: RedoItem = prev ?? {
    questionId: q.id,
    subject: q.subject,
    topicId: q.topicId,
    due: now,
    stage: 0,
    wrongCount: 0,
    correctStreak: 0,
    mastered: false,
    timedCorrect: false,
    lastAt: now,
  };

  const timed = mode === "timed" || mode === "exam";

  if (!correct) {
    return {
      ...base,
      wrongCount: base.wrongCount + 1,
      correctStreak: 0,
      mastered: false,
      stage: 0,
      due: now + REDO_STAGES[0] * DAY,
      lastAt: now,
    };
  }

  const streak = base.correctStreak + 1;
  const timedCorrect = base.timedCorrect || timed;
  const stage = Math.min(base.stage + 1, REDO_STAGES.length - 1);
  // Mastery needs consistency AND proof under time pressure.
  const mastered = streak >= 2 && timedCorrect;

  return {
    ...base,
    correctStreak: streak,
    timedCorrect,
    stage,
    mastered,
    due: now + REDO_STAGES[stage] * DAY,
    lastAt: now,
  };
}

// ------------------------------------------------------------------
// Topic health — drives the weakness dashboard
// ------------------------------------------------------------------

export type TopicStatus = "untouched" | "weak" | "improving" | "mastered";

export interface TopicHealth {
  topicId: string;
  subject: SubjectCode;
  attempted: number;
  mistakes: number;
  repeatedMistakes: number;
  marksAwarded: number;
  marksTotal: number;
  accuracy: number; // 0..1
  status: TopicStatus;
}

export function computeTopicHealth(
  attempts: QAttempt[],
  redos: RedoItem[],
): TopicHealth[] {
  const byTopic = new Map<string, TopicHealth>();

  for (const a of attempts) {
    let h = byTopic.get(a.topicId);
    if (!h) {
      h = {
        topicId: a.topicId,
        subject: a.subject,
        attempted: 0,
        mistakes: 0,
        repeatedMistakes: 0,
        marksAwarded: 0,
        marksTotal: 0,
        accuracy: 0,
        status: "untouched",
      };
      byTopic.set(a.topicId, h);
    }
    h.attempted += 1;
    h.marksAwarded += a.marksAwarded;
    h.marksTotal += a.marksTotal;
    if (a.marksAwarded < a.marksTotal) h.mistakes += 1;
  }

  for (const r of redos) {
    const h = byTopic.get(r.topicId);
    if (h && r.wrongCount > 1) h.repeatedMistakes += 1;
  }

  for (const h of byTopic.values()) {
    h.accuracy = h.marksTotal ? h.marksAwarded / h.marksTotal : 0;
    const topicRedos = redos.filter((r) => r.topicId === h.topicId);
    const allMastered =
      topicRedos.length > 0 && topicRedos.every((r) => r.mastered);
    if (h.attempted === 0) h.status = "untouched";
    else if (allMastered && h.accuracy >= 0.8) h.status = "mastered";
    else if (h.accuracy < 0.6 || h.repeatedMistakes > 0) h.status = "weak";
    else h.status = "improving";
  }

  return [...byTopic.values()];
}

/** Grade boundaries are approximate — used only as a rough steer. */
export function estimateGrade(pct: number): string {
  if (pct >= 80) return "A*";
  if (pct >= 70) return "A";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 40) return "D";
  if (pct >= 30) return "E";
  return "U";
}

/** Suggested seconds for a question — Cambridge is roughly 1.1 min per mark. */
export function suggestedSeconds(q: Question): number {
  return Math.round(q.marks * 66);
}

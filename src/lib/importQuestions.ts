// ------------------------------------------------------------------
// Importing past papers you already own.
//
// The built-in bank is original Cambridge-style material. Real past papers
// are copyright, so they aren't shipped — but if you own a paper and its
// mark scheme, this turns it into practice questions on your own device.
// ------------------------------------------------------------------

import type { Criterion, Difficulty, MarkPoint, Question, SubjectCode } from "./questions";
import { CRITERION_LABEL } from "./questions";

const SUBJECTS: SubjectCode[] = ["9702", "9708", "9618"];
const CRITERIA = Object.keys(CRITERION_LABEL) as Criterion[];

export interface ImportResult {
  questions: Question[];
  /** Rows that were skipped, with the reason — shown so nothing fails silently. */
  problems: string[];
}

/** A copy-pasteable example, shown in Settings so the format is obvious. */
export const IMPORT_TEMPLATE = `[
  {
    "subject": "9702",
    "paper": "9702/22 M/J 2023 Q3",
    "topicId": "phy-kinematics",
    "marks": 4,
    "difficulty": 1,
    "stem": "A stone falls from rest... **(a)** Calculate the speed after 2.0 s. **[2]**",
    "data": "Take g = 9.81 m s^-2.",
    "guidance": "Ignore air resistance.",
    "markScheme": [
      { "text": "Uses v = u + at", "marks": 1, "criterion": "formula" },
      { "text": "v = 19.6 m s^-1", "marks": 1, "criterion": "answer" }
    ]
  }
]`;

export function parseQuestions(text: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (e: any) {
    throw new Error("That isn't valid JSON: " + (e?.message ?? "parse failed"));
  }

  const rows: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.questions)
      ? (data as any).questions
      : [];

  if (!rows.length) {
    throw new Error('Expected a JSON array of questions, or {"questions": [ … ]}.');
  }

  const questions: Question[] = [];
  const problems: string[] = [];

  rows.forEach((row, i) => {
    const label = `Question ${i + 1}`;
    const r = row as Record<string, any>;

    if (!SUBJECTS.includes(r.subject)) {
      problems.push(`${label}: subject must be one of ${SUBJECTS.join(", ")}.`);
      return;
    }
    if (typeof r.stem !== "string" || !r.stem.trim()) {
      problems.push(`${label}: missing "stem" (the question text).`);
      return;
    }
    if (typeof r.topicId !== "string" || !r.topicId.trim()) {
      problems.push(`${label}: missing "topicId".`);
      return;
    }
    if (!Array.isArray(r.markScheme) || r.markScheme.length === 0) {
      problems.push(`${label}: needs a "markScheme" with at least one point.`);
      return;
    }

    const markScheme: MarkPoint[] = [];
    let bad = false;
    r.markScheme.forEach((p: any, j: number) => {
      if (typeof p?.text !== "string" || !p.text.trim()) {
        problems.push(`${label}, mark point ${j + 1}: missing "text".`);
        bad = true;
        return;
      }
      const marks = Number(p.marks);
      if (!Number.isFinite(marks) || marks <= 0) {
        problems.push(`${label}, mark point ${j + 1}: "marks" must be a positive number.`);
        bad = true;
        return;
      }
      const criterion: Criterion = CRITERIA.includes(p.criterion) ? p.criterion : "knowledge";
      markScheme.push({ id: p.id || `m${j + 1}`, text: p.text.trim(), marks, criterion });
    });
    if (bad) return;

    const schemeTotal = markScheme.reduce((s, p) => s + p.marks, 0);
    const marks = Number.isFinite(Number(r.marks)) && Number(r.marks) > 0 ? Number(r.marks) : schemeTotal;
    if (marks !== schemeTotal) {
      problems.push(
        `${label}: "marks" is ${marks} but the mark scheme adds up to ${schemeTotal} — using ${schemeTotal}.`,
      );
    }

    const d = Number(r.difficulty);
    const difficulty: Difficulty = d === 2 || d === 3 ? (d as Difficulty) : 1;

    questions.push({
      id: typeof r.id === "string" && r.id.trim() ? r.id.trim() : makeId(r, i),
      subject: r.subject,
      paper: typeof r.paper === "string" && r.paper.trim() ? r.paper.trim() : "Imported",
      topicId: r.topicId.trim(),
      subtopic: typeof r.subtopic === "string" ? r.subtopic : undefined,
      marks: schemeTotal,
      difficulty,
      stem: r.stem.trim(),
      data: typeof r.data === "string" && r.data.trim() ? r.data.trim() : undefined,
      markScheme,
      guidance: typeof r.guidance === "string" && r.guidance.trim() ? r.guidance.trim() : undefined,
      source: "imported",
    });
  });

  if (!questions.length) {
    throw new Error("Nothing could be imported:\n" + problems.join("\n"));
  }

  return { questions, problems };
}

/**
 * Stable-ish id so re-importing the same file updates rather than duplicates.
 * Derived from the paper reference and the opening of the stem.
 */
function makeId(r: Record<string, any>, i: number): string {
  const seed = `${r.subject}|${r.paper ?? ""}|${String(r.stem).slice(0, 80)}`;
  let h = 5381;
  for (let n = 0; n < seed.length; n++) h = ((h << 5) + h + seed.charCodeAt(n)) | 0;
  return `imp-${Math.abs(h).toString(36)}-${i}`;
}

// Cambridge A-Level exam calendar (Centre SC601, Zone 4).
// Mocks run Aug–Sep 2026; the real papers are Oct–Nov 2026.

export type ExamKind = "mock" | "real";

export interface Exam {
  date: string; // ISO yyyy-mm-dd
  component: string;
  subject: "9702" | "9708" | "9618";
  kind: ExamKind;
  label?: string;
}

const MOCKS: Exam[] = [
  { date: "2026-08-12", component: "9708/22", subject: "9708", kind: "mock" },
  { date: "2026-08-17", component: "9702/42", subject: "9702", kind: "mock" },
  { date: "2026-08-19", component: "9702/33", subject: "9702", kind: "mock", label: "practical" },
  { date: "2026-08-20", component: "9618/12", subject: "9618", kind: "mock" },
  { date: "2026-08-21", component: "9618/22", subject: "9618", kind: "mock" },
  { date: "2026-08-24", component: "9702/22", subject: "9702", kind: "mock" },
  { date: "2026-08-24", component: "9702/52", subject: "9702", kind: "mock", label: "PM" },
  { date: "2026-08-27", component: "9618/32", subject: "9618", kind: "mock" },
  { date: "2026-08-28", component: "9708/32", subject: "9708", kind: "mock" },
  { date: "2026-09-03", component: "9708/12", subject: "9708", kind: "mock" },
  { date: "2026-09-04", component: "9618/42", subject: "9618", kind: "mock", label: "practical" },
  { date: "2026-09-07", component: "9708/42", subject: "9708", kind: "mock" },
  { date: "2026-09-09", component: "9702/12", subject: "9702", kind: "mock", label: "PM" },
];

const REALS: Exam[] = [
  { date: "2026-10-06", component: "9708/22", subject: "9708", kind: "real" },
  { date: "2026-10-08", component: "9702/33", subject: "9702", kind: "real", label: "practical" },
  { date: "2026-10-09", component: "9618/12", subject: "9618", kind: "real" },
  { date: "2026-10-12", component: "9702/42", subject: "9702", kind: "real" },
  { date: "2026-10-13", component: "9708/42", subject: "9708", kind: "real" },
  { date: "2026-10-14", component: "9618/22", subject: "9618", kind: "real" },
  { date: "2026-10-14", component: "9702/22", subject: "9702", kind: "real" },
  { date: "2026-10-14", component: "9702/52", subject: "9702", kind: "real" },
  { date: "2026-10-20", component: "9618/32", subject: "9618", kind: "real" },
  { date: "2026-10-29", component: "9618/42", subject: "9618", kind: "real", label: "practical window" },
  { date: "2026-11-05", component: "9708/12", subject: "9708", kind: "real" },
  { date: "2026-11-10", component: "9702/12", subject: "9702", kind: "real" },
  { date: "2026-11-11", component: "9708/32", subject: "9708", kind: "real" },
];

export const EXAMS: Exam[] = [...MOCKS, ...REALS].sort((a, b) =>
  a.date.localeCompare(b.date),
);

export function todayISO(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  const a = new Date(todayISO(now) + "T00:00:00").getTime();
  const b = new Date(iso + "T00:00:00").getTime();
  return Math.round((b - a) / 86_400_000);
}

/** The next exam of either kind (or of a specific kind). */
export function nextExam(kind?: ExamKind, now: Date = new Date()): Exam | undefined {
  const t = todayISO(now);
  return EXAMS.find((e) => e.date >= t && (!kind || e.kind === kind));
}

/** All exams sitting on the same date as the given one (some days have two). */
export function examsOn(date: string): Exam[] {
  return EXAMS.filter((e) => e.date === date);
}

/** Every exam still to come. */
export function upcomingExams(now: Date = new Date()): Exam[] {
  const t = todayISO(now);
  return EXAMS.filter((e) => e.date >= t);
}

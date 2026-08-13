// Real Cambridge A-Level exams (Oct–Nov 2026, Zone 4). Used for the countdown.

export interface Exam {
  date: string; // ISO yyyy-mm-dd
  component: string;
  subject: "9702" | "9708" | "9618";
  label?: string;
}

const RAW: Exam[] = [
  { date: "2026-10-06", component: "9708/22", subject: "9708" },
  { date: "2026-10-08", component: "9702/33", subject: "9702", label: "practical" },
  { date: "2026-10-09", component: "9618/12", subject: "9618" },
  { date: "2026-10-12", component: "9702/42", subject: "9702" },
  { date: "2026-10-13", component: "9708/42", subject: "9708" },
  { date: "2026-10-14", component: "9618/22", subject: "9618" },
  { date: "2026-10-14", component: "9702/22", subject: "9702" },
  { date: "2026-10-14", component: "9702/52", subject: "9702" },
  { date: "2026-10-20", component: "9618/32", subject: "9618" },
  { date: "2026-10-29", component: "9618/42", subject: "9618", label: "practical" },
  { date: "2026-11-05", component: "9708/12", subject: "9708" },
  { date: "2026-11-10", component: "9702/12", subject: "9702" },
  { date: "2026-11-11", component: "9708/32", subject: "9708" },
];

export const EXAMS: Exam[] = [...RAW].sort((a, b) => a.date.localeCompare(b.date));

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daysUntil(iso: string): number {
  const a = new Date(todayISO() + "T00:00:00").getTime();
  const b = new Date(iso + "T00:00:00").getTime();
  return Math.round((b - a) / 86_400_000);
}

export function nextExam(): Exam | undefined {
  const t = todayISO();
  return EXAMS.find((e) => e.date >= t);
}

export function examsOnNextDate(): Exam[] {
  const nxt = nextExam();
  if (!nxt) return [];
  return EXAMS.filter((e) => e.date === nxt.date);
}

import React from "react";
import { useApp } from "@/lib/store";
import { allQuestions, getRedo, putQAttempt, putRedo } from "@/lib/db";
import {
  CRITERION_LABEL, MISTAKE_LABEL, estimateGrade, prettifyTopicId, scheduleAfterAttempt,
  type Criterion, type MistakeReason, type QAttempt, type Question, type SubjectCode,
} from "@/lib/questions";
import { topicById } from "@/data/topics";
import { csTopicById } from "@/features/cs/cs-data";
import { Button, Card, Chip, IconBack, ProgressBar, cx } from "@/components/ui";
import { RichText } from "@/components/Katex";
import { examine, examinerErrorMessage, type ExamReport } from "@/lib/examiner";
import { ExaminerReport, PointComment } from "./AIExaminer";

const SUBJECTS: { code: SubjectCode; name: string; accent: "physics" | "econ" | "compsci" }[] = [
  { code: "9702", name: "Physics", accent: "physics" },
  { code: "9708", name: "Economics", accent: "econ" },
  { code: "9618", name: "Computer Science", accent: "compsci" },
];

function topicName(id: string): string {
  return topicById(id)?.name ?? csTopicById(id)?.name ?? prettifyTopicId(id);
}

const DRAFT_KEY = "exam-draft-v1";

interface Draft {
  questionIds: string[];
  answers: Record<string, string>;
  endsAt: number;
  startedAt: number;
  subject: SubjectCode | "all";
}

function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Draft;
    return d.questionIds?.length ? d : null;
  } catch {
    return null;
  }
}
const saveDraft = (d: Draft) => localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

type Stage = "setup" | "sitting" | "marking" | "result";

export function ExamMode() {
  const back = useApp((s) => s.back);
  const [bank, setBank] = React.useState<Question[]>([]);
  const [stage, setStage] = React.useState<Stage>("setup");
  const [paper, setPaper] = React.useState<Question[]>([]);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [endsAt, setEndsAt] = React.useState(0);
  const [startedAt, setStartedAt] = React.useState(0);
  const [results, setResults] = React.useState<QAttempt[]>([]);
  const [resume, setResume] = React.useState<Draft | null>(null);

  React.useEffect(() => {
    allQuestions().then(setBank);
    setResume(loadDraft());
  }, []);

  function begin(subject: SubjectCode | "all", minutes: number) {
    let pool = bank.filter((q) => subject === "all" || q.subject === subject);
    if (!pool.length) return;
    // Build a paper: shuffle, then take questions until we roughly fill the time
    // at Cambridge's ~1 mark per minute.
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const chosen: Question[] = [];
    let marks = 0;
    for (const q of shuffled) {
      if (marks >= minutes) break;
      chosen.push(q);
      marks += q.marks;
    }
    // Easier questions first, like a real paper.
    chosen.sort((a, b) => a.difficulty - b.difficulty || a.marks - b.marks);
    const now = Date.now();
    const draft: Draft = {
      questionIds: chosen.map((q) => q.id),
      answers: {},
      endsAt: now + minutes * 60_000,
      startedAt: now,
      subject,
    };
    saveDraft(draft);
    setPaper(chosen); setAnswers({}); setEndsAt(draft.endsAt); setStartedAt(now);
    setResults([]); setStage("sitting");
  }

  function resumeExam(d: Draft) {
    const qs = d.questionIds.map((id) => bank.find((q) => q.id === id)).filter(Boolean) as Question[];
    if (!qs.length) { clearDraft(); setResume(null); return; }
    setPaper(qs); setAnswers(d.answers); setEndsAt(d.endsAt); setStartedAt(d.startedAt);
    setResults([]); setStage("sitting");
  }

  function updateAnswer(qid: string, text: string) {
    setAnswers((prev) => {
      const next = { ...prev, [qid]: text };
      saveDraft({ questionIds: paper.map((q) => q.id), answers: next, endsAt, startedAt, subject: "all" });
      return next;
    });
  }

  async function finishMarking(all: QAttempt[]) {
    for (const a of all) {
      await putQAttempt(a);
      const q = paper.find((x) => x.id === a.questionId)!;
      const prev = await getRedo(q.id);
      await putRedo(scheduleAfterAttempt(prev, q, a.marksAwarded >= a.marksTotal, "exam"));
    }
    setResults(all);
    clearDraft();
    setStage("result");
  }

  if (stage === "sitting") {
    return (
      <Sitting
        paper={paper} answers={answers} endsAt={endsAt}
        onAnswer={updateAnswer}
        onSubmit={() => setStage("marking")}
        onAbandon={() => { clearDraft(); setResume(null); setStage("setup"); }}
      />
    );
  }
  if (stage === "marking") {
    return <MarkPaper paper={paper} answers={answers} startedAt={startedAt} onDone={finishMarking} />;
  }
  if (stage === "result") {
    return <Result results={results} onDone={() => { setStage("setup"); setResume(null); }} />;
  }

  return <Setup bank={bank} resume={resume} onBegin={begin} onResume={resumeExam} onDiscard={() => { clearDraft(); setResume(null); }} onBack={back} />;
}

/* ------------------------------- Setup ------------------------------- */
function Setup({
  bank, resume, onBegin, onResume, onDiscard, onBack,
}: {
  bank: Question[]; resume: Draft | null;
  onBegin: (s: SubjectCode | "all", m: number) => void;
  onResume: (d: Draft) => void; onDiscard: () => void; onBack: () => void;
}) {
  const [subject, setSubject] = React.useState<SubjectCode | "all">("9702");
  const [minutes, setMinutes] = React.useState(45);
  const available = bank.filter((q) => subject === "all" || q.subject === subject);
  const totalMarks = available.reduce((s, q) => s + q.marks, 0);

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-8">
      <IconBack onClick={onBack} />
      <h1 className="font-serif text-3xl sm:text-4xl text-ink mt-5 mb-2 glow-head">📝 Exam mode</h1>
      <p className="text-ink-soft mb-6">
        A full paper under real conditions. Countdown running, no mark scheme until
        you hand in, answers saved as you go.
      </p>

      {resume && (
        <Card className="lifted p-5 mb-5">
          <div className="text-ink font-medium">Unfinished paper</div>
          <p className="text-ink-faint text-sm mt-1">
            {resume.questionIds.length} questions, started{" "}
            {new Date(resume.startedAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}.
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="primary" accent="physics" onClick={() => onResume(resume)}>Resume</Button>
            <Button variant="ghost" onClick={onDiscard}>Discard</Button>
          </div>
        </Card>
      )}

      <Card className="p-5 space-y-5">
        <div>
          <div className="text-xs text-ink-faint mb-2">Paper</div>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button key={s.code} onClick={() => setSubject(s.code)}
                className={cx("px-3 py-1.5 rounded-xl text-sm border transition-all active:scale-95",
                  subject === s.code ? "bg-physics-soft text-physics border-physics/40" : "bg-surface-2 text-ink-soft border-line/60")}>
                {s.name}
              </button>
            ))}
            <button onClick={() => setSubject("all")}
              className={cx("px-3 py-1.5 rounded-xl text-sm border transition-all active:scale-95",
                subject === "all" ? "bg-physics-soft text-physics border-physics/40" : "bg-surface-2 text-ink-soft border-line/60")}>
              Mixed
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-ink-faint">Duration</span>
            <span className="text-ink font-mono text-sm">{minutes} min</span>
          </div>
          <input type="range" min={15} max={120} step={15} value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-full accent-[rgb(var(--physics))] cursor-pointer" />
          <div className="text-ink-faint text-xs mt-1">
            Roughly {minutes} marks — Cambridge allows about a mark a minute.
          </div>
        </div>

        <div className="text-ink-faint text-xs">
          {available.length} questions available ({totalMarks} marks in the bank).
        </div>

        <Button variant="primary" accent="physics" size="lg" className="w-full"
          disabled={!available.length} onClick={() => onBegin(subject, minutes)}>
          Start the paper
        </Button>
      </Card>
    </div>
  );
}

/* ------------------------------ Sitting ------------------------------ */
function Sitting({
  paper, answers, endsAt, onAnswer, onSubmit, onAbandon,
}: {
  paper: Question[]; answers: Record<string, string>; endsAt: number;
  onAnswer: (id: string, t: string) => void; onSubmit: () => void; onAbandon: () => void;
}) {
  const [idx, setIdx] = React.useState(0);
  const [left, setLeft] = React.useState(Math.max(0, Math.round((endsAt - Date.now()) / 1000)));

  React.useEffect(() => {
    const t = setInterval(() => {
      const s = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) onSubmit();
    }, 1000);
    return () => clearInterval(t);
  }, [endsAt, onSubmit]);

  const q = paper[idx];
  const answered = paper.filter((x) => (answers[x.id] ?? "").trim()).length;
  const totalMarks = paper.reduce((s, x) => s + x.marks, 0);
  const low = left < 300;

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-6">
      {/* Exam chrome */}
      <div className="flex items-center justify-between mb-3">
        <Button variant="quiet" size="sm" onClick={onAbandon}>← Abandon</Button>
        <div className="flex items-center gap-2">
          <span className="text-ink-faint text-xs">{answered}/{paper.length} answered</span>
          <span className={cx("font-mono text-sm px-2.5 py-1 rounded-full tabular-nums",
            low ? "bg-mark-bad-bg text-mark-bad" : "bg-surface-2 text-ink")}>
            {fmt(left)}
          </span>
        </div>
      </div>
      <ProgressBar value={1 - left / Math.max(1, (endsAt - (endsAt - left * 1000)) / 1000 || 1)} />

      {/* Question navigator */}
      <div className="flex flex-wrap gap-1.5 my-4 no-grow">
        {paper.map((x, i) => {
          const done = (answers[x.id] ?? "").trim().length > 0;
          return (
            <button key={x.id} onClick={() => setIdx(i)}
              aria-label={`Question ${i + 1}${done ? ", answered" : ""}`}
              className={cx("w-8 h-8 rounded-lg text-xs border transition-all active:scale-90",
                i === idx ? "border-physics bg-physics text-white"
                  : done ? "border-mark-good/50 bg-mark-good-bg text-mark-good"
                  : "border-line/60 bg-surface-2 text-ink-faint")}>
              {i + 1}
            </button>
          );
        })}
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Chip accent={SUBJECTS.find((s) => s.code === q.subject)?.accent}>{q.paper}</Chip>
          <span className="text-ink-faint text-xs">Question {idx + 1}</span>
          <span className="ml-auto text-ink font-medium text-sm">[{q.marks}]</span>
        </div>
        <RichText text={q.stem} className="prose-paper text-ink" />
        {q.data && (
          <div className="mt-3 rounded-xl bg-surface-2/60 border border-line/50 px-3 py-2">
            <RichText text={q.data} className="text-ink-soft text-sm" />
          </div>
        )}
      </Card>

      <textarea
        value={answers[q.id] ?? ""}
        onChange={(e) => onAnswer(q.id, e.target.value)}
        rows={8}
        placeholder="Your answer…"
        className="w-full mt-4 rounded-2xl bg-surface border border-line/60 px-4 py-3 text-ink outline-none focus:border-physics/50 resize-none leading-relaxed"
      />

      <div className="flex items-center gap-2 mt-3">
        <Button variant="soft" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>← Previous</Button>
        {idx < paper.length - 1 ? (
          <Button variant="soft" onClick={() => setIdx(idx + 1)}>Next →</Button>
        ) : null}
        <div className="flex-1" />
        <Button variant="primary" accent="econ" onClick={onSubmit}>Hand in</Button>
      </div>
      <p className="text-ink-faint text-xs mt-3">
        {totalMarks} marks total · answers save automatically, so you can close this and resume.
      </p>
    </div>
  );
}

/* ---------------------------- Mark the paper ---------------------------- */
function MarkPaper({
  paper, answers, startedAt, onDone,
}: {
  paper: Question[]; answers: Record<string, string>; startedAt: number;
  onDone: (all: QAttempt[]) => void;
}) {
  const [i, setI] = React.useState(0);
  const [earned, setEarned] = React.useState<string[]>([]);
  const [reasons, setReasons] = React.useState<MistakeReason[]>([]);
  const [acc, setAcc] = React.useState<QAttempt[]>([]);
  const q = paper[i];

  // Claude marks the whole paper in one go, the way a teacher would take it
  // home — then you step through and change anything it got wrong.
  const apiKey = useApp((s) => s.settings.apiKey);
  const [reports, setReports] = React.useState<Record<string, ExamReport>>({});
  const [marking, setMarking] = React.useState(0); // 0 = idle, else 1-based
  const [batchError, setBatchError] = React.useState("");

  async function markWholePaper() {
    setBatchError("");
    const out: Record<string, ExamReport> = {};
    for (let n = 0; n < paper.length; n++) {
      setMarking(n + 1);
      try {
        out[paper[n].id] = await examine(paper[n], answers[paper[n].id] ?? "");
        setReports({ ...out });
      } catch (e) {
        setBatchError(examinerErrorMessage(e));
        break;
      }
    }
    setMarking(0);
  }

  // Pre-tick the current question from Claude's verdict.
  const report = q ? reports[q.id] : undefined;
  React.useEffect(() => {
    setEarned(report?.earnedPointIds ?? []);
    setReasons(report?.mistakeReasons ?? []);
  }, [i, report]);

  const awarded = q ? q.markScheme.filter((p) => earned.includes(p.id)).reduce((s, p) => s + p.marks, 0) : 0;
  const correct = q ? awarded >= q.marks : false;

  if (!q) return null;

  const byCriterion = new Map<Criterion, typeof q.markScheme>();
  for (const p of q.markScheme) {
    const arr = byCriterion.get(p.criterion) ?? [];
    arr.push(p); byCriterion.set(p.criterion, arr);
  }

  function next() {
    const a: QAttempt = {
      id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      questionId: q.id, subject: q.subject, topicId: q.topicId, at: Date.now(),
      marksAwarded: awarded, marksTotal: q.marks, earnedPointIds: earned,
      mistakeReasons: correct ? [] : reasons,
      secondsTaken: Math.round((Date.now() - startedAt) / 1000 / paper.length),
      mode: "exam", answerText: answers[q.id],
    };
    const all = [...acc, a];
    setAcc(all);
    if (i + 1 >= paper.length) onDone(all);
    else setI(i + 1);
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-ink font-medium">Marking</span>
        <span className="text-ink-faint text-xs">{i + 1} / {paper.length}</span>
      </div>
      <ProgressBar value={i / paper.length} />

      {apiKey?.trim() && Object.keys(reports).length < paper.length && (
        <Button
          variant="soft" accent="econ" className="w-full mt-4"
          disabled={marking > 0} onClick={markWholePaper}
        >
          {marking > 0
            ? `Claude is marking… ${marking} of ${paper.length}`
            : Object.keys(reports).length
              ? "✨ Finish marking the rest with Claude"
              : "✨ Mark my whole paper with Claude"}
        </Button>
      )}
      {batchError && (
        <div className="mt-3 text-mark-bad text-sm">{batchError}</div>
      )}

      <Card className="p-5 mt-4">
        <div className="text-ink-faint text-xs mb-2">Question {i + 1} · [{q.marks}]</div>
        <RichText text={q.stem} className="prose-paper text-ink" />
      </Card>

      {answers[q.id]?.trim() ? (
        <Card className="p-4 mt-3">
          <div className="text-xs text-ink-faint mb-1.5">Your answer</div>
          <div className="text-ink-soft text-sm whitespace-pre-wrap leading-relaxed">{answers[q.id]}</div>
        </Card>
      ) : (
        <div className="mt-3 text-ink-faint text-sm italic">You left this one blank.</div>
      )}

      {report && (
        <div className="mt-3">
          <ExaminerReport report={report} error="" marksTotal={q.marks} />
        </div>
      )}

      <Card className="p-5 mt-3">
        <div className="text-xs font-medium text-physics uppercase tracking-wide mb-3">
          {report ? "Mark scheme — change anything Claude got wrong" : "Mark scheme — tick what you got"}
        </div>
        {[...byCriterion.entries()].map(([crit, points]) => (
          <div key={crit} className="mb-4 last:mb-0">
            <div className="text-[0.7rem] uppercase tracking-wide text-ink-faint mb-2">{CRITERION_LABEL[crit]}</div>
            <div className="space-y-2">
              {points.map((p) => {
                const on = earned.includes(p.id);
                return (
                  <div key={p.id}>
                    <button
                      onClick={() => setEarned((e) => on ? e.filter((x) => x !== p.id) : [...e, p.id])}
                      className={cx("w-full text-left rounded-xl border px-3 py-2.5 flex gap-3 items-start transition-all active:scale-[0.99]",
                        on ? "border-mark-good/40 bg-mark-good-bg/40" : "border-line/60 bg-surface")}>
                      <span className={cx("mt-0.5 w-5 h-5 rounded-md border grid place-items-center shrink-0 text-xs",
                        on ? "bg-mark-good border-mark-good text-white" : "border-line text-transparent")}>✓</span>
                      <span className="flex-1"><RichText text={p.text} className="text-ink-soft text-sm leading-relaxed" /></span>
                      <span className="text-ink-faint text-xs shrink-0">{p.marks}</span>
                    </button>
                    <div className="px-3">
                      <PointComment report={report ?? null} pointId={p.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div className="mt-4 pt-4 border-t border-line/50 flex items-center justify-between">
          <span className="text-ink-soft text-sm">Score</span>
          <span className={cx("font-serif text-2xl", correct ? "text-mark-good" : "text-ink")}>
            {awarded}<span className="text-ink-faint">/{q.marks}</span>
          </span>
        </div>
      </Card>

      {!correct && (
        <Card className="p-5 mt-3">
          <div className="text-xs font-medium text-mark-bad uppercase tracking-wide mb-3">Why did you lose the mark?</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(MISTAKE_LABEL) as MistakeReason[]).map((r) => (
              <button key={r}
                onClick={() => setReasons((p) => p.includes(r) ? p.filter((x) => x !== r) : [...p, r])}
                className={cx("px-3 py-1.5 rounded-xl text-sm border transition-all active:scale-95",
                  reasons.includes(r) ? "bg-physics-soft text-physics border-physics/40" : "bg-surface-2 text-ink-soft border-line/60")}>
                {MISTAKE_LABEL[r]}
              </button>
            ))}
          </div>
        </Card>
      )}

      <Button variant="primary" accent="physics" size="lg" className="w-full mt-4"
        disabled={!correct && reasons.length === 0} onClick={next}>
        {!correct && reasons.length === 0 ? "Pick a reason to continue"
          : i + 1 >= paper.length ? "See my result" : "Next question →"}
      </Button>
    </div>
  );
}

/* ------------------------------- Result ------------------------------- */
function Result({ results, onDone }: { results: QAttempt[]; onDone: () => void }) {
  const awarded = results.reduce((s, r) => s + r.marksAwarded, 0);
  const total = results.reduce((s, r) => s + r.marksTotal, 0);
  const pct = total ? Math.round((awarded / total) * 100) : 0;

  const lost = new Map<string, number>();
  for (const r of results) {
    const d = r.marksTotal - r.marksAwarded;
    if (d > 0) lost.set(r.topicId, (lost.get(r.topicId) ?? 0) + d);
  }
  const reasonCount = new Map<MistakeReason, number>();
  for (const r of results) for (const m of r.mistakeReasons) reasonCount.set(m, (reasonCount.get(m) ?? 0) + 1);
  const top = [...reasonCount.entries()].sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-10">
      <h1 className="font-serif text-3xl text-ink mb-6">Result</h1>

      <Card className="lifted p-6 text-center mb-5">
        <div className="font-serif text-5xl text-ink">{awarded}<span className="text-ink-faint text-3xl">/{total}</span></div>
        <div className="text-2xl mt-1 text-ink-soft">{pct}%</div>
        <Chip accent={pct >= 60 ? "good" : pct >= 45 ? "warn" : "bad"} className="mt-3">
          Estimated grade {estimateGrade(pct)}
        </Chip>
      </Card>

      {lost.size > 0 && (
        <Card className="p-5 mb-5">
          <div className="text-xs font-medium text-mark-bad uppercase tracking-wide mb-3">Lost marks</div>
          <div className="space-y-2">
            {[...lost.entries()].sort((a, b) => b[1] - a[1]).map(([t, n]) => (
              <div key={t} className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">{topicName(t)}</span>
                <span className="text-mark-bad font-medium">−{n}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {top && (
        <Card className="p-5 mb-5">
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wide mb-2">Your biggest weakness</div>
          <div className="text-ink">{MISTAKE_LABEL[top[0]]}</div>
          <div className="text-ink-faint text-sm mt-1">Cost you marks on {top[1]} question{top[1] === 1 ? "" : "s"}.</div>
        </Card>
      )}

      <p className="text-ink-faint text-sm mb-5">
        Everything you dropped marks on is queued to come back tomorrow.
      </p>
      <Button variant="primary" accent="physics" size="lg" className="w-full" onClick={onDone}>Done</Button>
    </div>
  );
}

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

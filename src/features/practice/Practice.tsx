import React from "react";
import { useApp } from "@/lib/store";
import {
  allQuestions, allRedo, dueRedo, getRedo, putQAttempt, putRedo,
} from "@/lib/db";
import {
  CRITERION_LABEL, MISTAKE_LABEL, estimateGrade, scheduleAfterAttempt,
  suggestedSeconds,
  type Criterion, type MistakeReason, type PracticeMode, type QAttempt,
  type Question, type SubjectCode,
} from "@/lib/questions";
import { topicById } from "@/data/topics";
import { csTopicById } from "@/features/cs/cs-data";
import { Button, Card, Chip, IconBack, ProgressBar, cx } from "@/components/ui";
import { RichText } from "@/components/Katex";

const SUBJECTS: { code: SubjectCode; name: string; accent: "physics" | "econ" | "compsci" }[] = [
  { code: "9702", name: "Physics", accent: "physics" },
  { code: "9708", name: "Economics", accent: "econ" },
  { code: "9618", name: "Computer Science", accent: "compsci" },
];

function topicName(id: string): string {
  return topicById(id)?.name ?? csTopicById(id)?.name ?? id.replace(/^(ec|cs|phy)-/, "").replace(/-/g, " ");
}

type Stage = "setup" | "running" | "summary";

interface Config {
  subject: SubjectCode | "all";
  topics: string[];
  count: number;
  difficulty: 0 | 1 | 2 | 3; // 0 = any
  timed: boolean;
}

export function Practice({ preset }: { preset?: "redo" | "exam" }) {
  const back = useApp((s) => s.back);
  const [bank, setBank] = React.useState<Question[]>([]);
  const [stage, setStage] = React.useState<Stage>("setup");
  const [queue, setQueue] = React.useState<Question[]>([]);
  const [results, setResults] = React.useState<QAttempt[]>([]);
  const [mode, setMode] = React.useState<PracticeMode>("practice");
  const [redoCount, setRedoCount] = React.useState(0);

  React.useEffect(() => {
    allQuestions().then(setBank);
    dueRedo().then((r) => setRedoCount(r.length));
  }, []);

  async function startRedo() {
    const due = await dueRedo();
    const qs = due.map((r) => bank.find((q) => q.id === r.questionId)).filter(Boolean) as Question[];
    if (!qs.length) return;
    setQueue(qs);
    setMode("redo");
    setResults([]);
    setStage("running");
  }

  function start(cfg: Config) {
    let pool = bank.filter((q) => cfg.subject === "all" || q.subject === cfg.subject);
    if (cfg.topics.length) pool = pool.filter((q) => cfg.topics.includes(q.topicId));
    if (cfg.difficulty) pool = pool.filter((q) => q.difficulty === cfg.difficulty);
    if (!pool.length) return;
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, cfg.count);
    setQueue(shuffled);
    setMode(preset === "exam" ? "exam" : cfg.timed ? "timed" : "practice");
    setResults([]);
    setStage("running");
  }

  async function finishQuestion(a: QAttempt) {
    await putQAttempt(a);
    const q = queue.find((x) => x.id === a.questionId)!;
    const prev = await getRedo(q.id);
    const correct = a.marksAwarded >= a.marksTotal;
    await putRedo(scheduleAfterAttempt(prev, q, correct, a.mode));
    setResults((r) => [...r, a]);
  }

  if (stage === "running") {
    return (
      <Runner
        queue={queue}
        mode={mode}
        onQuestionDone={finishQuestion}
        onFinish={() => setStage("summary")}
        onQuit={() => { setStage("setup"); dueRedo().then((r) => setRedoCount(r.length)); }}
      />
    );
  }

  if (stage === "summary") {
    return <Summary results={results} queue={queue} onDone={() => { setStage("setup"); allQuestions().then(setBank); dueRedo().then((r) => setRedoCount(r.length)); }} />;
  }

  return (
    <Setup bank={bank} redoCount={redoCount} preset={preset} onStart={start} onStartRedo={startRedo} onBack={back} />
  );
}

/* ------------------------------- Setup ------------------------------- */
function Setup({
  bank, redoCount, preset, onStart, onStartRedo, onBack,
}: {
  bank: Question[]; redoCount: number; preset?: "redo" | "exam";
  onStart: (c: Config) => void; onStartRedo: () => void; onBack: () => void;
}) {
  const [subject, setSubject] = React.useState<SubjectCode | "all">("all");
  const [topics, setTopics] = React.useState<string[]>([]);
  const [count, setCount] = React.useState(5);
  const [difficulty, setDifficulty] = React.useState<0 | 1 | 2 | 3>(0);
  const [timed, setTimed] = React.useState(preset === "exam");

  const subjectPool = bank.filter((q) => subject === "all" || q.subject === subject);
  const availableTopics = [...new Set(subjectPool.map((q) => q.topicId))];
  const matching = subjectPool.filter(
    (q) => (!topics.length || topics.includes(q.topicId)) && (!difficulty || q.difficulty === difficulty),
  );
  const totalMarks = matching.slice(0, count).reduce((s, q) => s + q.marks, 0);

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-8">
      <IconBack onClick={onBack} />
      <h1 className="font-serif text-3xl sm:text-4xl text-ink mt-5 mb-2 glow-head">
        {preset === "exam" ? "Exam mode" : "Practice"}
      </h1>
      <p className="text-ink-soft mb-6">
        {preset === "exam"
          ? "A full paper under real conditions — timer running, no hints until you hand in."
          : "Answer real exam-style questions, then mark yourself against the scheme."}
      </p>

      {redoCount > 0 && preset !== "exam" && (
        <Card className="lifted p-5 mb-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-mark-bad">🔴</span>
                <span className="text-ink font-medium">{redoCount} question{redoCount === 1 ? "" : "s"} to redo</span>
              </div>
              <p className="text-ink-faint text-sm mt-1">Ones you got wrong, due again now.</p>
            </div>
            <Button variant="primary" accent="physics" onClick={onStartRedo}>Fix these →</Button>
          </div>
        </Card>
      )}

      <Card className="p-5 space-y-5">
        <div>
          <div className="text-xs text-ink-faint mb-2">Subject</div>
          <div className="flex flex-wrap gap-2">
            <Pill active={subject === "all"} onClick={() => { setSubject("all"); setTopics([]); }}>All</Pill>
            {SUBJECTS.map((s) => (
              <Pill key={s.code} active={subject === s.code} onClick={() => { setSubject(s.code); setTopics([]); }}>
                {s.name}
              </Pill>
            ))}
          </div>
        </div>

        {availableTopics.length > 1 && (
          <div>
            <div className="text-xs text-ink-faint mb-2">
              Topics {topics.length ? `(${topics.length} selected)` : "(all)"}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableTopics.map((t) => (
                <Pill
                  key={t}
                  active={topics.includes(t)}
                  onClick={() => setTopics((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t])}
                >
                  {topicName(t)}
                </Pill>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="text-xs text-ink-faint mb-2">Difficulty</div>
          <div className="flex flex-wrap gap-2">
            {([0, 1, 2, 3] as const).map((d) => (
              <Pill key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
                {d === 0 ? "Any" : d === 1 ? "Standard" : d === 2 ? "Harder" : "Stretch"}
              </Pill>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-ink-faint">Number of questions</span>
            <span className="text-ink font-mono text-sm">{Math.min(count, matching.length)}</span>
          </div>
          <input
            type="range" min={1} max={Math.max(1, Math.min(20, matching.length))} value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-[rgb(var(--physics))] cursor-pointer"
          />
        </div>

        <label className="flex items-center justify-between gap-4">
          <div>
            <div className="text-ink text-sm font-medium">Timed</div>
            <div className="text-ink-faint text-xs mt-0.5">
              Roughly 1 minute per mark, like the real paper.
            </div>
          </div>
          <button
            role="switch" aria-checked={timed} onClick={() => setTimed((v) => !v)}
            className={cx("shrink-0 w-11 h-6 rounded-full relative transition-colors border",
              timed ? "bg-physics border-physics" : "bg-surface-2 border-line/70")}
          >
            <span className={cx("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
              timed ? "translate-x-[22px]" : "translate-x-0.5")} />
          </button>
        </label>

        <div className="pt-1">
          <Button
            variant="primary" accent="physics" size="lg"
            disabled={matching.length === 0}
            onClick={() => onStart({ subject, topics, count, difficulty, timed })}
            className="w-full"
          >
            {matching.length === 0
              ? "No questions match"
              : `Start · ${Math.min(count, matching.length)} questions · ${totalMarks} marks`}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cx("px-3 py-1.5 rounded-xl text-sm border transition-all active:scale-95",
        active ? "bg-physics-soft text-physics border-physics/40" : "bg-surface-2 text-ink-soft border-line/60 hover:text-ink")}
    >
      {children}
    </button>
  );
}

/* ------------------------------ Runner ------------------------------- */
function Runner({
  queue, mode, onQuestionDone, onFinish, onQuit,
}: {
  queue: Question[]; mode: PracticeMode;
  onQuestionDone: (a: QAttempt) => void; onFinish: () => void; onQuit: () => void;
}) {
  const [idx, setIdx] = React.useState(0);
  const [phase, setPhase] = React.useState<"answering" | "marking">("answering");
  const [answer, setAnswer] = React.useState("");
  const [earned, setEarned] = React.useState<string[]>([]);
  const [reasons, setReasons] = React.useState<MistakeReason[]>([]);
  const [startedAt, setStartedAt] = React.useState(Date.now());
  const [elapsed, setElapsed] = React.useState(0);

  const q = queue[idx];
  const timed = mode === "timed" || mode === "exam";
  const limit = q ? suggestedSeconds(q) : 0;

  React.useEffect(() => {
    setPhase("answering"); setAnswer(""); setEarned([]); setReasons([]);
    setStartedAt(Date.now()); setElapsed(0);
  }, [idx]);

  React.useEffect(() => {
    if (phase !== "answering") return;
    const t = setInterval(() => setElapsed(Math.round((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(t);
  }, [phase, startedAt]);

  if (!q) return null;

  const awarded = q.markScheme.filter((p) => earned.includes(p.id)).reduce((s, p) => s + p.marks, 0);
  const correct = awarded >= q.marks;

  function submitMarking() {
    const a: QAttempt = {
      id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      questionId: q.id, subject: q.subject, topicId: q.topicId,
      at: Date.now(), marksAwarded: awarded, marksTotal: q.marks,
      earnedPointIds: earned, mistakeReasons: correct ? [] : reasons,
      secondsTaken: elapsed, mode, answerText: answer.trim() || undefined,
    };
    onQuestionDone(a);
    if (idx + 1 >= queue.length) onFinish();
    else setIdx(idx + 1);
  }

  // group mark scheme by criterion for the Cambridge-style breakdown
  const byCriterion = new Map<Criterion, typeof q.markScheme>();
  for (const p of q.markScheme) {
    const arr = byCriterion.get(p.criterion) ?? [];
    arr.push(p);
    byCriterion.set(p.criterion, arr);
  }

  const over = timed && elapsed > limit;

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-3">
        <Button variant="quiet" size="sm" onClick={onQuit}>← End</Button>
        <div className="flex items-center gap-2">
          <span className="text-ink-faint text-xs">{idx + 1} / {queue.length}</span>
          {timed && (
            <span className={cx("text-xs font-mono px-2 py-0.5 rounded-full",
              over ? "bg-mark-bad-bg text-mark-bad" : "bg-surface-2 text-ink-soft")}>
              {fmt(elapsed)} / {fmt(limit)}
            </span>
          )}
        </div>
      </div>
      <ProgressBar value={idx / queue.length} />

      <Card className="p-5 mt-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Chip accent={SUBJECTS.find((s) => s.code === q.subject)?.accent}>{q.paper}</Chip>
          <span className="text-ink-faint text-xs">{topicName(q.topicId)}</span>
          <span className="ml-auto text-ink font-medium text-sm">[{q.marks}]</span>
        </div>
        <RichText text={q.stem} className="prose-paper text-ink" />
        {q.data && (
          <div className="mt-3 rounded-xl bg-surface-2/60 border border-line/50 px-3 py-2">
            <RichText text={q.data} className="text-ink-soft text-sm" />
          </div>
        )}
      </Card>

      {phase === "answering" ? (
        <>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            placeholder="Write your answer here (or on paper — you'll mark it yourself next)…"
            className="w-full mt-4 rounded-2xl bg-surface border border-line/60 px-4 py-3 text-ink outline-none focus:border-physics/50 resize-none leading-relaxed"
          />
          <Button
            variant="primary" accent="physics" size="lg"
            className="w-full mt-3"
            onClick={() => setPhase("marking")}
          >
            Reveal mark scheme →
          </Button>
        </>
      ) : (
        <div className="mt-4 space-y-4 animate-fade-up">
          <Card className="p-5">
            <div className="text-xs font-medium text-physics uppercase tracking-wide mb-1">
              Mark scheme — tick what you actually got
            </div>
            <p className="text-ink-faint text-xs mb-4">
              Be honest. This is what builds an accurate picture of your weaknesses.
            </p>

            {[...byCriterion.entries()].map(([crit, points]) => (
              <div key={crit} className="mb-4 last:mb-0">
                <div className="text-[0.7rem] uppercase tracking-wide text-ink-faint mb-2">
                  {CRITERION_LABEL[crit]}
                </div>
                <div className="space-y-2">
                  {points.map((p) => {
                    const on = earned.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => setEarned((e) => on ? e.filter((x) => x !== p.id) : [...e, p.id])}
                        className={cx("w-full text-left rounded-xl border px-3 py-2.5 flex gap-3 items-start transition-all active:scale-[0.99]",
                          on ? "border-mark-good/40 bg-mark-good-bg/40" : "border-line/60 bg-surface hover:border-line")}
                      >
                        <span className={cx("mt-0.5 w-5 h-5 rounded-md border grid place-items-center shrink-0 text-xs",
                          on ? "bg-mark-good border-mark-good text-white" : "border-line text-transparent")}>
                          ✓
                        </span>
                        <span className="flex-1">
                          <RichText text={p.text} className="text-ink-soft text-sm leading-relaxed" />
                        </span>
                        <span className="text-ink-faint text-xs shrink-0">{p.marks}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {q.guidance && (
              <div className="mt-4 rounded-xl bg-[rgb(var(--mark-warn)/0.10)] border border-mark-warn/25 px-3 py-2 text-sm text-ink-soft">
                <span className="text-mark-warn font-medium">Examiner note: </span>{q.guidance}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-line/50 flex items-center justify-between">
              <span className="text-ink-soft text-sm">You scored</span>
              <span className={cx("font-serif text-2xl", correct ? "text-mark-good" : "text-ink")}>
                {awarded}<span className="text-ink-faint">/{q.marks}</span>
              </span>
            </div>
          </Card>

          {!correct && (
            <Card className="p-5">
              <div className="text-xs font-medium text-mark-bad uppercase tracking-wide mb-1">
                Why did you lose the mark?
              </div>
              <p className="text-ink-faint text-xs mb-3">
                Tag it — this is what makes your Mistake Bank useful.
              </p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(MISTAKE_LABEL) as MistakeReason[]).map((r) => (
                  <Pill
                    key={r}
                    active={reasons.includes(r)}
                    onClick={() => setReasons((p) => p.includes(r) ? p.filter((x) => x !== r) : [...p, r])}
                  >
                    {MISTAKE_LABEL[r]}
                  </Pill>
                ))}
              </div>
            </Card>
          )}

          <Button
            variant="primary" accent={correct ? "econ" : "physics"} size="lg"
            className="w-full"
            disabled={!correct && reasons.length === 0}
            onClick={submitMarking}
          >
            {!correct && reasons.length === 0
              ? "Pick a reason to continue"
              : idx + 1 >= queue.length ? "Finish" : "Next question →"}
          </Button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Summary ------------------------------ */
function Summary({ results, queue, onDone }: { results: QAttempt[]; queue: Question[]; onDone: () => void }) {
  const awarded = results.reduce((s, r) => s + r.marksAwarded, 0);
  const total = results.reduce((s, r) => s + r.marksTotal, 0);
  const pct = total ? Math.round((awarded / total) * 100) : 0;
  const seconds = results.reduce((s, r) => s + (r.secondsTaken ?? 0), 0);

  // marks lost by topic
  const lost = new Map<string, number>();
  for (const r of results) {
    const d = r.marksTotal - r.marksAwarded;
    if (d > 0) lost.set(r.topicId, (lost.get(r.topicId) ?? 0) + d);
  }
  // most common mistake reason
  const reasonCount = new Map<MistakeReason, number>();
  for (const r of results) for (const m of r.mistakeReasons) reasonCount.set(m, (reasonCount.get(m) ?? 0) + 1);
  const topReason = [...reasonCount.entries()].sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-10">
      <h1 className="font-serif text-3xl text-ink mb-1">Result</h1>
      <p className="text-ink-soft mb-6">{results.length} questions · {fmt(seconds)} taken</p>

      <Card className="lifted p-6 text-center mb-5">
        <div className="font-serif text-5xl text-ink">{awarded}<span className="text-ink-faint text-3xl">/{total}</span></div>
        <div className="text-2xl mt-1 text-ink-soft">{pct}%</div>
        <Chip accent={pct >= 60 ? "good" : pct >= 45 ? "warn" : "bad"} className="mt-3">
          Estimated grade {estimateGrade(pct)}
        </Chip>
        {total > 0 && (
          <div className="text-ink-faint text-xs mt-3">
            {(awarded / (seconds / 3600 || 1)).toFixed(0)} marks per hour
          </div>
        )}
      </Card>

      {lost.size > 0 && (
        <Card className="p-5 mb-5">
          <div className="text-xs font-medium text-mark-bad uppercase tracking-wide mb-3">Marks lost</div>
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

      {topReason && (
        <Card className="p-5 mb-5">
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wide mb-2">Your biggest issue</div>
          <div className="text-ink">{MISTAKE_LABEL[topReason[0]]}</div>
          <div className="text-ink-faint text-sm mt-1">
            Came up {topReason[1]} time{topReason[1] === 1 ? "" : "s"} in this session.
          </div>
        </Card>
      )}

      <p className="text-ink-faint text-sm mb-5">
        Anything you got wrong is scheduled to come back tomorrow, then in 3, 7 and 14 days.
      </p>

      <Button variant="primary" accent="physics" size="lg" className="w-full" onClick={onDone}>
        Done
      </Button>
    </div>
  );
}

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

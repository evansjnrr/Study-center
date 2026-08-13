import React from "react";
import { useApp } from "@/lib/store";
import { allQAttempts, allRedo } from "@/lib/db";
import {
  computeTopicHealth, MISTAKE_LABEL,
  type MistakeReason, type QAttempt, type RedoItem, type SubjectCode, type TopicHealth,
} from "@/lib/questions";
import { topicById } from "@/data/topics";
import { csTopicById } from "@/features/cs/cs-data";
import { Button, Card, Chip, IconBack, ProgressBar, cx } from "@/components/ui";

const SUBJECT_NAME: Record<SubjectCode, string> = {
  "9702": "Physics",
  "9708": "Economics",
  "9618": "Computer Science",
};
const SUBJECT_ACCENT: Record<SubjectCode, "physics" | "econ" | "compsci"> = {
  "9702": "physics",
  "9708": "econ",
  "9618": "compsci",
};

function topicName(id: string): string {
  return topicById(id)?.name ?? csTopicById(id)?.name ?? id;
}

export function Weakness() {
  const { back, navigate } = useApp();
  const [attempts, setAttempts] = React.useState<QAttempt[] | null>(null);
  const [redos, setRedos] = React.useState<RedoItem[]>([]);

  React.useEffect(() => {
    allQAttempts().then(setAttempts);
    allRedo().then(setRedos);
  }, []);

  if (!attempts) return <div className="h-64" />;

  if (attempts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-8">
        <IconBack onClick={back} />
        <h1 className="font-serif text-3xl text-ink mt-5 mb-2">Your performance</h1>
        <Card className="p-6 mt-4">
          <p className="text-ink-soft">
            Nothing here yet. Do some practice questions and this fills in — accuracy
            per subject, your weakest topics, and the mistakes you keep repeating.
          </p>
          <Button variant="primary" accent="physics" className="mt-4" onClick={() => navigate({ name: "practice" })}>
            Start practising →
          </Button>
        </Card>
      </div>
    );
  }

  const health = computeTopicHealth(attempts, redos);

  // per-subject accuracy
  const bySubject = new Map<SubjectCode, { a: number; t: number; n: number }>();
  for (const at of attempts) {
    const s = bySubject.get(at.subject) ?? { a: 0, t: 0, n: 0 };
    s.a += at.marksAwarded; s.t += at.marksTotal; s.n += 1;
    bySubject.set(at.subject, s);
  }

  const weak = health.filter((h) => h.status === "weak").sort((a, b) => a.accuracy - b.accuracy);
  const mastered = health.filter((h) => h.status === "mastered");

  // mistake reason tally
  const reasons = new Map<MistakeReason, number>();
  for (const at of attempts) for (const r of at.mistakeReasons) reasons.set(r, (reasons.get(r) ?? 0) + 1);
  const topReasons = [...reasons.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const totalSecs = attempts.reduce((s, a) => s + (a.secondsTaken ?? 0), 0);
  const totalAwarded = attempts.reduce((s, a) => s + a.marksAwarded, 0);
  const totalMarks = attempts.reduce((s, a) => s + a.marksTotal, 0);

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-8">
      <IconBack onClick={back} />
      <h1 className="font-serif text-3xl sm:text-4xl text-ink mt-5 mb-6 glow-head">Your performance</h1>

      {/* Headline tiles */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Tile label="Questions" value={String(attempts.length)} />
        <Tile label="Accuracy" value={`${Math.round((totalAwarded / Math.max(1, totalMarks)) * 100)}%`} />
        <Tile
          label="Marks / hour"
          value={totalSecs > 0 ? String(Math.round(totalAwarded / (totalSecs / 3600))) : "—"}
        />
      </div>

      {/* Per subject */}
      <Card className="p-5 mb-5">
        <div className="text-xs font-medium text-ink-faint uppercase tracking-wide mb-3">By subject</div>
        <div className="space-y-3">
          {[...bySubject.entries()].map(([code, s]) => {
            const pct = Math.round((s.a / Math.max(1, s.t)) * 100);
            return (
              <div key={code}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-ink">{SUBJECT_NAME[code]}</span>
                  <span className="text-ink-soft tabular-nums">{pct}% · {s.n}Q</span>
                </div>
                <ProgressBar value={pct / 100} accent={SUBJECT_ACCENT[code]} />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Work on these */}
      {weak.length > 0 && (
        <Card className="lifted p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span>🔴</span>
            <span className="text-ink font-medium text-sm">Work on these</span>
          </div>
          <div className="space-y-2">
            {weak.slice(0, 6).map((h, i) => (
              <div key={h.topicId} className="flex items-center gap-3 rounded-xl border border-line/60 bg-surface px-3 py-2.5">
                <span className="text-ink-faint text-xs w-4">{i + 1}</span>
                <Chip accent={SUBJECT_ACCENT[h.subject]}>{SUBJECT_NAME[h.subject].slice(0, 4)}</Chip>
                <span className="text-ink text-sm flex-1 truncate">{topicName(h.topicId)}</span>
                <span className="text-mark-bad text-sm tabular-nums">{Math.round(h.accuracy * 100)}%</span>
              </div>
            ))}
          </div>
          <Button variant="primary" accent="physics" className="w-full mt-4" onClick={() => navigate({ name: "practice", preset: "redo" })}>
            Fix my weaknesses →
          </Button>
        </Card>
      )}

      {/* Repeated mistakes */}
      {topReasons.length > 0 && (
        <Card className="p-5 mb-5">
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wide mb-3">Why you lose marks</div>
          <div className="space-y-2">
            {topReasons.map(([r, n]) => (
              <div key={r} className="flex items-center gap-3">
                <span className="text-ink-soft text-sm flex-1">{MISTAKE_LABEL[r]}</span>
                <div className="w-24"><ProgressBar value={n / topReasons[0][1]} accent="econ" /></div>
                <span className="text-ink-faint text-xs w-6 text-right">{n}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Topic status grid */}
      <Card className="p-5">
        <div className="text-xs font-medium text-ink-faint uppercase tracking-wide mb-3">
          Topic status · {mastered.length} mastered
        </div>
        <p className="text-ink-faint text-xs mb-3">
          A topic only becomes 🟢 Mastered once you've answered its questions correctly
          twice <em>and</em> at least once under time pressure.
        </p>
        <div className="grid gap-2">
          {health.sort((a, b) => a.accuracy - b.accuracy).map((h) => (
            <TopicRow key={h.topicId} h={h} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function TopicRow({ h }: { h: TopicHealth }) {
  const dot = h.status === "mastered" ? "🟢" : h.status === "weak" ? "🔴" : "🟡";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line/60 bg-surface px-3 py-2.5">
      <span className="text-sm">{dot}</span>
      <div className="flex-1 min-w-0">
        <div className="text-ink text-sm truncate">{topicName(h.topicId)}</div>
        <div className="text-ink-faint text-xs mt-0.5">
          {h.attempted} attempted · {h.mistakes} mistake{h.mistakes === 1 ? "" : "s"}
          {h.repeatedMistakes > 0 && ` · ${h.repeatedMistakes} repeated`}
        </div>
      </div>
      <span className={cx("text-sm tabular-nums",
        h.status === "mastered" ? "text-mark-good" : h.status === "weak" ? "text-mark-bad" : "text-ink-soft")}>
        {Math.round(h.accuracy * 100)}%
      </span>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="text-ink-faint text-xs">{label}</div>
      <div className="font-serif text-2xl text-ink mt-1">{value}</div>
    </Card>
  );
}

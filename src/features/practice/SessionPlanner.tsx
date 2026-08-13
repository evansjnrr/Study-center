import React from "react";
import { useApp } from "@/lib/store";
import { allCards, allQAttempts, allRedo, dueRedo } from "@/lib/db";
import { dueCards } from "@/lib/srs";
import { computeTopicHealth, type SubjectCode, type TopicHealth } from "@/lib/questions";
import { nextExam, daysUntil, type Exam } from "@/data/exams";
import { topicById } from "@/data/topics";
import { csTopicById } from "@/features/cs/cs-data";
import { Button, Card, Chip, IconBack, cx } from "@/components/ui";

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

interface Block {
  minutes: number;
  title: string;
  detail: string;
  accent: "physics" | "econ" | "compsci" | "ink";
  action: { label: string; go: () => void };
}

export function SessionPlanner() {
  const { back, navigate } = useApp();
  const [minutes, setMinutes] = React.useState(60);
  const [plan, setPlan] = React.useState<Block[] | null>(null);
  const [ctx, setCtx] = React.useState<{
    redo: number; cards: number; weak: TopicHealth[]; exam?: Exam; attempts: number;
  } | null>(null);

  React.useEffect(() => {
    (async () => {
      const [redos, cards, attempts, allR] = await Promise.all([
        dueRedo(), allCards(), allQAttempts(), allRedo(),
      ]);
      const health = computeTopicHealth(attempts, allR);
      setCtx({
        redo: redos.length,
        cards: dueCards(cards).length,
        weak: health.filter((h) => h.status === "weak").sort((a, b) => a.accuracy - b.accuracy),
        exam: nextExam(),
        attempts: attempts.length,
      });
    })();
  }, []);

  function generate() {
    if (!ctx) return;
    const blocks: Block[] = [];
    let left = minutes;

    // 1. Anything overdue for a redo comes first — these are proven weaknesses.
    if (ctx.redo > 0 && left >= 15) {
      const m = Math.min(left, Math.max(15, Math.min(30, ctx.redo * 5)));
      blocks.push({
        minutes: m,
        title: `Redo ${ctx.redo} question${ctx.redo === 1 ? "" : "s"} you got wrong`,
        detail: "Due today. These are the marks you're actually losing.",
        accent: "econ",
        action: { label: "Start redo", go: () => navigate({ name: "practice", preset: "redo" }) },
      });
      left -= m;
    }

    // 2. Target the weakest topics with fresh questions.
    const focus = ctx.weak.slice(0, 2);
    for (const w of focus) {
      if (left < 20) break;
      const m = Math.min(left, 25);
      blocks.push({
        minutes: m,
        title: `${SUBJECT_NAME[w.subject]} — ${topicName(w.topicId)}`,
        detail: `Currently ${Math.round(w.accuracy * 100)}%${w.repeatedMistakes ? `, ${w.repeatedMistakes} repeated mistake${w.repeatedMistakes === 1 ? "" : "s"}` : ""}. Practise questions on it.`,
        accent: SUBJECT_ACCENT[w.subject],
        action: { label: "Practise", go: () => navigate({ name: "practice" }) },
      });
      left -= m;
    }

    // 3. Nothing tracked yet? Start with a diagnostic.
    if (ctx.attempts === 0 && left >= 20) {
      const m = Math.min(left, 30);
      blocks.push({
        minutes: m,
        title: "Diagnostic — mixed questions",
        detail: "No data yet. Do a mixed set so the app can find your weak spots.",
        accent: "physics",
        action: { label: "Start", go: () => navigate({ name: "practice" }) },
      });
      left -= m;
    }

    // 4. Bias toward the nearest exam if there's still time.
    if (ctx.exam && left >= 20) {
      const m = Math.min(left, 25);
      const d = daysUntil(ctx.exam.date);
      blocks.push({
        minutes: m,
        title: `${SUBJECT_NAME[ctx.exam.subject]} — ${ctx.exam.component} prep`,
        detail: `Your next ${ctx.exam.kind} is in ${d} day${d === 1 ? "" : "s"}. Timed questions on this paper.`,
        accent: SUBJECT_ACCENT[ctx.exam.subject],
        action: { label: "Timed practice", go: () => navigate({ name: "practice" }) },
      });
      left -= m;
    }

    // 5. Finish with overdue recall — cheap, high-value, and a soft landing.
    if (ctx.cards > 0 && left >= 10) {
      const m = Math.min(left, 20);
      blocks.push({
        minutes: m,
        title: `${ctx.cards} flashcard${ctx.cards === 1 ? "" : "s"} due`,
        detail: "Spaced recall across all three subjects.",
        accent: "ink",
        action: { label: "Review", go: () => navigate({ name: "cards" }) },
      });
      left -= m;
    }

    // 6. Still time? Fill with a mixed set.
    if (left >= 20) {
      blocks.push({
        minutes: left,
        title: "Mixed practice",
        detail: "Interleaved questions across subjects — harder, and better for retention.",
        accent: "physics",
        action: { label: "Practise", go: () => navigate({ name: "practice" }) },
      });
      left = 0;
    }

    setPlan(blocks);
  }

  const totalPlanned = plan?.reduce((s, b) => s + b.minutes, 0) ?? 0;

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-8">
      <IconBack onClick={back} />
      <h1 className="font-serif text-3xl sm:text-4xl text-ink mt-5 mb-2 glow-head">
        🎯 What should I study?
      </h1>
      <p className="text-ink-soft mb-6">
        Tell me how long you've got. I'll build a session from what you've actually
        been getting wrong, what's due, and how close your next exam is.
      </p>

      <Card className="p-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-ink-faint">Time available</span>
          <span className="text-ink font-mono text-sm">{minutes} min</span>
        </div>
        <input
          type="range" min={20} max={180} step={10} value={minutes}
          onChange={(e) => { setMinutes(Number(e.target.value)); setPlan(null); }}
          className="w-full accent-[rgb(var(--physics))] cursor-pointer"
        />
        <div className="flex gap-2 mt-3 flex-wrap no-grow">
          {[30, 60, 90, 120].map((m) => (
            <button key={m} onClick={() => { setMinutes(m); setPlan(null); }}
              className={cx("px-3 py-1.5 rounded-xl text-sm border transition-all active:scale-95",
                minutes === m ? "bg-physics-soft text-physics border-physics/40" : "bg-surface-2 text-ink-soft border-line/60")}>
              {m} min
            </button>
          ))}
        </div>
        <Button variant="primary" accent="physics" size="lg" className="w-full mt-4"
          disabled={!ctx} onClick={generate}>
          Give me my session →
        </Button>
      </Card>

      {ctx && (
        <div className="flex flex-wrap gap-2 mb-5 text-xs">
          {ctx.redo > 0 && <Chip accent="bad">{ctx.redo} to redo</Chip>}
          {ctx.cards > 0 && <Chip accent="physics">{ctx.cards} cards due</Chip>}
          {ctx.weak.length > 0 && <Chip accent="warn">{ctx.weak.length} weak topic{ctx.weak.length === 1 ? "" : "s"}</Chip>}
          {ctx.exam && <Chip accent="econ">{ctx.exam.component} in {daysUntil(ctx.exam.date)}d</Chip>}
        </div>
      )}

      {plan && (
        <div className="animate-fade-up">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-xs font-medium text-ink-faint uppercase tracking-wide">
              Tonight — {totalPlanned} minutes
            </div>
            <button onClick={generate} className="text-ink-faint hover:text-ink text-xs">↻ regenerate</button>
          </div>
          <div className="space-y-3">
            {plan.map((b, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cx("shrink-0 w-14 text-center rounded-xl py-2",
                    b.accent === "physics" ? "bg-physics-soft text-physics"
                      : b.accent === "econ" ? "bg-econ-soft text-econ"
                      : b.accent === "compsci" ? "bg-compsci-soft text-compsci"
                      : "bg-surface-2 text-ink-soft")}>
                    <div className="font-serif text-lg leading-none">{b.minutes}</div>
                    <div className="text-[0.6rem] mt-0.5">min</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-ink font-medium text-sm">{b.title}</div>
                    <div className="text-ink-faint text-xs mt-1 leading-relaxed">{b.detail}</div>
                  </div>
                  <Button variant="soft" size="sm" onClick={b.action.go} className="shrink-0">
                    {b.action.label}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          {plan.length === 0 && (
            <Card className="p-5">
              <p className="text-ink-soft text-sm">
                Nothing outstanding and no weak topics yet — do some practice questions
                first so I have something to work from.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

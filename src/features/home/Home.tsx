import React from "react";
import { useApp } from "@/lib/store";
import { Card, Chip } from "@/components/ui";
import { PHYSICS_TOPICS } from "@/data/topics";
import { DIAGRAMS } from "@/features/econ/diagrams";
import { allCards, dueRedo } from "@/lib/db";
import { dueCards } from "@/lib/srs";
import { nextExam, daysUntil, examsOn, type Exam } from "@/data/exams";
import { useToday } from "@/lib/useToday";

export function Home() {
  const navigate = useApp((s) => s.navigate);
  const [dueCount, setDueCount] = React.useState<number | null>(null);
  const today = useToday(); // re-renders when the day rolls over

  const [redoDue, setRedoDue] = React.useState(0);

  React.useEffect(() => {
    allCards().then((c) => setDueCount(dueCards(c).length));
    dueRedo().then((r) => setRedoDue(r.length));
  }, []);

  // Kept as constants so the home screen doesn't pull the whole visualizer /
  // CS bundle into the initial load (they're code-split behind their routes).
  const interactiveCount = 12;
  const csTopicCount = 13;

  // `today` is a dependency so these recompute when the date changes.
  const now = React.useMemo(() => new Date(), [today]);
  const nextAny = nextExam(undefined, now);
  const nextReal = nextExam("real", now);

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-24">
      <div className="animate-fade-up">
        <p className="text-ink-faint text-sm mb-4">{greeting()}</p>
        <h1 className="font-serif text-3xl sm:text-[2.6rem] leading-[1.2] text-ink">
          Learn it, then prove it.
        </h1>
        <p className="text-ink-soft mt-4 max-w-xl">
          Practise real exam-style questions, mark yourself against the scheme, and
          let the app hunt down what you keep getting wrong.
        </p>
      </div>

      {/* The exam loop — the three things you actually do */}
      <div className="grid sm:grid-cols-3 gap-4 mt-9">
        <ActionCard
          icon="🎯" title="Practice" accent="physics"
          body="Choose subject, topics and difficulty. Timed or untimed."
          onClick={() => navigate({ name: "practice" })}
        />
        <ActionCard
          icon="🔴" title="Fix my weaknesses" accent="econ"
          body={redoDue > 0 ? `${redoDue} question${redoDue === 1 ? "" : "s"} due for a redo.` : "Redo the questions you got wrong."}
          badge={redoDue > 0 ? String(redoDue) : undefined}
          onClick={() => navigate({ name: "practice", preset: "redo" })}
        />
        <ActionCard
          icon="📝" title="Exam mode" accent="compsci"
          body="A full paper under real conditions, then a marked result."
          onClick={() => navigate({ name: "exam" })}
        />
      </div>

      {/* Decide-for-me shortcut */}
      <button
        onClick={() => navigate({ name: "plan" })}
        className="w-full mt-4 rounded-2xl border border-physics/40 bg-physics-soft/60 hover:bg-physics-soft px-5 py-4 flex items-center justify-between transition-colors active:scale-[0.99]"
      >
        <span className="text-physics font-medium">🎯 Give me my next session</span>
        <span className="text-physics/70 text-sm">builds a plan from your weak spots →</span>
      </button>

      <button
        onClick={() => navigate({ name: "progress" })}
        className="w-full mt-3 rounded-2xl border border-line/60 bg-surface hover:bg-surface-2 px-5 py-3.5 flex items-center justify-between transition-colors"
      >
        <span className="text-ink text-sm font-medium">📊 My performance</span>
        <span className="text-ink-faint text-sm">accuracy, weak topics, repeated mistakes →</span>
      </button>

      <div className="text-xs font-medium text-ink-faint uppercase tracking-wide mt-10 mb-3">
        Learn &amp; reference
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <BigCard
          accent="physics"
          eyebrow="Physics 9702"
          title="See it move"
          body={`Interactive models for every concept — ${interactiveCount} you can drag and animate, the rest with the core equations and ideas laid out in full.`}
          meta={`${PHYSICS_TOPICS.length} topics`}
          onClick={() => navigate({ name: "viz" })}
        />
        <BigCard
          accent="econ"
          eyebrow="Economics 9708"
          title="Your graphs"
          body="Every core diagram, editable by dragging the curves — with a real-world example and a full exam breakdown for each."
          meta={`${DIAGRAMS.length} diagrams`}
          onClick={() => navigate({ name: "econ" })}
        />
        <BigCard
          accent="compsci"
          eyebrow="Computer Science 9618"
          title="Worked & alternatives"
          body="Every topic with a worked example — pseudocode, SQL, trace tables — plus an alternative approach you can reveal and compare."
          meta={`${csTopicCount} topics`}
          onClick={() => navigate({ name: "cs" })}
        />
      </div>

      {/* Study tools: spaced-repetition review + exam countdown */}
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <Card onClick={() => navigate({ name: "cards" })} className="lifted p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-wide text-physics">Flashcards</div>
            {dueCount ? <Chip accent="physics">{dueCount} due</Chip> : null}
          </div>
          <div className="font-serif text-xl text-ink mt-2">Review, spaced out</div>
          <p className="text-ink-soft text-sm mt-2 leading-relaxed">
            {dueCount === 0
              ? "All caught up. New cards resurface right before you'd forget them."
              : "Active recall across subjects — the technique research rates highest."}
          </p>
          <div className="flex items-center justify-between mt-5">
            <span className="text-ink-faint text-xs">tap to review</span>
            <span className="text-ink-faint">→</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-econ">
            {nextAny?.kind === "mock" ? "Next mock" : "Next exam"}
          </div>
          {nextAny ? (
            <>
              <Countdown exam={nextAny} now={now} />
              {/* If the nearest is a mock, still show how far the real papers are. */}
              {nextAny.kind === "mock" && nextReal && (
                <div className="mt-4 pt-3 border-t border-line/50 text-sm text-ink-soft">
                  Real exams start in{" "}
                  <span className="text-ink font-medium">{daysUntil(nextReal.date, now)} days</span>{" "}
                  <span className="text-ink-faint">({nextReal.component}, 6 Oct)</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-ink-soft mt-2">No exams scheduled.</div>
          )}
        </Card>
      </div>

      <p className="mt-12 text-ink-faint text-sm">
        Everything is saved on this device — your cards, notes and edited graphs
        reopen exactly as you left them.
      </p>
    </div>
  );
}

function ActionCard({
  icon, title, body, accent, badge, onClick,
}: {
  icon: string; title: string; body: string;
  accent: "physics" | "econ" | "compsci"; badge?: string; onClick: () => void;
}) {
  const ring =
    accent === "physics" ? "hover:border-physics/50" : accent === "econ" ? "hover:border-econ/50" : "hover:border-compsci/50";
  return (
    <Card onClick={onClick} className={`lifted p-5 ${ring}`}>
      <div className="flex items-start justify-between">
        <span className="text-2xl" aria-hidden>{icon}</span>
        {badge && <Chip accent="bad">{badge}</Chip>}
      </div>
      <div className="font-serif text-lg text-ink mt-3">{title}</div>
      <p className="text-ink-soft text-sm mt-1.5 leading-relaxed">{body}</p>
    </Card>
  );
}

function Countdown({ exam, now }: { exam: Exam; now: Date }) {
  const days = daysUntil(exam.date, now);
  const sameDay = examsOn(exam.date);
  const label = days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`;
  return (
    <>
      <div
        className={
          "font-serif text-xl mt-2 " +
          (days <= 3 ? "text-mark-bad" : days <= 10 ? "text-mark-warn" : "text-ink")
        }
      >
        {label}
      </div>
      <p className="text-ink-soft text-sm mt-2">
        {new Date(exam.date + "T00:00:00").toLocaleDateString(undefined, {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </p>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {sameDay.map((e) => (
          <span
            key={e.component + e.label}
            className="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-ink-soft"
          >
            {e.component}
            {e.label ? ` · ${e.label}` : ""}
          </span>
        ))}
      </div>
    </>
  );
}

function BigCard({
  accent,
  eyebrow,
  title,
  body,
  meta,
  onClick,
}: {
  accent: "physics" | "econ" | "compsci";
  eyebrow: string;
  title: string;
  body: string;
  meta: string;
  onClick: () => void;
}) {
  const ring =
    accent === "physics" ? "hover:border-physics/50" : accent === "econ" ? "hover:border-econ/50" : "hover:border-compsci/50";
  const chip =
    accent === "physics" ? "text-physics" : accent === "econ" ? "text-econ" : "text-compsci";
  return (
    <Card onClick={onClick} className={`p-6 ${ring} transition-colors`}>
      <div className={`text-xs font-medium uppercase tracking-wide ${chip}`}>{eyebrow}</div>
      <div className="font-serif text-2xl text-ink mt-2">{title}</div>
      <p className="text-ink-soft text-sm mt-2 leading-relaxed">{body}</p>
      <div className="flex items-center justify-between mt-5">
        <span className="text-ink-faint text-xs">{meta}</span>
        <span className="text-ink-faint">→</span>
      </div>
    </Card>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Late one. Take it gently.";
  if (h < 12) return "Morning.";
  if (h < 17) return "Afternoon.";
  if (h < 22) return "Evening.";
  return "Late one. Take it gently.";
}

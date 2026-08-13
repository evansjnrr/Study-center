import React from "react";
import { useApp } from "@/lib/store";
import { Card, Chip } from "@/components/ui";
import { PHYSICS_TOPICS } from "@/data/topics";
import { DIAGRAMS } from "@/features/econ/diagrams";
import { allCards } from "@/lib/db";
import { dueCards } from "@/lib/srs";
import { nextExam, daysUntil, examsOnNextDate } from "@/data/exams";

export function Home() {
  const navigate = useApp((s) => s.navigate);
  const [dueCount, setDueCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    allCards().then((c) => setDueCount(dueCards(c).length));
  }, []);

  // Kept as constants so the home screen doesn't pull the whole visualizer /
  // CS bundle into the initial load (they're code-split behind their routes).
  const interactiveCount = 12;
  const csTopicCount = 12;
  const exam = nextExam();
  const examDays = exam ? daysUntil(exam.date) : undefined;
  const sameDay = examsOnNextDate();

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-24">
      <div className="animate-fade-up">
        <p className="text-ink-faint text-sm mb-4">{greeting()}</p>
        <h1 className="font-serif text-3xl sm:text-[2.6rem] leading-[1.2] text-ink">
          See the idea, then draw it yourself.
        </h1>
        <p className="text-ink-soft mt-4 max-w-xl">
          A visual study room for three subjects — interactive physics you can play
          with, economics diagrams you can reshape and keep, and computer science
          worked through with an alternative for every idea.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-10">
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
          <div className="text-xs font-medium uppercase tracking-wide text-econ">Next exam</div>
          {exam ? (
            <>
              <div className="font-serif text-xl text-ink mt-2">
                {examDays === 0 ? "Today" : examDays === 1 ? "Tomorrow" : `${examDays} days`}
              </div>
              <p className="text-ink-soft text-sm mt-2">
                {new Date(exam.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {sameDay.map((e) => (
                  <span key={e.component} className="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-ink-soft">
                    {e.component}{e.label ? ` · ${e.label}` : ""}
                  </span>
                ))}
              </div>
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

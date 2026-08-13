import React from "react";
import { useApp } from "@/lib/store";
import { allCards, putCard, logReview } from "@/lib/db";
import { review, intervalPreview, dueCards, interleave, newCard, type Grade } from "@/lib/srs";
import type { CardSubject, Flashcard } from "@/lib/types";
import { Button, Card, Chip, IconBack, ProgressBar, cx } from "@/components/ui";
import { RichText } from "@/components/Katex";
import { Stats } from "./Stats";

const SUBJECTS: { code: CardSubject; name: string; accent: "physics" | "econ" | "compsci" }[] = [
  { code: "9702", name: "Physics", accent: "physics" },
  { code: "9708", name: "Economics", accent: "econ" },
  { code: "9618", name: "Computer Science", accent: "compsci" },
];

type View = "overview" | "review" | "add" | "stats";

export function Flashcards() {
  const back = useApp((s) => s.back);
  const [cards, setCards] = React.useState<Flashcard[]>([]);
  const [view, setView] = React.useState<View>("overview");
  const [queue, setQueue] = React.useState<Flashcard[]>([]);
  const [reviewed, setReviewed] = React.useState(0);

  React.useEffect(() => {
    allCards().then(setCards);
  }, []);

  const now = Date.now();
  const due = dueCards(cards, now);

  function start(subject?: CardSubject) {
    if (subject) {
      // Within-subject: interleave the decks (formulas vs definitions vs …) so
      // consecutive cards keep switching type — that's the interleaving effect.
      const pool = due.filter((c) => c.subject === subject);
      if (pool.length === 0) return;
      setQueue(interleave(pool, (c) => c.deck));
    } else {
      const pool = interleave([...due]); // across subjects
      if (pool.length === 0) return;
      setQueue(pool);
    }
    setReviewed(0);
    setView("review");
  }

  function grade(g: Grade) {
    const current = queue[0];
    if (!current) return;
    const updated = review(current, g);
    putCard(updated);
    logReview({ id: `rv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, at: Date.now(), cardId: current.id, subject: current.subject, grade: g });
    setCards((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
    setQueue((q) => {
      const rest = q.slice(1);
      if (g === "again") rest.splice(Math.min(rest.length, 3), 0, updated);
      return rest;
    });
    setReviewed((r) => r + 1);
  }

  if (view === "review") {
    return (
      <ReviewSession
        queue={queue}
        reviewed={reviewed}
        onGrade={grade}
        onExit={() => { setView("overview"); allCards().then(setCards); }}
      />
    );
  }

  if (view === "add") {
    return (
      <AddCard
        onDone={() => { setView("overview"); allCards().then(setCards); }}
        onCancel={() => setView("overview")}
      />
    );
  }

  if (view === "stats") {
    return <Stats onBack={() => setView("overview")} />;
  }

  // ---- Overview ----
  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-8">
      <IconBack onClick={back} />
      <div className="flex items-start justify-between gap-4 mt-4 mb-2">
        <div>
          <h1 className="font-serif text-3xl text-ink">Flashcards</h1>
          <p className="text-ink-soft mt-2">
            Active recall, spaced out over time — the pair of techniques research keeps
            finding most effective. Cards resurface just before you'd forget them.
          </p>
        </div>
      </div>

      <Card className="lifted p-5 mt-4 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-ink font-medium">
              {due.length > 0 ? `${due.length} card${due.length === 1 ? "" : "s"} due` : "All caught up"}
            </div>
            <div className="text-ink-faint text-sm mt-0.5">
              {due.length > 0 ? "Mixed across subjects (interleaving boosts recall)." : "Nothing due right now — come back later, or review ahead by subject."}
            </div>
          </div>
          <Button variant="primary" accent="physics" disabled={due.length === 0} onClick={() => start()}>
            Review due →
          </Button>
        </div>
      </Card>

      <div className="grid gap-2 mb-6">
        {SUBJECTS.map((s) => {
          const total = cards.filter((c) => c.subject === s.code).length;
          const dueN = due.filter((c) => c.subject === s.code).length;
          return (
            <Card key={s.code} className="px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Chip accent={s.accent}>{s.code}</Chip>
                  <div>
                    <div className="text-ink font-medium">{s.name}</div>
                    <div className="text-ink-faint text-xs">{total} cards · {dueN} due</div>
                  </div>
                </div>
                <Button variant="soft" size="sm" disabled={dueN === 0} onClick={() => start(s.code)}>
                  Review {dueN > 0 ? dueN : ""}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Button variant="soft" onClick={() => setView("add")}>+ Add your own card</Button>
        <Button variant="ghost" onClick={() => setView("stats")}>View stats</Button>
      </div>
    </div>
  );
}

function ReviewSession({
  queue, reviewed, onGrade, onExit,
}: {
  queue: Flashcard[]; reviewed: number; onGrade: (g: Grade) => void; onExit: () => void;
}) {
  const [flipped, setFlipped] = React.useState(false);
  const current = queue[0];

  React.useEffect(() => setFlipped(false), [current?.id]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current) return;
      if (e.code === "Space") { e.preventDefault(); setFlipped((f) => !f); }
      else if (flipped && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        onGrade((["again", "hard", "good", "easy"] as Grade[])[Number(e.key) - 1]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, flipped, onGrade]);

  if (!current) {
    return (
      <div className="max-w-lg mx-auto px-5 py-16 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h1 className="font-serif text-3xl text-ink">Session done.</h1>
        <p className="text-ink-soft mt-3">
          You reviewed {reviewed} card{reviewed === 1 ? "" : "s"}. Each one is scheduled to
          come back at the right time — see you then.
        </p>
        <div className="mt-8"><Button variant="primary" accent="physics" onClick={onExit}>Back to decks</Button></div>
      </div>
    );
  }

  const preview = intervalPreview(current);
  const total = reviewed + queue.length;
  const acc = SUBJECTS.find((s) => s.code === current.subject);

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-6 py-8 min-h-[70vh] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <Button variant="quiet" size="sm" onClick={onExit}>← End session</Button>
        <div className="flex items-center gap-2">
          <Chip accent={acc?.accent}>{acc?.name}</Chip>
          <span className="text-ink-faint text-xs">{current.deck}</span>
        </div>
      </div>
      <ProgressBar value={total ? reviewed / total : 0} accent={acc?.accent} />

      <button
        onClick={() => setFlipped((f) => !f)}
        className="flex-1 my-5 rounded-3xl border border-line/70 bg-surface shadow-soft px-6 py-10 text-center flex flex-col items-center justify-center min-h-[280px] transition-all duration-200 ease-settle hover:shadow-soft-lg active:scale-[0.99]"
      >
        <RichText text={current.front} className="prose-paper text-xl text-ink" />
        {flipped && (
          <>
            <div className="w-full my-6 border-t border-line/60" />
            <RichText text={current.back} className="prose-paper text-ink-soft animate-fade-up" />
          </>
        )}
        {!flipped && <div className="text-ink-faint text-sm mt-8">tap, or press space, to flip</div>}
      </button>

      {flipped ? (
        <div className="grid grid-cols-4 gap-2 animate-fade-up">
          <GradeBtn label="Again" hint={preview.again} tone="bad" onClick={() => onGrade("again")} k="1" />
          <GradeBtn label="Hard" hint={preview.hard} tone="warn" onClick={() => onGrade("hard")} k="2" />
          <GradeBtn label="Good" hint={preview.good} tone="good" onClick={() => onGrade("good")} k="3" />
          <GradeBtn label="Easy" hint={preview.easy} tone="good" onClick={() => onGrade("easy")} k="4" />
        </div>
      ) : (
        <Button variant="primary" accent={acc?.accent} size="lg" onClick={() => setFlipped(true)}>
          Show answer
        </Button>
      )}
    </div>
  );
}

function GradeBtn({ label, hint, tone, onClick, k }: { label: string; hint: string; tone: "good" | "bad" | "warn"; onClick: () => void; k: string }) {
  const tones = {
    good: "border-mark-good/40 text-mark-good hover:bg-mark-good-bg/50",
    bad: "border-mark-bad/40 text-mark-bad hover:bg-mark-bad-bg/50",
    warn: "border-mark-warn/40 text-mark-warn hover:bg-[rgb(var(--mark-warn)/0.12)]",
  }[tone];
  return (
    <button onClick={onClick} className={cx("rounded-2xl border bg-surface py-3 px-2 text-center transition-all duration-150 active:scale-95", tones)}>
      <div className="font-medium text-sm">{label}</div>
      <div className="text-ink-faint text-[0.7rem] mt-0.5">{hint}</div>
      <div className="text-ink-faint text-[0.6rem] mt-1 opacity-70">{k}</div>
    </button>
  );
}

function AddCard({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [subject, setSubject] = React.useState<CardSubject>("9702");
  const [deck, setDeck] = React.useState("Definitions");
  const [front, setFront] = React.useState("");
  const [back, setBack] = React.useState("");

  async function save() {
    if (!front.trim() || !back.trim()) return;
    await putCard(newCard({
      id: `user-${Date.now()}`,
      subject, deck: deck.trim() || "My cards", front: front.trim(), back: back.trim(), source: "user",
    }));
    onDone();
  }

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-6 py-8">
      <Button variant="quiet" size="sm" onClick={onCancel} className="!px-2">← Cancel</Button>
      <h1 className="font-serif text-3xl text-ink mt-4 mb-6">Add a card</h1>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-ink-faint">Subject</span>
            <select value={subject} onChange={(e) => setSubject(e.target.value as CardSubject)} className="mt-1 w-full rounded-xl bg-surface border border-line/60 px-3 py-2 text-sm outline-none">
              {SUBJECTS.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-ink-faint">Deck</span>
            <input value={deck} onChange={(e) => setDeck(e.target.value)} className="mt-1 w-full rounded-xl bg-surface border border-line/60 px-3 py-2 text-sm outline-none" />
          </label>
        </div>
        <label className="block">
          <span className="text-xs text-ink-faint">Front (question) — supports $LaTeX$ and **bold**</span>
          <textarea value={front} onChange={(e) => setFront(e.target.value)} rows={2} className="mt-1 w-full rounded-xl bg-surface border border-line/60 px-3 py-2 text-sm outline-none resize-none" placeholder="e.g. State Newton's second law" />
        </label>
        <label className="block">
          <span className="text-xs text-ink-faint">Back (answer)</span>
          <textarea value={back} onChange={(e) => setBack(e.target.value)} rows={3} className="mt-1 w-full rounded-xl bg-surface border border-line/60 px-3 py-2 text-sm outline-none resize-none" placeholder="e.g. $F = \\Delta p / \\Delta t$" />
        </label>
        {(front || back) && (
          <div className="rounded-2xl border border-line/60 bg-surface-2/50 p-4">
            <div className="text-xs text-ink-faint mb-2">Preview</div>
            <RichText text={front || "…"} className="prose-paper text-ink" />
            {back && <><div className="my-3 border-t border-line/60" /><RichText text={back} className="prose-paper text-ink-soft" /></>}
          </div>
        )}
        <Button variant="primary" accent="physics" onClick={save} disabled={!front.trim() || !back.trim()}>Save card</Button>
      </div>
    </div>
  );
}

function shuffleKeep(arr: Flashcard[]): Flashcard[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

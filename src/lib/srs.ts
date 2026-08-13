import type { Flashcard } from "./types";

// ------------------------------------------------------------------
// Spaced repetition — a simplified, faithful SM-2 scheduler working at
// day granularity. Reviewing a card just before you'd forget it resets
// the forgetting curve; each success pushes the next review further out.
// ------------------------------------------------------------------

export const DAY = 86_400_000;
export type Grade = "again" | "hard" | "good" | "easy";

export function isDue(card: Flashcard, now = Date.now()): boolean {
  return card.due <= now;
}

/** Apply a review grade, returning the updated card (pure). */
export function review(card: Flashcard, grade: Grade, now = Date.now()): Flashcard {
  let { ease, interval, reps, lapses } = card;

  if (grade === "again") {
    reps = 0;
    lapses += 1;
    ease = Math.max(1.3, ease - 0.2);
    interval = 0; // resurfaces again this session
  } else if (grade === "hard") {
    ease = Math.max(1.3, ease - 0.15);
    interval = interval < 1 ? 1 : Math.round(interval * 1.2);
    reps += 1;
  } else if (grade === "good") {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 3;
    else interval = Math.round(interval * ease);
    reps += 1;
  } else {
    // easy
    ease = ease + 0.15;
    const base = interval < 1 ? 1 : interval;
    interval = Math.round(base * ease * 1.3);
    reps += 1;
  }

  const due = grade === "again" ? now : now + interval * DAY;
  return { ...card, ease, interval, reps, lapses, due };
}

/** Preview the next interval for each grade, as a short human label. */
export function intervalPreview(card: Flashcard): Record<Grade, string> {
  const fmt = (c: Flashcard) => {
    if (c.interval <= 0) return "now";
    if (c.interval === 1) return "1 day";
    if (c.interval < 30) return `${c.interval} days`;
    if (c.interval < 365) return `${Math.round(c.interval / 30)} mo`;
    return `${(c.interval / 365).toFixed(1)} yr`;
  };
  return {
    again: "now",
    hard: fmt(review(card, "hard")),
    good: fmt(review(card, "good")),
    easy: fmt(review(card, "easy")),
  };
}

export function dueCards(cards: Flashcard[], now = Date.now()): Flashcard[] {
  return cards.filter((c) => c.due <= now);
}

/**
 * Interleave due cards by some key (mix, don't block). Defaults to subject —
 * pass `c => c.deck` to interleave decks/topic-types *within* one subject, which
 * forces you to keep switching strategy (the whole point of interleaving).
 */
export function interleave(
  cards: Flashcard[],
  keyFn: (c: Flashcard) => string = (c) => c.subject,
): Flashcard[] {
  const groups = new Map<string, Flashcard[]>();
  for (const c of cards) {
    const k = keyFn(c);
    const arr = groups.get(k) ?? [];
    arr.push(c);
    groups.set(k, arr);
  }
  // light shuffle within each group
  for (const arr of groups.values()) shuffle(arr);
  const queues = [...groups.values()];
  const out: Flashcard[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const q of queues) {
      const c = q.shift();
      if (c) {
        out.push(c);
        added = true;
      }
    }
  }
  return out;
}

export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function newCard(
  partial: Omit<Flashcard, "ease" | "interval" | "due" | "reps" | "lapses" | "createdAt">,
): Flashcard {
  return {
    ease: 2.5,
    interval: 0,
    due: Date.now(),
    reps: 0,
    lapses: 0,
    createdAt: Date.now(),
    ...partial,
  };
}

// ------------------------------------------------------------------
// Domain types — a visual study tool (physics visuals + econ graphs).
// ------------------------------------------------------------------

export type SubjectCode = "9702" | "9708";

// A saved economics diagram — the user's personal edits, kept forever.
export interface SavedDiagram {
  id: string; // diagram template id, e.g. "supply-demand"
  // Free geometry the editor exposes (curve positions), flattened to numbers.
  params: Record<string, number>;
  labels?: Record<string, string>;
  notes?: string;
  updatedAt: number;
}

export type CardSubject = "9702" | "9708" | "9618";

// A spaced-repetition flashcard (active recall). SRS state is SM-2 style.
export interface Flashcard {
  id: string;
  subject: CardSubject;
  deck: string; // e.g. "Formulas", "Definitions"
  front: string; // may contain $latex$ and **bold**
  back: string;
  ease: number; // ease factor, starts 2.5
  interval: number; // days until next review
  due: number; // ms timestamp when due
  reps: number; // successful reviews in a row
  lapses: number;
  createdAt: number;
  source: "seed" | "user";
}

// A free-text note keyed by a surface (e.g. Feynman explanation of a topic).
export interface Note {
  id: string;
  text: string;
  updatedAt: number;
}

// One logged flashcard review — powers the stats view.
export interface ReviewLog {
  id: string;
  at: number;
  cardId: string;
  subject: CardSubject;
  grade: "again" | "hard" | "good" | "easy";
}

export interface Settings {
  id: "settings";
  theme: "light" | "dark" | "system";
  reduceMotion: boolean;
  // Worked-example preferences
  revealStepwise: boolean; // reveal solutions one step at a time
  showDiagrams: boolean; // show the mini dynamic diagram
  randomizeOnOpen: boolean; // fresh numbers each time a topic opens
  // Read-aloud (text-to-speech) preferences
  voiceURI?: string; // chosen voice; empty = best available
  speechRate: number; // 0.6 – 1.6
  // Touch comfort — larger tap targets for phone/tablet use
  bigTapTargets: boolean;
  // AI examiner. The key never leaves this device except to call Anthropic
  // directly from the browser; there is no backend.
  apiKey?: string;
  /** Mark with the AI as soon as the mark scheme is revealed, without asking. */
  autoMarkWithAI: boolean;
}

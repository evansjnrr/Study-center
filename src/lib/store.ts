import { create } from "zustand";
import type { Settings } from "./types";
import { getSettings, putSettings, countCards, putCards } from "./db";
import { seedCards } from "@/data/flashcards";

// ------------------------------------------------------------------
// A visual study tool: physics concept visuals + economics graphs.
// Lightweight state router (no router dep). One tap deep, never more.
// ------------------------------------------------------------------
export type Route =
  | { name: "home" }
  | { name: "viz"; topicId?: string } // physics concept visualizers
  | { name: "econ"; diagramId?: string } // economics graph editor
  | { name: "cs"; topicId?: string } // computer science examples
  | { name: "cards"; mode?: string } // spaced-repetition flashcards
  | { name: "settings" };

interface AppState {
  ready: boolean;
  settings: Settings;
  route: Route;
  history: Route[];

  boot: () => Promise<void>;
  navigate: (r: Route) => void;
  back: () => void;
  saveSettings: (patch: Partial<Settings>) => Promise<void>;
  applyTheme: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  id: "settings",
  theme: "dark",
  reduceMotion: false,
  revealStepwise: true,
  showDiagrams: true,
  randomizeOnOpen: true,
};

export const useApp = create<AppState>((set, get) => ({
  ready: false,
  settings: DEFAULT_SETTINGS,
  route: { name: "home" },
  history: [],

  boot: async () => {
    const saved = await getSettings();
    // Merge so any newly-added setting fields fall back to their defaults.
    const settings = { ...DEFAULT_SETTINGS, ...(saved ?? {}) };
    await putSettings(settings);
    // Seed the flashcard decks once.
    if ((await countCards()) === 0) await putCards(seedCards());
    set({ settings, ready: true });
    get().applyTheme();
  },

  navigate: (r) =>
    set((s) => ({ route: r, history: [...s.history, s.route].slice(-30) })),

  back: () =>
    set((s) => {
      if (s.history.length === 0) return { route: { name: "home" } };
      const prev = s.history[s.history.length - 1];
      return { route: prev, history: s.history.slice(0, -1) };
    }),

  saveSettings: async (patch) => {
    const next = { ...get().settings, ...patch };
    await putSettings(next);
    set({ settings: next });
    if ("theme" in patch || "reduceMotion" in patch) get().applyTheme();
  },

  applyTheme: () => {
    const { theme } = get().settings;
    const prefersDark =
      window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    const dark = theme === "dark" || (theme === "system" && prefersDark);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("reduce-motion", !!get().settings.reduceMotion);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#070709" : "#f7f8fa");
  },
}));

// Keep system theme in sync.
if (typeof window !== "undefined") {
  window
    .matchMedia?.("(prefers-color-scheme: dark)")
    .addEventListener?.("change", () => {
      const st = useApp.getState();
      if (st.settings.theme === "system") st.applyTheme();
    });
}

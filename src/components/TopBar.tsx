import { useApp } from "@/lib/store";
import { Button } from "./ui";
import { TimerWidget } from "@/features/timer/TimerWidget";

export function TopBar() {
  const { route, navigate, settings, saveSettings } = useApp();
  const onHome = route.name === "home";

  const nextTheme =
    settings.theme === "light" ? "dark" : settings.theme === "dark" ? "system" : "light";
  const themeGlyph =
    settings.theme === "light" ? "☀" : settings.theme === "dark" ? "☾" : "◐";

  return (
    <header className="sticky top-3 z-30 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto min-h-12 py-1 flex items-center justify-between gap-2 rounded-full border border-line/70 bg-surface/60 backdrop-blur-xl pl-4 pr-2 shadow-[0_10px_36px_rgb(var(--shadow)/0.35)]">
        <button
          onClick={() => navigate({ name: "home" })}
          className="flex items-center gap-2.5 text-ink hover:opacity-80 transition-opacity"
        >
          <span className="w-6 h-6 rounded-lg grid place-items-center" style={{ background: "linear-gradient(135deg, rgb(var(--physics)), rgb(var(--econ)))" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 15l3-6 2 4 2-3 3 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <span className="font-serif text-lg text-ink">Study Center</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
            title="Search (Ctrl/⌘ + K)"
            className="hidden sm:flex items-center gap-2 text-ink-faint hover:text-ink-soft text-sm px-2.5 py-1.5 rounded-xl border border-line/60 bg-surface-2/50 hover:bg-surface-2 transition-colors"
          >
            <span>⌕ Search</span>
            <kbd className="text-[0.6rem] border border-line/60 rounded px-1 py-0.5">⌘K</kbd>
          </button>
          <Button variant="quiet" size="sm" onClick={() => navigate({ name: "cards" })} title="Flashcards">
            Cards
          </Button>
          <TimerWidget />
          {!onHome && (
            <Button variant="quiet" size="sm" onClick={() => navigate({ name: "home" })}>
              Home
            </Button>
          )}
          <Button
            variant="quiet"
            size="sm"
            aria-label="Toggle theme"
            title={`Theme: ${settings.theme}`}
            onClick={() => saveSettings({ theme: nextTheme })}
            className="!px-2.5 text-base"
          >
            {themeGlyph}
          </Button>
          <Button
            variant="quiet"
            size="sm"
            aria-label="Settings"
            onClick={() => navigate({ name: "settings" })}
            className="!px-2.5 text-base"
          >
            ⚙
          </Button>
        </div>
      </div>
    </header>
  );
}

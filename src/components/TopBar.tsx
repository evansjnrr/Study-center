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
      <div className="max-w-4xl mx-auto min-h-12 py-1 flex items-center justify-between gap-2 rounded-xl border border-line/70 bg-surface/70 backdrop-blur-xl pl-4 pr-2">
        <button
          onClick={() => navigate({ name: "home" })}
          className="flex items-center gap-2.5 text-ink hover:opacity-70 transition-opacity"
        >
          {/* Stacked monogram, the way the reference sets its mark. */}
          <span className="font-serif text-[0.6rem] font-bold leading-[1.05] tracking-[0.1em] text-ink text-left">
            ST
            <br />
            CE
          </span>
          {/* The wordmark is the first thing to go when space is tight — the
              monogram still identifies the button. */}
          <span className="hidden xs:inline text-ink text-xs font-semibold uppercase tracking-[0.18em] sm:tracking-[0.22em]">
            Study Center
          </span>
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

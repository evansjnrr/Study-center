import React from "react";
import { cx } from "@/components/ui";

// A quiet Pomodoro timer. Research links Pomodoro-style breaks to lower burnout
// and stress rather than raw productivity — so this stays calm, not gamified.

const PRESETS = [
  { label: "25 / 5", focus: 25, brk: 5 },
  { label: "50 / 10", focus: 50, brk: 10 },
];

export function TimerWidget() {
  const [preset, setPreset] = React.useState(PRESETS[0]);
  const [mode, setMode] = React.useState<"focus" | "break">("focus");
  const [secs, setSecs] = React.useState(PRESETS[0].focus * 60);
  const [running, setRunning] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const totalForMode = (mode === "focus" ? preset.focus : preset.brk) * 60;

  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          // Segment finished — switch mode and pause.
          const nextMode = mode === "focus" ? "break" : "focus";
          setMode(nextMode);
          setRunning(false);
          try { document.title = nextMode === "break" ? "Break time · Study Center" : "Back to it · Study Center"; } catch {}
          return (nextMode === "focus" ? preset.focus : preset.brk) * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, mode, preset]);

  function reset(toMode: "focus" | "break" = "focus") {
    setRunning(false);
    setMode(toMode);
    setSecs((toMode === "focus" ? preset.focus : preset.brk) * 60);
  }

  function choosePreset(p: (typeof PRESETS)[number]) {
    setPreset(p);
    setRunning(false);
    setMode("focus");
    setSecs(p.focus * 60);
  }

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const progress = 1 - secs / totalForMode;
  const R = 9, C = 2 * Math.PI * R;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm transition-colors",
          running ? "text-ink bg-surface-2" : "text-ink-faint hover:text-ink hover:bg-surface-2",
        )}
        title="Focus timer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" className="-ml-0.5">
          <circle cx="12" cy="12" r={R} fill="none" stroke="rgb(var(--line))" strokeWidth="2.5" />
          <circle
            cx="12" cy="12" r={R} fill="none"
            stroke={mode === "focus" ? "rgb(var(--physics))" : "rgb(var(--mark-good))"}
            strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - progress)}
            transform="rotate(-90 12 12)"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        {(running || secs !== preset.focus * 60) && <span className="tabular-nums font-mono text-xs">{mm}:{ss}</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 z-40 rounded-2xl border border-line bg-surface shadow-soft-lg p-4 animate-fade-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-ink font-medium text-sm">Focus timer</span>
              <span className={cx("text-xs px-2 py-0.5 rounded-full", mode === "focus" ? "bg-physics-soft text-physics" : "bg-mark-good-bg text-mark-good")}>
                {mode === "focus" ? "Focus" : "Break"}
              </span>
            </div>
            <div className="text-center font-mono text-4xl text-ink tabular-nums my-2">{mm}:{ss}</div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setRunning((r) => !r)}
                className="flex-1 rounded-xl bg-ink text-paper py-2 text-sm font-medium active:scale-95 transition-transform"
              >
                {running ? "Pause" : "Start"}
              </button>
              <button onClick={() => reset(mode)} className="rounded-xl border border-line/60 bg-surface-2 text-ink-soft px-3 py-2 text-sm active:scale-95 transition-transform">
                Reset
              </button>
            </div>
            <div className="flex gap-1.5 mt-3">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => choosePreset(p)}
                  className={cx("flex-1 rounded-lg py-1.5 text-xs border transition-colors", preset.label === p.label ? "bg-physics-soft text-physics border-physics/40" : "bg-surface-2 text-ink-faint border-line/60")}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-ink-faint text-xs mt-3 leading-relaxed">
              Work in focused stretches with short breaks — it eases stress and keeps you going for longer.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

import React from "react";
import { cx } from "@/components/ui";

// A steady animation clock. Returns elapsed seconds; pass `run` to pause.
export function useClock(run: boolean = true): number {
  const [t, setT] = React.useState(0);
  const raf = React.useRef<number>();
  const start = React.useRef<number>(0);
  const base = React.useRef<number>(0);
  React.useEffect(() => {
    if (!run) return;
    start.current = performance.now();
    const loop = (now: number) => {
      setT(base.current + (now - start.current) / 1000);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      base.current = base.current + (performance.now() - start.current) / 1000;
    };
  }, [run]);
  return t;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1">
        <span className="text-ink-soft text-sm">{label}</span>
        <span className="text-ink font-mono text-sm tabular-nums">
          {format ? format(value) : value}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[rgb(var(--physics))] cursor-pointer"
      />
    </label>
  );
}

export function Readout({ items }: { items: { label: string; value: string; tone?: "good" | "bad" | "warn" }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl bg-surface-2/70 border border-line/50 px-3 py-2">
          <div className="text-ink-faint text-xs">{it.label}</div>
          <div
            className={cx(
              "font-mono text-sm mt-0.5",
              it.tone === "good" ? "text-mark-good" : it.tone === "bad" ? "text-mark-bad" : "text-ink",
            )}
          >
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// The stage: an SVG canvas with a dark, gridless neutral backdrop.
export function Stage({
  viewBox,
  children,
  className,
}: {
  viewBox: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("rounded-2xl border border-line/60 bg-surface overflow-hidden", className)}>
      <svg viewBox={viewBox} className="w-full block" style={{ maxHeight: "48vh" }}>
        {children}
      </svg>
    </div>
  );
}

export function PlayButton({ running, onToggle }: { running: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="px-3 py-1.5 rounded-xl text-sm bg-physics-soft text-physics border border-physics/40 hover:brightness-110 active:scale-95 transition-[background-color,border-color,color,transform,box-shadow,opacity] duration-150"
    >
      {running ? "❚❚ Pause" : "▶ Play"}
    </button>
  );
}

// Colours pulled from CSS vars so visualizers track the theme.
export const VIZ = {
  physics: "rgb(var(--physics))",
  ink: "rgb(var(--ink))",
  soft: "rgb(var(--ink-soft))",
  faint: "rgb(var(--ink-faint))",
  line: "rgb(var(--line))",
  good: "rgb(var(--mark-good))",
  bad: "rgb(var(--mark-bad))",
  warn: "rgb(var(--mark-warn))",
  econ: "rgb(var(--econ))",
};

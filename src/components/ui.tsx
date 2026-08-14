import React from "react";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "soft" | "ghost" | "quiet";
  size?: "sm" | "md" | "lg";
  /**
   * Retained so existing call sites keep working. The palette is monochrome
   * now, so it no longer changes the colour — a primary action is always the
   * off-white, whatever subject it belongs to.
   */
  accent?: "physics" | "compsci" | "econ" | "ink";
};

export function Button({
  variant = "soft",
  size = "md",
  className,
  children,
  ...rest
}: BtnProps) {
  const sizes = {
    sm: "px-3.5 py-1.5 text-xs rounded-xl",
    md: "px-5 py-2.5 text-[0.8rem] rounded-xl",
    lg: "px-7 py-3.5 text-[0.85rem] rounded-xl",
  }[size];

  // CTAs are set in wide-tracked caps, the way the reference sets its buttons.
  const caps = "uppercase tracking-[0.14em] font-semibold";

  const variants = {
    primary: cx(caps, "bg-ink text-paper hover:bg-ink/90 active:bg-ink/80"),
    outline: cx(
      caps,
      "bg-transparent text-ink border border-ink/35 hover:border-ink/70 hover:bg-ink/[0.04]",
    ),
    soft: "bg-surface-2 text-ink hover:bg-line/50 border border-line/60 font-medium",
    ghost: "bg-transparent text-ink-soft hover:bg-surface-2 font-medium",
    quiet: "bg-transparent text-ink-faint hover:text-ink font-medium",
  }[variant];

  return (
    <button
      className={cx(
        "transition-all duration-200 ease-settle disabled:opacity-35 disabled:pointer-events-none inline-flex items-center justify-center gap-2 active:scale-[0.98] select-none",
        sizes,
        variants,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Card({
  className,
  children,
  onClick,
  as = "div",
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  as?: "div" | "button";
}) {
  const Comp: any = onClick ? "button" : as;
  return (
    <Comp
      onClick={onClick}
      className={cx(
        // Hairline-bordered panel on graphite — no drop shadow by default,
        // depth comes from the tone step, as in the reference.
        "bg-surface border border-line/60 rounded-2xl",
        onClick &&
          "text-left w-full hover:border-line hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.995] transition-all duration-200 ease-settle cursor-pointer",
        className,
      )}
    >
      {children}
    </Comp>
  );
}

export function Chip({
  children,
  accent,
  className,
}: {
  children: React.ReactNode;
  accent?: "physics" | "compsci" | "econ" | "good" | "bad" | "warn";
  className?: string;
}) {
  // Subject chips are monochrome — the subject is always named in the text
  // beside them, so hue isn't carrying the meaning. Mark chips stay coloured.
  const styles: Record<string, string> = {
    physics: "bg-surface-2 text-ink-soft border border-line/60",
    compsci: "bg-surface-2 text-ink-soft border border-line/60",
    econ: "bg-surface-2 text-ink-soft border border-line/60",
    good: "bg-mark-good-bg text-mark-good border border-mark-good/25",
    bad: "bg-mark-bad-bg text-mark-bad border border-mark-bad/25",
    warn: "bg-[rgb(var(--mark-warn)/0.12)] text-mark-warn border border-mark-warn/25",
    neutral: "bg-surface-2 text-ink-soft border border-line/60",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[0.65rem] font-semibold uppercase tracking-[0.14em]",
        styles[accent ?? "neutral"],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function subjectAccent(subject: string): "physics" | "compsci" | "econ" {
  return subject === "9702" ? "physics" : subject === "9618" ? "compsci" : "econ";
}

export function IconBack({ onClick, label = "Back" }: { onClick: () => void; label?: string }) {
  return (
    <Button variant="quiet" size="sm" onClick={onClick} className="!px-2">
      <span aria-hidden>←</span> {label}
    </Button>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-ink-soft">
      <span className="inline-block w-4 h-4 rounded-full border-2 border-line border-t-ink-soft animate-spin" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

// A hairline progress rule. Monochrome — `accent` is accepted only so the
// existing call sites don't all need editing.
export function ProgressBar({ value }: { value: number; accent?: string }) {
  return (
    <div className="h-px w-full bg-line/70 overflow-hidden">
      <div
        className="h-full bg-ink transition-all duration-500 ease-settle"
        style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }}
      />
    </div>
  );
}

/**
 * A tiny wide-tracked uppercase caption — the reference leans on these
 * heavily to label sections without shouting.
 */
export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("label", className)}>{children}</div>;
}

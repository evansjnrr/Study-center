import React from "react";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "soft" | "ghost" | "quiet";
  size?: "sm" | "md" | "lg";
  accent?: "physics" | "compsci" | "econ" | "ink";
};

export function Button({
  variant = "soft",
  size = "md",
  accent = "ink",
  className,
  children,
  ...rest
}: BtnProps) {
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-xl",
    md: "px-4 py-2.5 text-[0.95rem] rounded-2xl",
    lg: "px-6 py-3.5 text-base rounded-2xl",
  }[size];

  const accentBg =
    accent === "physics"
      ? "bg-physics text-white shadow-[0_6px_24px_rgb(var(--physics)/0.45)]"
      : accent === "compsci"
      ? "bg-compsci text-white shadow-[0_6px_24px_rgb(var(--compsci)/0.45)]"
      : accent === "econ"
      ? "bg-econ text-white shadow-[0_6px_24px_rgb(var(--econ)/0.40)]"
      : "bg-ink text-paper shadow-soft";

  const variants = {
    primary: cx(accentBg, "hover:brightness-110 active:brightness-95"),
    soft: "bg-surface-2 text-ink hover:bg-line/50 border border-line/60",
    ghost: "bg-transparent text-ink-soft hover:bg-surface-2",
    quiet: "bg-transparent text-ink-faint hover:text-ink",
  }[variant];

  return (
    <button
      className={cx(
        "font-medium transition-all duration-200 ease-settle disabled:opacity-40 disabled:pointer-events-none inline-flex items-center justify-center gap-2 active:scale-[0.96] select-none",
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
        "bg-surface border border-line/70 rounded-3xl shadow-soft",
        onClick &&
          "text-left w-full hover:shadow-soft-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 ease-settle cursor-pointer",
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
  const styles: Record<string, string> = {
    physics: "bg-physics-soft text-physics",
    compsci: "bg-compsci-soft text-compsci",
    econ: "bg-econ-soft text-econ",
    good: "bg-mark-good-bg text-mark-good",
    bad: "bg-mark-bad-bg text-mark-bad",
    warn: "bg-[rgb(var(--mark-warn)/0.14)] text-mark-warn",
    neutral: "bg-surface-2 text-ink-soft",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
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

// A quiet, thin progress bar (no ticking countdown).
export function ProgressBar({ value, accent = "physics" }: { value: number; accent?: string }) {
  const bg =
    accent === "physics" ? "bg-physics" : accent === "compsci" ? "bg-compsci" : accent === "econ" ? "bg-econ" : "bg-ink";
  return (
    <div className="h-1 w-full rounded-full bg-line/50 overflow-hidden">
      <div
        className={cx("h-full rounded-full transition-all duration-500 ease-settle", bg)}
        style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }}
      />
    </div>
  );
}

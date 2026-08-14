/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // Small phones get their own step — 375px-wide screens were having to
      // wear the same type scale as a tablet.
      screens: {
        xs: "400px",
      },
      fontFamily: {
        // Geometric sans — the closest freely-licensed match for Cera CY.
        // Self-hosted variable font, so it still works offline.
        sans: [
          "Jost Variable",
          "Jost",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        // "serif" is repurposed as the display face for headings (same family,
        // differentiated by weight/tracking in index.css).
        serif: ["Jost Variable", "Jost", "system-ui", "sans-serif"],
        mono: [
          "JetBrains Mono Variable",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      colors: {
        // Warm neutral base — bone / warm grey / soft cream.
        // Driven by CSS variables so dark mode can be tuned warm, not blue.
        paper: "rgb(var(--paper) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--ink-soft) / <alpha-value>)",
        "ink-faint": "rgb(var(--ink-faint) / <alpha-value>)",
        // Marking colours — soft, never harsh
        "mark-good": "rgb(var(--mark-good) / <alpha-value>)",
        "mark-good-bg": "rgb(var(--mark-good-bg) / <alpha-value>)",
        "mark-bad": "rgb(var(--mark-bad) / <alpha-value>)",
        "mark-bad-bg": "rgb(var(--mark-bad-bg) / <alpha-value>)",
        "mark-warn": "rgb(var(--mark-warn) / <alpha-value>)",
        // Subject accents (one soft accent per subject for wayfinding)
        physics: "rgb(var(--physics) / <alpha-value>)",
        "physics-soft": "rgb(var(--physics-soft) / <alpha-value>)",
        compsci: "rgb(var(--compsci) / <alpha-value>)",
        "compsci-soft": "rgb(var(--compsci-soft) / <alpha-value>)",
        econ: "rgb(var(--econ) / <alpha-value>)",
        "econ-soft": "rgb(var(--econ-soft) / <alpha-value>)",
      },
      // Squarer than before — the reference's language is rectangular, with
      // just enough softening to avoid looking like a wireframe.
      borderRadius: {
        xl: "0.5rem",
        "2xl": "0.625rem",
        "3xl": "0.875rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(var(--shadow) / 0.04), 0 4px 16px rgb(var(--shadow) / 0.06)",
        "soft-lg":
          "0 2px 4px rgb(var(--shadow) / 0.05), 0 12px 40px rgb(var(--shadow) / 0.10)",
      },
      transitionTimingFunction: {
        settle: "cubic-bezier(0.22, 0.61, 0.36, 1)",
        // A touch of overshoot — makes taps feel like they respond rather
        // than merely change.
        spring: "cubic-bezier(0.34, 1.32, 0.58, 1)",
        // Slow out, for anything large or ambient.
        drift: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-up-panel": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        // Entrance for stacked content — a longer, softer version of fade-up
        // that reads well when several are staggered behind each other.
        rise: {
          "0%": { opacity: "0", transform: "translate3d(0, 14px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms cubic-bezier(0.22,0.61,0.36,1)",
        "fade-up": "fade-up 260ms cubic-bezier(0.22,0.61,0.36,1) both",
        "slide-in-right": "slide-in-right 200ms cubic-bezier(0.22,0.61,0.36,1)",
        "slide-up-panel": "slide-up-panel 240ms cubic-bezier(0.22,0.61,0.36,1)",
        rise: "rise 520ms cubic-bezier(0.22,0.61,0.36,1) both",
      },
    },
  },
  plugins: [],
};

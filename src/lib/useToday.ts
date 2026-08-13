import React from "react";
import { todayISO } from "@/data/exams";

/**
 * Returns today's ISO date, re-rendering when the day actually changes.
 * Without this a countdown computed on mount goes stale for anyone who leaves
 * the app (or the installed PWA) open across midnight.
 */
export function useToday(): string {
  const [day, setDay] = React.useState(() => todayISO());

  React.useEffect(() => {
    let timer: number;

    const check = () => {
      const now = todayISO();
      setDay((prev) => (prev === now ? prev : now));
    };

    const scheduleMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        5, // a few seconds past midnight
      );
      timer = window.setTimeout(() => {
        check();
        scheduleMidnight();
      }, nextMidnight.getTime() - now.getTime());
    };

    scheduleMidnight();
    // Also re-check whenever the app is refocused / restored from background.
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  return day;
}

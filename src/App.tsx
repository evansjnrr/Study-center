import React from "react";
import { useApp } from "@/lib/store";
import { Home } from "@/features/home/Home";
import { CommandPalette } from "@/features/search/CommandPalette";
import { TopBar } from "@/components/TopBar";

// Heavy feature screens are code-split so the first load stays small.
const Visualize = React.lazy(() => import("@/features/visualize/Visualize").then((m) => ({ default: m.Visualize })));
const EconGraphs = React.lazy(() => import("@/features/econ/EconGraphs").then((m) => ({ default: m.EconGraphs })));
const ComputerScience = React.lazy(() => import("@/features/cs/ComputerScience").then((m) => ({ default: m.ComputerScience })));
const Flashcards = React.lazy(() => import("@/features/cards/Flashcards").then((m) => ({ default: m.Flashcards })));
const SettingsScreen = React.lazy(() => import("@/features/settings/Settings").then((m) => ({ default: m.SettingsScreen })));
const Practice = React.lazy(() => import("@/features/practice/Practice").then((m) => ({ default: m.Practice })));
const Weakness = React.lazy(() => import("@/features/practice/Weakness").then((m) => ({ default: m.Weakness })));

export default function App() {
  const { ready, boot } = useApp();
  const route = useApp((s) => s.route);

  React.useEffect(() => {
    boot();
  }, [boot]);

  if (!ready) {
    return (
      <div className="min-h-full grid place-items-center">
        <div className="text-ink-faint animate-fade-in text-sm">
          a quiet room, good light…
        </div>
      </div>
    );
  }

  // A key that changes on every navigation so the screen re-mounts and its
  // entrance animation replays — giving a smooth transition between pages.
  const routeKey = `${route.name}:${(route as any).topicId ?? (route as any).diagramId ?? ""}`;

  return (
    <div className="min-h-full flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-ink focus:text-paper focus:shadow-soft-lg"
      >
        Skip to content
      </a>
      <TopBar />
      <main id="main" tabIndex={-1} className="flex-1 min-h-0 outline-none">
        <div key={routeKey} className="animate-fade-up">
          <React.Suspense fallback={<div className="h-64 grid place-items-center text-ink-faint text-sm">loading…</div>}>
            <Screen />
          </React.Suspense>
        </div>
      </main>
      <CommandPalette />
    </div>
  );
}

function Screen() {
  const route = useApp((s) => s.route);
  switch (route.name) {
    case "home":
      return <Home />;
    case "viz":
      return <Visualize topicId={route.topicId} />;
    case "econ":
      return <EconGraphs diagramId={route.diagramId} />;
    case "cs":
      return <ComputerScience topicId={route.topicId} />;
    case "cards":
      return <Flashcards />;
    case "practice":
      return <Practice preset={route.preset} />;
    case "progress":
      return <Weakness />;
    case "settings":
      return <SettingsScreen />;
    default:
      return <Home />;
  }
}

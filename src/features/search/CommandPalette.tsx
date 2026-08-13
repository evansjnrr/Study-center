import React from "react";
import { useApp, type Route } from "@/lib/store";
import { PHYSICS_TOPICS } from "@/data/topics";
import { DIAGRAMS } from "@/features/econ/diagrams";
import { CS_TOPICS } from "@/features/cs/cs-data";
import { cx } from "@/components/ui";

interface Cmd {
  id: string;
  label: string;
  sub?: string;
  group: string;
  keywords?: string;
  route: Route;
}

function buildIndex(): Cmd[] {
  const items: Cmd[] = [];
  items.push(
    { id: "p-home", label: "Home", group: "Go to", route: { name: "home" } },
    { id: "p-cards", label: "Flashcards", sub: "spaced repetition", group: "Go to", route: { name: "cards" } },
    { id: "p-viz", label: "Physics — See it move", group: "Go to", route: { name: "viz" } },
    { id: "p-econ", label: "Economics graphs", group: "Go to", route: { name: "econ" } },
    { id: "p-cs", label: "Computer Science", group: "Go to", route: { name: "cs" } },
    { id: "p-settings", label: "Settings", group: "Go to", route: { name: "settings" } },
  );
  for (const t of PHYSICS_TOPICS) {
    items.push({ id: `phy-${t.id}`, label: t.name, sub: "Physics concept", group: "Physics", route: { name: "viz", topicId: t.id } });
  }
  for (const d of DIAGRAMS) {
    items.push({ id: `econ-${d.id}`, label: d.name, sub: `${d.category} · diagram`, group: "Economics", keywords: d.note, route: { name: "econ", diagramId: d.id } });
  }
  for (const t of CS_TOPICS) {
    items.push({ id: `cs-${t.id}`, label: t.name, sub: "Computer Science", group: "Computer Science", keywords: t.summary, route: { name: "cs", topicId: t.id } });
  }
  return items;
}

function score(item: Cmd, q: string): number {
  const hay = (item.label + " " + (item.sub ?? "") + " " + (item.keywords ?? "")).toLowerCase();
  const label = item.label.toLowerCase();
  if (label === q) return 100;
  if (label.startsWith(q)) return 80;
  if (label.includes(q)) return 60;
  if (hay.includes(q)) return 40;
  // loose subsequence match
  let i = 0;
  for (const ch of label) if (ch === q[i]) i++;
  return i === q.length ? 20 : 0;
}

export function CommandPalette() {
  const navigate = useApp((s) => s.navigate);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const index = React.useMemo(buildIndex, []);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.filter((i) => i.group === "Go to");
    return index
      .map((i) => ({ i, s: score(i, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 24)
      .map((x) => x.i);
  }, [query, index]);

  // Global open shortcut (⌘K / Ctrl+K) + a button-triggered event.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    function onOpenEvent() { setOpen(true); }
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpenEvent);
    };
  }, []);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  React.useEffect(() => setActive(0), [query]);

  function choose(item: Cmd) {
    setOpen(false);
    navigate(item.route);
  }

  function onListKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); const r = results[active]; if (r) choose(r); }
  }

  React.useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    (el as HTMLElement | null)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  // group results in display order
  const groups: { name: string; items: { item: Cmd; idx: number }[] }[] = [];
  results.forEach((item, idx) => {
    let grp = groups.find((g) => g.name === item.group);
    if (!grp) { grp = { name: item.group, items: [] }; groups.push(grp); }
    grp.items.push({ item, idx });
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4" role="dialog" aria-modal aria-label="Search concepts, diagrams and topics">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl bg-surface border border-line rounded-2xl shadow-soft-lg overflow-hidden animate-fade-up" onKeyDown={onListKey}>
        <div className="flex items-center gap-3 px-4 border-b border-line/60">
          <span className="text-ink-faint">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts, diagrams, topics…"
            className="flex-1 bg-transparent py-3.5 outline-none text-ink placeholder:text-ink-faint text-[0.95rem]"
          />
          <kbd className="text-[0.65rem] text-ink-faint border border-line/60 rounded px-1.5 py-0.5">esc</kbd>
        </div>
        <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <div className="px-4 py-6 text-ink-faint text-sm text-center">No matches.</div>
          )}
          {groups.map((g) => (
            <div key={g.name} className="mb-1">
              <div className="px-4 py-1 text-[0.68rem] uppercase tracking-wide text-ink-faint">{g.name}</div>
              {g.items.map(({ item, idx }) => (
                <button
                  key={item.id}
                  data-idx={idx}
                  onMouseMove={() => setActive(idx)}
                  onClick={() => choose(item)}
                  className={cx(
                    "w-full text-left px-4 py-2 flex items-center justify-between gap-3 transition-colors",
                    idx === active ? "bg-surface-2" : "hover:bg-surface-2/50",
                  )}
                >
                  <span className="text-ink text-sm truncate">{item.label}</span>
                  {item.sub && <span className="text-ink-faint text-xs shrink-0">{item.sub}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import {
  PLOT,
  diagramById,
  type DLine,
  type DPoint,
  type DiagramTemplate,
} from "./diagrams";
import { getDiagram, putDiagram, deleteDiagram } from "@/lib/db";
import { Button, Chip } from "@/components/ui";

const COLORS: Record<string, string> = {
  demand: "rgb(var(--econ))",
  supply: "rgb(var(--physics))",
  third: "rgb(var(--compsci))",
  good: "rgb(var(--mark-good))",
  bad: "rgb(var(--mark-bad))",
  neutral: "rgb(var(--ink-faint))",
};

const VB_W = 372, VB_H = 300;

type Handle = { lineId: string; pt: "p1" | "p2" | "c" };

export function DiagramEditor({ id }: { id: string }) {
  const template = diagramById(id)!;
  const [lines, setLines] = React.useState<DLine[]>(() => clone(template.lines));
  const [labels, setLabels] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(template.lines.map((l) => [l.id, l.label])),
  );
  const [notes, setNotes] = React.useState("");
  const [saved, setSaved] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [hasSaved, setHasSaved] = React.useState(false);
  const drag = React.useRef<Handle | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);

  // End any drag on a global pointer release, even if it happens off the SVG,
  // so a handle can never stay "stuck" to the cursor.
  React.useEffect(() => {
    const end = () => (drag.current = null);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, []);

  // Load personal saved version, if any.
  React.useEffect(() => {
    (async () => {
      const s = await getDiagram(id);
      if (s) {
        setHasSaved(true);
        setLines(applyParams(template, s.params));
        if (s.labels) setLabels(s.labels);
        if (s.notes) setNotes(s.notes);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function toSvg(e: React.PointerEvent): DPoint {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * VB_W;
    const y = ((e.clientY - rect.top) / rect.height) * VB_H;
    return {
      x: clamp(x, PLOT.x0, PLOT.x1),
      y: clamp(y, PLOT.y0, PLOT.y1),
    };
  }

  function onMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const p = toSvg(e);
    const { lineId, pt } = drag.current;
    setLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, [pt]: p } : l)));
    setDirty(true);
  }

  async function save() {
    await putDiagram({
      id,
      params: flatten(lines),
      labels,
      notes,
      updatedAt: Date.now(),
    });
    setSaved(true);
    setHasSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 1600);
  }

  function reset() {
    setLines(clone(template.lines));
    setLabels(Object.fromEntries(template.lines.map((l) => [l.id, l.label])));
    setNotes("");
    setDirty(true);
  }

  async function forget() {
    await deleteDiagram(id);
    setHasSaved(false);
    reset();
    setDirty(false);
  }

  return (
    <div className="space-y-4">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full rounded-2xl border border-line/60 bg-surface touch-none select-none"
        style={{ maxHeight: "56vh" }}
        onPointerMove={onMove}
        onPointerUp={() => (drag.current = null)}
        onPointerLeave={() => (drag.current = null)}
      >
        {/* axes */}
        <line x1={PLOT.x0} y1={PLOT.y0} x2={PLOT.x0} y2={PLOT.y1} stroke="rgb(var(--ink-soft))" strokeWidth="1.5" markerStart="url(#axup)" />
        <line x1={PLOT.x0} y1={PLOT.y1} x2={PLOT.x1} y2={PLOT.y1} stroke="rgb(var(--ink-soft))" strokeWidth="1.5" markerEnd="url(#axright)" />
        <defs>
          <marker id="axup" markerWidth="8" markerHeight="8" refX="4" refY="1" orient="auto"><path d="M4,0 L8,6 L0,6 Z" fill="rgb(var(--ink-soft))" /></marker>
          <marker id="axright" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="rgb(var(--ink-soft))" /></marker>
        </defs>
        <text x={PLOT.x0 - 6} y={PLOT.y0 + 2} fill="rgb(var(--ink-soft))" fontSize="10" textAnchor="end">{template.yLabel}</text>
        <text x={PLOT.x1} y={PLOT.y1 + 16} fill="rgb(var(--ink-soft))" fontSize="10" textAnchor="end">{template.xLabel}</text>

        {/* intersections (equilibria) drawn under the curves */}
        {template.intersections?.map(([a, b], i) => {
          const la = lines.find((l) => l.id === a);
          const lb = lines.find((l) => l.id === b);
          if (!la || !lb || la.type !== "line" || lb.type !== "line") return null;
          const pt = intersect(la, lb);
          if (!pt) return null;
          return (
            <g key={i}>
              <line x1={pt.x} y1={pt.y} x2={pt.x} y2={PLOT.y1} stroke="rgb(var(--ink-faint))" strokeDasharray="3 3" />
              <line x1={PLOT.x0} y1={pt.y} x2={pt.x} y2={pt.y} stroke="rgb(var(--ink-faint))" strokeDasharray="3 3" />
              <circle cx={pt.x} cy={pt.y} r="3.5" fill="rgb(var(--ink))" />
            </g>
          );
        })}

        {/* curves / lines */}
        {lines.map((l) => (
          <g key={l.id}>
            <path d={pathFor(l)} fill="none" stroke={COLORS[l.color]} strokeWidth="2.5" strokeLinecap="round" />
            <text x={l.p2.x + 4} y={l.p2.y} fill={COLORS[l.color]} fontSize="12" fontWeight="600">{labels[l.id]}</text>
            {/* drag handles */}
            <Handle p={l.p1} onDown={() => (drag.current = { lineId: l.id, pt: "p1" })} color={COLORS[l.color]} />
            <Handle p={l.p2} onDown={() => (drag.current = { lineId: l.id, pt: "p2" })} color={COLORS[l.color]} />
            {l.type === "curve" && l.c && (
              <Handle p={l.c} onDown={() => (drag.current = { lineId: l.id, pt: "c" })} color={COLORS[l.color]} control />
            )}
          </g>
        ))}
      </svg>

      <p className="text-ink-faint text-sm">
        Drag the round handles to move each curve; the hollow handle bends a curve.
        The equilibrium and guide lines follow automatically.
      </p>

      {/* Label editors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {lines.map((l) => (
          <label key={l.id} className="block">
            <span className="text-xs" style={{ color: COLORS[l.color] }}>curve {l.id}</span>
            <input
              value={labels[l.id]}
              onChange={(e) => { setLabels({ ...labels, [l.id]: e.target.value }); setDirty(true); }}
              className="mt-1 w-full rounded-lg bg-surface-2 border border-line/60 px-2 py-1.5 text-sm outline-none focus:border-econ/50"
            />
          </label>
        ))}
      </div>

      {/* Personal notes on this diagram */}
      <label className="block">
        <span className="text-xs text-ink-faint">Your notes on this diagram</span>
        <textarea
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setDirty(true); }}
          rows={2}
          placeholder="e.g. remember to shade the welfare loss triangle…"
          className="mt-1 w-full rounded-xl bg-surface-2 border border-line/60 px-3 py-2 text-sm outline-none focus:border-econ/50 resize-none"
        />
      </label>

      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="primary" accent="econ" onClick={save} disabled={!dirty && hasSaved}>
          Save my version
        </Button>
        {saved && <Chip accent="good">saved</Chip>}
        {hasSaved && !dirty && !saved && <Chip accent="good">personal version loaded</Chip>}
        <Button variant="soft" onClick={reset}>Reset to default</Button>
        {hasSaved && <Button variant="ghost" onClick={forget}>Forget saved</Button>}
      </div>
    </div>
  );
}

function Handle({ p, onDown, color, control }: { p: DPoint; onDown: () => void; color: string; control?: boolean }) {
  return (
    <circle
      cx={p.x}
      cy={p.y}
      r="6"
      fill={control ? "transparent" : color}
      stroke={color}
      strokeWidth="2"
      className="cursor-grab active:cursor-grabbing"
      onPointerDown={(e) => { e.preventDefault(); onDown(); }}
    />
  );
}

function pathFor(l: DLine): string {
  if (l.type === "curve" && l.c) {
    return `M ${l.p1.x} ${l.p1.y} Q ${l.c.x} ${l.c.y} ${l.p2.x} ${l.p2.y}`;
  }
  return `M ${l.p1.x} ${l.p1.y} L ${l.p2.x} ${l.p2.y}`;
}

// Intersection of two infinite lines through their endpoints.
function intersect(a: DLine, b: DLine): DPoint | null {
  const { p1: p, p2: q } = a;
  const { p1: r, p2: s } = b;
  const d = (q.x - p.x) * (s.y - r.y) - (q.y - p.y) * (s.x - r.x);
  if (Math.abs(d) < 1e-6) return null;
  const t = ((r.x - p.x) * (s.y - r.y) - (r.y - p.y) * (s.x - r.x)) / d;
  const x = p.x + t * (q.x - p.x);
  const y = p.y + t * (q.y - p.y);
  if (x < PLOT.x0 - 4 || x > PLOT.x1 + 4 || y < PLOT.y0 - 4 || y > PLOT.y1 + 4) return null;
  return { x, y };
}

function clone(lines: DLine[]): DLine[] {
  return lines.map((l) => ({ ...l, p1: { ...l.p1 }, p2: { ...l.p2 }, c: l.c ? { ...l.c } : undefined }));
}

function flatten(lines: DLine[]): Record<string, number> {
  const o: Record<string, number> = {};
  for (const l of lines) {
    o[`${l.id}.p1x`] = l.p1.x; o[`${l.id}.p1y`] = l.p1.y;
    o[`${l.id}.p2x`] = l.p2.x; o[`${l.id}.p2y`] = l.p2.y;
    if (l.c) { o[`${l.id}.cx`] = l.c.x; o[`${l.id}.cy`] = l.c.y; }
  }
  return o;
}

function applyParams(t: DiagramTemplate, params: Record<string, number>): DLine[] {
  return clone(t.lines).map((l) => {
    const g = (k: string, d: number) => (typeof params[`${l.id}.${k}`] === "number" ? params[`${l.id}.${k}`] : d);
    const line: DLine = {
      ...l,
      p1: { x: g("p1x", l.p1.x), y: g("p1y", l.p1.y) },
      p2: { x: g("p2x", l.p2.x), y: g("p2y", l.p2.y) },
    };
    if (l.c) line.c = { x: g("cx", l.c.x), y: g("cy", l.c.y) };
    return line;
  });
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

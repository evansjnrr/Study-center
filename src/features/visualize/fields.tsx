import React from "react";
import { Slider, Readout, Stage, VIZ } from "./viz-ui";
import { cx } from "@/components/ui";

// ---------------- Radial (inverse-square) field ----------------
// Serves Electric Fields, Gravitational Fields, Capacitance intuition.
export function FieldViz() {
  const [kind, setKind] = React.useState<"gravitational" | "electric">("gravitational");
  const [strength, setStrength] = React.useState(6); // source magnitude / charge
  const [dist, setDist] = React.useState(3); // r in metres (test position)
  const [sign, setSign] = React.useState<1 | -1>(1); // electric charge sign

  const cx0 = 150, cy0 = 130;
  const attractive = kind === "gravitational" || sign === -1;
  // field ∝ strength / r²  (relative units)
  const field = strength / (dist * dist);
  const testX = cx0 + dist * 26;

  // radial field lines
  const lines = [];
  const n = 12;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * Math.PI;
    const inner = attractive ? 90 : 14;
    const outer = attractive ? 16 : 92;
    lines.push(
      <line
        key={i}
        x1={cx0 + Math.cos(a) * 14}
        y1={cy0 + Math.sin(a) * 14}
        x2={cx0 + Math.cos(a) * 92}
        y2={cy0 + Math.sin(a) * 92}
        stroke={VIZ.faint}
        strokeWidth="1.2"
        markerEnd={`url(#field-${attractive ? "in" : "out"})`}
        // Arrows point in for attractive fields, out for repulsive.
        transform={attractive ? undefined : undefined}
      />,
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["gravitational", "electric"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={cx(
              "px-3 py-1.5 rounded-xl text-sm border capitalize transition-all duration-150 active:scale-95",
              kind === k ? "bg-physics-soft text-physics border-physics/40" : "bg-surface-2 text-ink-soft border-line/60",
            )}
          >
            {k}
          </button>
        ))}
        {kind === "electric" && (
          <button
            onClick={() => setSign((s) => (s === 1 ? -1 : 1))}
            className="px-3 py-1.5 rounded-xl text-sm border border-line/60 bg-surface-2 text-ink-soft"
          >
            charge: {sign === 1 ? "+ (repels)" : "− (attracts)"}
          </button>
        )}
      </div>
      <Stage viewBox="0 0 400 260">
        <defs>
          <marker id="field-out" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={VIZ.faint} /></marker>
          <marker id="field-in" markerWidth="7" markerHeight="7" refX="1" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6 Z" fill={VIZ.faint} /></marker>
        </defs>
        {/* equipotential rings */}
        {[40, 65, 90].map((r) => (
          <circle key={r} cx={cx0} cy={cy0} r={r} fill="none" stroke={VIZ.line} strokeDasharray="2 5" />
        ))}
        {lines}
        <circle cx={cx0} cy={cy0} r="14" fill={kind === "gravitational" ? VIZ.physics : sign === 1 ? VIZ.bad : VIZ.physics} />
        {/* test object */}
        <line x1={testX} y1={cy0} x2={testX + (attractive ? -1 : 1) * Math.min(46, field * 6)} y2={cy0} stroke={VIZ.good} strokeWidth="2.5" markerEnd="url(#fld-force)" />
        <marker id="fld-force" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={VIZ.good} /></marker>
        <circle cx={testX} cy={cy0} r="6" fill={VIZ.warn} />
        <text x={cx0 - 10} y={cy0 + 4} fill={VIZ.ink} fontSize="11" textAnchor="middle">{kind === "gravitational" ? "M" : sign === 1 ? "+" : "−"}</text>
      </Stage>
      <div className="grid sm:grid-cols-2 gap-4">
        <Slider label={kind === "gravitational" ? "Source mass" : "Source charge"} value={strength} min={2} max={12} unit="" onChange={setStrength} />
        <Slider label="Test distance r" value={dist} min={1} max={6} step={0.5} unit="m" onChange={setDist} />
      </div>
      <Readout
        items={[
          { label: "Field strength ∝ 1/r²", value: `${field.toFixed(2)} (rel.)` },
          { label: "Double r →", value: "quarter the field" },
          { label: "Type", value: attractive ? "attractive" : "repulsive" },
        ]}
      />
      <p className="text-ink-faint text-sm">
        Both gravity and electrostatics follow an inverse-square law. Gravity only
        attracts; charges attract or repel. The <span className="text-mark-warn">test object</span>'s
        force (green) grows sharply as r shrinks.
      </p>
    </div>
  );
}

import React from "react";
import { Slider, Readout, Stage, PlayButton, useClock, VIZ } from "./viz-ui";
import { cx } from "@/components/ui";

// ---------------- D.C. circuits: series / parallel ----------------
export function DCCircuitViz() {
  const [mode, setMode] = React.useState<"series" | "parallel">("series");
  const [emf, setEmf] = React.useState(12);
  const [r1, setR1] = React.useState(4);
  const [r2, setR2] = React.useState(6);
  const [run, setRun] = React.useState(true);
  const t = useClock(run);

  const totalR = mode === "series" ? r1 + r2 : (r1 * r2) / (r1 + r2);
  const totalI = emf / totalR;
  const i1 = mode === "series" ? totalI : emf / r1;
  const i2 = mode === "series" ? totalI : emf / r2;
  const v1 = i1 * r1;
  const v2 = i2 * r2;

  const flow = (t * 40) % 20;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["series", "parallel"] as const).map((mm) => (
          <button
            key={mm}
            onClick={() => setMode(mm)}
            className={cx(
              "px-3 py-1.5 rounded-xl text-sm border capitalize transition-all duration-150 active:scale-95",
              mode === mm ? "bg-physics-soft text-physics border-physics/40" : "bg-surface-2 text-ink-soft border-line/60",
            )}
          >
            {mm}
          </button>
        ))}
      </div>
      <Stage viewBox="0 0 400 220">
        {/* battery */}
        <line x1="40" y1="60" x2="40" y2="160" stroke={VIZ.ink} strokeWidth="2" />
        <line x1="34" y1="95" x2="46" y2="95" stroke={VIZ.ink} strokeWidth="4" />
        <line x1="36" y1="110" x2="44" y2="110" stroke={VIZ.ink} strokeWidth="1.5" />
        <text x="8" y="115" fill={VIZ.soft} fontSize="11">{emf}V</text>

        {mode === "series" ? (
          <>
            <path d="M40 60 H360 V160 H40" fill="none" stroke={VIZ.line} strokeWidth="2" />
            <Resistor x={130} y={60} label={`R₁ ${r1}Ω`} />
            <Resistor x={250} y={60} label={`R₂ ${r2}Ω`} />
            <FlowDots points={seriesLoop()} offset={flow} />
          </>
        ) : (
          <>
            <path d="M40 60 H360 M40 160 H360 M360 60 V160" fill="none" stroke={VIZ.line} strokeWidth="2" />
            <line x1="200" y1="60" x2="200" y2="160" stroke={VIZ.line} strokeWidth="2" />
            <Resistor x={250} y={60} label={`R₁ ${r1}Ω`} />
            <Resistor x={250} y={160} label={`R₂ ${r2}Ω`} horizontalAt={160} />
            <FlowDots points={parallelLoop()} offset={flow} />
          </>
        )}
      </Stage>
      <div className="flex items-center gap-3"><PlayButton running={run} onToggle={() => setRun((x) => !x)} /></div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Slider label="e.m.f." value={emf} min={1} max={24} unit="V" onChange={setEmf} />
        <Slider label="R₁" value={r1} min={1} max={20} unit="Ω" onChange={setR1} />
        <Slider label="R₂" value={r2} min={1} max={20} unit="Ω" onChange={setR2} />
      </div>
      <Readout
        items={[
          { label: "Total resistance", value: `${totalR.toFixed(2)} Ω` },
          { label: "Total current", value: `${totalI.toFixed(2)} A` },
          { label: mode === "series" ? "V across R₁ / R₂" : "I through R₁ / R₂", value: mode === "series" ? `${v1.toFixed(1)} / ${v2.toFixed(1)} V` : `${i1.toFixed(2)} / ${i2.toFixed(2)} A` },
        ]}
      />
      <p className="text-ink-faint text-sm">
        {mode === "series"
          ? "Series: one current everywhere; the e.m.f. splits across the resistors (larger R takes more p.d.)."
          : "Parallel: same p.d. across each branch; total resistance is less than the smallest resistor."}
      </p>
    </div>
  );
}

function Resistor({ x, y, label, horizontalAt }: { x: number; y: number; label: string; horizontalAt?: number }) {
  const yy = horizontalAt ?? y;
  return (
    <>
      <rect x={x} y={yy - 8} width="60" height="16" rx="3" fill={VIZ.physics} opacity="0.85" />
      <text x={x + 30} y={yy - 14} fill={VIZ.soft} fontSize="10" textAnchor="middle">{label}</text>
    </>
  );
}

function FlowDots({ points, offset }: { points: { x: number; y: number }[]; offset: number }) {
  return (
    <>
      {points.map((p, i) => {
        const phase = (offset + i * 4) % 20;
        return <circle key={i} cx={p.x} cy={p.y} r={phase < 3 ? 2.6 : 1.8} fill={VIZ.good} opacity={0.6} />;
      })}
    </>
  );
}

function seriesLoop() {
  const pts: { x: number; y: number }[] = [];
  for (let x = 40; x <= 360; x += 16) pts.push({ x, y: 60 });
  for (let y = 60; y <= 160; y += 16) pts.push({ x: 360, y });
  for (let x = 360; x >= 40; x -= 16) pts.push({ x, y: 160 });
  for (let y = 160; y >= 60; y -= 16) pts.push({ x: 40, y });
  return pts;
}
function parallelLoop() {
  const pts: { x: number; y: number }[] = [];
  for (let x = 40; x <= 200; x += 16) pts.push({ x, y: 60 });
  for (let x = 40; x <= 200; x += 16) pts.push({ x, y: 160 });
  return pts;
}

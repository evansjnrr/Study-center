import React from "react";
import { Slider, Readout, Stage, PlayButton, useClock, VIZ } from "./viz-ui";
import { cx } from "@/components/ui";

// fold a value into [lo,hi] with reflection (bouncing off walls)
function fold(v: number, lo: number, hi: number): number {
  const range = hi - lo;
  let m = ((v - lo) % (2 * range) + 2 * range) % (2 * range);
  return m < range ? lo + m : hi - (m - range);
}

// ---------------- Ideal gases: kinetic theory in a box ----------------
export function IdealGasViz() {
  const [temp, setTemp] = React.useState(300);
  const [boxW, setBoxW] = React.useState(300);
  const [run, setRun] = React.useState(true);
  const t = useClock(run);
  const N = 26;

  const particles = React.useMemo(
    () =>
      Array.from({ length: N }, () => {
        const a = Math.random() * Math.PI * 2;
        return { x0: 50 + Math.random() * 240, y0: 30 + Math.random() * 150, dx: Math.cos(a), dy: Math.sin(a) };
      }),
    [],
  );

  const speed = 26 * Math.sqrt(temp / 300);
  const x1 = 40, x2 = 40 + boxW, y1 = 20, y2 = 190;
  const volume = boxW * (y2 - y1);
  const pressureRel = (N * temp) / (volume / 1000); // ∝ NT/V

  return (
    <div className="space-y-4">
      <Stage viewBox="0 0 400 210">
        <rect x={x1} y={y1} width={boxW} height={y2 - y1} fill="none" stroke={VIZ.line} strokeWidth="2" />
        {particles.map((p, i) => {
          const x = fold(p.x0 + p.dx * speed * t, x1 + 6, x2 - 6);
          const y = fold(p.y0 + p.dy * speed * t, y1 + 6, y2 - 6);
          return <circle key={i} cx={x} cy={y} r="4" fill={VIZ.physics} />;
        })}
        {/* movable right wall = volume */}
        <line x1={x2} y1={y1} x2={x2} y2={y2} stroke={VIZ.warn} strokeWidth="3" />
      </Stage>
      <div className="flex items-center gap-3"><PlayButton running={run} onToggle={() => setRun((v) => !v)} /></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Slider label="Temperature" value={temp} min={100} max={800} step={10} unit="K" onChange={setTemp} />
        <Slider label="Volume (box width)" value={boxW} min={140} max={330} unit="" onChange={setBoxW} />
      </div>
      <Readout
        items={[
          { label: "Pressure ∝ NT/V", value: `${(pressureRel).toFixed(0)} (rel.)` },
          { label: "Mean KE ∝ T", value: `${(1.5 * temp / 300).toFixed(2)} × (3/2 kT₀)` },
          { label: "Molecules", value: `${N}` },
        ]}
      />
      <p className="text-ink-faint text-sm">
        Raise the <span className="text-physics">temperature</span> and molecules move
        faster — more frequent, harder wall collisions raise pressure. Shrink the
        <span className="text-mark-warn"> volume</span> and pressure rises too (Boyle's law).
        Mean kinetic energy is directly proportional to absolute temperature.
      </p>
    </div>
  );
}

// ---------------- Capacitance: charging / discharging ----------------
export function CapacitorViz() {
  const [R, setR] = React.useState(6);
  const [C, setC] = React.useState(5);
  const [mode, setMode] = React.useState<"charge" | "discharge">("charge");
  const [run, setRun] = React.useState(true);
  const t = useClock(run);

  const tau = (R * C) / 10; // scaled seconds
  const window = 5 * tau;
  const tt = t % window;
  const frac = mode === "charge" ? 1 - Math.exp(-tt / tau) : Math.exp(-tt / tau);

  // curve
  const pts: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const ti = (window * i) / 100;
    const f = mode === "charge" ? 1 - Math.exp(-ti / tau) : Math.exp(-ti / tau);
    pts.push(`${i ? "L" : "M"} ${(40 + i * 3.2).toFixed(1)} ${(180 - f * 150).toFixed(1)}`);
  }
  const dotX = 40 + (tt / window) * 320;
  const dotY = 180 - frac * 150;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["charge", "discharge"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={cx("px-3 py-1.5 rounded-xl text-sm border capitalize transition-[background-color,border-color,color,transform,box-shadow,opacity] duration-150 active:scale-95", mode === m ? "bg-physics-soft text-physics border-physics/40" : "bg-surface-2 text-ink-soft border-line/60")}>
            {m}
          </button>
        ))}
      </div>
      <Stage viewBox="0 0 380 200">
        <line x1="40" y1="180" x2="370" y2="180" stroke={VIZ.line} />
        <line x1="40" y1="20" x2="40" y2="180" stroke={VIZ.line} />
        <line x1="40" y1="30" x2="370" y2="30" stroke={VIZ.faint} strokeDasharray="2 4" />
        <text x="44" y="26" fill={VIZ.faint} fontSize="9">V₀</text>
        <path d={pts.join(" ")} fill="none" stroke={VIZ.physics} strokeWidth="2" />
        <circle cx={dotX} cy={dotY} r="5" fill={VIZ.warn} />
        <text x="300" y="196" fill={VIZ.faint} fontSize="9">time →</text>
      </Stage>
      <div className="flex items-center gap-3"><PlayButton running={run} onToggle={() => setRun((v) => !v)} /></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Slider label="Resistance R" value={R} min={1} max={20} unit="" onChange={setR} />
        <Slider label="Capacitance C" value={C} min={1} max={20} unit="" onChange={setC} />
      </div>
      <Readout
        items={[
          { label: "Time constant τ = RC", value: `${(R * C / 10).toFixed(1)} (rel.)` },
          { label: mode === "charge" ? "Charge stored" : "Charge remaining", value: `${(frac * 100).toFixed(0)}%` },
          { label: "≈ full/empty after", value: "5τ" },
        ]}
      />
      <p className="text-ink-faint text-sm">
        Charge and discharge are <span className="text-physics">exponential</span>. In one
        time constant τ = RC the capacitor reaches 63% charged (or falls to 37%). Bigger
        R or C ⇒ slower. After about 5τ it's effectively full or empty.
      </p>
    </div>
  );
}

// ---------------- Quantum: photoelectric effect ----------------
const MATERIALS = [
  { name: "Caesium", phi: 2.1 },
  { name: "Sodium", phi: 2.28 },
  { name: "Zinc", phi: 4.3 },
  { name: "Platinum", phi: 6.35 },
];

export function PhotoelectricViz() {
  const [fUnit, setFUnit] = React.useState(8); // ×10^14 Hz
  const [matIdx, setMatIdx] = React.useState(1);
  const [run, setRun] = React.useState(true);
  const t = useClock(run);
  const phi = MATERIALS[matIdx].phi;

  const E = 0.414 * fUnit; // photon energy in eV (h in eV·s × 1e14)
  const f0 = phi / 0.414; // threshold freq in ×10^14 Hz
  const emits = E > phi;
  const KE = Math.max(0, E - phi);

  // electrons flying off if emitting
  const electrons = emits
    ? Array.from({ length: 6 }, (_, i) => {
        const speed = 30 + KE * 30;
        const tt = (t * speed + i * 20) % 160;
        return { x: 150 + tt, y: 95 - (i - 2.5) * 8, r: 3 };
      })
    : [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {MATERIALS.map((m, i) => (
          <button key={m.name} onClick={() => setMatIdx(i)}
            className={cx("px-2.5 py-1.5 rounded-xl text-xs border transition-[background-color,border-color,color,transform,box-shadow,opacity] duration-150 active:scale-95", i === matIdx ? "bg-physics-soft text-physics border-physics/40" : "bg-surface-2 text-ink-soft border-line/60")}>
            {m.name} (φ={m.phi})
          </button>
        ))}
      </div>
      <Stage viewBox="0 0 320 170">
        {/* incoming light */}
        {Array.from({ length: 5 }).map((_, i) => {
          const tt = (t * (40 + fUnit * 6) + i * 30) % 150;
          return <circle key={i} cx={10 + tt} cy={70 + i * 6} r="3" fill={emits ? VIZ.warn : VIZ.faint} />;
        })}
        {/* metal plate */}
        <rect x="140" y="40" width="14" height="90" fill={VIZ.soft} />
        {/* ejected electrons */}
        {electrons.map((e, i) => (
          <circle key={i} cx={e.x} cy={e.y} r={e.r} fill={VIZ.physics} />
        ))}
        <text x="150" y="150" fill={VIZ.faint} fontSize="9">metal (φ = {phi} eV)</text>
        {!emits && <text x="180" y="80" fill={VIZ.bad} fontSize="11">no emission</text>}
      </Stage>
      <div className="flex items-center gap-3"><PlayButton running={run} onToggle={() => setRun((v) => !v)} /></div>
      <Slider label="Light frequency f" value={fUnit} min={2} max={16} step={0.5} unit="×10¹⁴ Hz" onChange={setFUnit} />
      <Readout
        items={[
          { label: "Photon energy hf", value: `${E.toFixed(2)} eV` },
          { label: "Threshold f₀", value: `${f0.toFixed(1)} ×10¹⁴ Hz` },
          { label: "Max KE = hf − φ", value: emits ? `${KE.toFixed(2)} eV` : "0 (below threshold)", tone: emits ? "good" : "bad" },
        ]}
      />
      <p className="text-ink-faint text-sm">
        Below the <span className="text-physics">threshold frequency</span> no electrons
        are emitted — no matter how intense the light. This is the evidence for photons:
        one photon, one electron. Above threshold, extra frequency becomes electron
        kinetic energy: hf = φ + KEₘₐₓ.
      </p>
    </div>
  );
}

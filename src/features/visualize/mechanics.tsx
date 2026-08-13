import React from "react";
import { Slider, Readout, Stage, PlayButton, useClock, VIZ } from "./viz-ui";

const g = 9.81;

// ---------------- Kinematics: projectile motion ----------------
export function ProjectileViz() {
  const [u, setU] = React.useState(20);
  const [angle, setAngle] = React.useState(45);
  const [run, setRun] = React.useState(true);
  const t = useClock(run);

  const rad = (angle * Math.PI) / 180;
  const T = (2 * u * Math.sin(rad)) / g || 0.001;
  const R = (u * u * Math.sin(2 * rad)) / g;
  const H = (u * u * Math.sin(rad) ** 2) / (2 * g);

  // world -> stage
  const W = 400, Hh = 240, x0 = 30, ground = 210;
  const worldW = Math.max(R, 5);
  const worldH = Math.max(H, 3);
  const sx = (W - 60) / worldW;
  const sy = (ground - 20) / worldH;
  const s = Math.min(sx, sy);

  const tt = (t % (T * 1.25)) ; // small pause after landing
  const clamped = Math.min(tt, T);
  const wx = u * Math.cos(rad) * clamped;
  const wy = u * Math.sin(rad) * clamped - 0.5 * g * clamped * clamped;
  const px = x0 + wx * s;
  const py = ground - Math.max(0, wy) * s;

  // trajectory path
  const path: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const ti = (T * i) / 40;
    const X = x0 + u * Math.cos(rad) * ti * s;
    const Y = ground - (u * Math.sin(rad) * ti - 0.5 * g * ti * ti) * s;
    path.push(`${i ? "L" : "M"} ${X.toFixed(1)} ${Y.toFixed(1)}`);
  }

  const vx = u * Math.cos(rad);
  const vy = u * Math.sin(rad) - g * clamped;

  return (
    <div className="space-y-4">
      <Stage viewBox={`0 0 ${W} ${Hh}`}>
        <line x1="0" y1={ground} x2={W} y2={ground} stroke={VIZ.line} strokeWidth="2" />
        <path d={path.join(" ")} fill="none" stroke={VIZ.faint} strokeDasharray="3 4" strokeWidth="1.5" />
        {/* velocity vector */}
        <line x1={px} y1={py} x2={px + vx * 3} y2={py - vy * 3} stroke={VIZ.physics} strokeWidth="2" markerEnd="url(#arrow)" />
        <circle cx={px} cy={py} r="6" fill={VIZ.physics} />
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={VIZ.physics} />
          </marker>
        </defs>
      </Stage>
      <div className="flex items-center gap-3"><PlayButton running={run} onToggle={() => setRun((v) => !v)} /></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Slider label="Launch speed u" value={u} min={5} max={40} step={1} unit="m/s" onChange={setU} />
        <Slider label="Launch angle θ" value={angle} min={5} max={85} step={1} unit="°" onChange={setAngle} />
      </div>
      <Readout
        items={[
          { label: "Range", value: `${R.toFixed(1)} m` },
          { label: "Max height", value: `${H.toFixed(1)} m` },
          { label: "Time of flight", value: `${T.toFixed(2)} s` },
        ]}
      />
      <p className="text-ink-faint text-sm">
        45° gives the greatest range on level ground. Watch the vertical velocity
        (the arrow) fall to zero at the top, then reverse.
      </p>
    </div>
  );
}

// ---------------- Dynamics: F = ma ----------------
export function DynamicsViz() {
  const [F, setF] = React.useState(12);
  const [friction, setFriction] = React.useState(4);
  const [m, setM] = React.useState(2);
  const [run, setRun] = React.useState(true);
  const t = useClock(run);

  const resultant = Math.max(0, F - friction);
  const a = resultant / m;
  const cycle = 4;
  const tt = t % cycle;
  const x = 0.5 * a * tt * tt; // metres
  const stageX = 40 + Math.min(300, x * 6);
  const v = a * tt;

  return (
    <div className="space-y-4">
      <Stage viewBox="0 0 400 200">
        <line x1="0" y1="150" x2="400" y2="150" stroke={VIZ.line} strokeWidth="2" />
        <rect x={stageX} y="118" width="34" height="32" rx="4" fill={VIZ.physics} />
        {/* applied force */}
        <line x1={stageX + 34} y1="134" x2={stageX + 34 + F * 3} y2="134" stroke={VIZ.good} strokeWidth="3" markerEnd="url(#fa)" />
        {/* friction */}
        {friction > 0 && (
          <line x1={stageX} y1="134" x2={stageX - friction * 3} y2="134" stroke={VIZ.bad} strokeWidth="3" markerEnd="url(#fb)" />
        )}
        <defs>
          <marker id="fa" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={VIZ.good} /></marker>
          <marker id="fb" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={VIZ.bad} /></marker>
        </defs>
        <text x={stageX + 40} y="128" fill={VIZ.good} fontSize="11">F = {F} N</text>
      </Stage>
      <div className="flex items-center gap-3"><PlayButton running={run} onToggle={() => setRun((v) => !v)} /></div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Slider label="Applied force F" value={F} min={0} max={30} unit="N" onChange={setF} />
        <Slider label="Friction" value={friction} min={0} max={20} unit="N" onChange={setFriction} />
        <Slider label="Mass m" value={m} min={1} max={10} unit="kg" onChange={setM} />
      </div>
      <Readout
        items={[
          { label: "Resultant force", value: `${resultant.toFixed(1)} N`, tone: resultant === 0 ? "warn" : undefined },
          { label: "Acceleration", value: `${a.toFixed(2)} m/s²` },
          { label: "Velocity now", value: `${v.toFixed(1)} m/s` },
        ]}
      />
      <p className="text-ink-faint text-sm">
        Only the <span className="text-mark-good">resultant</span> force accelerates the
        block. When friction cancels the applied force, a = 0 and it moves at constant speed.
      </p>
    </div>
  );
}

// ---------------- Motion in a circle ----------------
export function CircularViz() {
  const [v, setV] = React.useState(6);
  const [r, setR] = React.useState(2);
  const [run, setRun] = React.useState(true);
  const t = useClock(run);

  const omega = v / r;
  const theta = omega * t;
  const cx = 200, cy = 120, R = 20 + r * 30;
  const px = cx + R * Math.cos(theta);
  const py = cy + R * Math.sin(theta);
  const a = (v * v) / r;
  const T = (2 * Math.PI * r) / v;

  return (
    <div className="space-y-4">
      <Stage viewBox="0 0 400 240">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={VIZ.faint} strokeDasharray="3 4" />
        <circle cx={cx} cy={cy} r="3" fill={VIZ.faint} />
        {/* centripetal force (toward centre) */}
        <line x1={px} y1={py} x2={cx + (R - 34) * Math.cos(theta)} y2={cy + (R - 34) * Math.sin(theta)} stroke={VIZ.bad} strokeWidth="2.5" markerEnd="url(#cf)" />
        {/* velocity (tangent) */}
        <line x1={px} y1={py} x2={px - 34 * Math.sin(theta)} y2={py + 34 * Math.cos(theta)} stroke={VIZ.physics} strokeWidth="2.5" markerEnd="url(#cv)" />
        <circle cx={px} cy={py} r="7" fill={VIZ.physics} />
        <defs>
          <marker id="cf" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={VIZ.bad} /></marker>
          <marker id="cv" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={VIZ.physics} /></marker>
        </defs>
      </Stage>
      <div className="flex items-center gap-3"><PlayButton running={run} onToggle={() => setRun((x) => !x)} /></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Slider label="Speed v" value={v} min={2} max={12} unit="m/s" onChange={setV} />
        <Slider label="Radius r" value={r} min={1} max={5} step={0.5} unit="m" onChange={setR} />
      </div>
      <Readout
        items={[
          { label: "Centripetal accel", value: `${a.toFixed(1)} m/s²` },
          { label: "Angular speed ω", value: `${omega.toFixed(2)} rad/s` },
          { label: "Period T", value: `${T.toFixed(2)} s` },
        ]}
      />
      <p className="text-ink-faint text-sm">
        <span className="text-physics">Velocity</span> is always tangent;
        <span className="text-mark-bad"> the resultant force</span> always points to the
        centre. a = v²/r, so halving the radius doubles the acceleration.
      </p>
    </div>
  );
}

// ---------------- Oscillations: simple harmonic motion ----------------
export function SHMViz() {
  const [A, setA] = React.useState(60);
  const [T, setT] = React.useState(2);
  const [run, setRun] = React.useState(true);
  const t = useClock(run);
  const omega = (2 * Math.PI) / T;
  const x = A * Math.cos(omega * t);
  const v = -A * omega * Math.sin(omega * t);
  const acc = -omega * omega * x;

  const cx = 200 + x, cy = 90;
  // trace x-t graph
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const ti = t - (120 - i) * 0.03;
    const X = 10 + i * 3.2;
    const Y = 200 - A * Math.cos(omega * ti) * 0.6;
    pts.push(`${i ? "L" : "M"} ${X.toFixed(1)} ${Y.toFixed(1)}`);
  }

  return (
    <div className="space-y-4">
      <Stage viewBox="0 0 400 240">
        {/* spring */}
        <line x1="60" y1={cy} x2={cx - 16} y2={cy} stroke={VIZ.faint} strokeWidth="2" />
        <line x1="60" y1="60" x2="60" y2="120" stroke={VIZ.line} strokeWidth="3" />
        <rect x={cx - 16} y={cy - 16} width="32" height="32" rx="4" fill={VIZ.physics} />
        {/* equilibrium marker */}
        <line x1="200" y1="120" x2="200" y2="150" stroke={VIZ.faint} strokeDasharray="2 3" />
        {/* x-t trace */}
        <path d={pts.join(" ")} fill="none" stroke={VIZ.physics} strokeWidth="1.5" opacity="0.8" />
        <text x="10" y="150" fill={VIZ.faint} fontSize="10">displacement–time</text>
      </Stage>
      <div className="flex items-center gap-3"><PlayButton running={run} onToggle={() => setRun((z) => !z)} /></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Slider label="Amplitude" value={A} min={20} max={90} unit="px" onChange={setA} />
        <Slider label="Period T" value={T} min={0.6} max={4} step={0.1} unit="s" onChange={setT} />
      </div>
      <Readout
        items={[
          { label: "Displacement", value: `${(x / A).toFixed(2)} A` },
          { label: "Velocity", value: Math.abs(v) < 1 ? "≈ 0 (max at centre)" : `${(v > 0 ? "+" : "")}${(v / (A * omega)).toFixed(2)} vmax` },
          { label: "Accel", value: `${(acc / (A * omega * omega)).toFixed(2)} amax` },
        ]}
      />
      <p className="text-ink-faint text-sm">
        a = −ω²x — acceleration is largest at the extremes and zero at the centre,
        where speed is greatest. Exactly out of phase, displacement and acceleration.
      </p>
    </div>
  );
}

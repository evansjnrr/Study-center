import React from "react";
import { useApp } from "@/lib/store";

// A small diagram that reflects the CURRENT worked-example question's numbers,
// and animates (projectile flying, wave scrolling, orbit turning…) unless the
// user has turned motion off.

export type VizSpec =
  | { kind: "motion"; v: number; decel?: boolean }
  | { kind: "vthrow"; u: number }
  | { kind: "projectile"; u: number; ang: number }
  | { kind: "block"; F: number; friction: number }
  | { kind: "wave"; amp: number; count: number }
  | { kind: "circuit"; series: boolean; R1: number; R2?: number; V: number }
  | { kind: "orbit"; showF?: boolean }
  | { kind: "beam"; lw: number; ld: number; rw: number; rd: number }
  | { kind: "capacitor"; frac: number }
  | { kind: "photon"; emits: boolean; keFrac: number }
  | { kind: "field"; attractive: boolean; distRel: number }
  | { kind: "spring"; extRel: number }
  | { kind: "gas"; tempRel: number }
  | { kind: "bars"; items: { label: string; v: number; tone?: "good" | "bad" | "accent" }[] };

const A = "rgb(var(--physics))";
const C = "rgb(var(--econ))";
const G = "rgb(var(--mark-good))";
const RED = "rgb(var(--mark-bad))";
const WARN = "rgb(var(--mark-warn))";
const F = "rgb(var(--ink-faint))";
const L = "rgb(var(--line))";
const INK = "rgb(var(--ink))";

function useClock(run: boolean): number {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => { setT((now - start) / 1000); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [run]);
  return t;
}

const fold = (v: number, lo: number, hi: number) => {
  const range = hi - lo;
  const m = ((v - lo) % (2 * range) + 2 * range) % (2 * range);
  return m < range ? lo + m : hi - (m - range);
};

export function MiniViz({ spec }: { spec: VizSpec }) {
  const reduce = useApp((s) => s.settings.reduceMotion);
  const clock = useClock(!reduce);
  const t = reduce ? 1.0 : clock; // fixed representative frame when motion is off

  return (
    <div className="rounded-2xl border border-line/60 bg-surface-2/40 overflow-hidden">
      <svg viewBox="0 0 240 130" className="w-full block" style={{ maxHeight: 170 }}>
        <defs>
          {[["aA", A], ["aG", G], ["aR", RED], ["aF", F], ["aC", C]].map(([id, col]) => (
            <marker key={id} id={id} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={col as string} />
            </marker>
          ))}
        </defs>
        <Body spec={spec} t={t} />
      </svg>
    </div>
  );
}

function Body({ spec, t }: { spec: VizSpec; t: number }) {
  switch (spec.kind) {
    case "motion": {
      const len = Math.min(90, 20 + spec.v * 3);
      const bx = 40 + ((t * 34) % 150);
      return (
        <>
          <line x1="10" y1="95" x2="230" y2="95" stroke={L} strokeWidth="2" />
          <rect x={bx} y="72" width="28" height="23" rx="3" fill={A} />
          <circle cx={bx + 8} cy="97" r="4" fill={INK} /><circle cx={bx + 20} cy="97" r="4" fill={INK} />
          <line x1={bx + 30} y1="83" x2={bx + 30 + len} y2="83" stroke={spec.decel ? RED : G} strokeWidth="3" markerEnd={`url(#${spec.decel ? "aR" : "aG"})`} />
          <text x="20" y="65" fill={F} fontSize="10">{spec.decel ? "decelerating" : "v"}</text>
        </>
      );
    }
    case "vthrow": {
      const h = Math.min(80, 20 + spec.u * 2.2);
      const frac = (t / 2) % 1;
      const yb = 115 - h * Math.sin(Math.PI * frac);
      return (
        <>
          <line x1="20" y1="115" x2="220" y2="115" stroke={L} strokeWidth="2" />
          <line x1="90" y1={115 - h} x2="150" y2={115 - h} stroke={F} strokeDasharray="3 3" />
          <circle cx="120" cy={yb} r="6" fill={A} />
          <text x="128" y={115 - h + 4} fill={F} fontSize="10">max height, v = 0</text>
          <text x="24" y="108" fill={F} fontSize="10">u = {spec.u} m/s</text>
        </>
      );
    }
    case "projectile": {
      const r = (spec.ang * Math.PI) / 180;
      const slope = Math.sin(r) / Math.max(0.2, Math.cos(r));
      const px = (f: number) => 20 + f * 200;
      const py = (f: number) => Math.min(118, 115 - (Math.sin(r) * f - 0.5 * slope * f * f) * 200 * Math.cos(r) * 1.4);
      const pts: string[] = [];
      for (let i = 0; i <= 30; i++) { const f = i / 30; pts.push(`${i ? "L" : "M"} ${px(f).toFixed(1)} ${py(f).toFixed(1)}`); }
      const bf = (t / 2.4) % 1;
      return (
        <>
          <line x1="20" y1="115" x2="220" y2="115" stroke={L} strokeWidth="2" />
          <path d={pts.join(" ")} fill="none" stroke={A} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
          <line x1="20" y1="115" x2={20 + 30 * Math.cos(r)} y2={115 - 30 * Math.sin(r)} stroke={G} strokeWidth="2.5" markerEnd="url(#aG)" />
          <circle cx={px(bf)} cy={py(bf)} r="5.5" fill={WARN} />
          <text x="26" y="110" fill={F} fontSize="10">{spec.ang}°, {spec.u} m/s</text>
        </>
      );
    }
    case "block": {
      const fl = Math.min(70, 12 + spec.F * 2), frl = Math.min(60, spec.friction * 2.4);
      const pulse = 1 + 0.08 * Math.sin(t * 4);
      return (
        <>
          <line x1="10" y1="90" x2="230" y2="90" stroke={L} strokeWidth="2" />
          <rect x="95" y="62" width="40" height="28" rx="3" fill={A} />
          <line x1="135" y1="76" x2={135 + fl * pulse} y2="76" stroke={G} strokeWidth="3" markerEnd="url(#aG)" />
          <text x="140" y="70" fill={G} fontSize="10">F = {spec.F} N</text>
          {spec.friction > 0 && <>
            <line x1="95" y1="76" x2={95 - frl} y2="76" stroke={RED} strokeWidth="3" markerEnd="url(#aR)" />
            <text x={60 - frl} y="70" fill={RED} fontSize="10">f</text>
          </>}
        </>
      );
    }
    case "wave": {
      const k = (Math.PI * 2 * spec.count) / 200;
      const phase = t * 2.4;
      const pts: string[] = [];
      for (let x = 0; x <= 200; x += 3) pts.push(`${x === 0 ? "M" : "L"} ${20 + x} ${65 - spec.amp * Math.sin(k * x - phase)}`);
      const mx = 120, my = 65 - spec.amp * Math.sin(k * (mx - 20) - phase);
      return (
        <>
          <line x1="20" y1="65" x2="220" y2="65" stroke={L} strokeDasharray="2 4" />
          <path d={pts.join(" ")} fill="none" stroke={A} strokeWidth="2.5" />
          <circle cx={mx} cy={my} r="4" fill={WARN} />
          <text x="26" y="24" fill={F} fontSize="10">amplitude &amp; wavelength scale to the question</text>
        </>
      );
    }
    case "circuit": {
      const flow = (t * 40) % 20;
      const dots = (pts: { x: number; y: number }[]) => pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={((flow + i * 4) % 20) < 4 ? 2.4 : 1.6} fill={G} opacity="0.6" />);
      const loop: { x: number; y: number }[] = [];
      for (let x = 30; x <= 210; x += 18) loop.push({ x, y: 35 });
      for (let y = 35; y <= 100; y += 18) loop.push({ x: 210, y });
      for (let x = 210; x >= 30; x -= 18) loop.push({ x, y: 100 });
      for (let y = 100; y >= 35; y -= 18) loop.push({ x: 30, y });
      return (
        <>
          <line x1="30" y1="40" x2="30" y2="95" stroke={INK} strokeWidth="2" />
          <line x1="24" y1="60" x2="36" y2="60" stroke={INK} strokeWidth="4" />
          <line x1="26" y1="72" x2="34" y2="72" stroke={INK} strokeWidth="1.5" />
          <text x="6" y="72" fill={F} fontSize="9">{spec.V}V</text>
          {spec.series ? (
            <>
              <path d="M30 35 H210 V100 H30" fill="none" stroke={L} strokeWidth="2" />
              {dots(loop)}
              <rect x="80" y="28" width="42" height="14" rx="2" fill={A} /><text x="82" y="24" fill={F} fontSize="9">R₁ {spec.R1}Ω</text>
              {spec.R2 ? <><rect x="150" y="28" width="42" height="14" rx="2" fill={C} /><text x="152" y="24" fill={F} fontSize="9">R₂ {spec.R2}Ω</text></> : null}
            </>
          ) : (
            <>
              <path d="M30 35 H210 M30 100 H210 M210 35 V100" fill="none" stroke={L} strokeWidth="2" />
              <line x1="120" y1="35" x2="120" y2="100" stroke={L} strokeWidth="2" />
              <rect x="150" y="28" width="42" height="14" rx="2" fill={A} /><text x="152" y="24" fill={F} fontSize="9">R₁ {spec.R1}Ω</text>
              {spec.R2 ? <rect x="150" y="93" width="42" height="14" rx="2" fill={C} /> : null}
              {spec.R2 ? <text x="152" y="122" fill={F} fontSize="9">R₂ {spec.R2}Ω</text> : null}
            </>
          )}
        </>
      );
    }
    case "orbit": {
      const ang = t * 1.3;
      const cx = 120, cy = 65, R = 42;
      const px = cx + R * Math.cos(ang), py = cy + R * Math.sin(ang);
      return (
        <>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={F} strokeDasharray="3 4" />
          <circle cx={cx} cy={cy} r="3" fill={F} />
          <line x1={px} y1={py} x2={cx + (R - 34) * Math.cos(ang)} y2={cy + (R - 34) * Math.sin(ang)} stroke={RED} strokeWidth="2.5" markerEnd="url(#aR)" />
          <line x1={px} y1={py} x2={px - 30 * Math.sin(ang)} y2={py + 30 * Math.cos(ang)} stroke={A} strokeWidth="2.5" markerEnd="url(#aA)" />
          <circle cx={px} cy={py} r="6" fill={A} />
          <text x="70" y="122" fill={F} fontSize="10">F (red) to centre · v (blue) tangent</text>
        </>
      );
    }
    case "beam": {
      const tilt = Math.max(-6, Math.min(6, (spec.lw * spec.ld - spec.rw * spec.rd) / 40)) + 1.2 * Math.sin(t * 2);
      const lx = 120 - spec.ld * 1.2, rx = 120 + spec.rd * 1.2;
      const lw = Math.max(8, spec.lw), rw = Math.max(8, spec.rw);
      return (
        <g transform={`rotate(${tilt} 120 55)`}>
          <line x1="40" y1="55" x2="200" y2="55" stroke={INK} strokeWidth="3" />
          <rect x={lx - 7} y="55" width="14" height={lw} fill={A} />
          <rect x={rx - 7} y="55" width="14" height={rw} fill={C} />
          <path d="M114 58 L126 58 L120 74 Z" fill={F} transform={`rotate(${-tilt} 120 55)`} />
          <text x="60" y="98" fill={F} fontSize="10" transform={`rotate(${-tilt} 120 55)`}>moments balance about the pivot</text>
        </g>
      );
    }
    case "capacitor": {
      const target = spec.frac;
      const f = target * (1 - Math.exp(-((t) % 3) / 0.6));
      const fill = Math.round(f * 30);
      return (
        <>
          <line x1="60" y1="30" x2="60" y2="100" stroke={INK} strokeWidth="3" />
          <line x1="90" y1="30" x2="90" y2="100" stroke={INK} strokeWidth="3" />
          <rect x="61" y={100 - fill} width="9" height={fill} fill={A} opacity="0.6" />
          {[40, 55, 70, 85].map((y) => <text key={y} x="48" y={y} fill={A} fontSize="9">+</text>)}
          {[40, 55, 70, 85].map((y) => <text key={y} x="94" y={y} fill={C} fontSize="9">−</text>)}
          <text x="120" y="68" fill={F} fontSize="11">{Math.round(target * 100)}% charged</text>
        </>
      );
    }
    case "photon": {
      return (
        <>
          <rect x="130" y="35" width="12" height="70" fill={F} />
          {[45, 60, 75].map((y, i) => { const x = 30 + ((t * 60 + i * 30) % 95); return <circle key={i} cx={x} cy={y} r="3.5" fill={spec.emits ? WARN : F} />; })}
          {spec.emits
            ? [0, 1, 2].map((i) => { const d = (t * (40 + spec.keFrac * 90) + i * 25) % 70; return <circle key={i} cx={144 + d} cy={55 + i * 10 - d * 0.15} r="3" fill={A} />; })
            : <text x="150" y="70" fill={RED} fontSize="11">no emission</text>}
          <text x="120" y="120" fill={F} fontSize="10">photons → metal</text>
        </>
      );
    }
    case "field": {
      const cx = 90, cy = 65, tx = cx + spec.distRel * 20 + 3 * Math.sin(t * 2);
      return (
        <>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const r = (a * Math.PI) / 180;
            const inner = spec.attractive ? 40 : 14, outer = spec.attractive ? 16 : 40;
            return <line key={a} x1={cx + Math.cos(r) * inner} y1={cy + Math.sin(r) * inner} x2={cx + Math.cos(r) * outer} y2={cy + Math.sin(r) * outer} stroke={F} strokeWidth="1" markerEnd="url(#aF)" />;
          })}
          <circle cx={cx} cy={cy} r="11" fill={A} />
          <circle cx={tx} cy={cy} r="5" fill={WARN} />
          <text x="150" y="118" fill={F} fontSize="10">{spec.attractive ? "attractive" : "repulsive"} · 1/r²</text>
        </>
      );
    }
    case "spring": {
      const baseExt = Math.min(40, spec.extRel * 40);
      const osc = baseExt + 8 * Math.sin(t * 3);
      const top = 25, bottom = 70 + osc;
      const coils: string[] = [];
      for (let i = 0; i <= 8; i++) coils.push(`${i ? "L" : "M"} ${110 + (i % 2 ? 12 : -12)} ${top + (i / 8) * (bottom - top)}`);
      return (
        <>
          <line x1="80" y1="25" x2="140" y2="25" stroke={INK} strokeWidth="3" />
          <path d={coils.join(" ")} fill="none" stroke={A} strokeWidth="2" />
          <rect x="98" y={bottom} width="24" height="20" rx="3" fill={C} />
          <text x="150" y={70} fill={F} fontSize="10">oscillates</text>
        </>
      );
    }
    case "gas": {
      const parts = Array.from({ length: 14 }, (_, i) => {
        const a = (i * 2.3) % (Math.PI * 2);
        const speed = 20 + spec.tempRel * 60;
        return {
          x: fold(50 + Math.cos(a) * speed * t + i * 11, 42, 198),
          y: fold(45 + Math.sin(a) * speed * t + i * 7, 28, 100),
        };
      });
      return (
        <>
          <rect x="35" y="22" width="170" height="86" fill="none" stroke={L} strokeWidth="2" />
          {parts.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r="3.5" fill={i % 2 ? A : C} />)}
          <text x="40" y="122" fill={F} fontSize="10">mean KE ∝ T</text>
        </>
      );
    }
    case "bars": {
      const max = Math.max(1, ...spec.items.map((i) => i.v));
      const bw = 160 / spec.items.length;
      return (
        <>
          {spec.items.map((it, i) => {
            const h = (it.v / max) * 80 * Math.min(1, t * 1.5 + 0.15);
            const col = it.tone === "good" ? G : it.tone === "bad" ? RED : A;
            return (
              <g key={i}>
                <rect x={30 + i * bw + 8} y={100 - h} width={bw - 20} height={h} rx="3" fill={col} />
                <text x={30 + i * bw + bw / 2 - 2} y="115" fill={F} fontSize="9" textAnchor="middle">{it.label}</text>
              </g>
            );
          })}
        </>
      );
    }
    default:
      return null;
  }
}

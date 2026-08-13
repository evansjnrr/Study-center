import React from "react";
import { Slider, Readout, Stage, PlayButton, useClock, VIZ } from "./viz-ui";

function wavePath(
  amp: number,
  wavelengthPx: number,
  phase: number,
  yMid: number,
  width = 400,
): string {
  const k = (2 * Math.PI) / wavelengthPx;
  const pts: string[] = [];
  for (let x = 0; x <= width; x += 4) {
    const y = yMid - amp * Math.sin(k * x - phase);
    pts.push(`${x === 0 ? "M" : "L"} ${x} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

// ---------------- Waves: transverse travelling wave ----------------
export function WaveViz() {
  const [amp, setAmp] = React.useState(40);
  const [wavelength, setWavelength] = React.useState(2); // metres
  const [freq, setFreq] = React.useState(1.5); // Hz
  const [run, setRun] = React.useState(true);
  const t = useClock(run);

  const v = freq * wavelength;
  const wlPx = wavelength * 60;
  const phase = 2 * Math.PI * freq * t;

  return (
    <div className="space-y-4">
      <Stage viewBox="0 0 400 160">
        <line x1="0" y1="80" x2="400" y2="80" stroke={VIZ.line} strokeDasharray="2 4" />
        <path d={wavePath(amp, wlPx, phase, 80)} fill="none" stroke={VIZ.physics} strokeWidth="2.5" />
        {/* a marker particle oscillating in place */}
        <circle cx="120" cy={80 - amp * Math.sin((2 * Math.PI / wlPx) * 120 - phase)} r="5" fill={VIZ.warn} />
      </Stage>
      <div className="flex items-center gap-3"><PlayButton running={run} onToggle={() => setRun((x) => !x)} /></div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Slider label="Amplitude" value={amp} min={8} max={64} unit="px" onChange={setAmp} />
        <Slider label="Wavelength λ" value={wavelength} min={0.5} max={5} step={0.5} unit="m" onChange={setWavelength} />
        <Slider label="Frequency f" value={freq} min={0.5} max={4} step={0.1} unit="Hz" onChange={setFreq} />
      </div>
      <Readout
        items={[
          { label: "Wave speed v = fλ", value: `${v.toFixed(2)} m/s` },
          { label: "Period T = 1/f", value: `${(1 / freq).toFixed(2)} s` },
          { label: "Amplitude", value: "energy ∝ A²" },
        ]}
      />
      <p className="text-ink-faint text-sm">
        The <span className="text-mark-warn">marked particle</span> only moves up and down —
        energy travels along, matter doesn't. Change λ or f and watch v = fλ update.
      </p>
    </div>
  );
}

// ---------------- Superposition: two waves + resultant ----------------
export function SuperpositionViz() {
  const [phaseDeg, setPhaseDeg] = React.useState(0);
  const [run, setRun] = React.useState(true);
  const t = useClock(run);
  const amp = 26;
  const wlPx = 140;
  const drift = 2 * Math.PI * 0.6 * t;
  const phi = (phaseDeg * Math.PI) / 180;

  // resultant amplitude for identical waves = 2A cos(φ/2)
  const resAmp = Math.abs(2 * Math.cos(phi / 2));
  const state =
    resAmp > 1.6 ? { label: "constructive", tone: "good" as const } : resAmp < 0.4 ? { label: "destructive", tone: "bad" as const } : { label: "partial", tone: "warn" as const };

  function resultantPath(): string {
    const k = (2 * Math.PI) / wlPx;
    const pts: string[] = [];
    for (let x = 0; x <= 400; x += 4) {
      const y1 = -amp * Math.sin(k * x - drift);
      const y2 = -amp * Math.sin(k * x - drift + phi);
      pts.push(`${x === 0 ? "M" : "L"} ${x} ${(120 + y1 + y2).toFixed(1)}`);
    }
    return pts.join(" ");
  }

  return (
    <div className="space-y-4">
      <Stage viewBox="0 0 400 200">
        <path d={wavePath(amp, wlPx, drift, 45)} fill="none" stroke={VIZ.faint} strokeWidth="1.5" />
        <path d={wavePath(amp, wlPx, drift - phi, 78)} fill="none" stroke={VIZ.faint} strokeWidth="1.5" />
        <line x1="0" y1="120" x2="400" y2="120" stroke={VIZ.line} strokeDasharray="2 4" />
        <path d={resultantPath()} fill="none" stroke={state.tone === "good" ? VIZ.good : state.tone === "bad" ? VIZ.bad : VIZ.physics} strokeWidth="2.5" />
        <text x="8" y="20" fill={VIZ.faint} fontSize="10">two sources (faint) → resultant (bold)</text>
      </Stage>
      <div className="flex items-center gap-3"><PlayButton running={run} onToggle={() => setRun((x) => !x)} /></div>
      <Slider label="Phase difference" value={phaseDeg} min={0} max={360} step={10} unit="°" onChange={setPhaseDeg} />
      <Readout
        items={[
          { label: "Interference", value: state.label, tone: state.tone },
          { label: "Resultant amplitude", value: `${resAmp.toFixed(2)} × A` },
          { label: "Path difference", value: `${(phaseDeg / 360).toFixed(2)} λ` },
        ]}
      />
      <p className="text-ink-faint text-sm">
        In phase (0° or 360°, path difference 0 or λ) → <span className="text-mark-good">constructive</span>.
        Antiphase (180°, ½λ) → <span className="text-mark-bad">destructive</span>. That's the double-slit condition.
      </p>
    </div>
  );
}

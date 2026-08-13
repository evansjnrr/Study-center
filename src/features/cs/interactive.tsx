import React from "react";
import { Readout, Stage, PlayButton, VIZ } from "@/features/visualize/viz-ui";
import { Button, cx } from "@/components/ui";

// ---------------- Data representation: 8-bit converter ----------------
export function NumberBaseConverter() {
  const [value, setValue] = React.useState(210); // 0..255
  const bits = Array.from({ length: 8 }, (_, i) => (value >> (7 - i)) & 1);
  const signed = value < 128 ? value : value - 256; // two's complement
  const hex = value.toString(16).toUpperCase().padStart(2, "0");

  function toggle(i: number) {
    setValue((v) => v ^ (1 << (7 - i)));
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 justify-center no-grow">
        {bits.map((b, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={cx(
              "w-10 sm:w-12 py-3 rounded-xl border text-lg font-mono transition-all duration-150 active:scale-90 hover:brightness-110",
              b
                ? "bg-compsci-soft text-compsci border-compsci/50"
                : "bg-surface-2 text-ink-faint border-line/60",
            )}
            title={`place value ${1 << (7 - i)}`}
          >
            {b}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5 justify-center text-[0.65rem] text-ink-faint font-mono">
        {[128, 64, 32, 16, 8, 4, 2, 1].map((p) => (
          <span key={p} className="w-10 sm:w-12 text-center">{p}</span>
        ))}
      </div>
      <label className="block max-w-[12rem] mx-auto">
        <span className="text-xs text-ink-faint">Type a denary value (0–255)</span>
        <input
          type="number"
          min={0}
          max={255}
          value={value}
          onChange={(e) => setValue(Math.max(0, Math.min(255, Number(e.target.value) || 0)))}
          className="mt-1 w-full rounded-xl bg-surface-2 border border-line/60 px-3 py-2 text-sm font-mono outline-none focus:border-compsci/50 text-center"
        />
      </label>
      <Readout
        items={[
          { label: "Unsigned denary", value: String(value) },
          { label: "Binary", value: bits.join("") },
          { label: "Hexadecimal", value: hex },
          { label: "Signed (two's comp.)", value: String(signed) },
        ]}
      />
      <p className="text-ink-faint text-sm">
        Click the bits to flip them. The same 8 bits mean <span className="text-compsci">210</span> as
        an unsigned number but <span className="text-compsci">{signed}</span> in two's complement —
        interpretation depends on the convention agreed in advance.
      </p>
    </div>
  );
}

// ---------------- Algorithms: bubble sort visualizer ----------------
export function SortVisualizer() {
  const [arr, setArr] = React.useState<number[]>(() => shuffle(9));
  const [i, setI] = React.useState(0);
  const [j, setJ] = React.useState(0);
  const [run, setRun] = React.useState(true);
  const [passes, setPasses] = React.useState(0);
  const [swaps, setSwaps] = React.useState(0);
  const done = i >= arr.length - 1;

  React.useEffect(() => {
    if (!run || done) return;
    const id = setInterval(() => {
      setArr((prev) => {
        const a = [...prev];
        let ni = i, nj = j;
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          setSwaps((s) => s + 1);
        }
        nj++;
        if (nj >= a.length - 1 - i) {
          ni = i + 1;
          nj = 0;
          setPasses((p) => p + 1);
        }
        setI(ni);
        setJ(nj);
        return a;
      });
    }, 320);
    return () => clearInterval(id);
  }, [run, i, j, done]);

  function reset() {
    setArr(shuffle(9));
    setI(0);
    setJ(0);
    setPasses(0);
    setSwaps(0);
    setRun(true);
  }

  const max = Math.max(...arr);
  const bw = 360 / arr.length;

  return (
    <div className="space-y-4">
      <Stage viewBox="0 0 380 180">
        {arr.map((v, idx) => {
          const h = (v / max) * 150;
          const active = idx === j || idx === j + 1;
          const sorted = idx >= arr.length - i;
          return (
            <g key={idx}>
              <rect
                x={10 + idx * bw}
                y={165 - h}
                width={bw - 6}
                height={h}
                rx="3"
                fill={done || sorted ? VIZ.good : active ? VIZ.warn : VIZ.physics}
              />
              <text x={10 + idx * bw + (bw - 6) / 2} y={178} fill={VIZ.faint} fontSize="9" textAnchor="middle">{v}</text>
            </g>
          );
        })}
      </Stage>
      <div className="flex items-center gap-3">
        <PlayButton running={run && !done} onToggle={() => setRun((v) => !v)} />
        <Button variant="soft" size="sm" onClick={reset}>Shuffle & restart</Button>
        {done && <span className="text-mark-good text-sm">sorted ✓</span>}
      </div>
      <Readout
        items={[
          { label: "Comparing", value: done ? "—" : `#${j + 1} & #${j + 2}` },
          { label: "Passes", value: String(passes) },
          { label: "Swaps", value: String(swaps) },
        ]}
      />
      <p className="text-ink-faint text-sm">
        <span className="text-physics">Bubble sort</span> repeatedly compares neighbours and
        swaps them if out of order, so the largest value "bubbles" to the end each pass
        (marked <span className="text-mark-good">green</span>). Simple, but O(n²) — slow on
        large lists.
      </p>
    </div>
  );
}

// ---------------- Algorithms: binary search step-through ----------------
const BS_ARRAY = [3, 7, 11, 15, 19, 23, 27, 31, 35];

export function BinarySearchViz() {
  const [target, setTarget] = React.useState(27);
  const [low, setLow] = React.useState(0);
  const [high, setHigh] = React.useState(BS_ARRAY.length - 1);
  const [mid, setMid] = React.useState<number | null>(null);
  const [status, setStatus] = React.useState<"idle" | "searching" | "found" | "missing">("idle");
  const [msg, setMsg] = React.useState("Press Step to begin.");
  const [comparisons, setComparisons] = React.useState(0);

  function reset(t = target) {
    setTarget(t);
    setLow(0);
    setHigh(BS_ARRAY.length - 1);
    setMid(null);
    setStatus("searching");
    setComparisons(0);
    setMsg(`Searching for ${t}. Low = 0, High = ${BS_ARRAY.length - 1}.`);
  }

  function step() {
    if (status === "found" || status === "missing") return;
    if (status === "idle") {
      reset();
      return;
    }
    if (low > high) {
      setStatus("missing");
      setMsg(`${target} is not in the list.`);
      return;
    }
    const m = Math.floor((low + high) / 2);
    setMid(m);
    setComparisons((c) => c + 1);
    if (BS_ARRAY[m] === target) {
      setStatus("found");
      setMsg(`ARR[${m}] = ${BS_ARRAY[m]} = target. Found at index ${m}!`);
    } else if (BS_ARRAY[m] < target) {
      setMsg(`ARR[${m}] = ${BS_ARRAY[m]} < ${target} → discard the left half, Low ← ${m + 1}.`);
      setLow(m + 1);
    } else {
      setMsg(`ARR[${m}] = ${BS_ARRAY[m]} > ${target} → discard the right half, High ← ${m - 1}.`);
      setHigh(m - 1);
    }
  }

  const bw = 360 / BS_ARRAY.length;
  return (
    <div className="space-y-4">
      <Stage viewBox="0 0 380 120">
        {BS_ARRAY.map((v, idx) => {
          const inRange = status !== "idle" && idx >= low && idx <= high;
          const isMid = idx === mid;
          const isFound = status === "found" && idx === mid;
          const fill = isFound ? VIZ.good : isMid ? VIZ.warn : inRange ? VIZ.physics : VIZ.line;
          return (
            <g key={idx}>
              <rect x={10 + idx * bw} y={40} width={bw - 6} height={40} rx="5" fill={fill}
                style={{ transition: "fill 250ms ease" }} />
              <text x={10 + idx * bw + (bw - 6) / 2} y={65} fill="#fff" fontSize="12" textAnchor="middle" fontWeight="600">{v}</text>
              <text x={10 + idx * bw + (bw - 6) / 2} y={98} fill={VIZ.faint} fontSize="9" textAnchor="middle">{idx}</text>
              {status !== "idle" && idx === low && <text x={10 + idx * bw + (bw - 6) / 2} y={30} fill={VIZ.soft} fontSize="9" textAnchor="middle">L</text>}
              {status !== "idle" && idx === high && <text x={10 + idx * bw + (bw - 6) / 2} y={20} fill={VIZ.soft} fontSize="9" textAnchor="middle">H</text>}
            </g>
          );
        })}
      </Stage>
      <div className="text-sm text-ink-soft min-h-[2.5rem] rounded-xl bg-surface-2/60 border border-line/50 px-3 py-2">
        {msg}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="primary" accent="compsci" size="sm" onClick={step} disabled={status === "found" || status === "missing"}>
          {status === "idle" ? "Start" : "Step ▸"}
        </Button>
        <Button variant="soft" size="sm" onClick={() => reset()}>Restart</Button>
        <div className="flex-1" />
        <span className="text-ink-faint text-xs">target</span>
        <select
          value={target}
          onChange={(e) => reset(Number(e.target.value))}
          className="rounded-lg bg-surface-2 border border-line/60 px-2 py-1 text-sm outline-none"
        >
          {[...BS_ARRAY, 20].sort((a, b) => a - b).map((v) => (
            <option key={v} value={v}>{v}{BS_ARRAY.includes(v) ? "" : " (not in list)"}</option>
          ))}
        </select>
      </div>
      <Readout
        items={[
          { label: "Range [Low, High]", value: status === "idle" ? "—" : `[${low}, ${high}]` },
          { label: "Comparisons", value: String(comparisons) },
          { label: "Max needed (log₂n)", value: `${Math.ceil(Math.log2(BS_ARRAY.length))}` },
        ]}
      />
      <p className="text-ink-faint text-sm">
        Each step checks the <span className="text-mark-warn">middle</span> of the live range and
        throws away half the list — so 9 items need at most 4 comparisons, and a million need only 20.
      </p>
    </div>
  );
}

// ---------------- Hardware: the fetch–decode–execute cycle ----------------
const FDE = [
  { phase: "Fetch", desc: "The PC holds the address of the next instruction.", hi: ["PC"] },
  { phase: "Fetch", desc: "Address copied to the MAR:  PC → MAR.", hi: ["PC", "MAR"] },
  { phase: "Fetch", desc: "Instruction read from memory:  memory[MAR] → MDR.", hi: ["MAR", "MDR"] },
  { phase: "Fetch", desc: "Instruction moved to the CIR:  MDR → CIR.", hi: ["MDR", "CIR"] },
  { phase: "Fetch", desc: "PC incremented to point at the next instruction:  PC ← PC + 1.", hi: ["PC"] },
  { phase: "Decode", desc: "The CIR is split into an opcode (ADD) and an operand (20).", hi: ["CIR"] },
  { phase: "Execute", desc: "ADD carried out: the value at address 20 is added into the ACC.", hi: ["ACC"] },
];
const REGS = ["PC", "MAR", "MDR", "CIR", "ACC"] as const;

export function VonNeumannViz() {
  const [step, setStep] = React.useState(0);
  const [run, setRun] = React.useState(false);

  React.useEffect(() => {
    if (!run) return;
    const id = setInterval(() => setStep((s) => (s + 1) % FDE.length), 1300);
    return () => clearInterval(id);
  }, [run]);

  const cur = FDE[step];
  const val = (r: string): string => {
    switch (r) {
      case "PC": return step >= 4 ? "31" : "30";
      case "MAR": return step >= 1 ? "30" : "—";
      case "MDR": return step >= 2 ? "ADD 20" : "—";
      case "CIR": return step >= 3 ? "ADD 20" : "—";
      case "ACC": return step >= 6 ? "12" : "5";
      default: return "—";
    }
  };
  const phaseTone = cur.phase === "Fetch" ? VIZ.physics : cur.phase === "Decode" ? VIZ.warn : VIZ.good;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: phaseTone, background: "rgb(var(--surface-2))" }}>
          {cur.phase}
        </span>
        <span className="text-ink-faint text-xs">step {step + 1} / {FDE.length}</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {REGS.map((r) => {
          const active = cur.hi.includes(r);
          return (
            <div
              key={r}
              className="rounded-xl border px-2 py-3 text-center transition-all duration-300"
              style={{
                borderColor: active ? phaseTone : "rgb(var(--line))",
                background: active ? "rgb(var(--surface-2))" : "rgb(var(--surface))",
                transform: active ? "translateY(-2px)" : "none",
              }}
            >
              <div className="text-[0.7rem] text-ink-faint">{r}</div>
              <div className="font-mono text-sm text-ink mt-0.5">{val(r)}</div>
            </div>
          );
        })}
      </div>
      <div className="text-sm text-ink-soft min-h-[2.5rem] rounded-xl bg-surface-2/60 border border-line/50 px-3 py-2">
        {cur.desc}
      </div>
      <div className="flex items-center gap-2">
        <PlayButton running={run} onToggle={() => setRun((v) => !v)} />
        <Button variant="soft" size="sm" onClick={() => { setRun(false); setStep((s) => (s + 1) % FDE.length); }}>Step ▸</Button>
        <Button variant="ghost" size="sm" onClick={() => { setRun(false); setStep(0); }}>Reset</Button>
      </div>
      <p className="text-ink-faint text-sm">
        Every instruction the CPU runs goes through this cycle. Registers are tiny, fast
        stores inside the processor; watch the PC increment and the instruction flow
        MAR → MDR → CIR before it's decoded and executed.
      </p>
    </div>
  );
}

function shuffle(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => (i + 1) * 2 + Math.floor(Math.random() * 3));
  for (let i = a.length - 1; i > 0; i--) {
    const k = Math.floor(Math.random() * (i + 1));
    [a[i], a[k]] = [a[k], a[i]];
  }
  return a;
}

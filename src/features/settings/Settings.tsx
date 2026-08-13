import React from "react";
import { useApp } from "@/lib/store";
import { Card, IconBack, cx } from "@/components/ui";
import { exportAll, importAll, clearData, countCards, putCards } from "@/lib/db";
import { seedCards } from "@/data/flashcards";
import {
  speechAvailable,
  loadVoices,
  englishVoices,
  bestVoice,
  speak,
  stopSpeech,
  onlyRoboticVoices,
} from "@/lib/speech";

export function SettingsScreen() {
  const { settings, saveSettings, back } = useApp();
  const [msg, setMsg] = React.useState("");
  const fileRef = React.useRef<HTMLInputElement>(null);

  async function doExport() {
    const data = await exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `study-center-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Backup downloaded.");
  }

  async function doImport(file: File) {
    try {
      const data = JSON.parse(await file.text());
      await importAll(data);
      setMsg("Backup restored. Reload to see everything.");
    } catch (e: any) {
      setMsg("Import failed: " + (e?.message ?? "invalid file"));
    }
  }

  async function resetCards() {
    if (!confirm("Reset all flashcard progress and review history? Your cards stay, but their scheduling resets.")) return;
    await clearData(["cards", "reviews"]);
    await putCards(seedCards());
    setMsg("Flashcards reset to the starter decks.");
  }

  async function clearEverything() {
    if (!confirm("Delete ALL your data — cards, review history, notes and edited graphs? This cannot be undone.")) return;
    await clearData(["cards", "reviews", "notes", "diagrams"]);
    if ((await countCards()) === 0) await putCards(seedCards());
    setMsg("Everything cleared. Reload to start fresh.");
  }

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-6 py-8">
      <IconBack onClick={back} />
      <h1 className="font-serif text-3xl sm:text-4xl text-ink mt-4 mb-6 glow-head">Settings</h1>

      {/* Appearance */}
      <Card className="p-5 mb-4">
        <h2 className="text-ink font-medium mb-1">Appearance</h2>
        <p className="text-ink-faint text-sm mb-3">Dark is a true, neutral black; light is a clean cool white.</p>
        <div className="flex gap-2 mb-4">
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => saveSettings({ theme: t })}
              className={cx(
                "px-4 py-2 rounded-xl text-sm capitalize border transition-all active:scale-95",
                settings.theme === t ? "bg-physics-soft text-physics border-physics/40" : "bg-surface-2 text-ink-soft border-line/60",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          <Toggle
            label="Reduce motion"
            desc="Turn off animations and transitions."
            on={settings.reduceMotion}
            onChange={(v) => saveSettings({ reduceMotion: v })}
          />
          <Toggle
            label="Bigger tap targets"
            desc="Roomier buttons and controls — easier on a phone or tablet."
            on={settings.bigTapTargets}
            onChange={(v) => saveSettings({ bigTapTargets: v })}
          />
        </div>
      </Card>

      {/* Read aloud */}
      <ReadAloudCard />

      {/* Worked examples & study */}
      <Card className="p-5 mb-4">
        <h2 className="text-ink font-medium mb-3">Worked examples</h2>
        <div className="space-y-4">
          <Toggle
            label="Reveal solutions step by step"
            desc="Show one step at a time instead of the whole solution at once."
            on={settings.revealStepwise}
            onChange={(v) => saveSettings({ revealStepwise: v })}
          />
          <Toggle
            label="Show mini diagrams"
            desc="A small sketch that reflects each question's numbers."
            on={settings.showDiagrams}
            onChange={(v) => saveSettings({ showDiagrams: v })}
          />
          <Toggle
            label="Fresh numbers each time"
            desc="Generate new values whenever you open a topic."
            on={settings.randomizeOnOpen}
            onChange={(v) => saveSettings({ randomizeOnOpen: v })}
          />
        </div>
      </Card>

      {/* Data */}
      <Card className="p-5 mb-4">
        <h2 className="text-ink font-medium mb-1">Your data</h2>
        <p className="text-ink-faint text-sm mb-4">
          Everything lives on this device. Back it up, move it to another device, or start over.
        </p>
        <div className="flex flex-wrap gap-2">
          <ActionBtn onClick={doExport}>↓ Export backup</ActionBtn>
          <ActionBtn onClick={() => fileRef.current?.click()}>↑ Import backup</ActionBtn>
          <ActionBtn onClick={resetCards}>Reset flashcards</ActionBtn>
          <ActionBtn danger onClick={clearEverything}>Clear everything</ActionBtn>
        </div>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
        {msg && <div className="mt-3 text-sm text-mark-good">{msg}</div>}
      </Card>

      {/* About */}
      <Card className="p-5">
        <h2 className="text-ink font-medium mb-1">About</h2>
        <p className="text-ink-soft text-sm leading-relaxed">
          A visual study room for Cambridge A-Level Physics 9702, Economics 9708 and
          Computer Science 9618 — interactive models, editable diagrams, worked
          examples and spaced-repetition flashcards. Local-first: nothing is sent anywhere.
        </p>
      </Card>
    </div>
  );
}

function ReadAloudCard() {
  const { settings, saveSettings } = useApp();
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [testing, setTesting] = React.useState(false);
  const available = React.useMemo(speechAvailable, []);

  React.useEffect(() => {
    if (!available) return;
    loadVoices().then(() => setVoices(englishVoices()));
    return () => stopSpeech();
  }, [available]);

  if (!available) return null;

  const auto = bestVoice();
  const ranked = [...voices].sort((a, b) => {
    // put the auto-pick first, then alphabetical
    if (a.voiceURI === auto?.voiceURI) return -1;
    if (b.voiceURI === auto?.voiceURI) return 1;
    return a.name.localeCompare(b.name);
  });

  function test() {
    stopSpeech();
    setTesting(true);
    speak(
      "Acceleration is the rate of change of velocity. Only the resultant force accelerates a body.",
      { voiceURI: settings.voiceURI, rate: settings.speechRate, onend: () => setTesting(false) },
    );
  }

  return (
    <Card className="p-5 mb-4">
      <h2 className="text-ink font-medium mb-1">Read aloud</h2>
      <p className="text-ink-faint text-sm mb-4">
        Used by the "Read aloud" buttons on concept pages and flashcards. Voices marked
        <span className="text-ink-soft"> Natural</span>,
        <span className="text-ink-soft"> Neural</span> or
        <span className="text-ink-soft"> Google</span> sound the most human.
      </p>

      <label className="block mb-4">
        <span className="text-xs text-ink-faint">Voice</span>
        <select
          value={settings.voiceURI ?? ""}
          onChange={(e) => saveSettings({ voiceURI: e.target.value || undefined })}
          className="mt-1 w-full rounded-xl bg-surface-2 border border-line/60 px-3 py-2 text-sm text-ink outline-none focus:border-physics/50"
        >
          <option value="">
            Best available{auto ? ` — ${auto.name}` : ""}
          </option>
          {ranked.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </label>

      <label className="block mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-ink-faint">Speed</span>
          <span className="text-xs text-ink font-mono">{settings.speechRate.toFixed(2)}×</span>
        </div>
        <input
          type="range"
          min={0.6}
          max={1.6}
          step={0.05}
          value={settings.speechRate}
          onChange={(e) => saveSettings({ speechRate: Number(e.target.value) })}
          className="w-full accent-[rgb(var(--physics))] cursor-pointer"
        />
      </label>

      <div className="flex items-center gap-2">
        <ActionBtn onClick={testing ? () => { stopSpeech(); setTesting(false); } : test}>
          {testing ? "■ Stop" : "▶ Test voice"}
        </ActionBtn>
        {voices.length === 0 && (
          <span className="text-ink-faint text-xs">Loading voices…</span>
        )}
      </div>

      {voices.length > 0 && onlyRoboticVoices() && (
        <div className="mt-4 rounded-xl border border-mark-warn/30 bg-[rgb(var(--mark-warn)/0.10)] px-4 py-3 text-sm text-ink-soft leading-relaxed">
          <span className="text-mark-warn font-medium">Only basic voices found. </span>
          This browser only has the older robotic Windows voices, so I've softened the
          delivery to compensate. For a properly human voice, open this app in{" "}
          <span className="text-ink">Microsoft Edge</span> (which adds free "Natural"
          neural voices), or install more in{" "}
          <span className="text-ink">Windows Settings → Time &amp; language → Speech</span>.
        </div>
      )}
    </Card>
  );
}

function Toggle({ label, desc, on, onChange }: { label: string; desc: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-ink text-sm font-medium">{label}</div>
        <div className="text-ink-faint text-xs mt-0.5">{desc}</div>
      </div>
      <button
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={cx(
          "shrink-0 w-11 h-6 rounded-full relative transition-colors duration-200 border",
          on ? "bg-physics border-physics" : "bg-surface-2 border-line/70",
        )}
      >
        <span className={cx("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200", on ? "translate-x-[22px]" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

function ActionBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "px-3.5 py-2 rounded-xl text-sm border transition-all active:scale-95",
        danger
          ? "bg-mark-bad-bg/40 text-mark-bad border-mark-bad/30 hover:bg-mark-bad-bg/70"
          : "bg-surface-2 text-ink-soft border-line/60 hover:bg-line/40 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

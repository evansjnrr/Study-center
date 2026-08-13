import React from "react";
import { speechAvailable, toSpeech, speak, stopSpeech, loadVoices } from "@/lib/speech";
import { useApp } from "@/lib/store";
import { cx } from "./ui";

// A small "read aloud" toggle. Hides itself if the browser has no speech support.
export function SpeakButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const settings = useApp((s) => s.settings);
  const [speaking, setSpeaking] = React.useState(false);
  const available = React.useMemo(speechAvailable, []);

  // Voices load asynchronously in most browsers — warm them up.
  React.useEffect(() => {
    if (available) loadVoices();
  }, [available]);

  // Stop any speech when this button unmounts (e.g. navigating away).
  React.useEffect(() => () => stopSpeech(), []);

  if (!available) return null;

  function toggle() {
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
    } else {
      const clean = toSpeech(text);
      if (!clean) return;
      speak(clean, {
        voiceURI: settings.voiceURI,
        rate: settings.speechRate,
        onend: () => setSpeaking(false),
      });
      setSpeaking(true);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={speaking ? "Stop reading aloud" : "Read this aloud"}
      className={cx(
        "inline-flex items-center gap-1.5 text-xs rounded-xl px-2.5 py-1.5 border transition-all active:scale-95",
        speaking
          ? "bg-physics-soft text-physics border-physics/40"
          : "bg-surface-2 text-ink-soft border-line/60 hover:text-ink",
        className,
      )}
    >
      <span aria-hidden>{speaking ? "■" : "🔊"}</span>
      {speaking ? "Stop" : "Read aloud"}
    </button>
  );
}

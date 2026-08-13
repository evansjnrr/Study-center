// Text-to-speech via the Web Speech API — a "read this to me" for revising.

export function speechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Turn rich markdown/LaTeX text into something worth reading aloud:
// drop maths (it reads as gibberish) and strip markdown markers.
export function toSpeech(rich: string): string {
  return rich
    .replace(/\$\$[^$]*\$\$/g, " ") // block maths
    .replace(/\$[^$]*\$/g, " ") // inline maths
    .replace(/```[\s\S]*?```/g, " ") // code fences
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/[#>*_~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function speak(text: string, onend?: () => void) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1;
  u.pitch = 1;
  u.lang = "en-GB";
  if (onend) u.onend = onend;
  synth.speak(u);
}

export function stopSpeech() {
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

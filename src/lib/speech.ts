// Text-to-speech via the Web Speech API — a "read this to me" for revising.
// Picks the most natural-sounding voice available and reads sentence-by-sentence
// so long passages don't get cut off (a known engine quirk).

export function speechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let cachedVoices: SpeechSynthesisVoice[] = [];

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!speechAvailable()) return resolve([]);
    const synth = window.speechSynthesis;
    const now = synth.getVoices();
    if (now.length) {
      cachedVoices = now;
      return resolve(now);
    }
    const onChange = () => {
      const v = synth.getVoices();
      if (v.length) {
        cachedVoices = v;
        synth.removeEventListener("voiceschanged", onChange);
        resolve(v);
      }
    };
    synth.addEventListener("voiceschanged", onChange);
    setTimeout(() => resolve(synth.getVoices()), 1200);
  });
}

function allVoices(): SpeechSynthesisVoice[] {
  if (cachedVoices.length) return cachedVoices;
  return speechAvailable() ? window.speechSynthesis.getVoices() : [];
}

export function englishVoices(): SpeechSynthesisVoice[] {
  return allVoices().filter((v) => /^en/i.test(v.lang));
}

// Higher score = more natural. Neural/Natural/cloud voices sound the most human;
// the legacy Windows SAPI voices (David/Mark/Zira) are the robotic fallback.
function scoreVoice(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase();
  let s = 0;
  if (/natural|neural/.test(n)) s += 140;
  if (/online/.test(n)) s += 90;
  if (!v.localService) s += 80; // network voices are the modern neural ones
  if (/google/.test(n)) s += 70;
  if (/premium|enhanced|siri/.test(n)) s += 60;
  // pleasant, commonly-good named voices
  if (/aria|jenny|sonia|libby|natasha|ryan|guy|samantha|serena|karen|moira|daniel/.test(n)) s += 20;
  if (/en-gb/i.test(v.lang)) s += 8;
  else if (/en-us|en-au/i.test(v.lang)) s += 4;
  // legacy Windows SAPI voices — robotic. Zira is the least harsh of them.
  if (/david|mark|hazel/.test(n)) s -= 20;
  else if (/zira/.test(n)) s -= 12;
  return s;
}

export function bestVoice(): SpeechSynthesisVoice | undefined {
  const vs = englishVoices();
  if (!vs.length) return undefined;
  return [...vs].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
}

/** True when the voice is a modern neural/cloud one rather than a legacy robotic. */
export function isNaturalVoice(v?: SpeechSynthesisVoice): boolean {
  if (!v) return false;
  return scoreVoice(v) > 30;
}

/** True when no natural-sounding voice exists on this device/browser. */
export function onlyRoboticVoices(): boolean {
  const vs = englishVoices();
  return vs.length > 0 && !vs.some(isNaturalVoice);
}

// Turn rich markdown/LaTeX text into something worth reading aloud:
// drop maths (it reads as gibberish) and strip markdown markers.
export function toSpeech(rich: string): string {
  return rich
    .replace(/\$\$[^$]*\$\$/g, " ")
    .replace(/\$[^$]*\$/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[#>*_~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

let session = 0;

export interface SpeakOptions {
  voiceURI?: string;
  rate?: number;
  onend?: () => void;
}

export function speak(text: string, opts: SpeakOptions = {}) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const mine = ++session;

  const voices = allVoices();
  let voice: SpeechSynthesisVoice | undefined;
  if (opts.voiceURI) voice = voices.find((v) => v.voiceURI === opts.voiceURI);
  if (!voice) voice = bestVoice();

  const rate = clamp(opts.rate ?? 1, 0.6, 1.6);
  // Break into sentence-sized chunks for smooth, uninterrupted playback.
  const chunks = text.match(/[^.!?;:]+[.!?;:]*/g)?.map((c) => c.trim()).filter(Boolean) ?? [text];
  let i = 0;

  const next = () => {
    if (mine !== session) return; // superseded / stopped
    if (i >= chunks.length) {
      opts.onend?.();
      return;
    }
    const u = new SpeechSynthesisUtterance(chunks[i++]);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else {
      u.lang = "en-GB";
    }
    // Legacy robotic voices sound noticeably warmer a touch slower and lower.
    const robotic = voice ? !isNaturalVoice(voice) : false;
    u.rate = robotic ? rate * 0.92 : rate;
    u.pitch = robotic ? 0.92 : 1.0;
    u.onend = next;
    u.onerror = next;
    synth.speak(u);
  };
  next();
}

export function stopSpeech() {
  session++;
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

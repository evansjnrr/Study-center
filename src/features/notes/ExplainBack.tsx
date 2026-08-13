import React from "react";
import { getNote, putNote } from "@/lib/db";
import { Chip, cx } from "@/components/ui";

// The Feynman technique: explain a concept in plain language as if teaching a
// beginner. Where you stumble is exactly the gap to go back and close. Saved
// locally per concept so you can return to (and improve) your explanation.

const ACCENT: Record<string, string> = {
  physics: "text-physics",
  econ: "text-econ",
  compsci: "text-compsci",
};

export function ExplainBack({
  noteId,
  subject = "physics",
}: {
  noteId: string;
  subject?: "physics" | "econ" | "compsci";
}) {
  const [text, setText] = React.useState("");
  const [saved, setSaved] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const loadedFor = React.useRef<string>("");

  React.useEffect(() => {
    loadedFor.current = noteId;
    getNote(noteId).then((n) => {
      // guard against a race if noteId changed mid-load
      if (loadedFor.current === noteId) {
        setText(n?.text ?? "");
        setDirty(false);
      }
    });
  }, [noteId]);

  async function save() {
    await putNote({ id: noteId, text, updatedAt: Date.now() });
    setSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="rounded-2xl border border-line/60 bg-surface p-5">
      <div className="flex items-center justify-between mb-1">
        <div className={cx("text-xs font-medium uppercase tracking-wide", ACCENT[subject])}>
          Explain it back
        </div>
        {saved ? <Chip accent="good">saved</Chip> : dirty ? <span className="text-ink-faint text-xs">unsaved</span> : null}
      </div>
      <p className="text-ink-faint text-sm mb-3 leading-relaxed">
        Say it in your own words, as if teaching someone who's never seen it. Wherever
        you get stuck is the gap worth revisiting — that's the Feynman technique.
      </p>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setDirty(true); }}
        onBlur={() => dirty && save()}
        rows={4}
        placeholder="In plain language…"
        className="w-full rounded-xl bg-surface-2/60 border border-line/60 px-3 py-2.5 text-sm text-ink outline-none focus:border-physics/40 resize-none leading-relaxed"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-ink-faint text-xs">Saves automatically when you click away.</span>
        <button
          onClick={save}
          disabled={!dirty}
          className="text-sm rounded-xl px-3 py-1.5 bg-surface-2 text-ink-soft border border-line/60 disabled:opacity-40 active:scale-95 transition-all"
        >
          Save
        </button>
      </div>
    </div>
  );
}

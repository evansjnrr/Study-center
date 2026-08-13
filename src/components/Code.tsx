// A simple monospace code block for Cambridge pseudocode, SQL and the like.
// Preserves whitespace; no syntax highlighting (kept deliberately plain).
export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  return (
    <div className="rounded-2xl border border-line/60 bg-surface-2/60 overflow-hidden">
      {lang && (
        <div className="px-3 py-1.5 text-[0.7rem] uppercase tracking-wide text-ink-faint border-b border-line/50">
          {lang}
        </div>
      )}
      <pre className="p-3.5 overflow-x-auto text-[0.86rem] leading-relaxed text-ink font-mono whitespace-pre">
        {code.replace(/^\n/, "").replace(/\n$/, "")}
      </pre>
    </div>
  );
}

import React from "react";
import { useApp } from "@/lib/store";
import { CS_TOPICS, csTopicById, type CSBlock, type CSExample } from "./cs-data";
import { Button, Card, Chip, IconBack, cx } from "@/components/ui";
import { RichText } from "@/components/Katex";
import { CodeBlock } from "@/components/Code";
import { ExplainBack } from "@/features/notes/ExplainBack";
import { SpeakButton } from "@/components/SpeakButton";

export function ComputerScience({ topicId }: { topicId?: string }) {
  const { navigate, back } = useApp();

  if (topicId) return <CSDetail topicId={topicId} />;

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 py-8">
      <IconBack onClick={back} />
      <h1 className="font-serif text-3xl text-ink mt-4 mb-1">Computer Science</h1>
      <p className="text-ink-soft mb-7">
        Every Cambridge 9618 topic with a worked example — and, where it helps, an
        <span className="text-compsci"> alternative approach</span> you can reveal and
        compare.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {CS_TOPICS.map((t) => (
          <Card key={t.id} onClick={() => navigate({ name: "cs", topicId: t.id })} className="px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-ink font-medium">{t.name}</div>
                <div className="text-ink-faint text-sm mt-0.5">{t.summary}</div>
              </div>
              {t.component ? (
                <Chip accent="compsci">interactive</Chip>
              ) : (
                <span className="text-ink-faint text-xs mt-1 shrink-0">example</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CSDetail({ topicId }: { topicId: string }) {
  const { navigate, back } = useApp();
  const t = csTopicById(topicId);
  if (!t) return null;
  const Comp = t.component;

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-8">
      <IconBack onClick={back} label="All topics" />
      <div className="flex items-center gap-3 mt-4 mb-1">
        <h1 className="font-serif text-3xl text-ink">{t.name}</h1>
        {Comp && <Chip accent="compsci">interactive</Chip>}
      </div>
      <p className="text-ink-soft mb-6">{t.summary}</p>

      {Comp && (
        <div className="mb-8">
          <Comp />
        </div>
      )}

      {/* Key points */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wide">
            The essentials
          </div>
          <SpeakButton text={`${t.summary} ${t.detail.join(" ")}`} />
        </div>
        <ul className="space-y-3">
          {t.detail.map((d, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-compsci mt-1.5 shrink-0">•</span>
              <RichText text={d} className="text-ink-soft leading-relaxed" />
            </li>
          ))}
        </ul>
      </div>

      {/* Worked examples with optional alternatives */}
      <div className="space-y-6">
        {t.examples.map((ex, i) => (
          <ExampleCard key={i} ex={ex} />
        ))}
      </div>

      <div className="mt-6">
        <ExplainBack noteId={`explain:${t.id}`} subject="compsci" />
      </div>

      <div className="mt-8">
        <Button variant="soft" onClick={() => navigate({ name: "cs" })}>All topics</Button>
      </div>
    </div>
  );
}

function ExampleCard({ ex }: { ex: CSExample }) {
  const [showAlt, setShowAlt] = React.useState(false);
  return (
    <Card className="p-5">
      <div className="text-ink font-medium mb-3">{ex.title}</div>
      <Blocks blocks={ex.blocks} />

      {ex.alternative && (
        <div className="mt-4 pt-4 border-t border-line/50">
          <button
            onClick={() => setShowAlt((v) => !v)}
            className={cx(
              "inline-flex items-center gap-2 text-sm rounded-xl px-3 py-1.5 border transition-all duration-150 active:scale-[0.97]",
              showAlt
                ? "bg-compsci-soft text-compsci border-compsci/40"
                : "bg-surface-2 text-ink-soft border-line/60 hover:text-ink",
            )}
          >
            <span className="transition-transform duration-200" style={{ transform: showAlt ? "rotate(90deg)" : "none" }}>›</span>
            {ex.alternative.label}
          </button>
          {showAlt && (
            <div className="mt-4 animate-fade-up">
              {ex.alternative.note && (
                <p className="text-ink-faint text-sm mb-3 italic">{ex.alternative.note}</p>
              )}
              <Blocks blocks={ex.alternative.blocks} />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function Blocks({ blocks }: { blocks: CSBlock[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        if (b.kind === "code") return <CodeBlock key={i} code={b.code} lang={b.lang} />;
        if (b.kind === "table") return <MiniTable key={i} headers={b.headers} rows={b.rows} />;
        if (b.kind === "widget") {
          const W = b.render;
          return (
            <div key={i} className="my-1">
              <W />
            </div>
          );
        }
        return <RichText key={i} text={b.text} className="text-ink-soft leading-relaxed" />;
      })}
    </div>
  );
}

function MiniTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-2/60">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-3 py-2 text-ink-soft font-medium border-b border-line/50">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line/40 last:border-0">
              {r.map((c, j) => (
                <td key={j} className={cx("px-3 py-2", j === 0 ? "text-ink font-medium" : "text-ink-soft")}>
                  <span dangerouslySetInnerHTML={{ __html: c.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

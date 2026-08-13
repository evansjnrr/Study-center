import React from "react";
import { useApp } from "@/lib/store";
import { DIAGRAMS, diagramById, type DiagramTemplate } from "./diagrams";
import { DiagramEditor } from "./DiagramEditor";
import { allDiagrams } from "@/lib/db";
import { Card, Chip, IconBack } from "@/components/ui";
import { RichText } from "@/components/Katex";
import { ExplainBack } from "@/features/notes/ExplainBack";
import { SpeakButton } from "@/components/SpeakButton";

export function EconGraphs({ diagramId }: { diagramId?: string }) {
  const { navigate, back } = useApp();
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    allDiagrams().then((d) => setSavedIds(new Set(d.map((x) => x.id))));
  }, [diagramId]);

  if (diagramId) {
    const d = diagramById(diagramId);
    if (!d) return null;
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-8">
        <IconBack onClick={back} label="All graphs" />
        <div className="flex items-center gap-3 mt-4 mb-1">
          <h1 className="font-serif text-3xl text-ink">{d.name}</h1>
          <Chip accent="econ">{d.category === "Macroeconomics" ? "Macro" : "Micro"}</Chip>
        </div>
        <p className="text-ink-soft mb-6">{d.note}</p>
        <DiagramEditor id={d.id} />
        <DiagramDetail d={d} />
        <div className="mt-6">
          <ExplainBack noteId={`explain:${d.id}`} subject="econ" />
        </div>
      </div>
    );
  }

  const micro = DIAGRAMS.filter((d) => d.category === "Microeconomics");
  const macro = DIAGRAMS.filter((d) => d.category === "Macroeconomics");

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 py-8">
      <IconBack onClick={back} />
      <h1 className="font-serif text-3xl text-ink mt-4 mb-1">Your economics graphs</h1>
      <p className="text-ink-soft mb-7">
        Every core 9708 diagram, editable. Reshape a curve to how you draw it,
        rename the axes, add a note — it saves as your personal version and reopens
        exactly as you left it.
      </p>

      <Section title="Microeconomics" diagrams={micro} savedIds={savedIds} onOpen={(id) => navigate({ name: "econ", diagramId: id })} />
      <Section title="Macroeconomics" diagrams={macro} savedIds={savedIds} onOpen={(id) => navigate({ name: "econ", diagramId: id })} />
    </div>
  );
}

// The detailed teaching content shown beneath the editable diagram.
function DiagramDetail({ d }: { d: DiagramTemplate }) {
  return (
    <div className="mt-8 space-y-6">
      {/* Real-world example — leads, because it's the anchor */}
      <Card className="p-5 border-econ/30">
        <div className="text-xs font-medium text-econ uppercase tracking-wide mb-2">
          Real-world example
        </div>
        <RichText text={d.realWorld} className="prose-paper text-ink leading-relaxed" />
      </Card>

      {/* In-depth explanation */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wide">
            How the diagram works
          </div>
          <SpeakButton text={`${d.realWorld} ${d.explanation.join(" ")}`} />
        </div>
        <ul className="space-y-3">
          {d.explanation.map((e, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-econ mt-1.5 shrink-0">•</span>
              <RichText text={e} className="text-ink-soft leading-relaxed" />
            </li>
          ))}
        </ul>
      </div>

      {/* Evaluation points */}
      {d.evaluation && d.evaluation.length > 0 && (
        <div>
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wide mb-3">
            Evaluation — lift your answer
          </div>
          <ul className="space-y-3">
            {d.evaluation.map((e, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-mark-warn mt-1.5 shrink-0">▸</span>
                <RichText text={e} className="text-ink-soft leading-relaxed" />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key terms */}
      {d.keyTerms && d.keyTerms.length > 0 && (
        <div>
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wide mb-3">
            Key terms
          </div>
          <div className="grid gap-2">
            {d.keyTerms.map((k) => (
              <div key={k.term} className="rounded-xl border border-line/60 bg-surface px-4 py-3">
                <span className="text-ink font-medium">{k.term}</span>
                <span className="text-ink-soft text-sm"> — {k.def}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title, diagrams, savedIds, onOpen,
}: {
  title: string; diagrams: typeof DIAGRAMS; savedIds: Set<string>; onOpen: (id: string) => void;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-medium text-ink-soft uppercase tracking-wide mb-3">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {diagrams.map((d) => (
          <Card key={d.id} onClick={() => onOpen(d.id)} className="px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-ink font-medium">{d.name}</div>
                <div className="text-ink-faint text-sm mt-0.5 line-clamp-2">{d.note}</div>
              </div>
              {savedIds.has(d.id) && <Chip accent="good">edited</Chip>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { useApp } from "@/lib/store";
import { PHYSICS_TOPICS, topicById } from "@/data/topics";
import { vizFor, type VizEntry } from "./registry";
import { Button, Card, Chip, IconBack } from "@/components/ui";
import { RichText, renderInline } from "@/components/Katex";
import { ExplainBack } from "@/features/notes/ExplainBack";
import { WorkedExamples, hasWorked } from "./worked";

// Hub: grid of physics topics; interactive ones open a live visualizer,
// all of them open a fully detailed concept page.
export function Visualize({ topicId }: { topicId?: string }) {
  const { navigate, back } = useApp();

  if (topicId) return <VizDetail topicId={topicId} />;

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 py-8">
      <IconBack onClick={back} />
      <h1 className="font-serif text-3xl text-ink mt-4 mb-1">See it move</h1>
      <p className="text-ink-soft mb-7">
        A page for every 9702 concept — the equations, what they mean, and what to
        notice. The interactive ones also let you drag the numbers and watch the
        physics respond.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {PHYSICS_TOPICS.map((t) => {
          const v = vizFor(t.id);
          const interactive = !!v?.component;
          return (
            <Card
              key={t.id}
              onClick={() => navigate({ name: "viz", topicId: t.id })}
              className="px-4 py-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-ink font-medium">{t.name}</div>
                  <div className="text-ink-faint text-sm mt-0.5">{v?.summary}</div>
                </div>
                {interactive ? (
                  <Chip accent="physics">interactive</Chip>
                ) : (
                  <span className="text-ink-faint text-xs mt-1 shrink-0">detailed</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function VizDetail({ topicId }: { topicId: string }) {
  const { navigate, back } = useApp();
  const topic = topicById(topicId);
  const v = vizFor(topicId);
  const Comp = v?.component;

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-8">
      <IconBack onClick={back} label="All visuals" />
      <div className="glow-head flex items-center gap-3 mt-5 mb-1">
        <h1 className="font-serif text-3xl sm:text-4xl text-ink">{topic?.name}</h1>
        {Comp && <Chip accent="physics">interactive</Chip>}
      </div>
      <p className="text-ink-soft mb-6">{v?.summary}</p>

      {Comp && (
        <div className="mb-8">
          <Comp />
        </div>
      )}

      {v && <ConceptDetail entry={v} />}

      {hasWorked(topicId) && (
        <div className="mt-6">
          <WorkedExamples topicId={topicId} />
        </div>
      )}

      <div className="mt-6">
        <ExplainBack noteId={`explain:${topicId}`} subject="physics" />
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="soft" onClick={() => navigate({ name: "viz" })}>
          Other visuals
        </Button>
      </div>
    </div>
  );
}

export function ConceptDetail({ entry }: { entry: VizEntry }) {
  return (
    <div className="space-y-6">
      {/* Key equations */}
      {entry.equations.length > 0 && (
        <Card className="p-5">
          <div className="text-xs font-medium text-physics uppercase tracking-wide mb-3">
            Key equations
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {entry.equations.map((eq, i) => (
              <div
                key={i}
                className="text-ink text-lg"
                dangerouslySetInnerHTML={{ __html: renderInline(eq) }}
              />
            ))}
          </div>
        </Card>
      )}

      {/* In-depth explanation */}
      {entry.detail.length > 0 && (
        <div>
          <div className="text-xs font-medium text-ink-faint uppercase tracking-wide mb-3">
            In depth
          </div>
          <ul className="space-y-3">
            {entry.detail.map((d, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-physics mt-1.5 shrink-0">•</span>
                <RichText text={d} className="text-ink-soft leading-relaxed" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

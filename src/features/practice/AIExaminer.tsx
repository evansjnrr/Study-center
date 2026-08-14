import React from "react";
import { examine, examinerErrorMessage, type ExamReport } from "@/lib/examiner";
import type { MistakeReason, Question } from "@/lib/questions";
import { useApp } from "@/lib/store";
import { Button, Card, cx } from "@/components/ui";
import { RichText } from "@/components/Katex";

/**
 * Runs one question's answer past the AI examiner.
 *
 * It pre-ticks the mark scheme and suggests why marks were lost — but the
 * ticks you see on screen stay editable, so the deterministic mark scheme
 * is still what actually gets recorded.
 */
export function useExaminer(
  q: Question | undefined,
  answer: string,
  onReport: (r: ExamReport) => void,
) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [report, setReport] = React.useState<ExamReport | null>(null);

  // A fresh question means a fresh verdict.
  React.useEffect(() => {
    setReport(null);
    setError("");
    setBusy(false);
  }, [q?.id]);

  const run = React.useCallback(async () => {
    if (!q || busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await examine(q, answer);
      setReport(r);
      onReport(r);
    } catch (e) {
      setError(examinerErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }, [q, answer, busy, onReport]);

  return { busy, error, report, run };
}

export function ExaminerButton({
  busy,
  hasReport,
  onRun,
}: {
  busy: boolean;
  hasReport: boolean;
  onRun: () => void;
}) {
  const apiKey = useApp((s) => s.settings.apiKey);
  const navigate = useApp((s) => s.navigate);

  if (!apiKey?.trim()) {
    return (
      <button
        onClick={() => navigate({ name: "settings" })}
        className="w-full rounded-xl border border-line/60 bg-surface-2 px-4 py-2.5 text-sm text-ink-faint hover:text-ink transition-colors text-left"
      >
        ✨ Want Claude to mark this for you? Add an API key in Settings →
      </button>
    );
  }

  return (
    <Button
      variant="soft"
      accent="econ"
      className="w-full"
      disabled={busy}
      onClick={onRun}
    >
      {busy ? "Marking…" : hasReport ? "↻ Mark again" : "✨ Mark this with Claude"}
    </Button>
  );
}

/** The examiner's verdict: what's missing, why, and a full-mark answer. */
export function ExaminerReport({
  report,
  error,
  marksTotal,
}: {
  report: ExamReport | null;
  error: string;
  marksTotal: number;
}) {
  const [showModel, setShowModel] = React.useState(false);

  React.useEffect(() => setShowModel(false), [report]);

  if (error) {
    return (
      <Card className="p-4 border-mark-bad/30">
        <div className="text-mark-bad text-sm">{error}</div>
        <p className="text-ink-faint text-xs mt-1">
          Tick the mark scheme yourself — it still counts exactly the same.
        </p>
      </Card>
    );
  }

  if (!report) return null;

  const full = report.marksAwarded >= marksTotal;

  return (
    <Card className="p-5 animate-fade-up">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-medium text-econ uppercase tracking-wide">
          Examiner
        </div>
        <div
          className={cx(
            "font-serif text-xl",
            full ? "text-mark-good" : report.marksAwarded === 0 ? "text-mark-bad" : "text-ink",
          )}
        >
          {report.marksAwarded}
          <span className="text-ink-faint text-sm">/{marksTotal}</span>
        </div>
      </div>

      {report.feedback && (
        <RichText text={report.feedback} className="text-ink-soft text-sm leading-relaxed" />
      )}

      {report.missing && !full && (
        <div className="mt-3 rounded-xl bg-mark-bad-bg/40 border border-mark-bad/25 px-3 py-2.5">
          <div className="text-[0.7rem] uppercase tracking-wide text-mark-bad mb-1">
            What's missing
          </div>
          <RichText text={report.missing} className="text-ink-soft text-sm leading-relaxed" />
        </div>
      )}

      {report.modelAnswer && (
        <div className="mt-3">
          <button
            onClick={() => setShowModel((v) => !v)}
            className="text-econ text-sm hover:underline"
          >
            {showModel ? "Hide the full-mark answer" : "Show me a full-mark answer →"}
          </button>
          {showModel && (
            <div className="mt-2 rounded-xl bg-surface-2/70 border border-line/50 px-3 py-2.5 animate-fade-up">
              <RichText
                text={report.modelAnswer}
                className="text-ink-soft text-sm leading-relaxed whitespace-pre-wrap"
              />
            </div>
          )}
        </div>
      )}

      <p className="text-ink-faint text-xs mt-4 pt-3 border-t border-line/50">
        Claude has ticked the mark scheme above. Change anything it got wrong —
        what you leave ticked is what gets recorded.
      </p>
    </Card>
  );
}

/** Per-mark-point comment, shown under each tickable row once marked. */
export function PointComment({
  report,
  pointId,
}: {
  report: ExamReport | null;
  pointId: string;
}) {
  const v = report?.points.find((p) => p.id === pointId);
  if (!v?.comment) return null;
  return (
    <div
      className={cx(
        "text-xs mt-1 leading-relaxed",
        v.awarded ? "text-mark-good" : "text-ink-faint",
      )}
    >
      {v.awarded ? "✓ " : "✗ "}
      {v.comment}
    </div>
  );
}

export type { ExamReport, MistakeReason };

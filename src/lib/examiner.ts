// ------------------------------------------------------------------
// The AI examiner.
//
// Sends one question + its criterion-tagged mark scheme + your typed answer
// to Claude, and gets back a per-mark-point verdict, what exactly is missing,
// and a full-mark model answer.
//
// The deterministic mark scheme is still the source of truth — this only
// PRE-TICKS the points; you can always override before it's recorded.
//
// Local-first: the key lives in this browser's IndexedDB and the request goes
// straight from the page to api.anthropic.com. There is no backend.
// ------------------------------------------------------------------

import type { MistakeReason, Question } from "./questions";
import { MISTAKE_LABEL } from "./questions";
import { getSettings } from "./db";

const MODEL = "claude-opus-5";

export interface PointVerdict {
  id: string;
  awarded: boolean;
  /** One line on why it was or wasn't awarded. */
  comment: string;
}

export interface ExamReport {
  points: PointVerdict[];
  earnedPointIds: string[];
  marksAwarded: number;
  /** The exact point(s) the answer is missing. */
  missing: string;
  /** Why the answer scored what it did, in examiner language. */
  feedback: string;
  /** A complete answer that would score full marks. */
  modelAnswer: string;
  /** Suggested mistake tags — the user confirms these. */
  mistakeReasons: MistakeReason[];
}

export class NoApiKeyError extends Error {
  constructor() {
    super("No Claude API key saved. Add one in Settings → AI examiner.");
    this.name = "NoApiKeyError";
  }
}

export async function hasApiKey(): Promise<boolean> {
  return !!(await getSettings())?.apiKey?.trim();
}

/** A cheap round-trip that proves the key works, used by the Settings screen. */
export async function testApiKey(key: string): Promise<void> {
  const client = await makeClient(key);
  await client.messages.create({
    model: MODEL,
    max_tokens: 16,
    messages: [{ role: "user", content: "Reply with the single word: ok" }],
  });
}

async function makeClient(key: string) {
  // Imported lazily so the SDK is code-split out of the initial page load —
  // the app still works fully offline without ever touching this chunk.
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  return new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
}

const REASONS = Object.keys(MISTAKE_LABEL) as MistakeReason[];

const SCHEMA = {
  type: "object",
  properties: {
    points: {
      type: "array",
      description: "One entry per mark-scheme point, in the order given.",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "The mark point's id." },
          awarded: {
            type: "boolean",
            description: "True only if the answer genuinely earns this point.",
          },
          comment: {
            type: "string",
            description: "One short sentence on why it was or wasn't awarded.",
          },
        },
        required: ["id", "awarded", "comment"],
        additionalProperties: false,
      },
    },
    missing: {
      type: "string",
      description:
        "The exact point(s) the answer failed to make. Empty string if it scored full marks.",
    },
    feedback: {
      type: "string",
      description:
        "Two or three sentences of examiner feedback on the answer as written.",
    },
    modelAnswer: {
      type: "string",
      description:
        "A complete answer that would score full marks, written the way a candidate should write it.",
    },
    mistakeReasons: {
      type: "array",
      description:
        "Why marks were lost. Empty array if the answer scored full marks.",
      items: { type: "string", enum: REASONS },
    },
  },
  required: ["points", "missing", "feedback", "modelAnswer", "mistakeReasons"],
  additionalProperties: false,
} as const;

const SYSTEM = `You are an experienced Cambridge International A-Level examiner marking a single question for one student.

You will be given the question, its official mark scheme (each point tagged with the criterion it tests), and the student's typed answer.

How to mark:
- Award a mark point only if the answer genuinely earns it. Do not give credit for something that is merely implied, nor for a bare final answer where the scheme requires working.
- Respect the command word. "State" needs no explanation; "Explain" needs a reason; "Discuss"/"Evaluate" need both sides and a supported judgement.
- Allow error carried forward where the scheme's structure supports it, and accept any physically or economically equivalent wording. Accept correct answers reached by a valid alternative method.
- Accept plain-text notation for maths and units (e.g. "m/s^2", "9.81 m s-2"). Do not penalise formatting, spelling, or typing shorthand.
- If the answer is blank or unrelated, award nothing and say so plainly.

Write the feedback to the student directly ("you"), in the tone of a teacher who wants them to score better next time. Be specific about the words the mark scheme wanted. Keep it short.

Write the model answer as a candidate should write it in the exam — the working, the reasoning and the final statement, nothing extra.

Only choose mistakeReasons from the allowed list, and only ones that genuinely apply.`;

export async function examine(
  q: Question,
  answerText: string,
): Promise<ExamReport> {
  const settings = await getSettings();
  const key = settings?.apiKey?.trim();
  if (!key) throw new NoApiKeyError();

  const client = await makeClient(key);

  const scheme = q.markScheme
    .map((p) => `- [${p.id}] (${p.marks} mark${p.marks === 1 ? "" : "s"}, tests ${p.criterion}) ${p.text}`)
    .join("\n");

  const prompt = [
    `Subject: ${subjectName(q.subject)} (${q.subject}), ${q.paper}`,
    `Total marks: ${q.marks}`,
    "",
    "QUESTION",
    q.stem,
    q.data ? `\nData given: ${q.data}` : "",
    "",
    "MARK SCHEME",
    scheme,
    q.guidance ? `\nExaminer guidance: ${q.guidance}` : "",
    "",
    "STUDENT'S ANSWER",
    answerText.trim() || "(left blank)",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: SYSTEM,
    output_config: {
      format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> },
      effort: "medium",
    },
    messages: [{ role: "user", content: prompt }],
  });

  if (res.stop_reason === "refusal") {
    throw new Error("The examiner declined to mark this answer.");
  }

  const text = res.content
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("");

  let raw: any;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("The examiner's reply could not be read. Try again.");
  }

  // Trust the mark scheme for the arithmetic — the model only decides
  // which points were earned.
  const verdicts: PointVerdict[] = q.markScheme.map((p) => {
    const hit = Array.isArray(raw.points)
      ? raw.points.find((x: any) => x?.id === p.id)
      : undefined;
    return {
      id: p.id,
      awarded: !!hit?.awarded,
      comment: typeof hit?.comment === "string" ? hit.comment : "",
    };
  });

  const earnedPointIds = verdicts.filter((v) => v.awarded).map((v) => v.id);
  const marksAwarded = q.markScheme
    .filter((p) => earnedPointIds.includes(p.id))
    .reduce((s, p) => s + p.marks, 0);

  return {
    points: verdicts,
    earnedPointIds,
    marksAwarded,
    missing: str(raw.missing),
    feedback: str(raw.feedback),
    modelAnswer: str(raw.modelAnswer),
    mistakeReasons: Array.isArray(raw.mistakeReasons)
      ? raw.mistakeReasons.filter((r: any): r is MistakeReason => REASONS.includes(r))
      : [],
  };
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function subjectName(code: Question["subject"]): string {
  return code === "9702" ? "Physics" : code === "9708" ? "Economics" : "Computer Science";
}

/** Turns an SDK/network failure into something worth showing on screen. */
export function examinerErrorMessage(e: unknown): string {
  const err = e as { name?: string; status?: number; message?: string };
  if (err?.name === "NoApiKeyError") return err.message!;
  if (err?.status === 401) return "That API key was rejected. Check it in Settings.";
  if (err?.status === 429) return "Rate limited by the API — wait a moment and try again.";
  if (err?.status === 400) return "The examiner rejected the request: " + (err.message ?? "");
  if (err?.status && err.status >= 500) return "Anthropic's API is having trouble. Try again shortly.";
  if (err?.message?.includes("fetch") || err?.message?.includes("network")) {
    return "Couldn't reach the API — you may be offline. Mark it yourself instead.";
  }
  return err?.message || "Something went wrong marking that answer.";
}

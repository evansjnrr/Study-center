import React from "react";
import { allReviews, allCards } from "@/lib/db";
import type { Flashcard, ReviewLog } from "@/lib/types";
import { DAY } from "@/lib/srs";
import { Button, Card, Chip, cx } from "@/components/ui";

const SUBJECT_META: Record<string, { name: string; accent: "physics" | "econ" | "compsci" }> = {
  "9702": { name: "Physics", accent: "physics" },
  "9708": { name: "Economics", accent: "econ" },
  "9618": { name: "Comp Sci", accent: "compsci" },
};

function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function Stats({ onBack }: { onBack: () => void }) {
  const [reviews, setReviews] = React.useState<ReviewLog[] | null>(null);
  const [cards, setCards] = React.useState<Flashcard[]>([]);

  React.useEffect(() => {
    allReviews().then(setReviews);
    allCards().then(setCards);
  }, []);

  const stats = React.useMemo(() => (reviews ? compute(reviews, cards) : null), [reviews, cards]);

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-8">
      <Button variant="quiet" size="sm" onClick={onBack} className="!px-2">← Flashcards</Button>
      <h1 className="font-serif text-3xl text-ink mt-4 mb-6">Your review stats</h1>

      {!stats || stats.total === 0 ? (
        <Card className="p-6">
          <p className="text-ink-soft">
            No reviews logged yet. Do a flashcard session and this fills in — reviews
            per day, retention, your streak and what's coming due.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Headline tiles */}
          <div className="grid grid-cols-3 gap-3">
            <Tile label="Reviewed today" value={String(stats.today)} />
            <Tile label="Day streak" value={stats.streak > 0 ? `${stats.streak}🔥`.replace("🔥", "") : "0"} sub={stats.streak > 0 ? "keep it going" : undefined} />
            <Tile label="Retention" value={`${stats.retention}%`} sub="graded Good+" tone={stats.retention >= 80 ? "good" : stats.retention >= 60 ? undefined : "bad"} />
          </div>

          {/* Reviews over the last 14 days */}
          <Card className="p-5">
            <div className="text-sm font-medium text-ink mb-1">Reviews · last 14 days</div>
            <div className="text-ink-faint text-xs mb-4">{stats.total} reviews all time</div>
            <BarRow bars={stats.last14} accent="physics" />
          </Card>

          {/* Maturity */}
          <Card className="p-5">
            <div className="text-sm font-medium text-ink mb-3">Card maturity</div>
            <MaturityBar {...stats.maturity} total={cards.length} />
            <div className="flex gap-4 mt-3 text-xs">
              <LegendDot color="bg-line" label={`New ${stats.maturity.fresh}`} />
              <LegendDot color="bg-physics/60" label={`Learning ${stats.maturity.young}`} />
              <LegendDot color="bg-mark-good" label={`Mature ${stats.maturity.mature}`} />
            </div>
          </Card>

          {/* Due forecast */}
          <Card className="p-5">
            <div className="text-sm font-medium text-ink mb-1">Coming due</div>
            <div className="text-ink-faint text-xs mb-4">next 7 days</div>
            <BarRow bars={stats.forecast} accent="econ" />
          </Card>

          {/* Per subject */}
          <Card className="p-5">
            <div className="text-sm font-medium text-ink mb-3">By subject</div>
            <div className="space-y-2">
              {stats.bySubject.map((s) => (
                <div key={s.subject} className="flex items-center gap-3">
                  <Chip accent={SUBJECT_META[s.subject]?.accent}>{SUBJECT_META[s.subject]?.name ?? s.subject}</Chip>
                  <div className="flex-1 h-1.5 rounded-full bg-line/40 overflow-hidden">
                    <div className="h-full bg-physics rounded-full" style={{ width: `${s.pct}%` }} />
                  </div>
                  <span className="text-ink-soft text-sm tabular-nums w-24 text-right">{s.reviews} reviews</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "bad" }) {
  return (
    <Card className="p-4">
      <div className="text-ink-faint text-xs">{label}</div>
      <div className={cx("font-serif text-3xl mt-1", tone === "good" ? "text-mark-good" : tone === "bad" ? "text-mark-bad" : "text-ink")}>{value}</div>
      {sub && <div className="text-ink-faint text-xs mt-0.5">{sub}</div>}
    </Card>
  );
}

function BarRow({ bars, accent }: { bars: { label: string; value: number }[]; accent: string }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  const color = accent === "econ" ? "bg-econ" : "bg-physics";
  return (
    <div className="flex items-end gap-1.5 h-24">
      {bars.map((b, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
          <span className="text-[0.6rem] text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity">{b.value}</span>
          <div className={cx("w-full rounded-md transition-all", b.value ? color : "bg-line/30")} style={{ height: `${(b.value / max) * 100}%`, minHeight: b.value ? "4px" : "2px" }} />
          <span className="text-[0.58rem] text-ink-faint">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

function MaturityBar({ fresh, young, mature, total }: { fresh: number; young: number; mature: number; total: number }) {
  const t = Math.max(1, total);
  return (
    <div className="flex h-3 rounded-full overflow-hidden bg-line/30">
      <div className="bg-line" style={{ width: `${(fresh / t) * 100}%` }} />
      <div className="bg-physics/60" style={{ width: `${(young / t) * 100}%` }} />
      <div className="bg-mark-good" style={{ width: `${(mature / t) * 100}%` }} />
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-ink-soft">
      <span className={cx("w-2.5 h-2.5 rounded-full", color)} /> {label}
    </span>
  );
}

function compute(reviews: ReviewLog[], cards: Flashcard[]) {
  const now = Date.now();
  const todayKey = dayKey(now);
  const byDay = new Map<string, number>();
  const bySubjectMap = new Map<string, number>();
  let good = 0;
  for (const r of reviews) {
    byDay.set(dayKey(r.at), (byDay.get(dayKey(r.at)) ?? 0) + 1);
    bySubjectMap.set(r.subject, (bySubjectMap.get(r.subject) ?? 0) + 1);
    if (r.grade === "good" || r.grade === "easy") good += 1;
  }

  // last 14 days
  const last14 = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * DAY);
    last14.push({ label: i === 0 ? "today" : String(d.getDate()), value: byDay.get(dayKey(d.getTime())) ?? 0 });
  }

  // streak: consecutive days with >=1 review, ending today or yesterday
  let streak = 0;
  for (let i = 0; ; i++) {
    const k = dayKey(now - i * DAY);
    if (byDay.get(k)) streak += 1;
    else if (i === 0) continue; // today not done yet doesn't break a prior streak
    else break;
  }

  // maturity
  let fresh = 0, young = 0, mature = 0;
  for (const c of cards) {
    if (c.reps === 0) fresh += 1;
    else if (c.interval >= 21) mature += 1;
    else young += 1;
  }

  // due forecast next 7 days
  const forecast = [];
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(now + i * DAY); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = dayStart.getTime() + DAY;
    const count = cards.filter((c) => c.due < dayEnd && (i === 0 ? true : c.due >= dayStart.getTime())).length;
    forecast.push({ label: i === 0 ? "now" : `+${i}`, value: i === 0 ? cards.filter((c) => c.due <= now).length : cards.filter((c) => c.due >= dayStart.getTime() && c.due < dayEnd).length });
  }

  const totalReviews = reviews.length;
  const bySubject = [...bySubjectMap.entries()]
    .map(([subject, reviews]) => ({ subject, reviews, pct: Math.round((reviews / Math.max(1, totalReviews)) * 100) }))
    .sort((a, b) => b.reviews - a.reviews);

  return {
    total: totalReviews,
    today: byDay.get(todayKey) ?? 0,
    streak,
    retention: totalReviews ? Math.round((good / totalReviews) * 100) : 0,
    last14,
    maturity: { fresh, young, mature },
    forecast,
    bySubject,
  };
}

import { PhasePill } from "./ui";
import { flagFor } from "@/lib/teams";
import type { MatchState } from "@/lib/matchState";

function Score({ m }: { m: MatchState }) {
  const shown = m.inPlay || m.finished;
  return (
    <div className="flex items-center gap-2 font-display text-xl font-bold tabular-nums">
      <span className={m.inPlay ? "text-turf" : "text-chalk"}>{shown ? m.homeTally.goals : "–"}</span>
      <span className="text-muted">:</span>
      <span className={m.inPlay ? "text-turf" : "text-chalk"}>{shown ? m.awayTally.goals : "–"}</span>
    </div>
  );
}

function MatchCard({ m }: { m: MatchState }) {
  const accent = m.inPlay
    ? "linear-gradient(90deg,#3DFF7A,#22E3C3)"
    : m.finished
      ? "linear-gradient(90deg,#4C8DFF,#9B6BFF)"
      : "linear-gradient(90deg,#9B6BFF,#FF5DA2)";
  return (
    <div className={`card relative min-w-[240px] flex-1 overflow-hidden p-3 ${m.inPlay ? "turf-glow" : ""}`}>
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accent, opacity: m.inPlay ? 1 : 0.7 }} />
      <div className="mb-2 flex items-center justify-between">
        <PhasePill m={m} />
        {(m.homeTally.red > 0 || m.awayTally.red > 0) && (
          <span className="text-xs text-red-400">🟥 {m.homeTally.red + m.awayTally.red}</span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2 truncate"><span className="text-lg">{flagFor(m.home)}</span><span className="truncate text-sm">{m.home}</span></div>
          <div className="flex items-center gap-2 truncate"><span className="text-lg">{flagFor(m.away)}</span><span className="truncate text-sm">{m.away}</span></div>
        </div>
        <Score m={m} />
      </div>
    </div>
  );
}

export default function MatchTicker({ matches }: { matches: MatchState[] }) {
  const ordered = [...matches].sort((a, b) => {
    const rank = (m: MatchState) => (m.inPlay ? 0 : m.scheduled ? 1 : 2);
    return rank(a) - rank(b) || a.startTime - b.startTime;
  });
  return (
    <div className="flex snap-x gap-3 overflow-x-auto pb-1">
      {ordered.map((m) => (
        <div key={m.fixtureId} className="snap-start">
          <MatchCard m={m} />
        </div>
      ))}
      {ordered.length === 0 && <div className="text-sm text-muted">No fixtures in the feed right now.</div>}
    </div>
  );
}

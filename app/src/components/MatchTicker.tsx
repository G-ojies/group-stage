import { PhasePill } from "./ui";
import { flagFor } from "@/lib/teams";
import type { MatchState } from "@/lib/matchState";

// Winner of a finished match: 1 = home, -1 = away, 0 = draw/undecided.
function winner(m: MatchState): 1 | 0 | -1 {
  if (!m.finished) return 0;
  if (m.homeTally.goals > m.awayTally.goals) return 1;
  if (m.awayTally.goals > m.homeTally.goals) return -1;
  return 0;
}

function Score({ m }: { m: MatchState }) {
  const shown = m.inPlay || m.finished;
  const w = winner(m);
  // Live scores glow turf; finished scores emphasise the winner and dim the loser.
  const cls = (isThisSide: boolean, otherWon: boolean) =>
    m.inPlay ? "text-turf" : otherWon ? "text-muted/60" : isThisSide ? "text-turf" : "text-chalk";
  return (
    <div className="flex items-center gap-2 font-display text-xl font-bold tabular-nums">
      <span className={cls(w === 1, w === -1)}>{shown ? m.homeTally.goals : "–"}</span>
      <span className="text-muted">:</span>
      <span className={cls(w === -1, w === 1)}>{shown ? m.awayTally.goals : "–"}</span>
    </div>
  );
}

function TeamRow({ team, dimmed, won }: { team: string; dimmed: boolean; won: boolean }) {
  return (
    <div className={`flex items-center gap-2 truncate ${dimmed ? "text-muted/60" : ""}`}>
      <span className="text-lg">{flagFor(team)}</span>
      <span className={`truncate text-sm ${won ? "font-semibold text-chalk" : ""}`}>{team}</span>
      {won && <span aria-hidden="true" className="ml-auto text-xs text-turf">✓</span>}
    </div>
  );
}

function MatchCard({ m }: { m: MatchState }) {
  const w = winner(m);
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
          <TeamRow team={m.home} dimmed={w === -1} won={w === 1} />
          <TeamRow team={m.away} dimmed={w === 1} won={w === -1} />
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

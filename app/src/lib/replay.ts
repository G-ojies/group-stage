/**
 * Demo replay engine. Turns the real World Cup fixtures (from the TxLINE feed)
 * into an accelerated "matchday": a virtual clock runs 0→90', and each match's
 * score is the count of goals whose minute has passed. This drives the exact
 * same MatchState[] the live feed produces, so the leaderboard animates and
 * re-sorts on demand — perfect for the demo video when no match is live.
 *
 * Real final scores are used where the feed already has them; scheduled matches
 * get a deterministic (seeded-by-fixtureId) scoreline so the board always moves.
 * This is a presentation aid over real teams/fixtures — clearly labelled in the UI.
 */
import type { MatchState, TeamTally } from "./matchState";

export const REPLAY_TOTAL_MIN = 92;

export interface ReplayGoal {
  minute: number;
  side: "home" | "away";
}
export interface ReplayMatch {
  fixtureId: number;
  competitionId: number;
  home: string;
  away: string;
  homeId: number;
  awayId: number;
  startTime: number;
  goals: ReplayGoal[];
}

function rngFrom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Weighted goal count: mostly 0-2, occasionally 3-4. */
function drawGoals(rng: () => number): number {
  const r = rng();
  if (r < 0.28) return 0;
  if (r < 0.62) return 1;
  if (r < 0.84) return 2;
  if (r < 0.96) return 3;
  return 4;
}

function spreadMinutes(n: number, rng: () => number): number[] {
  const mins: number[] = [];
  for (let i = 0; i < n; i++) mins.push(4 + Math.floor(rng() * 86)); // 4'..89'
  return mins.sort((a, b) => a - b);
}

/** Build a replay script from the current real matches. Deterministic per fixture. */
export function buildReplayScript(matches: MatchState[]): ReplayMatch[] {
  return matches.map((m) => {
    const rng = rngFrom(m.fixtureId);
    const hasReal = m.finished || m.inPlay;
    const hg = hasReal ? m.homeTally.goals : drawGoals(rng);
    const ag = hasReal ? m.awayTally.goals : drawGoals(rng);
    const goals: ReplayGoal[] = [
      ...spreadMinutes(hg, rng).map((minute) => ({ minute, side: "home" as const })),
      ...spreadMinutes(ag, rng).map((minute) => ({ minute, side: "away" as const })),
    ].sort((a, b) => a.minute - b.minute);
    return {
      fixtureId: m.fixtureId,
      competitionId: m.competitionId,
      home: m.home,
      away: m.away,
      homeId: m.homeId,
      awayId: m.awayId,
      startTime: m.startTime,
      goals,
    };
  });
}

function phaseFor(vmin: number): { statusId: number; phase: string; inPlay: boolean; finished: boolean } {
  if (vmin < 1) return { statusId: 1, phase: "NS", inPlay: false, finished: false };
  if (vmin < 45) return { statusId: 2, phase: "1H", inPlay: true, finished: false };
  if (vmin < 47) return { statusId: 3, phase: "HT", inPlay: true, finished: false };
  if (vmin < 90) return { statusId: 4, phase: "2H", inPlay: true, finished: false };
  return { statusId: 5, phase: "FT", inPlay: false, finished: true };
}

const emptyTally = (): TeamTally => ({ goals: 0, yellow: 0, red: 0, corners: 0 });

/** Compute the MatchState[] for the replay at a given virtual minute. */
export function replayStateAt(script: ReplayMatch[], vmin: number): MatchState[] {
  const p = phaseFor(vmin);
  return script.map((rm) => {
    const home = emptyTally();
    const away = emptyTally();
    for (const g of rm.goals) {
      if (g.minute <= vmin) (g.side === "home" ? home : away).goals++;
    }
    return {
      fixtureId: rm.fixtureId,
      competitionId: rm.competitionId,
      home: rm.home,
      away: rm.away,
      homeId: rm.homeId,
      awayId: rm.awayId,
      homeTally: home,
      awayTally: away,
      statusId: p.statusId,
      phase: p.phase,
      minute: p.inPlay ? Math.min(Math.floor(vmin), 90) : p.finished ? 90 : null,
      startTime: rm.startTime,
      inPlay: p.inPlay,
      finished: p.finished,
      scheduled: p.statusId === 1,
    };
  });
}

/**
 * Normalizes raw TxLINE fixture + score-snapshot JSON into a compact MatchState
 * the UI and scoring engine consume. Shapes verified against the live devnet feed:
 *   Score = { Participant1: { Total: { Goals, YellowCards, RedCards, Corners }, ... }, Participant2: {...} }
 *   StatusId = game-phase id (2=H1, 3=HT, 4=H2, 5=ended, ...)  — see TxLINE soccer phase table.
 */
import type { FixtureRecord } from "./txlineTypes";

export interface TeamTally {
  goals: number;
  yellow: number;
  red: number;
  corners: number;
}

export interface MatchState {
  fixtureId: number;
  competitionId: number;
  home: string;
  away: string;
  homeId: number;
  awayId: number;
  homeTally: TeamTally;
  awayTally: TeamTally;
  statusId: number;
  phase: string; // human label: NS / 1H / HT / 2H / FT ...
  minute: number | null;
  startTime: number;
  inPlay: boolean;
  finished: boolean;
  scheduled: boolean;
}

const PHASE: Record<number, string> = {
  1: "NS", 2: "1H", 3: "HT", 4: "2H", 5: "FT", 6: "WET", 7: "ET1", 8: "ETHT",
  9: "ET2", 10: "AET", 11: "WPE", 12: "PENS", 13: "FT-P", 14: "INT", 15: "ABD",
  16: "CANC", 17: "N/A", 18: "SUSP", 19: "PP",
};
const FINISHED = new Set([5, 10, 13]);
const IN_PLAY = new Set([2, 3, 4, 6, 7, 8, 9, 11, 12]);

function tally(side: any): TeamTally {
  const t = side?.Total ?? {};
  return {
    goals: Number(t.Goals ?? 0),
    yellow: Number(t.YellowCards ?? 0),
    red: Number(t.RedCards ?? 0),
    corners: Number(t.Corners ?? 0),
  };
}

/** Build a MatchState from a fixture record and its raw score-snapshot array. */
export function toMatchState(fixture: FixtureRecord, snapshot: any[]): MatchState {
  const recs = Array.isArray(snapshot) ? snapshot : [];
  const withScore = [...recs].reverse().find((r) => r?.Score);
  const withStatus = [...recs].reverse().find((r) => typeof r?.StatusId === "number");
  const withClock = [...recs].reverse().find((r) => r?.Clock && typeof r.Clock.Seconds === "number");
  const finalised = recs.some((r) => r?.Action === "game_finalised");

  const score = withScore?.Score ?? {};
  const p1 = tally(score.Participant1);
  const p2 = tally(score.Participant2);

  let statusId = withStatus?.StatusId ?? 1;
  if (finalised && !FINISHED.has(statusId)) statusId = 5;

  const p1Home = fixture.Participant1IsHome;
  const homeTally = p1Home ? p1 : p2;
  const awayTally = p1Home ? p2 : p1;

  const seconds = withClock?.Clock?.Seconds;
  const minute = typeof seconds === "number" ? Math.floor(seconds / 60) : null;

  return {
    fixtureId: fixture.FixtureId,
    competitionId: fixture.CompetitionId,
    home: p1Home ? fixture.Participant1 : fixture.Participant2,
    away: p1Home ? fixture.Participant2 : fixture.Participant1,
    homeId: p1Home ? fixture.Participant1Id : fixture.Participant2Id,
    awayId: p1Home ? fixture.Participant2Id : fixture.Participant1Id,
    homeTally,
    awayTally,
    statusId,
    phase: PHASE[statusId] ?? "NS",
    minute,
    startTime: fixture.StartTime,
    inPlay: IN_PLAY.has(statusId),
    finished: FINISHED.has(statusId),
    scheduled: statusId === 1,
  };
}

/** Distinct team names appearing across a set of fixtures (the draftable pool). */
export function teamPoolFromFixtures(fixtures: FixtureRecord[]): string[] {
  const s = new Set<string>();
  for (const f of fixtures) {
    if (f.Participant1) s.add(f.Participant1);
    if (f.Participant2) s.add(f.Participant2);
  }
  return [...s].sort();
}

export const WORLD_CUP_COMPETITION_ID = 72;

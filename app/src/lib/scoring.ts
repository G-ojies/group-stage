/** Sweepstake scoring: turn live MatchStates into per-team and per-member standings. */
import type { MatchState } from "./matchState";

export interface ScoreConfig {
  perGoal: number;
  perWin: number;
  perDraw: number;
  perCleanSheet: number;
}

export const DEFAULT_SCORING: ScoreConfig = {
  perGoal: 2,
  perWin: 5,
  perDraw: 2,
  perCleanSheet: 3,
};

export interface TeamStats {
  team: string;
  goalsFor: number;
  goalsAgainst: number;
  win: boolean;
  draw: boolean;
  loss: boolean;
  cleanSheet: boolean;
  played: boolean;
  live: boolean;
  points: number;
  fixtureId?: number;
  opponent?: string;
}

export interface MemberStanding {
  id: string;
  name: string;
  wallet?: string;
  teams: string[];
  points: number;
  teamStats: TeamStats[];
  rank: number;
}

/** Compute one team's stats from the match it appears in (if any). */
export function statsForTeam(team: string, matches: MatchState[], cfg: ScoreConfig): TeamStats {
  const base: TeamStats = {
    team, goalsFor: 0, goalsAgainst: 0, win: false, draw: false, loss: false,
    cleanSheet: false, played: false, live: false, points: 0,
  };
  const m = matches.find((x) => x.home === team || x.away === team);
  if (!m) return base;

  const isHome = m.home === team;
  const gf = isHome ? m.homeTally.goals : m.awayTally.goals;
  const ga = isHome ? m.awayTally.goals : m.homeTally.goals;
  base.goalsFor = gf;
  base.goalsAgainst = ga;
  base.live = m.inPlay;
  base.played = m.inPlay || m.finished;
  base.fixtureId = m.fixtureId;
  base.opponent = isHome ? m.away : m.home;

  // Goals accrue live; result + clean-sheet bonuses lock in at full time.
  base.points += gf * cfg.perGoal;
  if (m.finished) {
    if (gf > ga) { base.win = true; base.points += cfg.perWin; }
    else if (gf === ga) { base.draw = true; base.points += cfg.perDraw; }
    else { base.loss = true; }
    if (ga === 0) { base.cleanSheet = true; base.points += cfg.perCleanSheet; }
  }
  return base;
}

export function computeStandings(
  members: { id: string; name: string; wallet?: string; teams: string[] }[],
  matches: MatchState[],
  cfg: ScoreConfig
): MemberStanding[] {
  const rows = members.map((mem) => {
    const teamStats = mem.teams.map((t) => statsForTeam(t, matches, cfg));
    const points = teamStats.reduce((s, ts) => s + ts.points, 0);
    return { ...mem, points, teamStats, rank: 0 };
  });
  rows.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  let rank = 0, prev = Number.NaN;
  rows.forEach((r, i) => {
    if (r.points !== prev) { rank = i + 1; prev = r.points; }
    r.rank = rank;
  });
  return rows;
}

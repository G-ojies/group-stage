import type { NextApiRequest, NextApiResponse } from "next";
import { txlineGet } from "@/lib/txlineServer";
import { toMatchState, WORLD_CUP_COMPETITION_ID } from "@/lib/matchState";
import type { FixtureRecord } from "@/lib/txlineTypes";

/**
 * GET /api/live/matches?competitionId=72
 * Returns normalized MatchState[] for a competition: fixtures joined with their
 * latest score snapshot. This is the single live-data endpoint the room polls.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const competitionId = Number(req.query.competitionId) || WORLD_CUP_COMPETITION_ID;
  try {
    const fixtures = (await txlineGet<FixtureRecord[]>(
      `/api/fixtures/snapshot?competitionId=${competitionId}`
    )).filter((f) => f.CompetitionId === competitionId);

    const states = await Promise.all(
      fixtures.map(async (f) => {
        try {
          const snap = await txlineGet<any[]>(`/api/scores/snapshot/${f.FixtureId}?asOf=${Date.now()}`);
          return toMatchState(f, snap);
        } catch {
          return toMatchState(f, []);
        }
      })
    );
    states.sort((a, b) => a.startTime - b.startTime);
    res.setHeader("Cache-Control", "s-maxage=4, stale-while-revalidate=8");
    res.status(200).json({ competitionId, matches: states, ts: Date.now() });
  } catch (e: any) {
    res.status(502).json({ error: e?.message || "live matches failed" });
  }
}

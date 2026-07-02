import type { NextApiRequest, NextApiResponse } from "next";
import { txlineGet } from "@/lib/txlineServer";
import { teamPoolFromFixtures, WORLD_CUP_COMPETITION_ID } from "@/lib/matchState";
import type { FixtureRecord } from "@/lib/txlineTypes";

/** GET /api/live/pool?competitionId=72 — the draftable team pool for a competition. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const competitionId = Number(req.query.competitionId) || WORLD_CUP_COMPETITION_ID;
  try {
    const fixtures = (await txlineGet<FixtureRecord[]>(
      `/api/fixtures/snapshot?competitionId=${competitionId}`
    )).filter((f) => f.CompetitionId === competitionId);
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
    res.status(200).json({
      competitionId,
      competition: fixtures[0]?.Competition ?? "World Cup",
      teams: teamPoolFromFixtures(fixtures),
      fixtureCount: fixtures.length,
    });
  } catch (e: any) {
    res.status(502).json({ error: e?.message || "pool failed" });
  }
}

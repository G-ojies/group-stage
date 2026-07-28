import type { NextApiRequest, NextApiResponse } from "next";
import { teamPoolFromFixtures, WORLD_CUP_COMPETITION_ID } from "@/lib/matchState";
import { cacheFor, resolveFixtures } from "@/lib/fixtures";

/** GET /api/live/pool?competitionId=72 — the draftable team pool for a competition. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const competitionId = Number(req.query.competitionId) || WORLD_CUP_COMPETITION_ID;
  try {
    const { fixtures, source } = await resolveFixtures(competitionId);
    res.setHeader("Cache-Control", cacheFor(source, 30));
    res.status(200).json({
      competitionId,
      competition: fixtures[0]?.Competition ?? "World Cup",
      teams: teamPoolFromFixtures(fixtures),
      fixtureCount: fixtures.length,
      source,
    });
  } catch (e: any) {
    res.status(502).json({ error: e?.message || "pool failed" });
  }
}

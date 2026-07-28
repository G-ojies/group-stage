import type { NextApiRequest, NextApiResponse } from "next";
import { teamPoolFromFixtures, WORLD_CUP_COMPETITION_ID } from "@/lib/matchState";
import { resolveFixtures } from "@/lib/fixtures";
import { createRoom } from "@/lib/store";

/** POST /api/rooms — create a room. Body: { name, hostWallet, hostName, competitionId? } */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { name, hostWallet, hostName, competitionId } = req.body || {};
  if (!hostWallet) return res.status(400).json({ error: "hostWallet required" });

  const comp = Number(competitionId) || WORLD_CUP_COMPETITION_ID;
  try {
    const { fixtures } = await resolveFixtures(comp);
    const teamPool = teamPoolFromFixtures(fixtures);
    if (teamPool.length < 2) return res.status(400).json({ error: "no teams available for this competition" });

    const room = await createRoom({ name, hostWallet, hostName, competitionId: comp, teamPool });
    res.status(201).json(room);
  } catch (e: any) {
    res.status(502).json({ error: e?.message || "create failed" });
  }
}

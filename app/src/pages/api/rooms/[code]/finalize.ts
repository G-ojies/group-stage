import type { NextApiRequest, NextApiResponse } from "next";
import { getRoom, saveRoom, type FinalStanding } from "@/lib/store";

/**
 * POST /api/rooms/{code}/finalize — lock final standings (host only).
 * Body: { hostWallet, standings?: FinalStanding[], finalTx? }
 * The client-computed standings snapshot is stored so the Champion Badge
 * metadata can be served without re-deriving from the live feed.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const code = String(req.query.code || "");
  const { hostWallet, standings, finalTx } = req.body || {};
  const room = await getRoom(code);
  if (!room) return res.status(404).json({ error: "room not found" });
  if (room.hostWallet !== hostWallet) return res.status(403).json({ error: "only the host can finalize" });

  room.status = "final";
  room.finalizedAt = Date.now();
  if (Array.isArray(standings)) {
    room.finalStandings = (standings as FinalStanding[])
      .map((s) => ({ rank: s.rank, name: s.name, wallet: s.wallet, points: s.points, teams: s.teams }))
      .slice(0, 32);
  }
  if (finalTx) room.finalTx = finalTx;
  await saveRoom(room);
  res.status(200).json(room);
}

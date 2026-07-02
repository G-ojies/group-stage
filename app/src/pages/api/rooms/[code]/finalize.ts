import type { NextApiRequest, NextApiResponse } from "next";
import { getRoom, saveRoom } from "@/lib/store";
import type { MemberStanding } from "@/lib/scoring";

/**
 * POST /api/rooms/{code}/finalize — lock final standings (host only).
 * Body: { hostWallet, standings?: MemberStanding[], finalTx? }
 * The client-computed standings snapshot is frozen so the finalized board and the
 * Champion Badge metadata stay stable regardless of the live feed / replay state.
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
    room.finalStandings = (standings as MemberStanding[]).slice(0, 32);
  }
  if (finalTx) room.finalTx = finalTx;
  await saveRoom(room);
  res.status(200).json(room);
}

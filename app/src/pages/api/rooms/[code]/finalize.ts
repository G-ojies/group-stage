import type { NextApiRequest, NextApiResponse } from "next";
import { getRoom, saveRoom } from "@/lib/store";

/** POST /api/rooms/{code}/finalize — lock final standings. Body: { hostWallet, finalTx? } */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const code = String(req.query.code || "");
  const { hostWallet, finalTx } = req.body || {};
  const room = await getRoom(code);
  if (!room) return res.status(404).json({ error: "room not found" });
  if (room.hostWallet !== hostWallet) return res.status(403).json({ error: "only the host can finalize" });
  room.status = "final";
  if (finalTx) room.finalTx = finalTx;
  await saveRoom(room);
  res.status(200).json(room);
}

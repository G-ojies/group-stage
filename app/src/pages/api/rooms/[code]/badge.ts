import type { NextApiRequest, NextApiResponse } from "next";
import { getRoom, saveRoom } from "@/lib/store";

/** POST /api/rooms/{code}/badge — record the champion badge mint address. Body: { mint } */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const code = String(req.query.code || "");
  const { mint } = req.body || {};
  const room = await getRoom(code);
  if (!room) return res.status(404).json({ error: "room not found" });
  if (typeof mint !== "string" || mint.length < 32) return res.status(400).json({ error: "invalid mint" });
  room.championBadgeMint = mint;
  await saveRoom(room);
  res.status(200).json({ ok: true, mint });
}

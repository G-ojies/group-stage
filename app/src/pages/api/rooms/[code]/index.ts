import type { NextApiRequest, NextApiResponse } from "next";
import { getRoom } from "@/lib/store";

/** GET /api/rooms/{code} — room state. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = String(req.query.code || "");
  const room = await getRoom(code);
  if (!room) return res.status(404).json({ error: "room not found" });
  res.status(200).json(room);
}

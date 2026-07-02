import type { NextApiRequest, NextApiResponse } from "next";
import { addMember, getRoom } from "@/lib/store";

/** POST /api/rooms/{code}/join — body: { id, name, wallet? }. Adds a member while in lobby. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const code = String(req.query.code || "");
  const { id, name, wallet } = req.body || {};
  if (!(await getRoom(code))) return res.status(404).json({ error: "room not found" });
  if (!id) return res.status(400).json({ error: "id required" });
  const room = await addMember(code, { id, name, wallet });
  res.status(200).json(room);
}

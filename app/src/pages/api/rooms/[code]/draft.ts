import type { NextApiRequest, NextApiResponse } from "next";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { getRoom, saveRoom } from "@/lib/store";
import { snakeDraft } from "@/lib/draft";

/**
 * POST /api/rooms/{code}/draft — host runs the provably-fair draft.
 * Seed = a live Solana devnet blockhash (public + unpredictable): nobody can
 * grind the outcome, and anyone can re-run snakeDraft(members, pool, seed) to
 * verify who was assigned which team.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const code = String(req.query.code || "");
  const { hostWallet } = req.body || {};
  const room = await getRoom(code);
  if (!room) return res.status(404).json({ error: "room not found" });
  if (room.hostWallet !== hostWallet) return res.status(403).json({ error: "only the host can draft" });
  if (room.status !== "lobby") return res.status(409).json({ error: "draft already run" });
  if (room.members.length < 1) return res.status(400).json({ error: "need at least one member" });

  let seed: string;
  let slot: number | undefined;
  try {
    const conn = new Connection(clusterApiUrl("devnet"), "confirmed");
    const { blockhash } = await conn.getLatestBlockhash();
    slot = await conn.getSlot();
    seed = blockhash;
  } catch {
    // Fallback keeps the draft deterministic + verifiable even if RPC is down.
    seed = `${room.code}:${room.createdAt}:${room.members.map((m) => m.id).join(",")}`;
  }

  const memberIds = room.members.map((m) => m.id);
  const assignment = snakeDraft(memberIds, room.teamPool, `${code}:${seed}`);
  room.members = room.members.map((m) => ({ ...m, teams: assignment[m.id] ?? [] }));
  room.draftSeed = seed;
  room.status = "live";
  await saveRoom(room);
  res.status(200).json({ room, seed, slot });
}

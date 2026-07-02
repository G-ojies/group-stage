import type { NextApiRequest, NextApiResponse } from "next";
import { getRoom, saveRoom } from "@/lib/store";
import { snakeDraft } from "@/lib/draft";

const DEVNET_RPC = "https://api.devnet.solana.com";

/**
 * Fetch a live devnet blockhash via a raw JSON-RPC call with a hard timeout.
 * Using plain fetch (not @solana/web3.js) keeps the serverless path clean — no
 * internal retry machinery that can leave an unhandled rejection and crash the
 * function. Returns null on any failure/timeout so the caller falls back.
 */
async function fetchBlockhashSeed(timeoutMs = 2500): Promise<{ seed: string; slot?: number } | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(DEVNET_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getLatestBlockhash",
        params: [{ commitment: "confirmed" }],
      }),
      signal: ctrl.signal,
    });
    const j = await r.json();
    const blockhash: string | undefined = j?.result?.value?.blockhash;
    const slot: number | undefined = j?.result?.context?.slot;
    return blockhash ? { seed: blockhash, slot } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * POST /api/rooms/{code}/draft — host runs the provably-fair draft.
 * Seed = a live Solana devnet blockhash (public + unpredictable): nobody can
 * grind the outcome, and anyone can re-run snakeDraft(members, pool, seed) to
 * verify who was assigned which team. If the RPC is slow/unreachable, we fall
 * back to a deterministic seed so the draft is still verifiable.
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

  const bh = await fetchBlockhashSeed();
  const seed = bh?.seed ?? `${room.code}:${room.createdAt}:${room.members.map((m) => m.id).join(",")}`;
  const slot = bh?.slot;

  const memberIds = room.members.map((m) => m.id);
  const assignment = snakeDraft(memberIds, room.teamPool, `${code}:${seed}`);
  room.members = room.members.map((m) => ({ ...m, teams: assignment[m.id] ?? [] }));
  room.draftSeed = seed;
  room.status = "live";
  await saveRoom(room);
  res.status(200).json({ room, seed, slot, seedSource: bh ? "devnet-blockhash" : "deterministic-fallback" });
}

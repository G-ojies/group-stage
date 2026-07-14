import type { NextApiRequest, NextApiResponse } from "next";
import { getMomentum, saveMomentum, type Momentum, type MomentumPick } from "@/lib/store";

/**
 * GET  /api/momentum/{wallet} — read a player's persisted pick'em streak.
 * POST /api/momentum/{wallet} — body: { picks, streak, best }. Upserts it.
 *
 * The streak is a personal, cross-room stat, so it is keyed only by wallet.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const wallet = String(req.query.wallet || "");
  if (!wallet) return res.status(400).json({ error: "wallet required" });

  if (req.method === "GET") {
    return res.status(200).json(await getMomentum(wallet));
  }

  if (req.method === "POST") {
    const body = (req.body || {}) as Partial<Momentum>;
    const picks: Record<number, MomentumPick> = {};
    for (const [k, v] of Object.entries(body.picks ?? {})) {
      const o = (v as MomentumPick)?.outcome;
      if (o !== "home" && o !== "draw" && o !== "away") continue;
      picks[Number(k)] = {
        outcome: o,
        ts: Number((v as MomentumPick).ts) || Date.now(),
        resolved: !!(v as MomentumPick).resolved,
        correct: !!(v as MomentumPick).correct,
      };
    }
    const saved = await saveMomentum(wallet, {
      picks,
      streak: Number(body.streak) || 0,
      best: Number(body.best) || 0,
      updatedAt: Date.now(),
    });
    return res.status(200).json(saved);
  }

  return res.status(405).json({ error: "GET or POST only" });
}

import type { NextApiRequest, NextApiResponse } from "next";
import { usingPersistentStore } from "@/lib/store";

/** GET /api/health — quick deploy sanity check: store backend + TxLINE creds present. */
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const txlineConfigured =
    (!!process.env.TXLINE_JWT && !!process.env.TXLINE_API_TOKEN && !!process.env.TXLINE_API_ORIGIN) ||
    undefined; // undefined when relying on the local credentials.json fallback
  res.status(200).json({
    ok: true,
    store: usingPersistentStore() ? "redis" : "in-memory",
    txlineEnv: txlineConfigured ?? "fallback-file",
    ts: Date.now(),
  });
}

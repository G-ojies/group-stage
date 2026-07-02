import type { NextApiRequest, NextApiResponse } from "next";
import { getRoom } from "@/lib/store";

function originOf(req: NextApiRequest): string {
  const host = req.headers.host || "localhost:3000";
  const proto = (req.headers["x-forwarded-proto"] as string) || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * GET /api/badge/{code} — Metaplex-standard NFT metadata for the Champion Badge.
 * Fully self-hosted (image points back at our /image route), so minting needs no
 * Arweave/IPFS upload.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = String(req.query.code || "");
  const room = await getRoom(code);
  if (!room) return res.status(404).json({ error: "room not found" });

  const champ = room.finalStandings?.[0];
  const championName = champ?.name ?? "Champion";
  const points = champ?.points ?? 0;
  const teams = champ?.teams ?? [];
  const origin = originOf(req);
  const image = `${origin}/api/badge/${room.code}/image`;
  const dateStr = new Date(room.finalizedAt ?? room.createdAt).toISOString().slice(0, 10);

  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
  res.status(200).json({
    name: `GroupStage Champion — ${room.name}`,
    symbol: "GSCHAMP",
    description: `${championName} won "${room.name}" on GroupStage — the live, provably-fair, on-chain World Cup sweepstake powered by TxLINE. Final score: ${points} points.`,
    image,
    external_url: `${origin}/rooms/${room.code}`,
    attributes: [
      { trait_type: "Room", value: room.name },
      { trait_type: "Room Code", value: room.code },
      { trait_type: "Champion", value: championName },
      { trait_type: "Points", value: points },
      { trait_type: "Teams", value: teams.join(", ") || "—" },
      { trait_type: "Competition", value: "World Cup" },
      { trait_type: "Date", value: dateStr },
    ],
    properties: {
      category: "image",
      files: [{ uri: image, type: "image/svg+xml" }],
    },
  });
}

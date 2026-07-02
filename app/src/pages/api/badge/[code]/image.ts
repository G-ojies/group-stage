import type { NextApiRequest, NextApiResponse } from "next";
import { getRoom } from "@/lib/store";
import { flagFor } from "@/lib/teams";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** GET /api/badge/{code}/image — dynamic SVG artwork for the Champion Badge NFT. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = String(req.query.code || "");
  const room = await getRoom(code);

  const champ = room?.finalStandings?.[0];
  const championName = esc((champ?.name ?? "Champion").slice(0, 22));
  const roomName = esc((room?.name ?? "World Cup Room").slice(0, 28));
  const points = champ?.points ?? 0;
  const teams = (champ?.teams ?? []).slice(0, 8);
  const flags = teams.map((t) => flagFor(t)).join(" ");
  const dateStr = room ? new Date(room.finalizedAt ?? room.createdAt).toISOString().slice(0, 10) : "";

  // Solid fills only — gradients render inconsistently across NFT viewers.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#0A0F16"/>
  <circle cx="300" cy="205" r="180" fill="#FFCB47" fill-opacity="0.08"/>
  <rect x="18" y="18" width="564" height="564" rx="26" fill="#0E141D" stroke="#FFCB47" stroke-opacity="0.45" stroke-width="2"/>
  <text x="300" y="74" text-anchor="middle" fill="#3DFF7A" font-family="Verdana,Geneva,sans-serif" font-size="20" font-weight="700" letter-spacing="5">GROUPSTAGE</text>
  <text x="300" y="100" text-anchor="middle" fill="#8A99A8" font-family="Verdana,Geneva,sans-serif" font-size="12" letter-spacing="3">WORLD CUP · CHAMPION BADGE</text>
  <text x="300" y="252" text-anchor="middle" font-size="150" font-family="Verdana,sans-serif">🏆</text>
  <text x="300" y="332" text-anchor="middle" fill="#FFCB47" font-family="Verdana,Geneva,sans-serif" font-size="42" font-weight="700">${championName}</text>
  <text x="300" y="368" text-anchor="middle" fill="#EAF1F5" font-family="Verdana,Geneva,sans-serif" font-size="18">winner of “${roomName}”</text>
  <line x1="220" y1="400" x2="380" y2="400" stroke="#FFCB47" stroke-opacity="0.25" stroke-width="1"/>
  <text x="300" y="470" text-anchor="middle" fill="#FFCB47" font-family="Verdana,Geneva,sans-serif" font-size="76" font-weight="700">${points}</text>
  <text x="300" y="498" text-anchor="middle" fill="#8A99A8" font-family="Verdana,Geneva,sans-serif" font-size="13" letter-spacing="4">POINTS</text>
  <text x="300" y="542" text-anchor="middle" font-size="26" font-family="Verdana,sans-serif">${esc(flags)}</text>
  <text x="300" y="572" text-anchor="middle" fill="#8A99A8" font-family="Verdana,Geneva,sans-serif" font-size="12">${esc(room?.code ?? "")} · ${dateStr} · powered by TxLINE</text>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
  res.status(200).send(svg);
}

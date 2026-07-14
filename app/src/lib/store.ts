/**
 * Room store with two backends behind one async interface:
 *   • Upstash Redis / Vercel KV  — used when REST creds are in the env (production,
 *     multi-instance serverless: a judge's shared link works across cold starts).
 *   • In-memory Map on globalThis — automatic fallback for local dev with no KV.
 *
 * All functions are async so call sites are identical regardless of backend.
 */
import { Redis } from "@upstash/redis";
import { DEFAULT_SCORING, type ScoreConfig, type MemberStanding } from "./scoring";
import { makeRoomCode } from "./format";

export type RoomStatus = "lobby" | "live" | "final";

export interface Member {
  id: string;
  name: string;
  wallet?: string;
  teams: string[];
  isHost: boolean;
}

export interface Room {
  code: string;
  name: string;
  hostWallet: string;
  status: RoomStatus;
  createdAt: number;
  competitionId: number;
  teamPool: string[];
  members: Member[];
  scoring: ScoreConfig;
  draftSeed?: string;
  draftTx?: string;
  finalTx?: string;
  finalizedAt?: number;
  finalStandings?: MemberStanding[];
  championBadgeMint?: string;
}

const TTL_SECONDS = 60 * 60 * 24 * 30; // rooms live 30 days
const key = (code: string) => `gs:room:${code.toUpperCase()}`;

// --- backend selection -------------------------------------------------------

let redis: Redis | null | undefined;
function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

const g = globalThis as unknown as { __groupStageMem?: Map<string, Room> };
const mem: Map<string, Room> = g.__groupStageMem ?? new Map();
g.__groupStageMem = mem;

async function readRoom(code: string): Promise<Room | null> {
  const r = getRedis();
  if (r) return (await r.get<Room>(key(code))) ?? null;
  return mem.get(code.toUpperCase()) ?? null;
}

async function writeRoom(room: Room): Promise<void> {
  const r = getRedis();
  if (r) await r.set(key(room.code), room, { ex: TTL_SECONDS });
  else mem.set(room.code.toUpperCase(), room);
}

/** True when a persistent backend is configured (surfaced in health checks). */
export function usingPersistentStore(): boolean {
  return getRedis() !== null;
}

// --- public API --------------------------------------------------------------

export async function createRoom(input: {
  name: string;
  hostWallet: string;
  hostName: string;
  competitionId: number;
  teamPool: string[];
  scoring?: ScoreConfig;
}): Promise<Room> {
  let code = makeRoomCode();
  // Extremely unlikely collision, but guard anyway.
  for (let i = 0; i < 5 && (await readRoom(code)); i++) code = makeRoomCode();

  const room: Room = {
    code,
    name: input.name.trim() || "World Cup Room",
    hostWallet: input.hostWallet,
    status: "lobby",
    createdAt: Date.now(),
    competitionId: input.competitionId,
    teamPool: input.teamPool,
    scoring: input.scoring ?? DEFAULT_SCORING,
    members: [
      { id: input.hostWallet, name: input.hostName || "Host", wallet: input.hostWallet, teams: [], isHost: true },
    ],
  };
  await writeRoom(room);
  return room;
}

export async function getRoom(code: string): Promise<Room | null> {
  return readRoom(code);
}

export async function saveRoom(room: Room): Promise<Room> {
  await writeRoom(room);
  return room;
}

export async function addMember(
  code: string,
  m: { id: string; name: string; wallet?: string }
): Promise<Room | null> {
  const room = await readRoom(code);
  if (!room || room.status !== "lobby") return room;
  if (room.members.some((x) => x.id === m.id)) return room;
  room.members.push({ id: m.id, name: m.name.trim() || "Player", wallet: m.wallet, teams: [], isHost: false });
  await writeRoom(room);
  return room;
}

// --- Momentum (pick'em streak) ----------------------------------------------
//
// The Momentum streak is a personal, cross-room engagement stat keyed by wallet.
// Persisting it server-side (Redis) means a player's streak follows them across
// devices and cold starts instead of living only in one browser's localStorage.

export interface MomentumPick {
  outcome: "home" | "draw" | "away";
  ts: number;
  resolved?: boolean;
  correct?: boolean;
}

export interface Momentum {
  picks: Record<number, MomentumPick>;
  streak: number;
  best: number;
  updatedAt: number;
}

const momentumKey = (wallet: string) => `gs:momentum:${wallet}`;

const gm = globalThis as unknown as { __groupStageMomentum?: Map<string, Momentum> };
const momMem: Map<string, Momentum> = gm.__groupStageMomentum ?? new Map();
gm.__groupStageMomentum = momMem;

function emptyMomentum(): Momentum {
  return { picks: {}, streak: 0, best: 0, updatedAt: 0 };
}

export async function getMomentum(wallet: string): Promise<Momentum> {
  const r = getRedis();
  if (r) return (await r.get<Momentum>(momentumKey(wallet))) ?? emptyMomentum();
  return momMem.get(wallet) ?? emptyMomentum();
}

export async function saveMomentum(wallet: string, m: Momentum): Promise<Momentum> {
  const clean: Momentum = {
    picks: m.picks ?? {},
    streak: Math.max(0, m.streak | 0),
    best: Math.max(0, m.best | 0),
    updatedAt: Date.now(),
  };
  const r = getRedis();
  if (r) await r.set(momentumKey(wallet), clean, { ex: TTL_SECONDS });
  else momMem.set(wallet, clean);
  return clean;
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Award, Trophy } from "lucide-react";
import { useRouter } from "next/router";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { TopBar, WalletButton, TeamBadge } from "@/components/ui";
import Leaderboard from "@/components/Leaderboard";
import MatchTicker from "@/components/MatchTicker";
import PickEm from "@/components/PickEm";
import { useLiveMatches, useRoom } from "@/lib/hooks";
import { computeStandings } from "@/lib/scoring";
import { buildReplayScript, replayStateAt, REPLAY_TOTAL_MIN, type ReplayMatch } from "@/lib/replay";
import { shortAddr } from "@/lib/format";
import { sendMemo, explorerTx } from "@/lib/attest";

export default function RoomPage() {
  const router = useRouter();
  const code = typeof router.query.code === "string" ? router.query.code.toUpperCase() : undefined;
  const { room, error, loading, reload } = useRoom(code);
  const { matches } = useLiveMatches(room?.competitionId ?? 72);
  const wallet = useWallet();
  const { publicKey, signTransaction } = wallet;
  const { connection } = useConnection();

  const me = publicKey?.toBase58();
  const isHost = !!room && me === room.hostWallet;
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [copied, setCopied] = useState(false);

  // Demo replay: accelerate a full matchday over the real fixtures so the board
  // animates on demand (for the demo video when nothing is live).
  const [replayOn, setReplayOn] = useState(false);
  const [vmin, setVmin] = useState(0);
  const scriptRef = useRef<ReplayMatch[]>([]);
  const startReplay = () => {
    scriptRef.current = buildReplayScript(matches);
    setVmin(0);
    setReplayOn(true);
  };
  useEffect(() => {
    if (!replayOn || vmin >= REPLAY_TOTAL_MIN) return;
    const h = setTimeout(() => setVmin((v) => Math.min(v + 0.9, REPLAY_TOTAL_MIN)), 360);
    return () => clearTimeout(h);
  }, [replayOn, vmin]);

  const boardMatches = replayOn ? replayStateAt(scriptRef.current, vmin) : matches;
  const liveStandings = useMemo(
    () => (room ? computeStandings(room.members, boardMatches, room.scoring) : []),
    [room, boardMatches]
  );
  // A finalized room shows the frozen standings snapshot; otherwise it's live.
  const standings =
    room?.status === "final" && room.finalStandings?.length ? room.finalStandings : liveStandings;
  const champion = room?.status === "final" ? standings[0] : undefined;

  async function post(path: string, body: any) {
    setErr(null);
    const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "failed");
    return d;
  }

  async function addPlayer() {
    if (!code || !playerName.trim()) return;
    setBusy("add");
    try {
      await post(`/api/rooms/${code}/join`, { id: `p:${playerName.trim()}:${Date.now()}`, name: playerName.trim() });
      setPlayerName(""); await reload();
    } catch (e: any) { setErr(e.message); } finally { setBusy(null); }
  }

  async function joinSelf() {
    if (!code || !me) return;
    setBusy("join");
    try { await post(`/api/rooms/${code}/join`, { id: me, name: playerName.trim() || shortAddr(me), wallet: me }); await reload(); }
    catch (e: any) { setErr(e.message); } finally { setBusy(null); }
  }

  async function runDraft() {
    if (!code || !me) return;
    setBusy("draft");
    try { await post(`/api/rooms/${code}/draft`, { hostWallet: me }); await reload(); }
    catch (e: any) { setErr(e.message); } finally { setBusy(null); }
  }

  async function finalize() {
    if (!code || !me) return;
    setBusy("final");
    try {
      await post(`/api/rooms/${code}/finalize`, { hostWallet: me, standings });
      await reload();
    } catch (e: any) { setErr(e.message); } finally { setBusy(null); }
  }

  async function mintBadge() {
    if (!code || !me || !room || !wallet.publicKey) return;
    setBusy("badge"); setErr(null);
    try {
      const { mintChampionBadge } = await import("@/lib/badge");
      const { mint } = await mintChampionBadge({
        endpoint: connection.rpcEndpoint,
        wallet,
        roomCode: room.code,
        origin: window.location.origin,
      });
      await post(`/api/rooms/${code}/badge`, { mint });
      await reload();
    } catch (e: any) { setErr(e?.message || "mint failed"); } finally { setBusy(null); }
  }

  async function anchor() {
    if (!code || !me || !room || !publicKey || !signTransaction) return;
    setBusy("anchor");
    try {
      const memo = `GroupStage ${room.code} FINAL: champion ${champion?.name} (${champion?.points}pts). ` +
        standings.map((s) => `${s.rank}.${s.name}:${s.points}`).join(" ");
      const sig = await sendMemo(connection, publicKey, signTransaction, memo);
      await post(`/api/rooms/${code}/finalize`, { hostWallet: me, finalTx: sig });
      await reload();
    } catch (e: any) { setErr(e.message); } finally { setBusy(null); }
  }

  function copyCode() {
    if (!code) return;
    navigator.clipboard?.writeText(`${window.location.origin}/rooms/${code}`);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  if (loading) return <Shell><p className="text-muted">Loading room…</p></Shell>;
  if (error || !room) return (
    <Shell>
      <div className="card p-8 text-center">
        <p className="text-lg text-chalk">Room not found</p>
        <p className="mt-1 text-sm text-muted">Check the code and try again.</p>
        <button className="btn btn-ghost mt-4" onClick={() => router.push("/")}>Back home</button>
      </div>
    </Shell>
  );

  const inLobby = room.status === "lobby";
  const alreadyMember = room.members.some((m) => m.id === me);

  return (
    <Shell>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-chalk">{room.name}</h1>
            <StatusPill status={room.status} />
          </div>
          <button onClick={copyCode} className="mt-2 inline-flex items-center gap-2 text-sm text-muted hover:text-chalk">
            <span className="chip px-2 py-0.5 font-mono text-turf">{room.code}</span>
            {copied ? "link copied ✓" : "click to copy invite link"}
          </button>
        </div>
        <div className="text-right text-sm text-muted">
          <div>{room.members.length} players · {room.teamPool.length} teams</div>
          <div>{matches.filter((m) => m.inPlay).length} live now</div>
        </div>
      </div>

      {champion && (
        <div className="card gold-glow mb-6 p-5">
          <div className="flex items-center gap-4">
            <Trophy className="h-9 w-9 shrink-0 text-gold" strokeWidth={1.5} aria-hidden />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-widest text-gold">Champion</div>
              <div className="font-display text-2xl font-bold text-chalk">{champion.name}</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {champion.teams.map((t) => <TeamBadge key={t} team={t} className="chip px-2 py-0.5 text-xs" />)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl font-bold text-gold">{champion.points}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted">points</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
            {room.championBadgeMint ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
                  <Award className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Champion Badge minted on-chain
                </span>
                <a className="text-sm text-turf hover:underline" href={`https://explorer.solana.com/address/${room.championBadgeMint}?cluster=devnet`} target="_blank" rel="noreferrer">view NFT ↗</a>
                <a className="text-sm text-muted hover:underline" href={`/api/badge/${room.code}/image`} target="_blank" rel="noreferrer">preview art</a>
              </>
            ) : isHost || (champion.wallet && champion.wallet === me) ? (
              publicKey ? (
                <button className="btn btn-primary" disabled={busy === "badge"} onClick={mintBadge}>
                  {busy === "badge" ? (
                    "Minting…"
                  ) : (
                    <>
                      <Trophy className="h-4 w-4" strokeWidth={2} aria-hidden />
                      Mint Champion Badge NFT
                    </>
                  )}
                </button>
              ) : (
                <span className="text-sm text-muted">Connect the champion’s wallet to mint the badge.</span>
              )
            ) : (
              <span className="text-sm text-muted">Only the champion can mint the badge.</span>
            )}
          </div>
        </div>
      )}

      {err && <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-300">{err}</p>}

      {inLobby ? (
        <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-chalk">Players</h2>
            <ul className="mt-3 space-y-2">
              {room.members.map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-2.5">
                  <span className="font-medium text-chalk">{m.name}</span>
                  <span className="text-xs text-muted">{m.isHost ? "host" : m.wallet ? shortAddr(m.wallet) : "guest"}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2">
              <input placeholder="Add a player by name" value={playerName} onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPlayer()} />
              <button className="btn btn-ghost shrink-0" disabled={busy === "add" || !playerName.trim()} onClick={addPlayer}>Add</button>
            </div>
            {!alreadyMember && me && (
              <button className="btn btn-ghost mt-2 w-full" disabled={busy === "join"} onClick={joinSelf}>Join with my wallet</button>
            )}
          </div>

          <div className="card flex flex-col p-6">
            <h2 className="font-display text-lg font-semibold text-chalk">The draft</h2>
            <p className="mt-1 text-sm text-muted">
              {room.teamPool.length} World Cup teams will be dealt in a snake order seeded by a live Solana
              blockhash, so it’s provably fair and fully verifiable.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {room.teamPool.slice(0, 24).map((t) => <TeamBadge key={t} team={t} className="chip px-2 py-0.5 text-xs" />)}
            </div>
            <div className="mt-auto pt-5">
              {isHost ? (
                <button className="btn btn-primary w-full" disabled={busy === "draft"} onClick={runDraft}>
                  {busy === "draft" ? "Drawing…" : "Run provably-fair draft"}
                </button>
              ) : me ? (
                <p className="text-center text-sm text-muted">Waiting for the host to run the draft…</p>
              ) : (
                <div className="space-y-2"><p className="text-sm text-muted">Connect to join.</p><WalletButton /></div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold gradient-text">Standings</h2>
              {replayOn ? (
                <button onClick={() => setReplayOn(false)} className="text-xs font-semibold text-turf hover:underline">
                  ■ stop replay
                </button>
              ) : (
                <button onClick={startReplay} className="chip px-2.5 py-1 text-xs font-semibold text-turf hover:bg-white/10">
                  ▶ Demo replay
                </button>
              )}
            </div>

            {replayOn && (
              <div className="card mb-3 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-turf">▶ DEMO REPLAY · simulated matchday</span>
                  <span className="tabular-nums text-chalk">{Math.min(Math.floor(vmin), 90)}&apos;</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-turf transition-all duration-300" style={{ width: `${Math.min(100, (vmin / REPLAY_TOTAL_MIN) * 100)}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted">
                  <span>real teams &amp; fixtures · goals sped up</span>
                  {vmin >= REPLAY_TOTAL_MIN && (
                    <button onClick={startReplay} className="text-turf hover:underline">↻ restart</button>
                  )}
                </div>
              </div>
            )}

            <Leaderboard standings={standings} />
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted">
                {replayOn ? "Replay matches" : "Live matches"}
              </h3>
              <MatchTicker matches={boardMatches} />
            </div>
            <PickEm matches={boardMatches} wallet={me} />

            <div className="card card-ring p-4 text-xs text-muted">
              <div className="mb-1 font-semibold text-aqua">Provably-fair draft</div>
              <div>Seed (Solana blockhash):</div>
              <div className="mt-1 break-all font-mono text-turf">{room.draftSeed || "—"}</div>
              {room.finalTx && (
                <a className="mt-2 inline-block text-turf hover:underline" href={explorerTx(room.finalTx)} target="_blank" rel="noreferrer">
                  View on-chain result ↗
                </a>
              )}
            </div>

            {isHost && (
              <div className="flex gap-2">
                {room.status === "live" && (
                  <button className="btn btn-ghost flex-1" disabled={busy === "final"} onClick={finalize}>Finalize standings</button>
                )}
                {room.status === "final" && !room.finalTx && publicKey && (
                  <button className="btn btn-primary flex-1" disabled={busy === "anchor"} onClick={anchor}>
                    {busy === "anchor" ? "Anchoring…" : "Anchor result on-chain"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen">
      <TopBar />
      <div className="mx-auto max-w-6xl px-5 py-8">{children}</div>
    </main>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    lobby: "bg-white/10 text-muted",
    live: "bg-turf/15 text-turf",
    final: "bg-gold/15 text-gold",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${map[status]}`}>{status === "live" ? "● LIVE" : status.toUpperCase()}</span>;
}

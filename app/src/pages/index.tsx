import { useState } from "react";
import { useRouter } from "next/router";
import { useWallet } from "@solana/wallet-adapter-react";
import { TopBar, WalletButton } from "@/components/ui";
import MatchTicker from "@/components/MatchTicker";
import { useLiveMatches } from "@/lib/hooks";

export default function Home() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { matches, loading } = useLiveMatches();
  const liveCount = matches.filter((m) => m.inPlay).length;

  const [name, setName] = useState("");
  const [hostName, setHostName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function create() {
    if (!publicKey) return;
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, hostWallet: publicKey.toBase58(), hostName }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "failed");
      router.push(`/rooms/${d.code}`);
    } catch (e: any) { setErr(e.message); setBusy(false); }
  }

  return (
    <main className="min-h-screen">
      <TopBar />

      <section className="mx-auto max-w-6xl px-5 pt-14">
        <div className="chip mb-5 inline-flex items-center gap-2 px-3 py-1 text-xs text-muted">
          <span className={liveCount ? "live-dot" : "h-2 w-2 rounded-full bg-muted"} />
          {loading ? "Connecting to the pitch…" : liveCount ? `${liveCount} match${liveCount > 1 ? "es" : ""} live now` : "World Cup · live feed connected"}
        </div>
        <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-chalk sm:text-6xl">
          Your office World Cup sweepstake —<br />
          <span className="text-turf">live, automatic, on-chain.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          No more spreadsheets. Spin up a room, draft teams in a provably-fair on-chain draw, and watch
          the leaderboard move the instant a real goal hits the pitch — powered by the TxLINE live feed.
        </p>
      </section>

      <section className="mx-auto mt-8 max-w-6xl px-5">
        <MatchTicker matches={matches} />
      </section>

      <section className="mx-auto mt-12 grid max-w-6xl gap-5 px-5 pb-24 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-xl font-semibold text-chalk">Create a room</h2>
          <p className="mt-1 text-sm text-muted">You’ll get a share code. Add friends, then run the draft.</p>
          <div className="mt-4 space-y-3">
            <input placeholder="Room name — e.g. The Office Cup" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Your display name" value={hostName} onChange={(e) => setHostName(e.target.value)} />
            {publicKey ? (
              <button className="btn btn-primary w-full" disabled={busy} onClick={create}>
                {busy ? "Creating…" : "Create room"}
              </button>
            ) : (
              <div className="flex flex-col items-stretch gap-2">
                <p className="text-sm text-muted">Connect a Solana wallet to create your room.</p>
                <WalletButton />
              </div>
            )}
            {err && <p className="text-sm text-red-400">{err}</p>}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-xl font-semibold text-chalk">Join a room</h2>
          <p className="mt-1 text-sm text-muted">Got a code from a friend? Jump straight in.</p>
          <div className="mt-4 space-y-3">
            <input
              placeholder="ROOM-CODE"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && joinCode && router.push(`/rooms/${joinCode}`)}
            />
            <button className="btn btn-ghost w-full" disabled={!joinCode} onClick={() => router.push(`/rooms/${joinCode}`)}>
              Find room
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[
              ["1", "Draft", "Provably-fair on-chain draw"],
              ["2", "Watch", "Leaderboard moves on live goals"],
              ["3", "Win", "Champion badge at full time"],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-xl bg-white/[0.02] p-3">
                <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-turf/15 font-display text-sm font-bold text-turf">{n}</div>
                <div className="text-sm font-semibold text-chalk">{t}</div>
                <div className="mt-0.5 text-[11px] leading-tight text-muted">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-muted">
        GroupStage · a live fan experience on Solana · match data by TxLINE / TxODDS
      </footer>
    </main>
  );
}

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

      {/* Hero — fluidity comes from the drifting aurora + gradient sheen, no JS-gated content */}
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <div className="chip mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 text-xs text-chalk/90">
          <span className={liveCount ? "live-dot" : "h-2 w-2 rounded-full bg-turf"} />
          {loading ? "Connecting to the pitch…" : liveCount ? `${liveCount} match${liveCount > 1 ? "es" : ""} live now` : "World Cup · live feed connected"}
        </div>

        <h1 className="font-display text-5xl font-bold leading-[1.03] tracking-tight text-chalk sm:text-7xl">
          Your office World Cup sweepstake
          <span className="mt-1 block">
            <span className="gradient-text">live, automatic, on-chain.</span>
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          No more spreadsheets. Spin up a room, draft teams in a provably-fair on-chain draw, and watch
          the leaderboard move the instant a real goal hits the pitch, powered by the TxLINE live feed.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="#play" className="btn btn-primary text-base">Start a room</a>
          <div className="flex flex-wrap gap-2 text-xs text-muted">
            <span className="chip px-3 py-1.5">⚡ Real-time from TxLINE</span>
            <span className="chip px-3 py-1.5">🎲 Provably-fair draft</span>
            <span className="chip px-3 py-1.5">🏆 On-chain champion badge</span>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-6xl px-5">
        <MatchTicker matches={matches} />
      </section>

      <section id="play" className="mx-auto mt-14 grid max-w-6xl scroll-mt-20 gap-5 px-5 pb-24 md:grid-cols-2">
        <div className="card card-ring p-6 transition-transform duration-150 ease-out hover:-translate-y-0.5">
          <h2 className="font-display text-xl font-semibold text-chalk">Create a room</h2>
          <p className="mt-1 text-sm text-muted">You’ll get a share code. Add friends, then run the draft.</p>
          <div className="mt-5 space-y-3">
            <div>
              <label htmlFor="room-name" className="mb-1.5 block text-xs font-medium text-muted">Room name</label>
              <input id="room-name" placeholder="e.g. The Office Cup" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="host-name" className="mb-1.5 block text-xs font-medium text-muted">Your display name</label>
              <input id="host-name" placeholder="e.g. Great" value={hostName} onChange={(e) => setHostName(e.target.value)} />
            </div>
            {publicKey ? (
              <button className="btn btn-primary w-full" disabled={busy} onClick={create} aria-busy={busy}>
                {busy ? "Creating…" : "Create room"}
              </button>
            ) : (
              <div className="flex flex-col items-stretch gap-2 pt-1">
                <p className="text-sm text-muted">Connect a Solana wallet to create your room.</p>
                <WalletButton />
              </div>
            )}
            {err && <p className="text-sm text-magenta">{err}</p>}
          </div>
        </div>

        <div className="card p-6 transition-transform duration-150 ease-out hover:-translate-y-0.5">
          <h2 className="font-display text-xl font-semibold text-chalk">Join a room</h2>
          <p className="mt-1 text-sm text-muted">Got a code from a friend? Jump straight in.</p>
          <div className="mt-5 space-y-3">
            <div>
              <label htmlFor="join-code" className="mb-1.5 block text-xs font-medium text-muted">Room code</label>
              <input
                id="join-code"
                placeholder="GOLAZO-724"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && joinCode && router.push(`/rooms/${joinCode}`)}
                autoComplete="off"
              />
            </div>
            <button className="btn btn-ghost w-full" disabled={!joinCode} onClick={() => router.push(`/rooms/${joinCode}`)}>
              Find room
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[
              ["1", "Draft", "Provably-fair on-chain draw"],
              ["2", "Watch", "Board moves on live goals"],
              ["3", "Win", "Champion badge at full time"],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div
                  aria-hidden="true"
                  className="mx-auto mb-1.5 grid h-7 w-7 place-items-center rounded-lg font-display text-sm font-bold text-pitch-950"
                  style={{ background: "var(--brand)" }}
                >
                  {n}
                </div>
                <div className="text-sm font-semibold text-chalk">{t}</div>
                <div className="mt-0.5 text-[11px] leading-tight text-muted">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-muted">
        GroupStage · a live fan experience on Solana · match data by TxLINE / TxODDS
      </footer>
    </main>
  );
}

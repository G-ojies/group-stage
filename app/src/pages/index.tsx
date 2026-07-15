import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useWallet } from "@solana/wallet-adapter-react";
import { Dices, Trophy, Zap, type LucideIcon } from "lucide-react";
import { TopBar, WalletButton } from "@/components/ui";
import MatchTicker from "@/components/MatchTicker";
import { useLiveMatches } from "@/lib/hooks";
import type { MatchState } from "@/lib/matchState";

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
      <section className="mx-auto max-w-6xl px-5 pt-14 sm:pt-16">
        <div className="mb-5 flex items-center gap-2">
          <span className={liveCount ? "live-dot" : "h-1.5 w-1.5 rounded-full bg-turf"} />
          <span className="label">
            {loading ? "Connecting to the pitch" : liveCount ? `${liveCount} match${liveCount > 1 ? "es" : ""} live now` : "World Cup · live feed connected"}
          </span>
        </div>

        <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-chalk sm:text-6xl">
          Your office World Cup sweepstake
          <span className="mt-1 block">
            <span className="gradient-text">live, automatic, on-chain.</span>
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
          No more spreadsheets. Spin up a room, draft teams in a provably-fair on-chain draw, and watch
          the leaderboard move the instant a real goal hits the pitch, powered by the TxLINE live feed.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a href="#play" className="btn btn-primary text-sm">Start a room</a>
          <div className="flex flex-wrap gap-2">
            <Pill icon={Zap}>Real-time from TxLINE</Pill>
            <Pill icon={Dices}>Provably-fair draft</Pill>
            <Pill icon={Trophy}>On-chain champion badge</Pill>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-9 max-w-6xl px-5">
        <HeroBanner matches={matches} liveCount={liveCount} loading={loading} />
      </section>

      <section className="mx-auto mt-10 max-w-6xl px-5">
        <MatchTicker matches={matches} />
      </section>

      <section id="play" className="mx-auto mt-14 grid max-w-6xl scroll-mt-20 gap-5 px-5 pb-24 md:grid-cols-2">
        <div className="card card-ring p-6 transition-transform duration-150 ease-out hover:-translate-y-0.5">
          <h2 className="font-display text-lg font-semibold tracking-tight text-chalk">Create a room</h2>
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
          <h2 className="font-display text-lg font-semibold tracking-tight text-chalk">Join a room</h2>
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
              <div key={n} className="rounded-control border border-white/[0.08] p-3">
                <div
                  aria-hidden="true"
                  className="mx-auto mb-1.5 grid h-7 w-7 place-items-center rounded-control font-mono text-xs font-semibold text-pitch-950"
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

      <footer className="hairline mx-auto mt-4 max-w-6xl px-5 py-8">
        <p className="text-center text-xs text-muted">
          GroupStage · a live fan experience on Solana · match data by TxLINE / TxODDS
        </p>
        {/* CC BY 4.0 requires attribution to the photographer plus a licence link. */}
        <p className="mt-2 text-center text-[11px] text-muted">
          Banner photo by Krzysztof Popławski,{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 transition-colors duration-100 ease-out hover:text-chalk"
          >
            CC BY 4.0
          </a>
          , via{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Mecz_pi%C5%82karski_Wis%C5%82a_Krak%C3%B3w_-_Zag%C5%82%C4%99bie_Sosnwoiec,_28_pa%C5%BAdziernika_2022,_Po%C5%BCegnanie_Stadionu_Ludowego,_KP.jpg"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 transition-colors duration-100 ease-out hover:text-chalk"
          >
            Wikimedia Commons
          </a>
          .
        </p>
      </footer>
    </main>
  );
}

/* ─────────────────────────── hero banner ─────────────────────────── */
function Pill({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="chip inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-muted">
      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
      {children}
    </span>
  );
}

/**
 * Same device as SharpSignal's hero: photo, then a diagonal scrim protecting the
 * text, then a bottom-up scrim so the stat row's 11px mono labels clear AA over
 * the floodlit crowd. Measured, not eyeballed — the labels fail without it.
 */
function HeroBanner({ matches, liveCount, loading }: { matches: MatchState[]; liveCount: number; loading: boolean }) {
  const next = matches.filter((m) => !m.inPlay && !m.finished).sort((a, b) => a.startTime - b.startTime)[0];
  const kickoff = next
    ? new Date(next.startTime).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="card card-ring relative overflow-hidden">
      <Image
        src="/hero-stadium.jpg"
        alt=""
        fill
        priority
        sizes="(max-width: 1152px) 100vw, 1152px"
        className="pointer-events-none select-none object-cover object-[70%_center] opacity-75"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,#0B111C_24%,rgba(11,17,28,0.82)_54%,rgba(11,17,28,0.42))]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,#0B111C_20%,rgba(11,17,28,0.72)_40%,transparent_72%)]" />

      <div className="relative p-5 sm:p-7">
        <h2 className="font-display max-w-md text-xl font-semibold tracking-tight text-chalk sm:text-2xl">
          Matchday, not a spreadsheet
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          Every room tracks the same live feed the pros do. Goals land on the board as they happen.
        </p>

        <div className="hairline mt-6 grid grid-cols-3 gap-x-4 pt-5">
          <Stat label="Matches" sub="tracked now">
            {loading ? <span className="stat text-muted/60">·</span> : <span className="stat text-chalk">{matches.length}</span>}
          </Stat>
          <Stat label="Live now" sub={liveCount ? "in play" : "none in play"}>
            <span className={`stat ${liveCount ? "text-turf" : "text-muted/60"}`}>{loading ? "·" : liveCount}</span>
          </Stat>
          <Stat label="Next kickoff" sub={next ? `${next.home} v ${next.away}` : "no fixtures listed"}>
            <span className="stat text-chalk">{kickoff ? kickoff.split(",")[0] : "·"}</span>
          </Stat>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">{children}</div>
      <div className="label mt-1.5 truncate text-[10px] tracking-[0.1em]">{sub}</div>
    </div>
  );
}

import dynamic from "next/dynamic";
import Link from "next/link";
import { flagFor } from "@/lib/teams";
import type { MatchState } from "@/lib/matchState";

export const WalletButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2 no-underline">
      <span
        className="font-display font-bold tracking-tight text-chalk"
        style={{ fontSize: size }}
      >
        Group<span className="text-turf">Stage</span>
      </span>
    </Link>
  );
}

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-pitch-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="chip hidden px-3 py-1 text-xs text-muted sm:inline">Powered by TxLINE</span>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}

export function LiveBadge({ minute, phase }: { minute?: number | null; phase: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-300">
      <span className="live-dot" />
      {phase}
      {minute != null ? ` · ${minute}'` : ""}
    </span>
  );
}

export function PhasePill({ m }: { m: MatchState }) {
  if (m.inPlay) return <LiveBadge minute={m.minute} phase={m.phase} />;
  if (m.finished) return <span className="chip px-2.5 py-1 text-xs text-muted">Full time</span>;
  const t = new Date(m.startTime);
  const label = t.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return <span className="chip px-2.5 py-1 text-xs text-muted">{label}</span>;
}

export function TeamBadge({ team, className = "" }: { team: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="text-lg leading-none">{flagFor(team)}</span>
      <span className="truncate">{team}</span>
    </span>
  );
}

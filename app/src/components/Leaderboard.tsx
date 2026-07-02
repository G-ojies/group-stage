import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { MemberStanding, TeamStats } from "@/lib/scoring";
import { flagFor } from "@/lib/teams";
import { shortAddr } from "@/lib/format";

function TeamChip({ ts }: { ts: TeamStats }) {
  const flashed = useFlash(ts.goalsFor);
  return (
    <span
      title={`${ts.team}${ts.opponent ? ` vs ${ts.opponent}` : ""} · ${ts.points} pts`}
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs transition-colors ${
        ts.live ? "bg-turf/10 text-turf" : ts.played ? "bg-white/5 text-muted" : "bg-white/5 text-muted/70"
      } ${flashed ? "animate-goalflash" : ""}`}
    >
      <span>{flagFor(ts.team)}</span>
      {(ts.played || ts.live) && <span className="font-semibold tabular-nums">{ts.goalsFor}</span>}
      {ts.live && <span className="live-dot !h-1.5 !w-1.5" />}
    </span>
  );
}

function useFlash(value: number) {
  const prev = useRef(value);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (value > prev.current) {
      setOn(true);
      const t = setTimeout(() => setOn(false), 1600);
      prev.current = value;
      return () => clearTimeout(t);
    }
    prev.current = value;
  }, [value]);
  return on;
}

function Row({ s, top }: { s: MemberStanding; top: boolean }) {
  const flashed = useFlash(s.points);
  const medal = s.rank === 1 ? "🥇" : s.rank === 2 ? "🥈" : s.rank === 3 ? "🥉" : null;
  return (
    <motion.li
      layout
      layoutId={s.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ layout: { type: "spring", stiffness: 500, damping: 34 }, duration: 0.25 }}
      className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3 ${
        top ? "border-gold/40 bg-gold/[0.06]" : "border-white/5 bg-white/[0.02]"
      } ${flashed ? "animate-goalflash" : ""}`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold ${
        top ? "bg-gold/20 text-gold" : "bg-white/5 text-muted"
      }`}>
        {medal ?? s.rank}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold text-chalk">{s.name}</span>
          {s.wallet && <span className="hidden text-xs text-muted sm:inline">{shortAddr(s.wallet)}</span>}
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {s.teamStats.map((ts) => <TeamChip key={ts.team} ts={ts} />)}
        </div>
      </div>
      <div className="text-right">
        <div className={`font-display text-2xl font-bold tabular-nums ${top ? "text-gold" : "text-chalk"}`}>{s.points}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted">pts</div>
      </div>
    </motion.li>
  );
}

export default function Leaderboard({ standings }: { standings: MemberStanding[] }) {
  return (
    <ul className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {standings.map((s) => <Row key={s.id} s={s} top={s.rank === 1} />)}
      </AnimatePresence>
    </ul>
  );
}

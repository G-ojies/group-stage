import { useEffect, useMemo, useRef, useState } from "react";
import { flagFor } from "@/lib/teams";
import type { MatchState } from "@/lib/matchState";

type Outcome = "home" | "draw" | "away";
interface Pick { outcome: Outcome; ts: number; }
type State = { picks: Record<number, Pick & { resolved?: boolean; correct?: boolean }>; streak: number; best: number };

const KEY = "gs_momentum_v1";
function load(): State {
  if (typeof window === "undefined") return { picks: {}, streak: 0, best: 0 };
  try { return { picks: {}, streak: 0, best: 0, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
  catch { return { picks: {}, streak: 0, best: 0 }; }
}
function save(s: State) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }

/** Fire-and-forget push to the Redis-backed store so the streak follows the wallet. */
function pushServer(wallet: string, s: State) {
  fetch(`/api/momentum/${wallet}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ picks: s.picks, streak: s.streak, best: s.best }),
  }).catch(() => {});
}
const hasData = (s: State) => s.streak > 0 || s.best > 0 || Object.keys(s.picks).length > 0;

function resultOf(m: MatchState): Outcome {
  if (m.homeTally.goals > m.awayTally.goals) return "home";
  if (m.homeTally.goals < m.awayTally.goals) return "away";
  return "draw";
}

/**
 * "Momentum" — the between-matches engagement hook. Call the outcome of a live
 * or upcoming match, watch live whether you're on track, and build a streak that
 * locks in at full time. Pure live TxLINE data, personal stakes, replayable 104×.
 */
export default function PickEm({ matches, wallet }: { matches: MatchState[]; wallet?: string }) {
  const [state, setState] = useState<State>(() => load());
  const [idx, setIdx] = useState(0);

  // Keep the latest wallet in a ref so persistence closures (including the
  // resolve effect keyed on `matches`) always target the connected wallet.
  const walletRef = useRef<string | undefined>(wallet);
  walletRef.current = wallet;
  const persist = (next: State) => {
    save(next);
    if (walletRef.current) pushServer(walletRef.current, next);
  };

  // On wallet connect, adopt the durable server streak (merging in any local
  // picks) so it follows the player across devices; seed the server if empty.
  useEffect(() => {
    if (!wallet) return;
    let cancelled = false;
    fetch(`/api/momentum/${wallet}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((server: State | null) => {
        if (cancelled || !server) return;
        setState((local) => {
          if (!hasData(server)) {
            if (hasData(local)) pushServer(wallet, local);
            return local;
          }
          const merged: State = {
            picks: { ...local.picks, ...server.picks }, // resolved server picks win per fixture
            streak: server.streak,
            best: Math.max(local.best || 0, server.best || 0),
          };
          save(merged);
          pushServer(wallet, merged);
          return merged;
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [wallet]);

  const eligible = useMemo(
    () => matches.filter((m) => !m.finished || state.picks[m.fixtureId]).sort((a, b) => {
      const r = (m: MatchState) => (m.inPlay ? 0 : m.scheduled ? 1 : 2);
      return r(a) - r(b) || a.startTime - b.startTime;
    }),
    [matches, state.picks]
  );
  const m = eligible[Math.min(idx, Math.max(0, eligible.length - 1))];

  // Resolve finished matches we have a pick on, exactly once.
  useEffect(() => {
    let changed = false;
    const next = { ...state, picks: { ...state.picks } };
    for (const mm of matches) {
      const p = next.picks[mm.fixtureId];
      if (mm.finished && p && !(p as any).resolved) {
        const correct = resultOf(mm) === p.outcome;
        (next.picks[mm.fixtureId] as any) = { ...p, resolved: true, correct };
        next.streak = correct ? next.streak + 1 : 0;
        next.best = Math.max(next.best, next.streak);
        changed = true;
      }
    }
    if (changed) { setState(next); persist(next); }
  }, [matches]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!m) return null;
  const pick = state.picks[m.fixtureId] as (Pick & { resolved?: boolean; correct?: boolean }) | undefined;
  const live = resultOf(m);
  const onTrack = pick && (m.inPlay || m.finished) && live === pick.outcome;

  function choose(outcome: Outcome) {
    if (pick) return;
    const next = { ...state, picks: { ...state.picks, [m.fixtureId]: { outcome, ts: Date.now() } } };
    setState(next); persist(next);
  }

  const opt = (o: Outcome, label: string) => {
    const selected = pick?.outcome === o;
    return (
      <button
        key={o}
        disabled={!!pick}
        onClick={() => choose(o)}
        className={`btn flex-1 py-2.5 text-sm ${
          selected
            ? pick?.resolved
              ? pick.correct ? "turf-glow bg-turf text-pitch-950" : "bg-red-500/20 text-red-300"
              : onTrack ? "turf-glow bg-turf text-pitch-950" : "bg-white/10 text-chalk"
            : "btn-ghost"
        } ${pick && !selected ? "opacity-40" : ""}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="card card-ring p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display font-semibold gradient-text">Momentum</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-turf">🔥 {state.streak} streak</span>
          <span className="text-muted">best {state.best}</span>
          {wallet && <span className="text-muted" title="Streak saved to your wallet">· synced</span>}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 text-sm">
        <span className="flex items-center gap-1.5"><span className="text-lg">{flagFor(m.home)}</span>{m.home}</span>
        <span className="font-display font-bold tabular-nums">
          {m.inPlay || m.finished ? `${m.homeTally.goals}–${m.awayTally.goals}` : "vs"}
        </span>
        <span className="flex items-center gap-1.5">{m.away}<span className="text-lg">{flagFor(m.away)}</span></span>
      </div>

      <div className="flex gap-2">
        {opt("home", flagFor(m.home) + " Win")}
        {opt("draw", "Draw")}
        {opt("away", "Win " + flagFor(m.away))}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>
          {pick
            ? pick.resolved
              ? pick.correct ? "✓ Called it! Streak up." : "✗ Missed. Streak reset."
              : m.inPlay ? (onTrack ? "On track…" : "Off track, needs a goal") : "Locked · resolves at full time"
            : "Call the result to start a streak"}
        </span>
        <button className="text-turf hover:underline" onClick={() => setIdx((i) => (i + 1) % eligible.length)}>
          next match →
        </button>
      </div>
    </div>
  );
}

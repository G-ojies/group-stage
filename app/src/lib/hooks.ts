import { useCallback, useEffect, useRef, useState } from "react";
import type { MatchState } from "./matchState";
import type { Room } from "./store";

/** Poll the normalized live-match feed. */
export function useLiveMatches(competitionId = 72, intervalMs = 6000) {
  const [matches, setMatches] = useState<MatchState[]>([]);
  const [ts, setTs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/live/matches?competitionId=${competitionId}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "failed");
      setMatches(d.matches);
      setTs(d.ts);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [competitionId]);

  useEffect(() => {
    load();
    const h = setInterval(load, intervalMs);
    return () => clearInterval(h);
  }, [load, intervalMs]);

  return { matches, ts, error, loading, reload: load };
}

/** Poll a room's state. */
export function useRoom(code?: string, intervalMs = 5000) {
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!code) return;
    try {
      const r = await fetch(`/api/rooms/${code}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "not found");
      setRoom(d);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    load();
    const h = setInterval(load, intervalMs);
    return () => clearInterval(h);
  }, [load, intervalMs]);

  return { room, error, loading, reload: load, setRoom };
}

/** Detect when a numeric value increases (for goal-flash effects). Returns a token that changes on increase. */
export function useIncreaseFlash(value: number) {
  const prev = useRef(value);
  const [token, setToken] = useState(0);
  useEffect(() => {
    if (value > prev.current) setToken((t) => t + 1);
    prev.current = value;
  }, [value]);
  return token;
}

/**
 * Provably-fair snake draft. A public seed (on-chain: a tx signature or recent
 * blockhash; nobody can predict or grind it) deterministically shuffles the team
 * pool, then teams are dealt in snake order (1-2-3-3-2-1) so no seat is favoured.
 * Anyone can re-run this with the seed and verify who got Brazil.
 */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable 32-bit hash of the seed string. */
export function seedToInt(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function shuffle<T>(items: T[], seed: string): T[] {
  const rng = mulberry32(seedToInt(seed));
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Deal `pool` teams to `memberIds` in snake order using `seed`.
 * Returns memberId -> teams[]. Leftover teams (pool not divisible) are dealt
 * one extra to the front of the snake order until exhausted.
 */
export function snakeDraft(
  memberIds: string[],
  pool: string[],
  seed: string
): Record<string, string[]> {
  const teams = shuffle(pool, seed);
  const order = shuffle(memberIds, seed + ":order");
  const out: Record<string, string[]> = {};
  order.forEach((m) => (out[m] = []));
  if (order.length === 0) return out;

  let idx = 0;
  let forward = true;
  for (const team of teams) {
    out[order[idx]].push(team);
    if (forward) {
      if (idx === order.length - 1) forward = false;
      else idx++;
    } else {
      if (idx === 0) forward = true;
      else idx--;
    }
  }
  return out;
}

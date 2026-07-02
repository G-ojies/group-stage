export function shortAddr(a?: string, n = 4): string {
  if (!a) return "";
  return a.length <= n * 2 + 2 ? a : `${a.slice(0, n)}…${a.slice(-n)}`;
}

/** Human room-share codes like "GOLAZO-724". */
const WORDS = ["GOLAZO", "HATTRICK", "STOPPAGE", "NUTMEG", "VOLLEY", "SCREAMER", "BRACE", "CLASSICO", "DERBY", "GROUP"];

export function makeRoomCode(rand: () => number = Math.random): string {
  const w = WORDS[Math.floor(rand() * WORDS.length)];
  const n = Math.floor(100 + rand() * 900);
  return `${w}-${n}`;
}

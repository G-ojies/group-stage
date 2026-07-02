# GroupStage ⚽

**Your office World Cup sweepstake — live, automatic, and provably fair on-chain.**

Submission for the **TxODDS World Cup Hackathon → Consumer & Fan Experiences** track (Superteam Earn).

No more spreadsheets. Spin up a room, draft World Cup teams in a provably-fair draw seeded by a
live Solana blockhash, and watch the leaderboard move the instant a real goal hits the pitch —
powered end-to-end by the **TxLINE** live match feed.

---

## Why it wins the track

| Judging criterion | How GroupStage delivers |
| --- | --- |
| **Fan Accessibility & UX** | Connect wallet → join with a code → watch your teams climb. No crypto knowledge needed. |
| **Real-Time Responsiveness** | The leaderboard re-sorts and goal-flashes the moment a goal/card lands in the TxLINE feed. |
| **Originality** | Not a betting market. The familiar office sweepstake, made live + automatic, with a **provably-fair on-chain draft** and immutable final standings. |
| **Monetization** | Premium/sponsored rooms, cosmetic badge packs, optional prize-pool escrow. Consumer showcase for TxODDS' live data layer. |
| **Completeness** | Full end-to-end product on real live World Cup data — not a mockup. |

## Product loop

1. **Connect** a Solana wallet (devnet) — this is sign-in.
2. **Create a room** — get a shareable code; add friends by name or wallet.
3. **Draft** — the host runs a snake draft seeded by a **live Solana blockhash** (public + unpredictable → nobody can rig who gets Brazil; anyone can re-run and verify).
4. **Watch live** — each player scores from their teams' real match events, streamed from TxLINE. The board animates as it happens.
5. **Momentum** (engagement hook) — call live match outcomes, build a personal streak between your teams' games.
6. **Finish** — champion crowned at full time; host can **anchor the final standings on-chain** (devnet memo) for a publicly auditable result.

## Scoring

Per team: `goals × 2`, `win +5`, `draw +2`, `clean sheet +3` (result/clean-sheet bonuses lock in at full time; goals accrue live). A player's score is the sum across their drafted teams. Fully configurable in `lib/scoring.ts`.

---

## Architecture

```
app/                       Next.js 14 (pages router) + Tailwind + framer-motion + Solana wallet-adapter
  src/lib/
    txlineServer.ts        server-only TxLINE auth + fetch (JWT + apiToken kept off the client)
    txline.ts              browser client → hits our proxy routes
    matchState.ts          normalizes raw TxLINE fixture+score JSON → MatchState
    scoring.ts             MatchState[] + members → live standings
    draft.ts               provably-fair, deterministic snake draft from a seed
    attest.ts              on-chain (devnet SPL-memo) attestation of results
    store.ts               room store (in-memory; swap for KV/Redis in prod)
  src/pages/api/
    live/matches          normalized live feed the room polls (the single data endpoint)
    live/pool             draftable team pool for a competition
    rooms/*               create / join / draft / finalize
    txline/*              raw TxLINE proxies (fixtures, scores, SSE stream)
  src/pages/
    index.tsx             landing + create/join
    rooms/[code].tsx      lobby → draft → live leaderboard → champion
```

### TxLINE endpoints used
- `GET /api/fixtures/snapshot?competitionId=72` — World Cup fixtures + team pool
- `GET /api/scores/snapshot/{fixtureId}` — live per-match score (goals/cards/corners via `Score.ParticipantN.Total`)
- `GET /api/scores/stream` (SSE) — live push feed (proxied in `api/txline/stream`)
- Phase derived from `StatusId` (soccer game-phase table); goals from the `Score` object.

---

## Run it locally

```bash
cd app
npm install
# TxLINE creds: either export TXLINE_* env vars (see .env.local.example)
# or place the bootstrap credentials.json at ../txline/credentials.json
npm run dev        # http://localhost:3000
```

Connect a devnet wallet (Phantom → set to Devnet), create a room, add a couple of players,
run the draft, and the board will track whatever World Cup matches are live in the feed.

> **Note:** requires a working Node/Next build environment. The engine (data parsing, draft,
> scoring) is covered by an integration test that runs directly against the live TxLINE devnet
> feed — see `docs/` / `scripts`.

## Status

- ✅ Live TxLINE integration (auth, fixtures, live scores, SSE) — verified against the devnet World Cup feed
- ✅ Provably-fair draft (deterministic from a Solana blockhash seed) — verified deterministic
- ✅ Live scoring + standings — verified end-to-end (e.g. a 1–0 win → 2 goal + 5 win + 3 clean-sheet = 10 pts)
- ✅ Solana wallet sign-in + on-chain result attestation (devnet memo)
- ⏭️ Next: persistence backend (Vercel KV) for multi-instance deploy, mintable champion badge NFT, demo video

Match data by **TxLINE / TxODDS**. Built on **Solana**.

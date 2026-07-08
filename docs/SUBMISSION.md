# GroupStage — Superteam Earn Submission (copy-paste)

**Track:** TxODDS World Cup Hackathon → Consumer & Fan Experiences

## Links
- **Demo video (4:06):** https://www.loom.com/share/8015fbf3534b43ec9ee4f292f2f4cade
- **Live app:** https://group-stage.vercel.app
- **Public repo:** https://github.com/G-ojies/group-stage

## One-liner
Your office World Cup sweepstake, made live, automatic, and provably fair on-chain — the
leaderboard moves the instant a real goal hits the pitch, powered by the TxLINE live feed.

## Brief Technical Documentation

**Core idea.** GroupStage turns the universal "office sweepstake" into a live consumer product.
You connect a Solana wallet, spin up a room, and friends join with a share code. Teams are dealt in
a **provably-fair draft seeded by a live Solana blockhash** (nobody can predict or rig it; anyone can
re-run and verify). As real World Cup matches play, each player's score updates automatically from
the **TxLINE live feed** and the leaderboard re-sorts in real time. At full time the champion mints a
**1/1 Champion Badge NFT**, and the final standings can be anchored on-chain.

**Technical highlights.**
- Next.js 14 app; a single normalized `MatchState` derived from TxLINE fixtures + score snapshots
  drives the live leaderboard, the match ticker, and the "Momentum" pick-'em.
- Scoring: goals ×2, win +5, draw +2, clean sheet +3 (goals accrue live; result bonuses lock at FT).
- Provably-fair snake draft seeded by a live devnet blockhash (raw JSON-RPC, timeout-guarded, with a
  deterministic fallback so it never blocks).
- Champion Badge = Metaplex Token-Metadata 1/1 NFT minted client-side by the wallet; metadata + a
  dynamic SVG are **self-hosted** (`/api/badge/{code}`), so no Arweave/IPFS or DAS needed.
- Persistence via Upstash Redis (Vercel Marketplace) so shared room links work across serverless
  instances; in-memory fallback for local dev.
- A "Demo replay" mode accelerates a full matchday over the real fixtures for demoing when nothing is
  live — clearly labelled, using real feed scores where present.

**TxLINE endpoints used.**
- `GET /api/fixtures/snapshot?competitionId=72` — World Cup fixtures + draftable team pool
- `GET /api/scores/snapshot/{fixtureId}` — live goals/cards/corners (`Score.ParticipantN.Total`)
- `GET /api/scores/stream` — live push feed (proxied server-side)
- Game phase decoded from `StatusId` (1 NS, 2 1H, 3 HT, 4 2H, 5 FT …)

## Feedback for the TxODDS / TxLINE team

**What we liked.** The single normalized JSON schema across competitions made it genuinely fast to go
from zero to a live leaderboard — one `MatchState` mapper covered fixtures, live scores, and the SSE
stream. The free World Cup tier (guest JWT + `subscribe`) meant no purchase friction to build. The
`Score.ParticipantN.Total.{Goals,YellowCards,RedCards,Corners}` structure is clean and exactly the
shape a consumer scoreboard wants, and the SSE stream is great for real-time UIs.

**Where we hit friction.**
1. **Field-level response schemas aren't fully documented** — we had to probe the live devnet feed to
   discover the exact `Score` object shape and which record carries it. Publishing per-endpoint JSON
   schemas (or TypeScript types) would save every team that first hour.
2. **`GameState` is unreliable** — it read `"scheduled"` on fixtures that were clearly in-play. We
   switched to `StatusId` (+ `Clock.Seconds` and the `game_finalised` action) for phase/finished
   detection. Worth calling out prominently in the docs, or fixing `GameState`.
3. **Fixtures age out of `/fixtures/snapshot` quickly**, which made it hard to demo finished matches by
   listing; scores-by-`fixtureId` still worked, but a "recently finished" window or an explicit
   historical fixtures listing would help demo/testing flows.

Overall: a fast, pleasant data layer to build a real-time consumer app on. Thank you for the access.

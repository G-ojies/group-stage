# GroupStage — Full Demo Video Script (read-along)

**Target: 4:45** (15s under the 5:00 cap) · **Live app:** https://group-stage.vercel.app · **Repo:** https://github.com/G-ojies/group-stage

The listing makes the demo video **pass/fail** and requires it to show: (1) the problem, (2) a live
walkthrough, (3) **how TxLINE powers the backend**. This script covers all three and hits every
judging criterion (Fan UX · Real-Time · Originality · Monetization · Completeness).

---

## Before you press record
- [ ] Hide bookmarks bar (`Ctrl+Shift+B`).
- [ ] Brave at 1080p, one tab: **group-stage.vercel.app**.
- [ ] Phantom on **Devnet**, funded (your `FHj8w7…` wallet has ~3.25 SOL — good for the mint).
- [ ] Loom (browser extension on Linux) → **Screen + Cam** or **Screen only**, capture the tab. Confirm it's actually recording the screen before you talk.
- [ ] No match is live right now → **Scene 4 uses the ▶ Demo replay button.**
- [ ] One silent practice pass first.

**Delivery:** warm, confident, a little excited — you're a fan showing friends something cool, not
reading a spec. Let the app breathe on screen; don't rush over the replay.

---

## SCENE 1 — The hook (0:00 – 0:32)
**On screen:** Landing page, slow. Let the gradient headline sit.

> "Every four years, hundreds of millions of us run the same little ritual — the office World Cup
> sweepstake. You pull a country out of a hat and follow it for a month. There's just one problem:
> it lives in a spreadsheet that *somebody* has to update by hand, and it's always out of date.
> So we rebuilt it. This is **GroupStage** — your office sweepstake, made live, automatic, and on-chain."

---

## SCENE 2 — Connect & create a room (0:32 – 1:12)
**On screen:** Point at the live match ticker. Click **Connect Wallet → approve**. Type room name
"The Office Cup" and your name. Click **Create room**. Click the **code** to copy.

> "Right at the top — those aren't mock scores. That's the live World Cup feed, straight from TxLINE.
> I sign in with a Solana wallet… name my room 'The Office Cup'… and I've got a share code. I drop
> that in the group chat, and everyone jumps in from their phone. No app to install, no crypto
> knowledge needed."

---

## SCENE 3 — The provably-fair draft (1:12 – 2:00)
**On screen:** Add players `Sam`, `Ada`, `Tunde`. Click **Run provably-fair draft**. Teams fan out.
Scroll to the **Provably-fair draft** panel; point at the **blockhash seed**.

> "Now the draw. In a normal sweepstake, you just trust whoever's holding the hat. Here, the draft is
> seeded by a live Solana blockhash — public, and impossible to predict or rig. Everyone gets their
> teams… and because that seed is right here on screen, anyone can re-run the exact same draft and
> prove it was fair. It's the office sweepstake — but trustless."

---

## SCENE 4 — The live leaderboard (the moment) (2:00 – 3:15)
**On screen:** Click **▶ Demo replay**. Let the full matchday play (~35s). Do **not** rush — let the
rows flash green and re-sort, and let the final lead-change land.

> "And this is where it comes alive. I'll run a full matchday, sped up — and every point you see is
> real TxLINE match data: goals, results, clean sheets. Watch the board… there's a goal… a team's
> tally ticks up, the points move, and the whole leaderboard re-sorts itself, live. No spreadsheet,
> no refresh. This — the lead flipping on a late goal — is the moment your group chat goes off.
> And at full time, we've got a champion."

---

## SCENE 5 — Momentum & the business (3:15 – 3:52)
**On screen:** The **Momentum** widget. Call a match result; show the streak counter.

> "Between your team's games, there's Momentum — quick calls on live matches that build a personal
> streak, so there's always a reason to keep the app open. And the business is simple: premium and
> sponsored rooms, cosmetic packs, prize pools. For TxODDS, GroupStage turns your live data layer
> into something millions of everyday fans actually touch."

---

## SCENE 6 — Champion, badge & how TxLINE powers it (3:52 – 4:35)
**On screen:** With the replay finished and still showing, click **Finalize standings** → the
**Champion** banner appears. Click **🏆 Mint Champion Badge NFT** → approve in Phantom → click
**view NFT** (Explorer). *(Optional: gesture to the on-chain draft seed / result.)*

> "When it's over, the champion is crowned — and they mint a one-of-one Champion Badge: an NFT that
> lands straight in their wallet on Solana. Under the hood, GroupStage pulls fixtures and live scores
> from TxLINE's snapshot and stream endpoints, turns goals, cards and corners into points, and that
> drives everything you just saw. TxLINE is the live heartbeat of the whole product."

---

## SCENE 7 — Close (4:35 – 4:48)
**On screen:** Back to the landing page with the URL visible.

> "GroupStage — your office World Cup sweepstake: live, automatic, and on-chain. It's live right now
> at group-stage-dot-vercel-dot-app. Thanks for watching."

---

## The one rule that matters
Run the **replay to full-time first**, *then* **Finalize** (Scene 6). Finalize snapshots whatever the
board shows — replay first → a clear champion; finalize first → everyone ties at zero.

## TxLINE endpoints to name (covers the "backend" requirement)
- `GET /api/fixtures/snapshot?competitionId=72` — World Cup fixtures + team pool
- `GET /api/scores/snapshot/{fixtureId}` — live goals / cards / corners (`Score.ParticipantN.Total`)
- `GET /api/scores/stream` — the live push feed
- Game phase decoded from `StatusId` (2 = 1st half, 4 = 2nd half, 5 = full time)

## After recording
Trim dead air in Loom → set sharing to **"Anyone with the link"** → paste the URL into the Superteam
Earn submission's **Demo Video** field.

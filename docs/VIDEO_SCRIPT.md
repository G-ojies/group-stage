# GroupStage — Demo Video Script (≤5 min)

**Submission:** TxODDS World Cup Hackathon → Consumer & Fan Experiences
**Live app:** https://group-stage.vercel.app · **Repo:** https://github.com/G-ojies/group-stage

> The listing makes the demo video an **absolute requirement to pass initial screening**, and
> says it must show: (1) the problem, (2) a live app walkthrough, (3) **how TxLINE powers the
> backend**. This script covers all three and deliberately touches each judging criterion
> (Fan UX · Real-Time Responsiveness · Originality · Monetization · Completeness).

---

## ⚙️ Before you hit record (prep checklist)

- [ ] **Hide your browser bookmarks bar** (Ctrl/Cmd+Shift+B). Your current bar shows
      "Parrot OS / Hack The Box / OSINT / Vuln DB" — keep it off-camera for a clean, pro look.
- [ ] Use a clean browser window at **1920×1080**, 100% zoom, no unrelated tabs.
- [ ] **Phantom** (or any wallet) installed and **switched to Devnet**, with a little devnet SOL
      (for the on-chain "anchor result" tx at the end). Get some at faucet.solana.com if needed.
- [ ] **Check for a live match** so the leaderboard visibly ticks during the demo:
      ```
      curl -s https://group-stage.vercel.app/api/live/matches \
        | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.matches.filter(m=>m.inPlay).map(m=>m.home+' '+m.homeTally.goals+'-'+m.awayTally.goals+' '+m.away+' ('+m.phase+')'))})"
      ```
      Record during a window with ≥1 in-play fixture for the real-time "wow". (If none are live,
      see **Fallback** at the bottom — we can add a replay mode.)
- [ ] Pre-stage a room with 3–4 players so the leaderboard looks alive, OR create it live and add
      players named after real people ("You", "Sam", "Ada", "Tunde"). Have the join code ready.
- [ ] Record voice separately if you can — cleaner than live narration. Keep energy up; this is a
      consumer product, not an enterprise tool.

**Total runtime target: 4:45.** Leave 15s of headroom under the 5:00 cap.

---

## 🎬 The script

### Scene 1 — The problem (0:00 – 0:30)
**On screen:** A boring spreadsheet of a World Cup sweepstake (or a stock image of one), then cut
to the GroupStage landing page hero.

**VO:**
> "Every World Cup, hundreds of millions of fans run the same little ritual — the office sweepstake.
> You get a team out of a hat, and you follow it all tournament. But it lives in a spreadsheet that
> *somebody* has to update by hand… and it's always out of date. What if that sweepstake just…
> ran itself — live, automatically, and provably fair?"

*(Criterion hit: Originality — we name the exact pain the sponsor called out.)*

---

### Scene 2 — Meet GroupStage + create a room (0:30 – 1:15)
**On screen:** Landing page. Point at the live match ticker strip (real scores). Click **Connect
Wallet → approve** in Phantom. Type a room name ("The Office Cup") and your name, click **Create room**.
Land on the room page; highlight the **share code** (click to copy).

**VO:**
> "This is GroupStage. Right up top — those aren't mock scores, that's the *live* World Cup feed
> from TxLINE. I connect a Solana wallet — that's my sign-in — name my room 'The Office Cup', and
> I've got a shareable code. I send this to my group chat and everyone jumps in from their phone.
> No app install, no crypto knowledge needed."

*(Criteria: Fan UX — dead simple; Completeness — real wallet, real room.)*

---

### Scene 3 — The provably-fair on-chain draft (1:15 – 2:05)
**On screen:** In the lobby, add a couple of players by name (or show them joining). Click **Run
provably-fair draft**. Teams fan out to each player. Then scroll to the **"Provably-fair draft"**
panel and point at the **seed (Solana blockhash)**.

**VO:**
> "Now the draw. In a normal sweepstake you just trust whoever's holding the hat. Here, the draft is
> seeded by a *live Solana blockhash* — nobody, not even me the host, can predict or rig who gets
> Brazil. And because the seed is public, anyone can re-run the exact same draft and verify the
> result. That's the twist: the office sweepstake, but trustless."

*(Criteria: Originality + Completeness — this is the meaningful on-chain hook, and it's not a betting market.)*

---

### Scene 4 — The live leaderboard (THE moment) (2:05 – 3:20)
**On screen:** The standings board. Point out each player's flags and running goal counts. Then —
ideally on a live goal — the row **flashes green and re-sorts**. If you can catch a real goal, let
it breathe on camera. Show the live match ticker updating alongside.

**VO:**
> "And here's where it comes alive. Every player's score comes straight from what's happening on the
> pitch — goals, results, clean sheets — streamed in from TxLINE. Watch the board… *[a goal lands]* …
> there it is. A real goal just went in, my team's tally ticks up, and the whole leaderboard re-sorts
> itself, live. No spreadsheet. No refresh. This is the moment your group chat goes off."

*(Criteria: Real-Time Responsiveness — the headline criterion; Fan UX — the emotional payoff.)*

> 🎥 *Editing tip:* if you catch a real goal, add a subtle zoom + sound sting on the flash. If the
> match is quiet, narrate over the running scores and the live ticker — the board still reflects
> real results — or use the replay fallback below.

---

### Scene 5 — Momentum + the business (3:20 – 4:00)
**On screen:** The **Momentum** pick'em widget. Call a live match result; show the streak counter.
Briefly gesture to premium/sponsored-room framing (a slide or on-screen text bullet is fine).

**VO:**
> "Between your team's games, there's Momentum — quick live calls on match results that build a
> personal streak, so there's always a reason to keep the app open. And the business is
> straightforward: premium and sponsored rooms, cosmetic packs, optional prize pools. For TxODDS,
> GroupStage is the consumer showcase that turns your live data layer into something millions of
> everyday fans actually touch."

*(Criteria: Monetization — explicit path; Fan UX — retention hook.)*

---

### Scene 6 — Champion + how TxLINE powers it (4:00 – 4:40)
**On screen:** (If a match/tournament stage has finished) show the **Champion** banner, then click
**Anchor result on-chain** and approve the Phantom tx; click the **explorer link**. Quick cut to a
simple architecture card: `TxLINE feed → /api/live/matches → scoring engine → leaderboard`.

**VO:**
> "When it's over, the champion is crowned — and the host anchors the final standings on-chain, so
> the result is permanent and auditable. Under the hood: GroupStage pulls World Cup fixtures and
> live scores from TxLINE's snapshot and stream endpoints, normalizes goals, cards and corners, and
> feeds a simple scoring engine that drives the whole leaderboard. TxLINE is the live heartbeat of
> the entire product."

*(Requirement hit: "how TxLINE powers the backend." Criterion: Completeness — real end-to-end.)*

---

### Scene 7 — Close (4:40 – 4:50)
**On screen:** Landing page with URL + repo on screen.

**VO:**
> "GroupStage — your office World Cup sweepstake, live, automatic, and on-chain. It's live now at
> group-stage dot vercel dot app. Thanks for watching."

---

## 🗣️ TxLINE endpoints to mention / show (for the "backend" requirement)
- `GET /api/fixtures/snapshot?competitionId=72` — World Cup fixtures + team pool
- `GET /api/scores/snapshot/{fixtureId}` — live goals/cards/corners (`Score.ParticipantN.Total`)
- `GET /api/scores/stream` — the live push feed
- Game phase decoded from `StatusId` (2 = 1st half, 4 = 2nd half, 5 = full time)

## ▶️ Fallback if no match is live at record time
The "real-time" beat is strongest with a live goal. If the feed has no in-play fixture in your
recording window, either (a) record during a scheduled World Cup kickoff (check the ticker times),
or (b) ask me to add a **replay mode** that plays back a finished match's real TxLINE score updates
at speed — so the leaderboard animates on demand, any time, using genuine TxLINE data.

## 📤 Where to post
Upload to **YouTube (unlisted)** or **Loom**, keep it **public/anyone-with-link**, and paste the URL
into the Superteam Earn submission's "Demo Video" field.

# Deploying GroupStage to Vercel

The app lives in `group-stage/app` (Next.js 14, pages router). Rooms persist to
Upstash Redis in production and fall back to in-memory locally.

## 0. Prerequisites
- A public GitHub repo for `group-stage/` (judges require a public repo).
- A Vercel account (Next.js is auto-detected).
- TxLINE devnet credentials — already in `txline/credentials.json` (git-ignored). The
  exact env lines to paste are in `deploy/vercel-env.txt` (also git-ignored).

## 1. Push to GitHub
```bash
cd group-stage
git init            # (already initialised)
git add -A
git commit -m "GroupStage: live on-chain World Cup sweepstake"
git branch -M main
git remote add origin https://github.com/<you>/group-stage.git
git push -u origin main
```
> `.gitignore` already excludes `node_modules`, `.next`, all `.env*`,
> `txline/credentials.json`, and `deploy/vercel-env.txt`. **Verify no secrets are staged**
> with `git status` before pushing.

## 2. Import into Vercel
- New Project → import the repo.
- **Root Directory: `app`** (important — the Next app is in the subfolder).
- Framework preset: **Next.js** (auto). Build/output settings: defaults.

## 3. Add Redis (persistent rooms)
Storage tab → **Marketplace → Upstash (Redis)** → connect to the project.
This auto-injects `KV_REST_API_URL` and `KV_REST_API_TOKEN`, which the store reads.
(Alternatively create an Upstash DB manually and set `UPSTASH_REDIS_REST_URL` /
`UPSTASH_REDIS_REST_TOKEN`.) Without these, the app still runs but rooms are per-instance
and will not survive across serverless cold starts.

## 4. Set TxLINE env vars
Settings → Environment Variables → add (values in `deploy/vercel-env.txt`):
```
TXLINE_API_ORIGIN = https://txline-dev.txodds.com
TXLINE_JWT        = <guest jwt>
TXLINE_API_TOKEN  = <api token>
```
All server-side only — never exposed to the browser (proxied through `/api/txline/*`).

## 5. Deploy & verify
After the deploy finishes, hit:
```
https://<your-app>.vercel.app/api/health
→ { "ok": true, "store": "redis", "txlineEnv": true, ... }
```
- `store: "redis"` confirms persistence is wired.
- `txlineEnv: true` confirms the feed creds are set.

Then open the site, create a room, add players, run the draft, and share the room link —
it now works across devices/instances.

## Notes
- **JWT expiry:** the guest JWT was created 2026-06-30 and expires ~30 days later
  (~2026-07-30). If it lapses before judging, re-bootstrap in `../txline` and update
  `TXLINE_JWT` in Vercel.
- **SSE route:** `/api/txline/stream` is a long-lived stream and may be cut by serverless
  timeouts — it is **not** on the critical path (the room uses polling via
  `/api/live/matches`), so this does not affect the product.
- **Custom server:** `app/server.js` is only for local sandboxed runs; Vercel uses the
  standard Next.js build and ignores it.

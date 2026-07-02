# Brand — GroupStage

_Status: active_

Consumer-fan energy on a premium dark base. Modern, colourful, fluid — a live World Cup
sweepstake that should feel like matchday, not a spreadsheet.

## Palette

Base (stadium night):
- `pitch-950 #060910` (page), `pitch-900 #0A0F1A`, `pitch-800 #131B29` (surfaces)
- `chalk #EEF3F8` (text), `muted #97A6B8` (secondary — AA on dark)

Brand spectrum — a **coherent gradient family**, used together as one identity (deliberate
departure from the usual single-accent rule, per an explicit "colourful" brief):
- `turf #3DFF7A` → `aqua #22E3C3` → `azure #4C8DFF` → `iris #9B6BFF` → `magenta #FF5DA2`
- Signature gradient token: `--brand` (100° across the spectrum). Applied to the wordmark,
  headline (`.gradient-text`, slow 8s sheen), primary CTAs, and step badges.

Semantic:
- `gold #FFCB47` — champion / winner only
- `magenta #FF5DA2` — errors/destructive
- red `#FF4D4D` — live pulse dot only

## Motion (fluid)

- **Aurora** — 4 blurred, slowly drifting colour blobs fixed behind all content (`Aurora.tsx`),
  plus a soft radial colour wash on `body`. Subtle, edge-weighted so text stays readable.
- **Gradient sheen** — headline gradient animates background-position over 8s.
- Micro-interactions: hover lift `translateY(-1px)` / press `translateY(1px)` at 120ms ease-out.
- Durations follow the craft tiers (100 hover / 150 small / 200–250 element). Specify properties,
  never `transition: all`.
- **All motion is disabled under `prefers-reduced-motion: reduce`.** Content is never gated behind
  JS animation (landing renders immediately; no opacity-0-until-hydration).

## Typography

- Display: **Space Grotesk** (`--font-display`) — headings, numbers, wordmark.
- Body/UI: **Inter** (`--font-sans`).
- Numbers that change use `tabular-nums`.

## Surfaces

- `.card` — glassmorphic (blur + saturate), 20px radius, soft shadow.
- `.card-ring` — adds a gradient border for hero surfaces.
- One radius per element class; 1px borders; border **or** shadow, not both.

## Voice

Warm, confident, fan-first. Short and active. "Start a room", not "Click here to begin."
Avoid em dashes in UI copy (use commas or new lines).

_Implemented in `app/src/styles/globals.css` + `app/tailwind.config.ts`. Set 2026-07-02._

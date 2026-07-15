# Brand — GroupStage

_Status: active — sibling system set 2026-07-15_

Consumer-fan energy on a premium dark base. A live World Cup sweepstake that should feel
like matchday, not a spreadsheet.

GroupStage is a **sibling** of SharpSignal (`worldcup-sharp-signal`), not a clone. The two
share a skeleton so they read as one studio; each keeps the accent that fits its job.

| Shared with SharpSignal | GroupStage keeps its own |
|---|---|
| Geist + Geist Mono | Brand spectrum as the accent (**not** violet) |
| `.label` mono uppercase micro-caps, 11px / 0.14em | Aurora backdrop (its "fluid" signature) |
| Hairline borders, flat cards, no glow/shadow | `gradient-text` headline with 8s sheen |
| One radius scale: `--radius` 14px, `--radius-sm` 8px | Gold = champion only |
| Hero banner: photo → diagonal scrim → bottom scrim → stat row | Pitch-night base (`#060910`) rather than warm-neutral |
| `.stat` / `.tnum` tabular figures | |
| lucide-react icons, `strokeWidth={1.5}` | |
| Pill buttons, 100ms transitions naming their properties | |

The "colourful" brief still holds. What changed: colour now lives in the **accent and the
aurora**, not in glass, glow and shadow on every surface. Flat surfaces make the spectrum
read as a deliberate signal instead of ambient noise.

## Palette

Base (stadium night):
- `pitch-950 #060910` (page), `pitch-900 #0A0F1A`, `pitch-800 #131B29`, card surface `#0B111C`
- `chalk #EEF3F8` (text), `muted #97A6B8` (secondary, AA on dark)

Brand spectrum — a coherent gradient family used together as one identity:
- `turf #3DFF7A` → `aqua #22E3C3` → `azure #4C8DFF` → `iris #9B6BFF` → `magenta #FF5DA2`
- `--brand` (100° across the spectrum) on the wordmark, headline, primary CTAs, step badges,
  and the `card-ring` hairline.

Semantic: `gold #FFCB47` champion only · `magenta` errors · red `#FF4D4D` live pulse only.

## Two constraints worth not re-litigating

1. **Font vars are bridged on `.font-root`, not `:root`.** A `var()` inside a custom property
   is substituted at the element that *declares* it. geist's `.variable` classes live on the
   wrapper `<div>` in `_app.tsx`, so bridging `--font-sans: var(--font-geist-sans)` on `:root`
   resolves against an undefined value, invalidates the declaration, and the whole page
   **silently falls back to serif**. Pages Router can't put the classes on `<html>` because
   next/font isn't supported in `_document`. Hence `.font-root` on the wrapper.
2. **`transpilePackages: ["geist"]` in `next.config.js` is load-bearing.** geist is ESM and
   imports `next/font/local` as a bare directory; Node's ESM resolver rejects directory
   imports and `next build` dies at page-data collection. Routing it through webpack fixes it.

## Contrast

Hero stat labels sit over a floodlit crowd photo. Measured on the rendered page (hide the
text, sample the background): muted label **6.26:1**, chalk stat **13.92:1**. The bottom-up
scrim is what earns that — without it the 11px labels land near 3:1 and fail AA.

## Imagery

Banner photo by Krzysztof Popławski, CC BY 4.0, via Wikimedia Commons. Self-hosted in
`app/public/hero-stadium.jpg`, shared with SharpSignal. Attribution in the footer is a
licence condition, not a courtesy — keep it. No FIFA marks, trophies or player likenesses:
those are trademarked and these are public entries.

## Motion

- **Aurora** — 4 blurred drifting blobs behind all content (`Aurora.tsx`), opacity reduced
  now that surfaces are flat and no longer compete with it.
- **Gradient sheen** — headline animates background-position over 8s.
- Micro-interactions at 100ms ease-out; transitions name their properties, never `all`.
- Everything above collapses under `prefers-reduced-motion`.

## Voice

Plain and specific. "Matchday, not a spreadsheet." Never oversell the tech; say what happens
on the pitch. No em dashes in rendered copy.

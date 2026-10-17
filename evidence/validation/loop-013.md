# Loop 013 — Sky decoration occlusion

Date: 2026-10-17
Repository: https://github.com/teyyara/darboussedra
Branch: `fix/loop-004-architecture-coherence`
PR #5: https://github.com/teyyara/darboussedra/pull/5 (open/draft)

## Source and browser result
- Source commit [`34889ca`](https://github.com/teyyara/darboussedra/commit/34889caf7e4459655028d95f911c6904346b59ca).
- CI run [39058157769](https://github.com/teyyara/darboussedra/actions/runs/39058157769) completed successfully. Artifact ID: `12110771029`.
- TypeScript, tests, production build, and Chromium setup passed.
- Browser review recorded 10/10 correct room arrivals, zero runtime errors, zero notes, WebGL2 available, correct stair ascent/descent pitch, visible navigation hints desktop/mobile, 13 room choices on desktop/mobile, and no horizontal overflow at 390 px.
- Visual inspection of `15a-upper-landing-to-stair.png` shows the nearby wall edge occluding the sun disk; the cloud/sun decoration no longer reads as painted over the adjacent wall. `14-upper-landing-turn.png` and `16-upper-bridge-after-ascent.png` show sky only through open sightlines.
- The exterior shot still doesn't show a clear sun disk: the house largely blocks it. This remains open and prompted Loop 014.

## Change
- `src/house/HouseScene.tsx`: enable depth testing for sun, halo, and cloud meshes so nearby opaque house geometry can occlude them. The dome remains a background layer.

## Boundaries
PR #5 stays open/draft. No merge to `main`, no manual Vercel deployment, no added dependency or remote asset.

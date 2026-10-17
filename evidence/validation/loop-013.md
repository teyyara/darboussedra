# Loop 013 — Sky decoration occlusion

Date: 2026-10-17
Repository: https://github.com/teyyara/darboussedra
Branch: `fix/loop-004-architecture-coherence`
PR #5: https://github.com/teyyara/darboussedra/pull/5 (open/draft)

## Evidence-based diagnosis
- The exterior and mobile frames from [CI run 39056997214](https://github.com/teyyara/darboussedra/actions/runs/39056997214) now show a blue sky, unlike the prior cream-background baseline.
- Frame `15a-upper-landing-to-stair.png` shows the halo and cloud shapes painted over a large nearby wall. This is not a correct sky/architecture relationship: the decorations were bypassing scene depth testing.
- Frame `16-upper-bridge-after-ascent.png` has the visible blue sky and nearby stair/wall surfaces; this is a useful comparison frame for the fix.

## Source change
- [`34889ca`](https://github.com/teyyara/darboussedra/commit/34889caf7e4459655028d95f911c6904346b59ca) modifies `src/house/HouseScene.tsx`.
- Enables depth testing on the sun, halo, and both cloud clusters so walls and roof geometry can occlude them.
- Raises the sun disk/halo to improve the chance that it reads above the roofline in the open exterior view.
- Keeps the sky dome's background treatment unchanged so uncovered sightlines still get a persistent blue-to-warm gradient.
- No package, remote asset, service, room footprint, or camera path changes.

## Validation
- [CI run 39058157769](https://github.com/teyyara/darboussedra/actions/runs/39058157769): `npm run typecheck`, `npm test`, `npm run build`, and Chromium setup passed.
- The step `Capture exterior, walkthrough, floor/map and mobile views` is still running and no new artifact has been published. The new depth interaction and sun position are **not yet visually verified**.

## Boundaries
- PR #5 remains draft/unmerged; `main` unchanged.
- No manual Vercel deployment or promotion.
- Zero new dependencies or external assets.

## Next action
Inspect the new exterior desktop/mobile and stair/landing frames from run 39058157769. The sun and clouds must appear only where the sky is in front of the camera, never across nearby walls; also ensure the sun remains visible above or beside the house. Do not call visual acceptance until those frames are inspected.

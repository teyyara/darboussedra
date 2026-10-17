# Loop 007 — Improve the 3D rendering finish

Date: 2026-10-17
Repository: https://github.com/teyyara/darboussedra
Branch: `fix/loop-004-architecture-coherence`
PR #5: https://github.com/teyyara/darboussedra/pull/5 (open, draft)

## Baseline screenshot findings
Artifact from [browser run 39051454455](https://github.com/teyyara/darboussedra/actions/runs/39051454455) showed:
- Exterior and room surfaces appeared pale and low-contrast; wooden/terracotta materials were not separated clearly enough from plaster.
- Garden trees and terrace planters had conspicuously polygonal foliage.
- Large shadow projection volume likely wasted shadow-map resolution on scene regions that did not need detailed shadows.
- Navigation/browser smoke test still passed: ten room arrivals settled, no page runtime errors, all 13 room destinations present in desktop/mobile maps, and no mobile horizontal overflow at 390px.

## Source change
Commit [`40dfb0c`](https://github.com/teyyara/darboussedra/commit/40dfb0ce8495fe42977072584d20876284c737d5) updates `src/house/HouseScene.tsx`:
- Enable antialiasing in the WebGL renderer.
- Apply `ACESFilmicToneMapping` at neutral exposure to manage highlight roll-off.
- Reduce ambient fill and rebalance hemisphere/directional light so material shading can carry more depth.
- Increase directional shadow map resolution from 1024 to 2048 and focus its shadow-camera volume around the house/garden footprint.
- Increase cylinder/cone/sphere segment counts for the most visible trees and rooftop foliage; no added dependency or asset.

## Validation
[CI run 39051923842](https://github.com/teyyara/darboussedra/actions/runs/39051923842): typecheck, unit tests, and production build all passed. At checkpoint time, Chromium installation was still in progress and the latest browser artifact was not available. Therefore visual success remains unverified.

## Boundary
- No changes to main; PR #5 remains draft.
- No manual Vercel deployment, promotion or rollback command issued. Existing repository integration may automatically update a PR preview.
- No new dependencies, paid assets/services, APIs, storage, analytics or remote model assets.

## Next action
Inspect the latest desktop exterior, living room, rooftop and upper-landing frames from run 39051923842. Compare against the baseline for highlight control, material depth, foliage smoothness, aliasing and shadow quality. Do not merge until browser review is complete.

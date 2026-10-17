# Loop 014 — Sun framing against the exterior sky

Date: 2026-10-17
Repository: https://github.com/teyyara/darboussedra
Branch: `fix/loop-004-architecture-coherence`
PR #5: https://github.com/teyyara/darboussedra/pull/5 (open/draft)

## Diagnosis
- In [CI artifact from run 39058157769](https://github.com/teyyara/darboussedra/actions/runs/39058157769), `01-exterior-desktop.png` shows the sky/cloud backdrop but no clear sun disk because its screen projection overlaps the house roof/wall.
- Stair/landing captures show the depth-tested sun decoration is now occluded at the near wall edge, which is desirable.

## Source change
- Source commit [`b14c7a3`](https://github.com/teyyara/darboussedra/commit/b14c7a3abf5168d210f65462a569d97092f04a2e) changes only the sun disk and halo offset in `src/house/HouseScene.tsx` from `[-38, 24, -60]` to `[-28, 12, -60]`.
- The new offset is intended to place the sun in the visible sky above/right of the facade from the default exterior view. Depth testing remains enabled.

## Validation
- Previous source and browser checks pass in run 39058157769.
- Fresh run [39058615280](https://github.com/teyyara/darboussedra/actions/runs/39058615280) is queued. Loop 014 source checks and visual outcome remain pending until that run completes and its artifact is inspected.

## Boundaries
No dependency/assets, room layout/path changes, merge to main, or manual deployment.

## Next action
Inspect exterior desktop/mobile and landing/stair frames from the fresh artifact. Confirm sun visibility and preserved wall occlusion before calling this loop accepted.

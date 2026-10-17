# Loop 011 — First landing-turn gaze

Date: 2026-10-17
Repository: https://github.com/teyyara/darboussedra
Branch: `fix/loop-004-architecture-coherence`
PR #5: https://github.com/teyyara/darboussedra/pull/5 (open, draft)

## Screenshot-based diagnosis
- Source artifact: [Loop 010 CI run 39052970714](https://github.com/teyyara/darboussedra/actions/runs/39052970714), file `14-upper-landing-turn.png`.
- The browser-review frame state reports camera position `[0.77, 4.65, -4.019]` with direction `[0.004, -0.028, 1]`. This near-perfect forward tangent gaze occurs just after the first lateral step onto the guarded bridge and points directly toward the rear bedroom-wall line.
- Frame `16-upper-bridge-after-ascent.png` continues to show the next stair flight blocking the corridor composition. The prior Loop 010 adjustment was not enough despite passing code checks and browser execution.

## Source change
- [`fb5bbb5`](https://github.com/teyyara/darboussedra/commit/fb5bbb57bf24032fc0dc687087c0631827952703) authors the first side-lane landing pose with an inward look vector `[-0.42, 0.91]` and preserves that direction rather than allowing cameraPath's travel tangent to orient the camera toward the wall.
- Regression test checks the exact first lateral step and requires its look target to point inward and forward. Test coverage also reflects the extra authored turn pose.
- Physical path positions, stair treads, upper bridge and room footprints stay unchanged.

## CI
- [Run 39053389810](https://github.com/teyyara/darboussedra/actions/runs/39053389810) is triggered for this source commit and was queued when this record was saved. No typecheck, unit-test, build or browser result is claimed yet.

## Constraints
- PR #5 remains open/draft; main not merged.
- No manual Vercel deploy.
- No external assets, paid features, extra dependencies, or room/stair geometry changes.

## Next review
Check the fresh `14-upper-landing-turn.png`, `15a-upper-landing-to-stair.png`, and `16-upper-bridge-after-ascent.png`. If the turn still faces a wall, inspect mesh visibility/wall placement at the upper stair boundary before further camera-only tweaks.

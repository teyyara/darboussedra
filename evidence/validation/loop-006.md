# Loop 006 — Improve upper-landing camera composition

Date: 2026-10-17
Repository: https://github.com/teyyara/darboussedra
Branch: `fix/loop-004-architecture-coherence`
PR: https://github.com/teyyara/darboussedra/pull/5 (open/draft; not merged)

## Evidence
- Baseline browser artifact: [run 39050232013](https://github.com/teyyara/darboussedra/actions/runs/39050232013)
- The `14-upper-landing-turn.png` frame still gave excessive screen area to the adjacent bedroom side wall despite the foot path reaching the correct protected side lane.
- The baseline browser report recorded 10/10 tested arrivals settled, no runtime errors, 13 desktop and mobile destination buttons, and no horizontal overflow at a 390px viewport. This indicates a remaining visual composition defect, not a broad runtime/navigation failure.

## Implementation
- Commit [`b83b838`](https://github.com/teyyara/darboussedra/commit/b83b8387dbfcfefe32bd74cc4c69b0c46edf69e0) added explicit heading preservation to camera-path waypoints and aimed the first two upper-corridor views inward toward the central hall. The camera's world position remains on the protected side lane.
- Commit [`e0c1bc6`](https://github.com/teyyara/darboussedra/commit/e0c1bc60a744bf9f56b420f185fe3301583a9708) corrected the old straight-ahead assertion to check the deliberate inward look direction.
- No architecture dimensions or room registry locations were changed in this loop.

## Validation
- CI run [39051454455](https://github.com/teyyara/darboussedra/actions/runs/39051454455): typecheck PASS, unit tests PASS, production build PASS.
- At the time of this checkpoint, the browser capture step was still in progress and no new artifact was available. The post-fix visual result is not certified.

## Boundary
- PR #5 remains draft and unmerged; main is unchanged.
- No direct Vercel deployment or promotion command was invoked. The repository's configured Vercel integration can automatically create/update PR previews when branch commits are pushed.
- No dependency, backend, database, storage or paid service was added.

## Next action
After run 39051454455 finishes, inspect `14-upper-landing-turn.png` and `16-upper-bridge-after-ascent.png`. If the view remains wall-dominated, make the next change to the physical upper-landing/bedroom corridor proportions, not another isolated camera-yaw tweak.

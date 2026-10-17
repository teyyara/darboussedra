# Loop 010 — Upper-landing camera composition

Date: 2026-10-17
Repository: https://github.com/teyyara/darboussedra
Branch: `fix/loop-004-architecture-coherence`
PR #5: https://github.com/teyyara/darboussedra/pull/5 (open, draft)

## Evidence-first diagnosis
- Baseline: [CI run 39052442310](https://github.com/teyyara/darboussedra/actions/runs/39052442310), artifact `darboussedra-visual-review`.
- `15a-upper-landing-to-stair.png` shows a return-travel camera at eye height looking along the side lane into a broad blank surface instead of showing the lower stair approach.
- `16-upper-bridge-after-ascent.png` shows the roof-stair flight taking over the forward view as the camera emerges onto the narrow upper bridge. The walking positions themselves remain on the bridge, but the gaze is too tangent-only and exposes little of the stairwell.

## Source changes
- [`1b89548`](https://github.com/teyyara/darboussedra/commit/1b895480bc625763fdd9277aabf7767f30a7f4c9) changes `cameraPath.ts` so upper side-lane poses include a moderate inward glance toward the stair opening.
- `reverseRoute` now treats authored `preserveHeading` waypoints specially: it flips the fore/aft look direction when reversing travel but keeps the inward lateral component. This prevents the return journey from turning its gaze outward into the wall.
- Added regression coverage in `cameraPath.test.ts` for forward and reverse upper-bridge views.
- Camera positions, stair positions, room footprints, and doorway geometry are unchanged. No dependencies added.

## Previous validated loops
- [Loop 007, run 39051923842](https://github.com/teyyara/darboussedra/actions/runs/39051923842): rendering changes passed browser review; 10/10 arrivals, zero runtime errors, WebGL2 present, stair pitch correct.
- [Loop 008, run 39052224425](https://github.com/teyyara/darboussedra/actions/runs/39052224425): source and browser capture passed; kitchen appliance is clearer.
- [Loop 009, run 39052442310](https://github.com/teyyara/darboussedra/actions/runs/39052442310): source and browser capture passed; subtle baseboards are visible without bridging door openings.

## Validation status for this loop
- [CI run 39052970714](https://github.com/teyyara/darboussedra/actions/runs/39052970714) is running for `1b89548`; it was at dependency installation when this note was written. No claim of current test or screenshot success until run completion.

## Boundaries
- PR #5 is still open/draft; no merge to main.
- No manual Vercel deployment.
- No dependency, room-footprint or stair-geometry change.

## Next action
Review `14-upper-landing-turn.png`, `15a-upper-landing-to-stair.png` and `16-upper-bridge-after-ascent.png` from the newest completed visual artifact. If the view still points into a wall, adjust only the authored camera gaze on the upper lane and rerun browser capture before touching the architecture itself.

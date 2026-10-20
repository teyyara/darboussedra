# Loop 092 — Stair camera height and level visibility

Date: 2026-10-18
Repository: https://github.com/teyyara/darboussedra
Branch: fix/loop-064-moroccan-exterior-and-layout
State: source checkpoint committed; CI pending

## Evidence and diagnosis

The Loop 090 browser artifact from [run 39166944037](https://github.com/teyyara/darboussedra/actions/runs/39166944037) includes `13b-stair-ascent-landing-clearance.png`, which is almost fully occupied by an opaque wall. The camera path uses a 1.51m eye offset on stair flights (`STAIR_HEAD_HEIGHT`), but `getCameraZoneForPosition` estimated floor height by subtracting 1.65m everywhere. Near the upper approach, that 14cm difference delays the change to upper-storey visibility.

Loop 091 commit `a0c617a` also re-aims the late-ascent sightline across the open bridge. Its source typecheck/tests/build passed, but the subsequent browser capture has remained in progress without a new artifact, so its rendered result is not treated as confirmed.

## Implementation

- Add a guarded estimate that recognizes positions on the authored ground or roof stair only when lateral position, Z span and expected eye elevation agree.
- Use the stair camera's 1.51m offset for those points; keep 1.65m for ordinary room/corridor positions.
- Preserve the existing hatch-boundary rule so eye height alone cannot expose a sky-only frame.
- On the final-tread clearance band, turn gently toward positive Z while keeping the sightline inside the central 1.3m opening; avoid looking diagonally into the bridge soffit before reaching the side lane.
- Add regression tests for tread-height zone classification, a ground-zone mid-flight point, positive-Z landing gaze, horizontal opening clearance and shallow upward pitch.

## Scope

This loop does not alter the floor plan, doors, wall geometry, stair positions, props or decorations. No paid dependencies/assets or manual deployments. The new CI result and a fresh visual artifact are still required before claiming rendered acceptance.

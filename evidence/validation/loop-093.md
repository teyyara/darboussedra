# Loop 093 — Upper-landing camera direction

Date: 2026-10-18
Repository: https://github.com/teyyara/darboussedra
Branch: fix/loop-064-moroccan-exterior-and-layout
State: source checkpoint committed; CI pending

## Observed defect
The available stair-ascent capture shows a mostly blocked view of the ceiling/wall during the approach to the upper landing. The camera's exact stair-top pose was generated from the route tangent; because the next movement is lateral, that pose can point across the narrow stair lane rather than into the open upper bridge.

## Change
- Replace the automatic tangent-facing top pose with an explicit forward (+Z), shallow downward gaze into the upper bridge.
- Preserve the route's physical stair and landing coordinates. The change affects only camera orientation; it adds no objects, decor, dependencies or assets.
- Keep the reverse-route behavior, which aims into the stairwell for descent.

## Regression coverage
The camera-path test now finds the exact upper endpoint of the lower stair and checks that it is reached at the authored eye height, looks forward into the bridge, keeps a slight downward pitch, and does not aim laterally into the wall.

## Validation
Typecheck, tests, build, and a new Chromium screenshot artifact must pass before visual acceptance. The prior Loop 092 browser capture had stalled without producing a fresh artifact; this change is submitted as a new checkpoint and must not be treated as a proven visual fix until the new run finishes.

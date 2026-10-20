# Loop 090 — Camera-phase capture race repair

Date: 2026-10-18
Repository: https://github.com/teyyara/darboussedra
Branch: fix/loop-064-moroccan-exterior-and-layout
Status: source changes checkpointed; CI pending

## Evidence from the prior run

GitHub Actions run [39163754448](https://github.com/teyyara/darboussedra/actions/runs/39163754448) passed TypeScript, unit tests, and the production build. Chromium visual review failed: three route-phase waits timed out and their screenshots reused the same intermediate camera pose. The report also captured lower-stair clearance before the route's upward look-ahead activated.

## Changes in this loop

- Replace the single shared camera-hold boolean with per-screenshot tokens. Camera travel remains paused while any active screenshot owns a token; one task cannot accidentally release a different task's hold.
- Release only the current capture's token from a `finally` block, including after a timeout.
- Align the upper landing match window to the actual right-side bridge lane and widen it slightly to avoid missing a short still frame.
- Move the clearance screenshot later on the lower flight and separate the first roof stair treads from the later hatch-clear window.
- Add regression assertions for these exact phase boundaries.

## Guardrails

No furniture, objects, wall art, rugs, garden or rooftop props were added. No paid dependency, service, asset, or manual deployment was added. Do not merge to `main` until the fresh automated checks and visual-review artifact pass. Do not claim browser/rendered acceptance until the new artifact is inspected.

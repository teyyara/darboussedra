# Handoff — Dar Boussedra

**STATUS: CHECKPOINTED / IN PROGRESS. Loop109 render-cost optimization committed; validation pending.**

## Candidate
- Branch: fix/loop-064-moroccan-exterior-and-layout
- Loop109 source commit: 46503a0e292e7389b5e8e47916ba2e08b470e3a2
- PR #7: https://github.com/teyyara/darboussedra/pull/7
- Main unchanged; AEOS v4.1 remains canonical.

## Loop108 evidence
Workflow 39346813018: https://github.com/teyyara/darboussedra/actions/runs/39346813018
Artifact 12232020376: https://github.com/teyyara/darboussedra/actions/runs/39346813018/artifacts/12232020376
SHA-256: 98dca1d627dc715e130d2c6410ca472d8674a0f881052439a7b6a0837650ad1b
Typecheck, expanded tests, build and Chromium passed. Browser review failed: the lower-stair-midflight phase timed out; clearance, upper side-lane, roof flight and hatch phases were skipped; descent timed out; 13/14 arrivals settled. Fallback frame at timeout [0.659,1.65,1.335], routeProgress 0/56, speed1.587, remaining distance28.329, distance1.534 to first waypoint. Later fallback frames recorded 8/56, 22/56, 29/56, 46/56, then arrival56/56. The frames are not valid target-phase evidence.

## Loop109 correction
Commit 46503a0e292e7389b5e8e47916ba2e08b470e3a2 targets renderer cost rather than changing camera geometry:
- DPR becomes 1 during navigation; higher device-pixel ratio is restored when settled.
- Directional shadow map drops from 2048² to 1024² during motion.
- Shadow-map autoUpdate is disabled while the camera travels, and the shadow map is refreshed when the transition or camera visibility zone changes. Normal automatic updates resume at rest.
- Pure unit tests verify the shadow and frame-loop policy.

## Exact next action
Run full CI on the final memory-aware head. Require all source gates and then a browser report with every phase marked matched, all 14 arrivals settled, no runtime errors, mobile overflow false and valid frames 13/13b/14/16/17 at their actual positions/progress. Do not judge framing from a fallback frame.

## Constraints
No decoration, new dependency, main merge while validation is failing/unknown, or manual Vercel deployment.

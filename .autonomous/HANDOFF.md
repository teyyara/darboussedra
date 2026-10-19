# Handoff — Dar Boussedra

**STATUS: CHECKPOINTED / IN PROGRESS. Loop 103a source repair committed; fresh validation pending.**

## Candidate
- Branch: fix/loop-064-moroccan-exterior-and-layout
- Source commit: 81210677c12b1e1a10a521af6abca537f29b42e0
- Open PR #7: https://github.com/teyyara/darboussedra/pull/7
- Main baseline remains e06af00a049eb72b173295438bbeb8e384c6fef5.
- AEOS v4.1 strategy/state is canonical.

## Loop 102 visual baseline
Workflow 39185169298: https://github.com/teyyara/darboussedra/actions/runs/39185169298
Artifact 12157699074: https://github.com/teyyara/darboussedra/actions/runs/39185169298/artifacts/12157699074
All 21 screenshots saved; 14/14 room arrivals, no runtime errors, mobile overflow false, and roof-stair/hatch images 16/17 captured actual distinct positions. Visual acceptance failed because the landing-clearance and anticipatory-turn predicates were false.

## Loop 103 validation
Run 39186386526: https://github.com/teyyara/darboussedra/actions/runs/39186386526
Typecheck passed, but tests failed: cameraPath.test.ts 8 failures, 131 passed / 8 failed across 22 files, build and browser were skipped.
- Six failures enforced old outward/neutral bridge gaze.
- One showed the upward blend began too late for every pose in the clearance band.
- One heading-alignment failure was at an intended clearance look-ahead pose.

## Loop 103a correction
Commit 81210677c12b1e1a10a521af6abca537f29b42e0 updates bridge-gaze assertions to require a bounded inward glance (target 0.2–0.6m left of the side lane) while preserving positive-Z forward bridge focus and camera-position safety. It starts the easing 2.45m before the last tread, keeps it active through 2cm before the end, and uses a shallow 0.20 vertical blend so the whole upper-clearance band can clear the fascia without over-pitching.

## Exact next action
Inspect the Foundation run for the final branch head. Require typecheck, all tests, and build to pass. Then inspect screenshots 13b/14/16/17 and the browser report: both clearance predicates and upperLandingAiming must be true; the upper-landing view must reveal the stair opening rather than a near-field wall; images 16/17 must remain real, independent roof/hatch captures.

## Constraints
No decorations, paid dependencies, merge to main while acceptance is failing/unknown, or manual Vercel deployment.

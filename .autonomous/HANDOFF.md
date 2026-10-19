# Handoff — Dar Boussedra

**STATUS: CHECKPOINTED / IN PROGRESS. Loop107 phase-window improvement committed; validation pending.**

## Candidate
- Branch: fix/loop-064-moroccan-exterior-and-layout
- Source commit: ff06bf663adff19640fd5b967deda0e2d499fbd8
- PR #7: https://github.com/teyyara/darboussedra/pull/7
- Main stays unchanged; AEOS v4.1 remains canonical.

## Loop106a evidence
Workflow 39191552660: https://github.com/teyyara/darboussedra/actions/runs/39191552660
Artifact 12160745173: https://github.com/teyyara/darboussedra/actions/runs/39191552660/artifacts/12160745173
Type-check, expanded 145-test suite and build passed. Browser gate failed because the midflight capture timed out; later screenshots were explicitly skipped. Those frames are not valid camera evidence.
Actual reported fallback samples: phase 13 start [0.662,1.65,1.341], progress 0/56; position [0,2.862,-1.924], progress 8/56; upper side-lane [0.925,4.65,-3.368], progress 22/56. The latter two positions demonstrate the old phase windows excluded valid positions on the route.

## Loop107 correction
Source commit ff06bf663adff19640fd5b967deda0e2d499fbd8 broadens the midflight camera window to X [-0.25,0.25], Y [2.7,3.95], Z [-3.4,-1.2] and broadens the upper side-lane Z window to [-4.5,-2.25]. Both route readiness and phase matching now use 100ms polling rather than RAF-only polling. Timeout values: 90 seconds for lower midflight and 60 seconds for each subsequent ascent/roof phase, still bounded by the 15-minute workflow job limit. Tests assert the observed positions fit the intended windows.

## Exact next action
Run full source/script tests, build and browser review. Require every phaseCaptureResults entry to be matched; no timeout/skip. Confirm screenshot positions/progress match their intended phase before evaluating the camera framing.

## Constraints
No decor, no paid dependencies, no main merge while acceptance is failing/unknown, no manual Vercel deployment.

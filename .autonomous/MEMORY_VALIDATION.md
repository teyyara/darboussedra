# Memory Validation

## Strategy and cold-start
- Full supplied v4.1 strategy stored in .autonomous/STRATEGY.md and strategy-history/versions/v4.1.md (65,233 characters on readback); master continue/engineering loop/final principle markers verified.
- All canonical memory paths exist, STATE.json parses, version is 4.1.
- Cold-start recovery: PASS; project stack, PR/branch, permanent destinations, constraints, latest browser failure and next action reconstructed from repository files.
- Legacy .aeos/state.json is marked historical loop-050 state; .autonomous/STATE.json is authoritative.

## Loop 098/099
- Run 39181779811 on commit 1d9f0cdb5d5bd8bb2e2081501e9cec15dea9d72e: typecheck PASS; tests FAIL (131 passed, 2 failed); build/browser review skipped.
- Root cause: existing assertions still required an entrance target on the same X axis and a focus inside the entry, contradicting the intended gaze through the real portal into Family Table.
- Source commit 10ff07e0882133bb68a31c8333c90e4d64340719 revises assertions to enforce the intended sightline and the same doorway/room bounds. New candidate validation is **NOT RUN / PENDING**.


## Loop 101/102 cold-start and validation record
- Canonical AEOS v4.1 and project memory remained present after Loop 102. Current STATE.json records source commit 5e294d5a96444ffdaf56edb8f022a30723c736a5 and latest validation pending.
- Workflow 39184178983 on prior head a4304e2790cc145111967608736e3ba18a452787: typecheck, tests, build and Chromium passed; browser review failed. Artifact 12157498087 / SHA-256 a53e368cd993b25a2cb61e18702396c10d3e78171fd86effd98b2d8716ad6cd5.
- Captures 16/17 were absent. Frame telemetry for 14/16/17 indicated routeProgress 22/56 and the same upper-side camera pose [0.925,4.65,-2.942]; one predecessor token remained active with ~45.3s.
- Loop 102 source commit 5e294d5a96444ffdaf56edb8f022a30723c736a5 sequences phase watchers, starts the next after screenshot completion and before releasing predecessor hold, and prevents matching while predecessor token remains active. Source checks and a fresh browser artifact are pending.

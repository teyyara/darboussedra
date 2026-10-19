# Handoff — Dar Boussedra

**STATUS: CHECKPOINTED / IN PROGRESS. Latest candidate browser review FAILS.**

## Source of truth
- Candidate branch: fix/loop-064-moroccan-exterior-and-layout
- Source commit inspected: 4acf977818f22ff486ff82636f146ea6de2ed28f
- Open PR: https://github.com/teyyara/darboussedra/pull/7
- Main baseline: e06af00a049eb72b173295438bbeb8e384c6fef5
- Canonical state: .autonomous/STATE.json. .aeos/state.json is a retained, explicitly historical loop-050 snapshot.

## Completed
- Reconciled main, candidate PR and validation history through loop 097.
- Inspected artifact 12154942342 from workflow 39177873937.
- Migrated the durable memory structure to AEOS v4.1. Product source and CI/release gates were not edited in this initialization checkpoint.
- Perform the required cold-start memory reconstruction before further product-code changes.

## Actual evidence
Workflow: https://github.com/teyyara/darboussedra/actions/runs/39177873937
Artifact: https://github.com/teyyara/darboussedra/actions/runs/39177873937/artifacts/12154942342
ZIP SHA-256: 8b50f020216fa7075a105b0e8ab4d829d0723468654fbb139a08c386c46e779f
Typecheck, unit tests, build and Chromium install passed; browser review failed. There were 14/14 room arrivals but a 45-second screenshot timeout, three camera phase timeouts and false stair-top camera checks. Entrance still looks like an aligned tunnel; stair-top view is wall/fascia dominated.

## Constraints
No new decorations, paid dependencies/services, manual Vercel deployment or merge to main while validation fails. Do not treat old preview status as proof of the latest candidate.

## Next bounded action
After cold-start recovery, adjust only the entrance destination camera pose in src/house/rooms.ts to avoid aligned doorframes while remaining within entrance bounds. Add a specific geometry/camera regression test, then run full source validation and inspect a fresh browser artifact.

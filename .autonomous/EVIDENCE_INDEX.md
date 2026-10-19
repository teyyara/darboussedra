# Evidence Index

## Candidate review
- Candidate source: 4acf977818f22ff486ff82636f146ea6de2ed28f
- Workflow: https://github.com/teyyara/darboussedra/actions/runs/39177873937
- Artifact: https://github.com/teyyara/darboussedra/actions/runs/39177873937/artifacts/12154942342
- ZIP SHA-256: 8b50f020216fa7075a105b0e8ab4d829d0723468654fbb139a08c386c46e779f
- PASS: typecheck, tests, build, Chromium install; 14/14 room arrivals.
- FAIL: screenshot timed out at 45000ms; upper-side-landing, roof-stair-flight, roof-hatch-clear timed out; stair anticipation/clearance values false.
- Inspected images: 02-entrance-eye-level.png; 13b-stair-ascent-landing-clearance.png; 01-exterior-desktop.png.

## Previous evidence
- PR #6 run 39080362653 recorded a pass on older baseline 98ea0a5ff04d2468faaf1d747f66b317452b7784.
- Run 39166944037 passed key route/camera phases on earlier source 5dac21368616957aea3513c304de63cf97960d2e.

## Limitations
Latest candidate visual quality is not certified; a preview Ready status may refer to a stale SHA; no manual deployment was attempted. Visual review remains a structured human-perspective assessment.


## Loop 098 — entrance framing
- Source commit: 4fecdacd646ef616cafabbc803c23ad08cb60149.
- Change: off-axis eye-level entrance camera and regression assertions.
- Validation: pending new Foundation checks triggered by final branch update.
- Prior baseline artifact: workflow 39177873937 / artifact 12154942342 / SHA-256 8b50f020216fa7075a105b0e8ab4d829d0723468654fbb139a08c386c46e779f. It proves the old defect, not whether Loop 098 fixed it.


## Loop 098/099 — entrance sightline regression
- Loop 098 source commit: 4fecdacd646ef616cafabbc803c23ad08cb60149.
- Run 39181779811: https://github.com/teyyara/darboussedra/actions/runs/39181779811, head 1d9f0cdb5d5bd8bb2e2081501e9cec15dea9d72e.
- Result: typecheck PASS; tests FAIL with 131 passed / 2 failed in cameraPath.test.ts. Build and browser capture were skipped; no screenshots were produced.
- Root cause and correction documented in .autonomous/FAILURES.md; source commit 10ff07e0882133bb68a31c8333c90e4d64340719 revises tests rather than removing the doorway/bounds checks. Re-validation pending.


## Latest browser artifact before Loop 100
- Workflow 39181992857: https://github.com/teyyara/darboussedra/actions/runs/39181992857
- Artifact 12156503344: https://github.com/teyyara/darboussedra/actions/runs/39181992857/artifacts/12156503344
- ZIP SHA-256: ece0411ee34009fd6e0fd81cfda97cf39d0298a8ac969312b9e43811c78a5127
- Source gates: PASS (typecheck, 133 tests, build, Chromium); 14/14 arrivals and no runtime errors.
- Caveat: the roof-stair-flight and roof-hatch-clear images timed out at the same stale position [0.249,4.65,0.923], route progress 27/56. Green workflow result is not a full visual pass.
- Loop 100 source commit 9021c8b2f8002faccddc0fcc38e9f606b4a7fb3b introduces hold expiry and telemetry; validate with fresh images.

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

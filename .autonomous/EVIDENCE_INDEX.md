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


## Loop 100 failure / Loop 101 correction
- Workflow 39182940594: https://github.com/teyyara/darboussedra/actions/runs/39182940594
- Artifact 12157625304: https://github.com/teyyara/darboussedra/actions/runs/39182940594/artifacts/12157625304
- SHA-256: f70e6f673979f213d1f3566d6877dc2c69b89ec55a9884c656f5a886490a7386
- Source checks passed (137 tests, production build, Chromium), but browser review failed with two screenshot and two phase timeouts. Captures 16/17 were absent.
- Both fallback frame states showed [0.925,4.65,-2.98], progress 22/56, one hold token, ~43.7s remaining. The global deadline was renewed repeatedly.
- Loop 101 source commit 0f638eb74f160c408e2d68275edac0a905e30220 uses per-token deadlines and one-shot matching. Fresh validation is pending.


## Loop 101 browser failure / Loop 102 correction
- Workflow 39184178983: https://github.com/teyyara/darboussedra/actions/runs/39184178983
- Artifact 12157498087: https://github.com/teyyara/darboussedra/actions/runs/39184178983/artifacts/12157498087
- ZIP SHA-256: a53e368cd993b25a2cb61e18702396c10d3e78171fd86effd98b2d8716ad6cd5
- Source gates passed; browser gate failed. 19 images saved; images 16/17 absent after phase/screenshot timeouts.
- Frames 14/16/17 all remained at [0.925,4.65,-2.942], routeProgress 22/56. Token 14-upper-landing-turn.png remained active with ~45.3s left.
- Diagnosis: all phase timers started at route start and expired during an earlier screenshot hold.
- Loop 102 source commit 5e294d5a96444ffdaf56edb8f022a30723c736a5 makes watchers sequential while arming the next before release. Revalidation pending.


## Loop 102 visual acceptance baseline
- Workflow 39185169298: https://github.com/teyyara/darboussedra/actions/runs/39185169298
- Artifact 12157699074: https://github.com/teyyara/darboussedra/actions/runs/39185169298/artifacts/12157699074
- SHA-256: a53e368cd993b25a2cb61e18702396c10d3e78171fd86effd98b2d8716ad6cd5
- Source gates passed (22 test files / 138 tests, build, Chromium). 21/21 screenshots saved, 14/14 room arrivals, no runtime errors and mobile overflow false.
- Browser gate failed because the late-ascent clearing and turn predicates were false. Images 16/17 showed distinct real roof-stair/hatch-clear positions.
- Loop 103 source commit 87d5d43ddfe22cfe74ae15772fb811f1ea11b334 changes the turn and inward gaze; fresh validation pending.


## Loop 103 visual baseline and Loop 103a repair
- Run 39185169298: https://github.com/teyyara/darboussedra/actions/runs/39185169298
- Artifact 12157699074, SHA a53e368cd993b25a2cb61e18702396c10d3e78171fd86effd98b2d8716ad6cd5. All 21 screenshots captured; browser gate failed the landing predicates only.
- Run 39186386526: https://github.com/teyyara/darboussedra/actions/runs/39186386526. Typecheck passed; cameraPath.test.ts failed 8 assertions, other 21 test files passed; build/browser skipped.
- Loop 103a source commit 81210677c12b1e1a10a521af6abca537f29b42e0: inward side-lane target assertions, earlier and slightly shallower ascent look-ahead, clearance blend continues through last tread. Validation pending.


## Loop 103b validation next
- Run 39186716661: typecheck pass; 137/139 tests pass; only cameraPath.test.ts fails two assertions; browser/build skipped.
- Loop 103b source commit bf7be9496af8121116e70450089332a9588412f6 corrects the final-tread direction assertion and the geometry-defined late-clearance exception. Fresh run/artifact is required before marking fixed.


## Loop 103b baseline / Loop 104 candidate
- Workflow 39186902422: https://github.com/teyyara/darboussedra/actions/runs/39186902422
- Artifact 12158258421; SHA-256 2d392ab1cc39bb9613ec40fc8c2df8aafc8ee037f6f9cad5cec9842800b087b6.
- All source gates passed; 21 screenshots, 14/14 arrivals, no runtime errors/mobile overflow. Images 16/17 are distinct, real roof/hatch positions.
- Visual gate failed upper bridge alignment; direction X=-0.339, Y=-0.227, Z=0.913. Frame13b shows near-field wall; frame14 the stair underside.
- Loop 104 commit dd44aec75ab73fc0d4ce5f7e05afc6157c181c83 softens gaze; new artifact is required.


## Loop 104 invalid artifact / Loop 105 validation
- Workflow 39187622415: https://github.com/teyyara/darboussedra/actions/runs/39187622415
- Artifact 12158767554: https://github.com/teyyara/darboussedra/actions/runs/39187622415/artifacts/12158767554
- Typecheck/tests/build passed, browser review failed. Frames 13b/14/16/17 all fallback at final rooftop position [3.45,7.2,0.5], route 56/56 after clearance phase miss; ignore for geometry conclusions.
- Loop 105 source commit 2cf72fb2001e05a1e8db90b513ebe3e2ae519a87 adds wide clearance phase, 30s cap, explicit skipped/matched statuses, and script phase tests to npm test.


## Loop105a
- Run 39190470096: typecheck passed; 144 passed/1 failed in a newly enabled script phase test. Build/browser skipped.
- Source commit 917a0b93674d505f63e1cebb872923579c615f5b moves positive hatch-clear fixture to x=1.05m, preserving phase rules. New run and browser artifact required.


## Loop105a / Loop106a
- Run39190695353: https://github.com/teyyara/darboussedra/actions/runs/39190695353
- Artifact12159956771: source gates passed; browser phase1 timed out and later phases were marked skipped. Initial fallback had destination family-table, route 0/0. Not usable for camera assessment.
- Source 597bc45107c04a921f5edbdda8c6df6c05a2bbe6 delayed phase watcher until route became active.
- Source a633263bf94ee4a8a7b07d454fbc68b8634ae944 corrected the regex escapes. Validate fresh head before camera changes.

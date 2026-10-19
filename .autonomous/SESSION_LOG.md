# Session Log

## 2026-10-19T01:30:00+01:00 — Adopt methodology v4.1 and reconcile candidate
- Confirmed main baseline e06af00a049eb72b173295438bbeb8e384c6fef5 and PR #7 source head 4acf977818f22ff486ff82636f146ea6de2ed28f.
- Read the repair roadmap and history through loop 097.
- Inspected visual artifact 12154942342 from run 39177873937 (digest recorded in EVIDENCE_INDEX.md).
- Source checks passed but visual review failed.
- Migrated repository memory to v4.1; no product code, validator criteria, trusted workflow, deployment or decorations were changed.
- Cold-start recovery test must run before next product edit.


## 2026-10-19 — Loop 098 / cold-start validation
- Reconstructed the project using only committed canonical memory after strategy migration; cold-start recovery PASS.
- Added off-axis entrance destination camera pose and regression tests in source commit 4fecdacd646ef616cafabbc803c23ad08cb60149; appended Loop 098 to AEOS_STATUS.md.
- Candidate validation was NOT RUN at checkpoint writing; a new workflow is expected on the final branch update. Inspect it before further product edits.
- No geometry changes, new decorations, paid services, manual deployment or main merge.


## 2026-10-19 — Loop 099 regression-contract correction
- Run 39181779811 on head 1d9f0cdb5d5bd8bb2e2081501e9cec15dea9d72e: typecheck PASS; tests FAIL (131 pass, 2 fail); build and browser capture skipped. Exact failures were obsolete expectations of an X-centered entrance gaze and focus remaining inside the entrance footprint.
- Updated the test contract to require a diagonal entrance sightline through the shared portal into Family Table; preserves camera bounds, focus-room bounds and aperture crossing constraints.
- Source checkpoint 10ff07e0882133bb68a31c8333c90e4d64340719; validation NOT RUN for this revision. Inspect fresh CI before more product edits.


## 2026-10-19 — Loop 100 / review hold safety fuse
- Inspected workflow 39181992857 and artifact 12156503344 (SHA-256 ece0411ee34009fd6e0fd81cfda97cf39d0298a8ac969312b9e43811c78a5127).
- Source gates passed: typecheck, 22 test files / 133 tests, build, Chromium install. 14/14 room arrivals, no runtime errors, mobile has no horizontal overflow at 390px.
- Visual review remains incomplete: roof-stair-flight and roof-hatch-clear reused the same stale waypoint (27/56).
- Source commit 9021c8b2f8002faccddc0fcc38e9f606b4a7fb3b adds bounded expiry to review-only camera holds, unit coverage and hold state telemetry; no architecture, decor or dependencies changed.
- Next: inspect the fresh report before another product-code change.


## 2026-10-19 — Loop 101 / independent hold expiries
- Run 39182940594 failed its browser gate after typecheck, 137 tests, build and Chromium passed. Artifact 12157625304 SHA-256 f70e6f673979f213d1f3566d6877dc2c69b89ec55a9884c656f5a886490a7386.
- Two later phase screenshots failed; same upper-landing frame showed one hold token and ~43.7s remaining. The shared deadline was being renewed while the matching token remained true.
- Source commit 0f638eb74f160c408e2d68275edac0a905e30220 switches to per-token deadlines and a one-shot matching guard, with independent cleanup and unit tests.
- Fresh full/browser validation pending; no architecture or decor changed.


## 2026-10-19 — Loop 101 per-token hold, syntax correction
- Run 39182940594 failed browser review after source checks passed (137 tests/build/Chromium); artifact 12157625304 shows both roof-phase captures fell back to the same upper-landing state, one token and ~43.7s remaining.
- Loop 101 changed from a shared renewable deadline to per-token expiry and one-shot matched-token claiming.
- Run 39183973522 failed at typecheck: TS1128/TS1434 at lines 41–47 of cameraTiming.ts, because the text replacement left the previous helper's return/body tail.
- Corrective source commit bfbf926e4c46bdd06b18356a8b153ba09d061e19 removes that orphaned tail. Fresh validation is pending; no geometry or decor was changed.


## 2026-10-19 — Loop 101 syntax correction follow-up
- Run 39183973522 failed at typecheck with TS1128/TS1434; the first edit left an orphaned previous helper body.
- Run 39184079432 failed at typecheck with TS1005 expected } after that orphan was removed; the new helper closure had also been removed.
- Source commit 4335a37895f2a56595cb97b43b11c3da78808358 restores the final closing brace. No unit or browser results exist for this revision yet.
- Next: inspect new CI, first typecheck, then tests/build, then the visual artifacts after a successful browser capture.


## 2026-10-19 — Loop 102 / sequential browser phase capture
- Run 39184178983 on head a4304e2790cc145111967608736e3ba18a452787: typecheck/tests/build/Chromium passed; browser review failed.
- Artifact 12157498087 digest a53e368cd993b25a2cb61e18702396c10d3e78171fd86effd98b2d8716ad6cd5. 19 screenshots saved; images 16/17 missing. Later phase waiters timed out while the upper-side capture token remained live at ~45.3s and position [0.925,4.65,-2.942], progress 22/56.
- Loop 102 source commit 5e294d5a96444ffdaf56edb8f022a30723c736a5 sequences waiters: next phase starts after previous screenshot, before current token release, and is blocked from matching until the previous token clears. Phase timeouts unchanged.
- Fresh validation pending; no house geometry/decor changed.


## 2026-10-19 — Loop 103 / ascent turn and inward landing view
- Run 39185169298 passed typecheck, 22 test files / 138 tests, production build and Chromium setup. All 21 screenshots were saved, with 14/14 arrivals and no runtime errors, but the visual gate failed on the late-ascent clearance and anticipatory turn predicates.
- Artifact 12157699074 shows true, separate roof-stair and hatch-clear frames. Its hash is a53e368cd993b25a2cb61e18702396c10d3e78171fd86effd98b2d8716ad6cd5.
- Visual diagnosis: image 13b had the stair fascia covering almost the whole view as the camera swung from -Z to +Z too abruptly. Image 14 showed a near-field wall because its side-lane gaze pointed outward.
- Loop 103 source commit 87d5d43ddfe22cfe74ae15772fb811f1ea11b334 blends the late stair turn over ~1.6m, keeps a flightward Z component, adds modest upward look-ahead, points the bridge gaze inward (-X), narrows the capture zone and adds tests. New validation pending.


## 2026-10-19 — Loop 103a / inward gaze and full clearance band
- Run 39186386526: typecheck passed; tests failed 8 assertions in cameraPath.test.ts (21 test files passed; 131 passed / 8 failed); build/browser skipped.
- Six failures were old assertions that insisted side-lane camera targets stay at or to the right of their position. This contradicts the screenshot-based finding that a near-field outer wall dominates the upper-landing view, so these are updated to require a bounded inward glance while preserving positive-Z bridge focus and safe lane positions.
- The late-ascent clearance predicate also failed for a pose in its intended capture band. Start turn earlier (2.45m before top), end only 2cm before the flight endpoint, and limit upward amplitude to a 0.20 horizontal blend ratio so the near-top frames remain shallow and clear the fascia.
- Source commit 81210677c12b1e1a10a521af6abca537f29b42e0. Fresh validation pending; no decor or structural geometry change.


## 2026-10-19 — Loop 103b / final-clearance assertion
- Run 39186716661: typecheck passed, 137/139 unit tests passed. Only two cameraPath assertions failed, so build/browser were skipped.
- One test expected +Z gaze while the camera was still on the final treads. The intended route retains a view down the flight until the top landing and then turns toward the bridge; the existing landing-specific test keeps that +Z contract.
- The tangent-alignment exception used a target-based and too-narrow range for the 2.45m late clearance blend. Loop 103b bases the exception on the geometric clearance zone while retaining separate aim assertions.
- Source commit bf7be9496af8121116e70450089332a9588412f6; fresh validation pending.


## 2026-10-19 — Loop 104 / reduced lateral stair glance
- Run 39186902422 / artifact 12158258421: source gates passed, all 21 screenshots saved, 14/14 arrivals, no runtime errors/mobile overflow. Actual roof stair/hatch frames 16/17 present.
- Browser gate failed upperLandingAiming.looksAlongBridge; direction [-0.339,-0.227,0.913]. Frame13b wall-dominated, frame14 too far inward at the stair underside. Both ascent aim predicates passed.
- Source commit dd44aec75ab73fc0d4ce5f7e05afc6157c181c83 changes lateral look factor 0.45 to 0.20 and bridge direction vectors to [-0.08,0.99]. Fresh full CI/browser validation pending.


## 2026-10-19 — Loop 105 / visual-review harness
- Loop 104 run 39187622415 / artifact 12158767554 is invalid for camera-framing evaluation: lower-stair-clearance timed out; all later phase tasks timed out and 13b/14/16/17 are fallback frames at final rooftop position [3.45,7.2,0.5], route 56/56.
- Phase window y [4.4,4.68], z [-4.12,-3.84] was too narrow and inconsistent with the existing script test case [0,4.65,-4.2]. Because tests only included src/**/*.test.ts, neither script phase test ran.
- Loop 105 commit 2cf72fb2001e05a1e8db90b513ebe3e2ae519a87 widens the phase window, caps phase timeout at 30s, marks downstream captures skipped on a miss and fails gate for all non-matched phases; includes script phase tests in Vitest. Validation pending.


## 2026-10-19 — Loop 105a
- Run 39190470096 executed the newly enabled script phase tests. Typecheck passed; 144 passed, 1 failed. The positive roof-hatch fixture marked x=0.12m over the hatch as zone roof / hatch clear, contrary to the rule requiring the camera to be more than 0.9m off-center on the deck.
- Source commit 917a0b93674d505f63e1cebb872923579c615f5b changes the fixture to x=1.05m. Fresh source + browser validation pending.


## 2026-10-19 — Loop106 / Loop106a route readiness
- Run39190695353: source type-check, expanded unit tests and build passed. Browser failed first phase; later phases correctly marked skipped. Fallback state reveals watcher was armed before selected route: destination family-table, route 0/0. No valid framing conclusion.
- Commit 597bc45107c04a921f5edbdda8c6df6c05a2bbe6 delayed initial phase watch until after click/path change and route progress is populated.
- Before branch validation, source review discovered its regexes were over-escaped. Commit a633263bf94ee4a8a7b07d454fbc68b8634ae944 corrects both regexes so slash-delimited progress values are parsed. Fresh validation pending.


## 2026-10-19 — Loop107 / wider phase sampling
- Run39191552660 / artifact12160745173: typecheck, expanded 145 tests and build passed; browser gate failed because lower-stair-midflight timed out; downstream ascent/roof phases correctly marked skipped.
- Fallback report had destination rooftop and a populated route, so Loop106 route readiness is working. The old phase window excluded the observed midflight [0,2.862,-1.924] at progress8/56. The upper side-lane pose [0.925,4.65,-3.368] at progress22/56 was just outside its old Z lower bound.
- Source ff06bf663adff19640fd5b967deda0e2d499fbd8 widens both windows, changes waits to 100ms polling and gives slow rendered zones longer bounded timeouts. Fresh validation pending.

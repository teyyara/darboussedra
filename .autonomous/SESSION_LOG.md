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

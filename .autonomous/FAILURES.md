# Failure Register

## F-001 — Entrance tunnel / repeated-frame effect
Class VISUAL / UX / PRODUCT; OPEN / IMPROVED BUT NOT ACCEPTED. Artifact 12156503344 image 02-entrance-eye-level.png shows more Family Table, but a large foreground frame and another interior frame remain prominent. Next: reassess framing after stair capture reliability is restored.


## F-002 — Stair-top/upper-landing sightline obstructed
Class PRODUCT / VISUAL; OPEN. Artifact 12156503344 images 13b-stair-ascent-landing-clearance.png and 14-upper-landing-turn.png. Flags for anticipating/clearing the landing are true, yet the image is still dominated by stair underside/wall. The boolean predicates are insufficient to prove a good view. Next: inspect fresh roof-stair frames, then refine route position/aim with visual evidence.


## F-003 — Browser capture phase timeouts / stale frames
Class TEST / PERFORMANCE / UNKNOWN; OPEN. Run 39181992857 / artifact 12156503344. roof-stair-flight and roof-hatch-clear timed out and both captured position [0.249,4.65,0.923], progress 27/56. Possible causes include a leaked review hold or phase/harness mismatch; evidence does not prove root cause. Loop 100 adds a 50-second hold safety fuse and telemetry. Verify the next report before marking resolved.


## F-004 — Contradictory state memory
Class MEMORY; mitigated. Legacy .aeos/state.json described loop 050/PR #5 while candidate history reached loop 097/PR #7. Canonical state now .autonomous/STATE.json.


## F-005 — Legacy entrance-camera test expectations
Class TEST / SPECIFICATION; corrected in source commit 10ff07e0882133bb68a31c8333c90e4d64340719, validation pending.
Run 39181779811 failed two tests because the old tests required the entrance camera and target to share an X axis and required all focus points to stay in their own room. Loop 099 makes the intended exception explicit only for entrance→Family Table, checks the line crosses the real shared aperture, and retains room bounds. Confirm a fresh full test run before marking resolved.


## F-006 — Unbounded visual-review hold (hypothesis)
Class TEST INFRASTRUCTURE; mitigation in source commit 9021c8b2f8002faccddc0fcc38e9f606b4a7fb3b, verification pending.
Two later phase captures reused the same stale waypoint after timeout. HouseScene intentionally pauses movement while the review harness captures a matched frame, but there was no hold deadline if cleanup failed. Loop 100 adds a 50-second expiry and pure unit tests. Do not mark resolved until a fresh artifact shows the roof stair/hatch phases at independent route positions.


## F-007 — Shared review-hold deadline renewed indefinitely
Class TEST INFRASTRUCTURE; Loop 101 mitigation committed, revalidation pending.
Workflow 39182940594 / artifact 12157625304. Screenshots 16/17 timed out and fell back to [0.925,4.65,-2.98], routeProgress 22/56, one active hold and ~43.7s remaining. The phase predicate refreshed a shared 50-second deadline while the same matched pose remained true. Loop 101 stores deadlines per token and uses a first-match-only guard. Do not mark resolved until new screenshots 16/17 exist at distinct, true route positions.


## F-008 — Concurrent phase timeouts during screenshot holds
Class TEST INFRASTRUCTURE; mitigation in Loop 102 source commit 5e294d5a96444ffdaf56edb8f022a30723c736a5, verification pending.
Workflow 39184178983 / artifact 12157498087. The upper-side capture held camera at [0.925,4.65,-2.942], progress 22/56. Later roof-stair/hatch waiters were started concurrently, so their 90-second windows elapsed before the route reached those phases. Screenshots 16/17 were missing after screenshot timeouts. Loop 102 starts the next watcher after the prior screenshot but before releasing the current token; the next matcher waits until the previous token has been removed. Phase timeouts are unchanged. Verify in fresh report before marking fixed.


## F-008 — Loop 103 camera-path regression failures
Class TEST / CAMERA; open pending Loop 103a validation.
Run 39186386526, candidate head b61cffd0ad6a54e0c1cd827de265c029ae668c81. Typecheck passed; cameraPath.test.ts failed 8 tests (131 passed / 8 failed). Six assertions encoded outward/neutral side-lane gaze and were inconsistent with the screenshot showing a wall dominating the upper landing. The remaining failures showed the full clearance band did not always get a positive upward target and the tangent-alignment checker didn't classify a desired clearance look-ahead frame as an exception. Loop 103a corrects the target expectation and starts the upward blend earlier. Require full rerun before resolution.


## F-009 — Loop 103 late-clearance test mismatch
Class TEST / CAMERA; Loop 103b correction committed, validation pending.
Run 39186716661: typecheck passed; 137/139 tests passed. One test incorrectly demanded +Z while on the final treads; the designed route keeps the flight in front until the camera reaches the landing, and the separate landing test already asserts +Z. One alignment failure fell inside the camera's 2.45m easing zone but outside the test's target-dependent exception. Loop 103b changes only these test semantics, preserving the separate aim and bounds assertions. Rerun all source and browser gates before resolution.


## F-010 — Upper bridge gaze remains stair-underside oriented
Class CAMERA / VISUAL ACCEPTANCE; Loop 104 mitigation committed, validation pending.
Workflow 39186902422 / artifact 12158258421. Source gates passed, 21 screenshots, 14/14 arrivals, no runtime errors/mobile overflow. upperLandingAiming.looksAlongBridge=false at direction [-0.339,-0.227,0.913]. Frame13b is wall-dominated and frame14 looks too far inward at the stair underside. Loop104 reduces the late-ascent lateral component and softens bridge vectors; only change geometry if new screenshots still show occlusion.


## F-011 — Browser phase capture starvation / stale fallbacks
Class TEST / VISUAL REVIEW; Loop 105 mitigation committed, validation pending.
Run 39187622415, artifact 12158767554. Source gates passed, but lower-stair-clearance timed out and all remaining phases timed out sequentially. Screenshot frame states for 13b, 14, 16 and 17 all show [3.45,7.2,0.5], route progress 56/56, so they are not valid phase screenshots. The phase window excluded the scripted/tested top-tread case and npm test was configured to exclude scripts/*.test.*. Loop 105 broadens the range, makes downstream capture skipping explicit and includes the script tests; rerun before resolving.


## F-012 — Roof hatch positive fixture physically over opening
Run39190470096: typecheck passed; 144 passed / 1 failed. Positive test used x=0.12m, still centered over 1.65m hatch, while asserting zone roof and hatch-clear. Phase rule correctly requires x>0.9m and roof zone. Loop105a updates fixture to x=1.05m; implementation rule remains unchanged. Rerun before resolution.


## F-013 — First phase watcher started before an active route
Run39190695353 / artifact12159956771. First ascent phase timed out with destination family-table, route 0/0; later phases were explicitly skipped. Loop106 moved watcher startup after selection and waits for selected destination and populated route. Loop106a fixed both regexes that parse route progress. Resolution pending fresh CI/browser run; do not infer visual quality from fallbacks.

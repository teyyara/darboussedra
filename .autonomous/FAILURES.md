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

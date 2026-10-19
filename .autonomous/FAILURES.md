# Failure Register

## F-001 — Entrance tunnel effect
Class VISUAL / UX / PRODUCT; OPEN. Prior artifact 12154942342, image 02-entrance-eye-level.png, shows almost aligned frames dominating the view. Loop 098 changed the destination camera; no new screenshot exists because CI failed before capture. Next: inspect fresh entrance screenshot after CI completes.


## F-002 — Stair-top clearance blocked
Class PRODUCT / VISUAL; OPEN. Artifact 12154942342, 13b-stair-ascent-landing-clearance.png. Opaque fascia/wall dominates; landingClearanceDirectionX=0.808, Y=0.098; anticipatesUpperLandingTurn=false; clearsUpperLandingOnAscent=false. Next: inspect geometry and route pose; do not relax gate.

## F-003 — Browser capture/phase timeouts
Class TEST / PERFORMANCE / UNKNOWN; FAIL. Workflow 39177873937: screenshot 45000ms timeout and three phase timeouts. Next: separate renderer stalls from harness synchronization.

## F-004 — Contradictory state memory
Class MEMORY; mitigated. Legacy .aeos/state.json described loop 050/PR #5 while candidate history reached loop 097/PR #7. Canonical state now .autonomous/STATE.json.


## F-005 — Legacy entrance-camera test expectations
Class TEST / SPECIFICATION; corrected in source commit 10ff07e0882133bb68a31c8333c90e4d64340719, validation pending.
Run 39181779811 failed two tests because the old tests required the entrance camera and target to share an X axis and required all focus points to stay in their own room. Loop 099 makes the intended exception explicit only for entrance→Family Table, checks the line crosses the real shared aperture, and retains room bounds. Confirm a fresh full test run before marking resolved.

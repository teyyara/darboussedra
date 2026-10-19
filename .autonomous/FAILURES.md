# Failure Register

## F-001 — Entrance tunnel effect
Class VISUAL / UX / PRODUCT; OPEN. Artifact 12154942342, 02-entrance-eye-level.png. Foreground door frame and far opening are nearly aligned. Next: off-axis camera within footprint plus regression and fresh screenshot.

## F-002 — Stair-top clearance blocked
Class PRODUCT / VISUAL; OPEN. Artifact 12154942342, 13b-stair-ascent-landing-clearance.png. Opaque fascia/wall dominates; landingClearanceDirectionX=0.808, Y=0.098; anticipatesUpperLandingTurn=false; clearsUpperLandingOnAscent=false. Next: inspect geometry and route pose; do not relax gate.

## F-003 — Browser capture/phase timeouts
Class TEST / PERFORMANCE / UNKNOWN; FAIL. Workflow 39177873937: screenshot 45000ms timeout and three phase timeouts. Next: separate renderer stalls from harness synchronization.

## F-004 — Contradictory state memory
Class MEMORY; mitigated. Legacy .aeos/state.json described loop 050/PR #5 while candidate history reached loop 097/PR #7. Canonical state now .autonomous/STATE.json.

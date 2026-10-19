# Durable Decisions

## ADR-001 — AEOS v4.1 is canonical
Keep the full supplied strategy at .autonomous/STRATEGY.md and a versioned copy. Continuity must depend on repository memory, not chat alone.

## ADR-002 — Preserve legacy state as history
Mark .aeos/state.json as a superseded loop-050 snapshot; .autonomous/STATE.json is current. Keep the old validation data for audit.

## ADR-003 — Architecture before decoration
Fix physical coherence, thresholds, camera paths, geometry visibility and render readiness before adding decorative content. The current images still show a tunnel-like entry and wall-dominated stair-top view.

## ADR-004 — Source tests are not visual acceptance
Require fresh screenshots/runtime evidence for meaningful camera/geometry changes. Passing source checks does not certify the rendered house.


## ADR-005 — Bound test-only camera pauses
- **Decision:** A review phase may pause movement for at most 50 seconds, just beyond the 45-second screenshot bound.
- **Reason:** A stale phase frame can indicate a leaked review hold and starve later captures; the artifact is consistent with that failure but does not prove it.
- **Safety:** Expired tokens clear in the render loop. The hold mechanism is activated only when the browser-review harness explicitly sets it.
- **Verification:** Fresh screenshots and telemetry must show the roof-stair/hatch phases reaching actual route positions.


## ADR-006 — Review holds use independent, one-shot deadlines
- **Decision:** Each visual-review screenshot token has its own 50-second deadline set on its first match only.
- **Reason:** The phase wait predicate was refreshing a shared deadline while a stale match remained true.
- **Safety:** HouseScene expires tokens independently; later phases cannot renew an earlier hold. Cleanup removes only the matching token/deadline.
- **Verification:** Fresh report must show expired holds cleared and images 16/17 captured at actual roof-flight/hatch positions.

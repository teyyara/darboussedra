# Durable Decisions

## ADR-001 — AEOS v4.1 is canonical
Keep the full supplied strategy at .autonomous/STRATEGY.md and a versioned copy. Continuity must depend on repository memory, not chat alone.

## ADR-002 — Preserve legacy state as history
Mark .aeos/state.json as a superseded loop-050 snapshot; .autonomous/STATE.json is current. Keep the old validation data for audit.

## ADR-003 — Architecture before decoration
Fix physical coherence, thresholds, camera paths, geometry visibility and render readiness before adding decorative content. The current images still show a tunnel-like entry and wall-dominated stair-top view.

## ADR-004 — Source tests are not visual acceptance
Require fresh screenshots/runtime evidence for meaningful camera/geometry changes. Passing source checks does not certify the rendered house.

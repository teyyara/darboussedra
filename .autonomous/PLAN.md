# Prioritized Plan

## P0 — Physical architecture
- [ ] Loop 098 entrance framing implementation awaits visual confirmation.
- [ ] Loop 099 updates contradictory camera-path assertions; run unit tests/build before proceeding.
- [ ] Fix stair-top view so the camera clears the fascia and looks into the open upper landing.
- [ ] Verify structural substrates close unintended gaps while preserving the real stairwell/hatch openings.
- [ ] Audit portal ownership, room adjacency, floor/ceiling joins, thresholds, head clearance, landings and rails.

## P1 — Rendering readiness / pop-in
- [ ] Measure first-scene readiness, first-movement latency, frame stalls and transition delays.
- [ ] Profile before optimizing; prewarm/reuse resources only when supported by measurements.
- [ ] Avoid destructive visibility handoffs; have upcoming visible geometry ready before camera turns reveal it.
- [ ] Keep camera phase windows distinct and inspect fresh artifacts.

## P2 — Moroccan visual coherence
- [ ] Keep existing plaster, tile, wood, neighborhood, sun and clouds coherent.
- [ ] No new decor until explicitly approved.

## Release
- [ ] Source checks, room arrivals, stair ascent/descent, fresh visual review, responsive checks and memory integrity pass on a frozen candidate.
- [ ] No release with critical FAIL/BLOCKED/UNKNOWN. No manual Vercel deployment.

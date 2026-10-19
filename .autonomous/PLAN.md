# Prioritized Plan

## P0 — Physical architecture
- [ ] Loop 098: entrance camera pose implementation committed; validation pending. Confirm the destination no longer looks like a tunnel.
- [ ] Fix stair-top view so it clears the fascia and looks into the open upper landing.
- [ ] Verify structural floor substrates close unintentional gaps while preserving the intended stairwell/hatch openings.
- [ ] Audit wall/portal ownership, adjacency, floor/ceiling joins, thresholds, head clearance, landings and rails.

## P1 — Rendering readiness and pop-in
- [ ] Measure first-scene readiness, time-to-first-movement, frame stalls and transition delays on a production build.
- [ ] Profile before optimizing; prewarm/reuse resources only when evidence supports it.
- [ ] Avoid destructive visibility handoffs and prepare upcoming geometry before camera rotations expose it.
- [ ] Keep camera phase windows distinct and inspect fresh artifacts.

## P2 — Moroccan visual coherence
- [ ] Keep existing plaster, tile, wood, street, neighborhood, sun and clouds coherent.
- [ ] Tune existing materials/lighting after P0/P1. Add no decor until explicit approval.

## Release
- [ ] Typecheck, unit tests, build, room arrivals, stair ascent/descent, visual review, responsive checks and memory validation pass on a frozen candidate.
- [ ] No release while any critical status is FAIL/BLOCKED/UNKNOWN. No manual Vercel deployment.

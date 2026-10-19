# Prioritized Plan

## P0 — Physical architecture
- [ ] Correct tunnel-like entrance view with an off-axis eye-level camera pose inside the entrance footprint.
- [ ] Fix stair-top view so it clears the fascia and looks into the actual open landing.
- [ ] Verify structural floor substrates close unintended gaps while preserving the real stairwell/hatch openings.
- [ ] Audit wall/portal ownership, room adjacency, floor/ceiling joins, thresholds, head clearance, landings and rails.

## P1 — Rendering readiness and pop-in
- [ ] Measure first-scene readiness, first-movement latency, frame stalls and floor-transition delays on a production build.
- [ ] Profile before optimizing. Warm relevant shader/material variants/geometries and reuse resources where justified.
- [ ] Avoid destructive visibility handoffs and prepare near-future geometry before camera rotation exposes it.
- [ ] Keep screenshot phase windows distinct and inspect fresh artifacts.

## P2 — Moroccan visual coherence
- [ ] Keep existing plaster, tile, wood, street, neighborhood, sun and clouds coherent.
- [ ] Tune existing material/lighting only after P0/P1. Do not add decor without approval.

## Release
- [ ] Typecheck, unit tests, build, room arrivals, stair ascent/descent, visual review, mobile checks and memory validation pass on a frozen candidate.
- [ ] No release while a critical test is FAIL/BLOCKED/UNKNOWN. No manual Vercel deployment.

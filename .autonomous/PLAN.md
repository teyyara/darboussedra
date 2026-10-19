# Prioritized Plan

## P0 — Capture and stair traversal
- [ ] Loop 101 per-token hold-expiry fix committed; full validation pending.
- [ ] Verify screenshot 16 reaches the roof flight and screenshot 17 reaches the deck beyond the hatch, with distinct camera positions/progress and per-token deadline data.
- [ ] Fix the wall/underside-heavy lower landing and narrow upper passage from fresh visual evidence.
- [ ] Reassess entrance framing; improved but not accepted.

## P1 — Rendering readiness / pop-in
- [ ] Measure initial readiness, first movement and frame stalls after reliable captures are available.
- [ ] Profile before optimizing; don't infer a renderer bottleneck from screenshot timeout alone.
- [ ] Inspect exact screenshot/report evidence.

## P2 — Moroccan coherence
- [ ] Keep existing plaster, tile, wood, neighborhood, sun and clouds coherent.
- [ ] No new decorations until explicit approval.

## Release
- [ ] Typecheck, full tests, production build, arrivals, real roof-stair/hatch captures, responsive checks and memory integrity pass on a frozen candidate.
- [ ] No release with critical FAIL/BLOCKED/UNKNOWN. Never manually deploy to Vercel.

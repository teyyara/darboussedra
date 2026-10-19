# Prioritized Plan

## P0 — Stair and landing traversal
- [ ] Loop 100 review-only camera hold-expiry implementation committed; CI/browser revalidation pending.
- [ ] Verify roof-stair-flight and roof-hatch-clear captures progress beyond stale waypoint 27/56.
- [ ] Inspect lower-stair clearance and upper landing; camera booleans pass but the rendered view remains underside/wall-heavy.
- [ ] Keep the entrance under visual review; improved framing is not yet acceptance-ready.
- [ ] Audit head clearance, walkway width and floor/hatch gaps after fresh evidence localizes the specific defect.

## P1 — Rendering readiness / pop-in
- [ ] Measure first-scene readiness, first-movement latency and frame stalls.
- [ ] Profile before optimizing; do not infer a rendering bottleneck from screenshot timeout alone.
- [ ] Avoid destructive visibility handoffs; inspect exact browser images and telemetry.

## P2 — Moroccan visual coherence
- [ ] Keep existing plaster, tile, wood, neighborhood, sun and clouds coherent.
- [ ] No decorations until explicit user approval.

## Release
- [ ] Typecheck, full tests, build, room arrivals, actual stair/hatch captures, responsive checks and memory integrity pass on a frozen candidate.
- [ ] No release while a critical visual gate is FAIL/BLOCKED/UNKNOWN. Never manually deploy to Vercel.

# Prioritized Plan

## P0 — Reliable stair review
- [ ] Validate Loop 102 phase-capture sequencing on a fresh CI/browser run.
- [ ] Verify images 16/17 exist, show real distinct roof-flight/hatch-clear positions, and have no active stale hold.
- [ ] Fix the lower landing and upper passage where wall/stair underside dominates.
- [ ] Reassess entrance framing; improved but not yet visually accepted.

## P1 — Rendering readiness
- [ ] Once traversal captures are trustworthy, measure first-render readiness, movement latency and stalls.
- [ ] Profile before performance optimizations; distinguish renderer stalls from review-harness timeouts.

## P2 — Moroccan coherence
- [ ] Preserve existing plaster/tile/wood/neighborhood/sun/cloud direction.
- [ ] No new decorations before explicit approval.

## Release
- [ ] Typecheck, tests, build, room arrivals, real stair/hatch screenshots, responsive checks and memory integrity pass on frozen candidate.
- [ ] No release on critical FAIL/BLOCKED/UNKNOWN; never manually deploy to Vercel.

# Prioritized Plan

## P0 — Render stability and animated walkthrough
- [ ] Validate Loop109 dynamic DPR / cached shadow-map policy.
- [ ] Require all phaseCaptureResults matched with no timeout, skipped or fallback frames.
- [ ] Require 14/14 room arrivals settled, no runtime errors and no mobile overflow.
- [ ] Check frames 13, 13b, 14, 16 and 17 have the intended, distinct camera coordinates/progress.
- [ ] If the route still stalls, add frame-timing telemetry and reduce expensive geometry/material work with evidence.

## P1 — Visual refinement
- [ ] Once phase evidence is valid, reassess upper landing and stair fascia obstruction.
- [ ] Reduce portal repetition/tunnel effect at entrance.

## P2 — Moroccan/exterior coherence
- [ ] Maintain Moroccan neighborhood, plaster/tile/wood, sky/sun/clouds.
- [ ] No new decorations until explicitly authorized.

## Release
- [ ] Typecheck, all tests, build, complete phase capture, 14/14 arrivals, responsive and memory checks pass on one frozen candidate.
- [ ] No merge to main or manual Vercel deployment while a critical gate remains FAIL/UNKNOWN.

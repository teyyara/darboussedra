# Prioritized Plan

## P0 — Stair / walkthrough camera
- [ ] Validate Loop 104 vectors against typecheck, all tests, build and browser review.
- [ ] Require looksAlongBridge, looksDownPastStairUnderside, clearsUpperLandingOnAscent and anticipatesUpperLandingTurn to be true.
- [ ] Inspect images 13b/14; reject if wall/fascia still dominates.
- [ ] Preserve distinct real roof stair/hatch frames 16/17 and settled room arrivals.
- [ ] If camera is still physically occluded, use the new screenshot to make a separate tested geometry change.

## P1 — Entrance framing
- [ ] Reduce oversized foreground portal and repeated interior frame; preserve a plausible Moroccan entry.

## P2 — Rendering / exterior
- [ ] Profile pop-in after camera acceptance.
- [ ] Preserve neighborhood, sky, sun and clouds; no new decor before explicit authorization.

## Release
- [ ] Typecheck, tests, build, room arrivals, true stair/hatch screenshots, responsive and memory checks pass on one frozen candidate.
- [ ] Never merge/deploy while any critical acceptance gate fails or is unknown.

# Dar Boussedra — Architecture & Rendering Repair Roadmap

**Goal:** A believable, physically coherent Moroccan family home experienced as a smooth first-person game walkthrough. Architecture and safe circulation come before decoration.

**Hard constraints:** No furniture, wall art, rugs, ornaments, garden/rooftop set-dressing, or other new decorative objects until the user explicitly approves. Prefer free/local tools. Do not merge to `main` or manually deploy to Vercel.

## P0 — Physical architecture
- [ ] Audit every room floor, corridor, landing, stair tread, roof slab and threshold. Eliminate unintended holes, floor-to-floor gaps, floating strips and exposed voids.
- [ ] Keep continuous structural substrate below room-specific finish tiles. Preserve only the intentional stairwell/hatch opening and guard every traversable edge.
- [ ] Remove the tunnel-like entrance sightline: inspect the front door, vestibule and stacked interior openings from ground and upper floors; avoid deep repeated frames and impossible views through levels.
- [ ] Audit wall ownership/thickness, doorway cutouts, ceiling edges, window openings, room adjacency and exterior shell. No room should open into a wall or unfinished void.
- [ ] Check human-scale hall/door clearances, turning space, stair rise/run, landings, head clearance and continuous handrails.
- [ ] Ensure the exterior shell meets a believable street/neighborhood without leaking into interior views.

## P1 — No pop-in or empty frames
- [ ] Profile first-scene readiness, time-to-first-movement, frame stalls and floor-transition delays before optimizing.
- [ ] Warm shaders/material variants/geometries before navigation; reuse resources rather than creating them during movement.
- [ ] Avoid destructive visibility handoffs. Keep critical shell/floor/rail geometry mounted until replacement geometry is ready.
- [ ] Prepare near-future visible geometry before camera rotation exposes it.
- [ ] Keep screenshot phase windows disjoint; capture stair flight, landing, roof flight, hatch and descent deterministically.
- [ ] Accept a loop only after typecheck, tests, build and fresh browser screenshots are inspected. Source tests alone do not prove visual correctness.

## P2 — Moroccan visual coherence
- [ ] Tune existing plaster, tile, wood and lighting only after P0/P1 pass.
- [ ] Keep neighborhood, street, sky and sun/cloud proportions coherent.
- [ ] Add decor only after explicit user approval.

## Loop history
- **093:** Typecheck/tests/build passed, visual review failed. Late ascent camera direction was X=0.808 / Y=0.098, still wall/soffit-dominated; two roof-stair captures timed out.
- **094:** Added persistent roadmap documenting the user's architecture and pop-in defects.
- **095:** Added continuous ground-floor structural slab under room finish floors; visual validation pending.
- **096:** Add structural substrate beneath the upper-floor room tiles and perimeter strips while preserving the deliberate stairwell void; verify with coverage tests and fresh browser screenshots.

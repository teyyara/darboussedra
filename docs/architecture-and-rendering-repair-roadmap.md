# Dar Boussedra — Architecture & Rendering Repair Roadmap

**Goal:** A believable, physically coherent Moroccan family home experienced as a smooth first-person game walkthrough. Architecture and safe circulation take priority over decoration.

**Hard constraint:** Do not add furniture, wall art, rugs, ornaments, garden/rooftop set-dressing, or other decorations until the user explicitly approves. No paid services/assets or unnecessary dependencies. Do not merge to `main` or manually deploy to Vercel.

## P0 — Fix physical architecture before visual polish

- [ ] **P0.1 Floor continuity audit:** map every room floor, corridor, landing, stair tread, roof slab, and threshold against the house shell. Remove unintended holes, visible gaps between levels, floating floor strips, exposed voids, and seams a person could fall through.
- [ ] **P0.2 Continuous structural floor:** add a structural substrate below room-specific finish tiles so gaps between room registrations never reveal empty space. Preserve only intentional stairwell/hatch openings, and protect them with appropriate guardrails.
- [ ] **P0.3 Entrance is a room, not a tunnel:** inspect the front door, vestibule, first interior opening, and all openings visible in one sightline. Avoid deep repeated trim, doorframes nested in line, and a view that reads like a long tunnel. Ensure an upstairs camera cannot see an impossible tunnel-shaped doorway below.
- [ ] **P0.4 Floor-plan coherence:** audit room footprints, wall ownership/thickness, doorway cutouts, ceiling edges, windows, exterior wall shell, room transitions, and shared boundaries. No room should open into a wall, end at an unprotected drop, or expose the world through unfinished geometry.
- [ ] **P0.5 Safe circulation:** ensure every traversable edge is guarded; stairwell edges, rooftop hatch, and level transitions must not allow the player to fall through a gap. Keep handrails continuous and avoid rails blocking the walking route.
- [ ] **P0.6 Stairs and head clearance:** verify tread count, rise/run, landing dimensions, head clearance, upper/lower connection, roof access, and camera body clearance. Camera must not pass through slabs/walls or arrive facing a soffit.
- [ ] **P0.7 Door and hall dimensions:** check human-scale clear widths and turning areas. The stair must read as a stair hall, not an obstacle occupying the family room. Keep all required destinations reachable.
- [ ] **P0.8 Exterior boundary:** make the house meet the sidewalk/street/neighbourhood logically, and ensure exterior buildings/sky do not leak into indoor views.

## P1 — Stop geometry/material pop-in

- [ ] **P1.1 Profile before optimizing:** inspect route captures and measure first-scene readiness, time-to-first-movement, frame stalls, and level-transition delays. Determine whether empty flashes come from conditional mounting, shader compilation, textures, or zone visibility.
- [ ] **P1.2 Warm scene before navigation:** compile shaders and prepare shared materials/geometries before the first route starts; avoid expensive material/geometry creation during camera movement. Reuse cached resources.
- [ ] **P1.3 No destructive visibility handoff:** pre-mount critical architecture where memory allows. A wall, floor, ceiling, or rail must not disappear before the replacement is rendered. Use stable structural shell geometry and zone visibility only for the details that need it.
- [ ] **P1.4 Preload visible-near-future geometry:** ensure objects in the camera's near-future field of view are ready before camera rotation exposes them; do not rely on pop-in being hidden by camera movement.
- [ ] **P1.5 Deterministic browser review:** separate capture windows for stair flight, landing, roof flight, hatch, and descent; avoid overlapping phase windows and concurrent screenshots against a moving WebGL canvas.
- [ ] **P1.6 Acceptance gate:** each loop must pass typecheck, unit tests, production build, and a fresh browser screenshot review. Inspect actual entrance, upstairs, stair, and floor-edge images. Passing source tests alone is not visual acceptance.

## P2 — Realistic Moroccan look, after P0/P1

- [ ] **P2.1** Tune existing plaster, tile, wood, and lighting materials to feel plausible for a real Moroccan home.
- [ ] **P2.2** Keep the neighborhood, street, sky, and sun/cloud scale coherent with the house.
- [ ] **P2.3** Add Moroccan furniture/decor only after explicit user approval.

## Loop notes

### Loop 093 — Camera gaze at stair top
- Source typecheck/tests/build passed, but the visual-review gate failed. Browser evidence measured the late-ascent camera direction at X=0.808 / Y=0.098, outside its intended direction range; the image was still dominated by stair fascia/wall.
- Two roof-stair capture phases timed out, with overlapping landing/roof-flight capture windows. Treat this as a real failed visual acceptance, not a successful loop.

### Loop 094 — Roadmap formalization
- Record the user's specific architectural defects and render pop-in concern as ordered, persistent repository TODOs.
- Next implementation should address floor continuity, guarded edges, and the stacked entrance/stair doorway sightline in one focused architectural pass; then validate screenshots. Do not add decoration.

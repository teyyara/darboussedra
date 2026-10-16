# Loop 004 Architecture Audit

**Repository:** `teyyara/darboussedra`  
**Base:** `main@501cc6ccf3e6926504dfcd051ac98147360cd48a`  
**Correction branch:** `fix/loop-004-architecture-coherence`  
**Review status:** corrective source changes prepared for automated validation; not merged or deployed by the agent.

## Source audit before changes

| Concern | Source evidence | Correction in this branch |
|---|---|---|
| Exterior/room disconnect | Exterior shell was one solid box with the front door layered in front; interior rooms were rendered separately | Front facade is assembled from wall pieces around a real opening; its hinged door opens when entering, while rooms, shell, garden, stairs and roof use one world space |
| Blocked/misleading adjacency | `connectedTo` was not used when constructing wall geometry, so side walls could block listed connections | Every declared edge must meet along a usable same-level boundary and generates a matching opening on both adjoining room walls |
| Stair conflict | Old stair run occupied the previous Pets’ Corner footprint and crossed its lateral openings | Rear rooms are placed around a reserved central stair hall; a doorway from the Family Table opens into the hall; a registry invariant rejects ground-room overlap with the shaft |
| Level continuity | Stair endpoints/steps did not reconcile with configured floor heights; rooftop deck had no corresponding opening | Shell, ground/upper floor heights, landing/bridge, flight endpoints and roof opening now share `HOUSE_LAYOUT` |
| Entrance threshold | Entrance footprint ended before the shell’s inner front face and porch pieces had overlapping placement | Entrance footprint meets the inner wall face; threshold pieces are placed sequentially and garden/path/trees derive their placement from the registered garden |
| Map was a list only | `HouseMap` only grouped HTML buttons with unrelated map coordinates | Ground/upper/garden/rooftop HTML plan views derive every room tile from `scenePosition` and `footprint`, show the stair void/landing, and retain the complete accessible directory |
| Duplicated layout dimensions | Shell dimensions, garden scenery, map extent and stairs were specified independently | Centralized `HOUSE_LAYOUT` holds shell/floor/circulation geometry; map extents derive from shell dimensions |

## Automated invariants added or extended
- All 13 permanent destination IDs/slugs are unique and required slugs exist exactly once.
- Every declared room connection is reciprocal and has a usable shared doorway.
- Room footprints are finite, do not overlap, and remain inside the shell’s usable faces.
- Each private room opens to the shared upper landing, not directly into another bedroom.
- Ground-floor rooms do not overlap the reserved stair shaft.
- Stair flights meet configured floor surfaces, landing edges and the rooftop opening.
- The entrance meets the shell’s inner facade face and the garden adjoins the entrance.

## Visual evidence — blocked
No genuine browser screenshots were captured. Connected browser/Vercel inspection previously returned access denied, and no interactive browser driver is available through the repository tool connection. There is **no verified before/after image evidence**, so visual correctness is not certified here.

Human review still needs screenshots/views of the exterior and door swing, entry transition, one ground room, one upstairs bedroom and landing, stair clearance, garden, rooftop/hatch, all four plan tabs, and mobile map behavior. Interactions still to manually verify: direct-refresh/back-forward, keyboard/focus/touch, reduced motion, WebGL fallback, browser console, and rendered collision/shadow behavior.

The layout is a provisional blockout, not an approved surveyed family plan. Proportions—especially the reduced Pets’ Corner width, enlarged Musalla width, circulation position and stair pitch—remain explicit family-approval decisions before further architectural refinement.

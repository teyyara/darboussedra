# Loop 004 Architecture Audit

**Repository:** `teyyara/darboussedra`  
**Base:** `main@501cc6ccf3e6926504dfcd051ac98147360cd48a`  
**Correction branch:** `fix/loop-004-architecture-coherence`  
**Review status:** [GitHub Actions run 38951780470 passed](https://github.com/teyyara/darboussedra/actions/runs/38951780470) on source-code commit `adcc4cff71e3d1487681294c7b9560ee7d484126`; draft PR #5 remains unmerged and no manual deployment was performed.

## Source audit before changes

| Concern | Source evidence | Correction in this branch |
|---|---|---|
| Exterior/room disconnect | Exterior shell was one solid box with the front door layered in front; interior rooms were rendered separately | Front facade is assembled from wall pieces around a real opening; its hinged door opens when entering, while rooms, shell, garden, stairs and roof use one world space |
| Blocked/misleading adjacency | `connectedTo` was not used when constructing wall geometry, so side walls could block listed connections | Every declared edge must meet along a usable same-level boundary and generates a matching opening; shared walls and frames have one geometry owner to avoid duplicate coincident meshes |
| Stair conflict | Old stair run occupied the previous Pets’ Corner footprint and crossed its lateral openings; initial revised tread extended into the rear shell | Rear rooms are placed around a reserved central stair hall; the Family Table opens into the hall; the first tread clears the inner rear wall and is guarded by an invariant |
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

## Automated CI evidence

GitHub Actions run [38951780470](https://github.com/teyyara/darboussedra/actions/runs/38951780470) passed the production validation job: TypeScript typecheck, 16 tests across three test files, and Vite production build. Both Vercel Git status checks returned success for the branch revision. The connected Vercel inspector still does not provide an accessible rendered browser session, so those status checks do not replace visual inspection.


## Production bundle check

The last recorded bundle measurement (source-code commit `9b541fdc19dd03f951371c22a0e1528961732304`) measured the entry JS at **244.05 kB minified / 76.23 kB gzip** and the lazy 3D scene at **896.19 kB / 241.56 kB gzip**. The newer source-code commit passed CI, but no separate bundle-size report was captured for that run. The main entry remains much smaller than the original pre-lazy-load bundle, but Vite still warns that the on-demand HouseScene chunk exceeds 500 kB. No dependency or speculative manual chunk split was added during this architecture-focused loop; further work should measure renderer/module-level splitting and runtime effect before changing chunk boundaries.

## Visual evidence — blocked
No genuine browser screenshots were captured. Connected browser/Vercel inspection previously returned access denied, and no interactive browser driver is available through the repository tool connection. There is **no verified before/after image evidence**, so visual correctness is not certified here.

Human review still needs screenshots/views of the exterior and door swing, entry transition, one ground room, one upstairs bedroom and landing, stair clearance, garden, rooftop/hatch, all four plan tabs, and mobile map behavior. Interactions still to manually verify: direct-refresh/back-forward, keyboard/focus/touch, reduced motion, WebGL fallback, browser console, and rendered collision/shadow behavior.

The layout is a provisional blockout, not an approved surveyed family plan. Proportions—especially the reduced Pets’ Corner width, enlarged Musalla width, circulation position and stair pitch—remain explicit family-approval decisions before further architectural refinement.


## Follow-up source-level consistency fixes

The facade doorway now uses a dedicated 1.5 m entrance-door dimension, and the entrance-to-garden portal derives its width from that same setting; the separate 1.2 m stair-hall opening remains configured independently. Adjacent facade panel widths/positions derive from the shell width rather than assuming a fixed house width. Garden trees and bushes are positioned relative to the registered garden footprint, and decorative back-wall trim follows single-owner wall intervals. The entrance/facade width agreement has a regression test. These changes pass automated CI but remain visually unaccepted until screenshots and browser interaction checks are possible. The trim fix also reuses portal-aware wall runs, with a regression invariant that checks no wall or trim run crosses a declared doorway. The front-door interaction now acts as a proper navigation boundary: enter from the exterior, return outside from the entrance, and do not treat the distant facade door as an action from other rooms.


## 3D interaction polish

Room-floor hover now applies a restrained tint based on room category, while selected rooms retain their stronger active colour and ring. This makes clickable floor areas easier to discover without adding furniture or changing the empty-house scope. Browser rendering/contrast remains unverified because this session cannot access the protected preview.

## Follow-up: camera, hover and small viewport

- Extracted the camera-path helper into `src/house/cameraPath.ts` and made the facade use the registered entrance door height. Camera movement now crosses the front facade at 1.55 m eye height on both sides of the doorway before rising to an interior overview. Four tests cover entry, reverse exit, garden-to-interior transition and rooftop transition ordering.
- Added restrained hover cues to the actionable front door, rooftop stair treads, garden ground and rooftop deck panels. This improves discoverability without introducing furnishings.
- Removed the app shell's unconditional 560 px minimum on short screens. A max-height media rule compacts the welcome panel and keeps the map panel within a short landscape viewport.
- **Automated validation:** [GitHub Actions run 38953581339](https://github.com/teyyara/darboussedra/actions/runs/38953581339) passed TypeScript, test and production-build steps for source revision `810785472787924c98ee2a49deedbf13ee1c1927`. Confirm test count from the run output; older run counts above are historical.
- **Visual validation is still blocked.** Vercel preview access returns 403 for team scope `tyyr1`; no genuine browser screenshots have been captured, so the actual visual result is not certified.
- Branch `fix/loop-004-architecture-coherence` remains unmerged; no manual deployment/promotion was performed.


## Destination framing and level-aware view correction

- Room camera targets are constrained to the footprint of the destination they name. The old fixed focus point extended outside narrow rooms and could look through a doorway into an adjacent room. A regression test checks every room's camera position and focus point against its own bounds; the Entrance view was moved fully inside its own footprint too.
- Added level-aware scene visibility: on a settled ground-floor destination, upper room volumes are hidden; on an upper-floor destination, ground-room volumes are hidden. Both are revealed only while the travel path crosses storeys. The rooftop slab is no longer rendered throughout every indoor transition.
- Regression tests cover ground/upper/roof visibility states and camera focus containment.
- **Latest source CI:** [run 38959873489](https://github.com/teyyara/darboussedra/actions/runs/38959873489) passed TypeScript, **30 tests across five test files**, and production build for source commit `96d5f291f6d940ac1a6046be5b85e2442fb985ae`.
- The production build still reports the deferred HouseScene chunk above 500 kB (900.06 kB minified / 243.03 kB gzip); this is not hidden by increasing Vite's warning limit.
- **Rendered visual QA remains blocked:** the protected Vercel preview cannot be fetched from this session because team scope `tyyr1` is not authorized. No screenshots or visual pass are claimed.
- Draft PR #5 remains unmerged and no manual Vercel deployment/promotion was performed.

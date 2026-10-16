# AEOS Status — Dar Boussedra

**State:** LOOP 004 CORRECTION BRANCH — AWAITING VALIDATION AND REVIEW  
**Active keyphrase:** DAR BOUSSEDRA — LOOP 004: ARCHITECTURE COHERENCE REVIEW AND CORRECTION  
**Run ID:** 20261016-darboussedra-loop004-architecture-coherence  
**Loop:** 004 · **Candidate:** dar-boussedra-architecture-coherence-004  
**Repository:** https://github.com/teyyara/darboussedra  
**Branch:** fix/loop-004-architecture-coherence  
**Base main:** 501cc6ccf3e6926504dfcd051ac98147360cd48a  
**Latest source-code correction commit:** adcc4cff71e3d1487681294c7b9560ee7d484126  
**Last updated:** 2026-10-16

## Loop 003 outcome
- Lazy-loaded the 3D house scene so the initial navigation UI is not coupled to the full Three.js scene bundle.
- Reworked the architectural cutaway to use each room's scenePosition and footprint for its floor and partial-height walls; added doorway gaps, thresholds, trims and selected-room emphasis.
- Separated indoor, garden and rooftop rendering contexts. Outdoor paths no longer render the indoor cutaway; the open cutaway no longer places an opaque roof slab over upper-floor rooms.
- Corrected a missing JSX array bracket in hemisphereLight found after the first architectural PR commit failed typecheck; the corrected PR commit passed the complete CI pipeline and Vercel reported the preview deployment completed.
- Kept the local-first requirement: no backend, database, family-content storage, paid API/assets, analytics or tracking added. No manual Vercel deployment/promote/rollback command was issued.

## Validation evidence
- TypeScript repair PR #1 and map/camera PR #2 were merged with passing CI.
- Lazy-load PR #3 passed CI and was merged.
- Architectural cutaway PR #4's first commit failed TypeScript parsing due to the missing JSX bracket; that commit was not merged. The syntax was corrected on the PR branch.
- Corrected architectural PR #4 commit 00df86ff48d7d3e975dd17a3881b14c8e348daca: GitHub Actions run 38940746330 passed install, typecheck, tests and production build. Vercel's status for that preview commit was successful.
- Post-merge main commit d237375a364f25b0e30dade08f9b02790396b966: main workflow 38940864901 passed. GitHub's Vercel status for this main commit also reports deployment completed.
- npm test currently reports 2 test files and 5 tests passing.
- Bundle comparison: before lazy loading, main JS entry was 1,123.97 kB minified / 313.07 kB gzip. After lazy loading, the entry is 235.24 kB / 73.54 kB gzip; the on-demand 3D scene chunk is 890.96 kB / 240.04 kB gzip. Vite still reports a chunk-size warning for the lazy scene, although it is no longer part of the initial entry bundle.
- Local install/build and visual-browser inspection were not performed in this runtime. The connected Vercel/browser inspection route returned access denied, so visual correctness, keyboard/mobile behavior, real-device performance and accessibility conformance are not claimed as verified.

## Loop 003 acceptance state (historical)
The current main code passes automated typecheck, unit tests and production build, and the Vercel Git integration reports its deployment completed. The empty-house milestone is still not fully certified: room proportions, circulation, floor-map alignment and actual browser behavior need hands-on visual verification. The house layout remains an initial revisable proposal, not an approved family floor plan.

## Next high-value work
Improve/test architectural proportions and circulation against a visual browser view when available. Then test every room route, map selection/return, responsive behavior, reduced motion, WebGL fallback, keyboard accessibility and runtime performance. The large 3D chunk may warrant further module-level splitting if measurement shows a practical improvement.



## Loop 004 — architecture coherence review
- **State:** automated validation passed on the latest code revision; human visual acceptance remains blocked. PR #5 is still draft-only; this work is not merged or manually deployed.
- **Run ID:** 20261016-darboussedra-loop004-architecture-coherence
- **Base main:** 501cc6ccf3e6926504dfcd051ac98147360cd48a
- **Branch:** fix/loop-004-architecture-coherence
- Centralized shell/floor/circulation geometry, moved rear rooms clear of the central stairwell and preserved the 13 public slugs.
- Derived room door gaps from physical adjacency; provided an explicit Family Table-to-stair-hall portal and private-room openings onto the shared upper landing.
- Split the exterior entrance-door width from the stair-hall width and added a regression invariant that keeps the entrance facade opening and entrance-to-garden portal aligned.
- Added single-owner wall/portal geometry so shared partitions and doorway frames are emitted once; the exterior shell owns the entrance facade rather than an overlapping room-wall strip.
- Moved the first ground stair tread clear of the rear exterior wall and added a regression invariant for tread clearance.
- Added source-level checks for registry consistency, usable connected boundaries, room/shell overlaps and stair/landing/roof continuity.
- Added distinct spatial plan tabs for ground, upper, garden and roof, with a stairwell/landing overlay and the semantic room directory retained.
- **Automated CI:** [run 38951780470](https://github.com/teyyara/darboussedra/actions/runs/38951780470) passed TypeScript typecheck, 16 tests across three files, and production build on source-code commit `adcc4cff71e3d1487681294c7b9560ee7d484126`. Both Vercel Git status checks report success for this revision, but neither constitutes rendered browser evidence.
- **Last recorded bundle-size measurement:** on source-code commit `9b541fdc19dd03f951371c22a0e1528961732304`, the `index` bundle was 244.05 kB minified / 76.23 kB gzip and lazy `HouseScene` was 896.19 kB / 241.56 kB gzip. Vite warned that the deferred chunk exceeds 500 kB. CI passed for the newer source commit, but no separate bundle-size measurement was recorded for that run. The existing lazy boundary is preserved; further splitting remains a measured optimization follow-up, not an architecture acceptance substitute.

- **Browser screenshots/interactive QA: BLOCKED.** No real images captured. The Vercel GitHub PR status identifies the branch preview as [darboussedra-git-fix-loop-004-architecture-coherence-tyyr1.vercel.app](https://darboussedra-git-fix-loop-004-architecture-coherence-tyyr1.vercel.app), but Vercel preview fetch/access-bypass calls returned 403 because this session is not authorized for team scope `tyyr1`; direct web fetching also reports the host inaccessible. Visual correctness is not certified.
- Do not merge/deploy as part of Loop 004. The proportion changes (especially Pets’ Corner/Musalla), circulation arrangement and floor plan require family review before acceptance.

The latest source-code CI run is green, but Loop 004 remains incomplete until real browser review is completed and the family confirms the proposed proportions, room arrangement and circulation.

- **Latest validated source-code revision:** `adcc4cff71e3d1487681294c7b9560ee7d484126`, with passing CI in run 38951780470. Subsequent commits only synchronized audit/status wording and formatting. The Loop 004 branch remains unmerged from `main`.

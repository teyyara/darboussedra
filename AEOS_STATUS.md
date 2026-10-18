# AEOS Status — Dar Boussedra

**State:** LOOP 083 — LOOK INTO THE SIDE LANDING AS THE STAIR CLEARS THE FASCIA — CHECKPOINT COMMITTED; CI PENDING  
**Active keyphrase:** DAR BOUSSEDRA — LOOP 083: TURN TOWARD THE OPEN SIDE LANE AT THE UPPER LANDING; NO NEW DECORATIONS  
**Run ID:** 20261018-darboussedra-aeos-v3-loop083  
**Loop:** 083 · **Candidate:** dar-boussedra-walkthrough-coherence-083  
**Repository:** https://github.com/teyyara/darboussedra  
**Branch:** fix/loop-064-moroccan-exterior-and-layout  
**Base main:** e06af00a049eb72b173295438bbeb8e384c6fef5  
**Latest source-code checkpoint commit:** see latest Loop 083 commit on the linked PR branch  
**Last updated:** 2026-10-18

## Standing user priorities — keep active until explicitly cleared

- [ ] **NO NEW DECORATIONS.** Do not add furniture, wall art, rugs, garden/rooftop props, ornaments, or decorative set-dressing until the user explicitly says to resume. This includes “Moroccan-themed” decoration work. Current loops should focus on architecture, materials already present, navigation, and tests only.
- [ ] **Make the house spatially coherent.** Audit real room footprints, wall ownership, door openings, hall/landing continuity, stair clearances, floor/roof alignment, and camera sightlines. Do not treat a passing unit test as proof that the plan looks like a real home.
- [ ] **Improve the first-person walkthrough.** Keep human eye height, walkable room-to-room routes, natural turning, step-aware stair ascent/descent, and useful views without blank walls, ceiling slabs, or furniture filling the whole frame.
- [ ] **Keep a real neighborhood outside.** Neighboring Moroccan homes, street, and sidewalk must prevent the scene from reading as an empty void; keep them spatially connected and avoid rendering them over indoor views.
- [ ] **Fix the sun-side circles and use soft clouds.** Keep the sun as a clean disc without halo/ring artifacts; clouds should read as rounded puffs rather than tiny flat circles.
- [ ] **Moroccan visual identity.** When decorations are later approved, use believable Moroccan materials, joinery, proportions, and objects rather than generic staged props.


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
- **Earlier automated CI:** [run 38951780470](https://github.com/teyyara/darboussedra/actions/runs/38951780470) passed TypeScript typecheck, 16 tests across three files, and production build on source-code commit `adcc4cff71e3d1487681294c7b9560ee7d484126`. This was superseded by follow-up interaction, camera-path and viewport changes below; Vercel status checks are not rendered browser evidence.
- **Last recorded bundle-size measurement:** on source-code commit `9b541fdc19dd03f951371c22a0e1528961732304`, the `index` bundle was 244.05 kB minified / 76.23 kB gzip and lazy `HouseScene` was 896.19 kB / 241.56 kB gzip. Vite warned that the deferred chunk exceeds 500 kB. CI passed for the newer source commit, but no separate bundle-size measurement was recorded for that run. The existing lazy boundary is preserved; further splitting remains a measured optimization follow-up, not an architecture acceptance substitute.

- **Browser screenshots/interactive QA: BLOCKED.** No real images captured. The Vercel GitHub PR status identifies the branch preview as [darboussedra-git-fix-loop-004-architecture-coherence-tyyr1.vercel.app](https://darboussedra-git-fix-loop-004-architecture-coherence-tyyr1.vercel.app), but Vercel preview fetch/access-bypass calls returned 403 because this session is not authorized for team scope `tyyr1`; direct web fetching also reports the host inaccessible. Visual correctness is not certified.
- Do not merge/deploy as part of Loop 004. The proportion changes (especially Pets’ Corner/Musalla), circulation arrangement and floor plan require family review before acceptance.

The source-code updates below passed automated validation in [run 38953581339](https://github.com/teyyara/darboussedra/actions/runs/38953581339), including TypeScript, tests, and production build. Loop 004 remains visually unaccepted until real browser review is completed and the family confirms the proposed proportions, room arrangement and circulation.

- **Latest validated source-code revision:** `96d5f291f6d940ac1a6046be5b85e2442fb985ae`, with passing CI in [run 38959873489](https://github.com/teyyara/darboussedra/actions/runs/38959873489). The Loop 004 branch remains unmerged from `main`.

## Follow-up: movement, feedback and small viewports
- Extracted the camera route into `src/house/cameraPath.ts`. Entry and exit pass across the front facade at a height below the registered 2.3 m door before the camera rises inside; the garden and rooftop transitions have explicit paths. Four regression tests cover entry, exit, garden transitions and rooftop clearance.
- `HOUSE_LAYOUT.entrance` now owns both entrance door width and height so the facade and camera route use one source of truth.
- Added restrained hover colour changes to the actionable front door, rooftop stair treads, garden surface and rooftop deck to make click targets easier to discover without adding furniture.
- Removed the fixed 560 px minimum that could extend the app below short viewports. A max-height media rule compacts the welcome layout and confines the map panel in short landscape windows.
- **Earlier automated CI:** [run 38953581339](https://github.com/teyyara/darboussedra/actions/runs/38953581339) passed TypeScript, 20 tests across four test files, and production build for the camera-path/viewport follow-up.
- **Latest source CI:** [run 38959873489](https://github.com/teyyara/darboussedra/actions/runs/38959873489) passed TypeScript, **30 tests across five test files**, and production build on `96d5f291f6d940ac1a6046be5b85e2442fb985ae`. Rendered visual acceptance remains blocked.
- Vercel project access remains denied to this session by team scope `tyyr1`. No genuine screenshots have been captured; do not claim visual acceptance based on CI/status checks.


## Follow-up: destination framing and level-aware rendering
- Rebuilt room camera presets so their focus points remain inside the room footprint named by the route. The previous 1.55 m aim beyond the room centre sent views for some narrow rooms through a wall/portal into a neighbour; this is now prevented by regression tests for every registered room's camera and focus point.
- The entrance camera now looks within the entrance footprint rather than beyond it into the Family Table.
- Added a pure level-visibility contract: settled ground-floor views no longer render upper rooms; settled upper-floor views no longer render the ground floor; both levels are revealed during level-changing travel. The rooftop deck is removed from interior room transitions and kept for exterior/garden/rooftop destinations.
- Added regression coverage for ground/upper/roof visibility and for room-focused camera bounds.
- Latest automated validation: [run 38959873489](https://github.com/teyyara/darboussedra/actions/runs/38959873489), 30 tests across five files, TypeScript and production build passed. Build still reports the lazy HouseScene chunk above 500 kB (900.06 kB minified / 243.03 kB gzip).
- **Visual limitation:** the rendered preview still cannot be inspected from this session because Vercel denies access to team scope `tyyr1`. The code changes address concrete source-level causes, but no screenshot/visual pass is claimed.


## Latest Loop 004 checkpoint — 2026-10-16 (expanded browser-reviewed)

**State:** LOOP 004 — architecture and room-navigation coherence checkpointed. Continue only when the next explicit `CONTINUE` request arrives.
**Latest source commit:** `03dcfafd933b768379c9b5799a394f2b7fd86675`
**Validated CI:** [run 38970488701](https://github.com/teyyara/darboussedra/actions/runs/38970488701) — PASS.
**Browser artifact:** The run’s `darboussedra-visual-review` artifact includes 12 desktop frames, two mobile frames, and `browser-review.json`.
**PR:** [#5 — Loop 004: Reconcile shell, room connections, stairs and spatial map](https://github.com/teyyara/darboussedra/pull/5). It remains open and draft, and has not been merged.

### Architecture and camera changes in the branch
- Separated exterior, indoor ground floor, upper floor, garden and rooftop visibility. Settled indoor views no longer show the opaque exterior shell over the room, and the roof slab is hidden during roof transitions.
- Aligned the exterior flat roof/parapet and walkable rooftop deck to one roof level, including a visible stair hatch. Replaced the contradictory pitched roof so the house shell and terrace describe the same architecture.
- Added ceilings to enclosed rooms and framed rear windows in back-facing rooms.
- Set explicit eye-level camera poses for all 13 registered destinations rather than deriving camera facing from one generic rule. The entrance looks along the passage; Family Table frames across the room; Living Room, Kitchen, Library, Pets’ Corner and Prayer Room are aimed toward their defining contents; bedroom arrival poses start at the shared landing and look into each room; garden and rooftop have dedicated outdoor framing.
- Added room-specific procedural furnishings using built-in geometry: dining table/chairs, living seating and coffee table, kitchen counter/hob/fridge, bedroom bed/headboard/bedside tables, bookshelf/books, pet bed/scratcher/bowl, prayer mat, and a simple rooftop bench/planter grouping. Scaled down the bedroom headboards and rooftop planting after reviewing the rendered frames.
- Improved camera-path performance without removing actual passage/stair routing: eased motion is faster, and redundant stair/landing waypoints were removed while keeping sampled stair movement and the roof hatch route.
- Added regression tests for camera bounds/orientation, room-level visibility, roof/terrace alignment, route waypoints and room-specific framing.
- Expanded the Playwright CI capture from the initial few locations to ten destination checks across the entrance, shared rooms, private bedroom, garden and rooftop, plus desktop/mobile screenshots. Arrival checks are bounded; a failed arrival is recorded rather than silently treated as settled.

### Latest validation and rendered evidence
- TypeScript: PASS.
- Unit tests: **36 passed across 5 test files**.
- Production build: PASS.
- Chromium/WebGL2: initial canvas and WebGL2 context detected; **no browser runtime errors**.
- All **10 tested room arrivals settled** to the expected room title and `YOU ARE HERE` label: Entrance, Family Table, Living Room, Kitchen, Library, Pets’ Corner, Prayer Room / Musalla, Zineb’s Private Room, Garden and Rooftop Terrace.
- The HTML map contained all **13 room destinations**. On a 390 px mobile viewport, document width remained 390 px and there was no horizontal overflow.
- The final artifact was visually inspected. Compared with the earlier frames, the camera now settles at the intended destination; room-specific items are visible in the appropriate rooms; the bedroom view shows the bed rather than the landing doorway; and the garden/rooftop show their outdoor context instead of being captured mid-transition.
- This remains a stylized, procedural 3D house—not photorealistic and not yet final family acceptance. A few rooms remain simple and could benefit from more carefully balanced furnishing, lighting/shadows, facade detailing and garden/terrace context. Continue improving spatial credibility, not by adding unrelated features.
- Keep performance on the follow-up list: `HouseScene` has previously exceeded Vite’s 500 kB lazy-chunk warning threshold. Re-measure the current production build before making claims about current bundle size, and optimize only if the measurement supports it.

### Next useful loop
Inspect the latest frames at full size, especially Kitchen, Library, Pets’ Corner and Rooftop Terrace, and refine any remaining scale/spacing issues without moving items outside their authoritative room footprints. Keep the room registry the source of truth. Do not deploy, promote to `main` or merge PR #5 as part of this work.


## Loop 005 — upper-landing camera orientation repair

**State:** Source checks passed; browser re-capture was still in progress at this checkpoint. PR #5 remains draft-only.

- **Source checkpoint:** [`21cf57d`](https://github.com/teyyara/darboussedra/commit/21cf57d44d53c1f6eefb46b4f9bbf2d802db56e1)
- **CI run:** [Foundation checks #39050232013](https://github.com/teyyara/darboussedra/actions/runs/39050232013).
- **Observed defect:** The browser artifact from run [39047506141](https://github.com/teyyara/darboussedra/actions/runs/39047506141), frame `14-upper-landing-turn.png`, shows a near-full-frame blank wall during the lower stair landing turn. `browser-review.json` recorded camera direction approximately `[0.689, 0.001, 0.724]` at route progress `25/36`.
- **Cause addressed:** Intermediate headings use the route tangent, so the previous diagonal U-turn sent the lens into the private-room side wall.
- **Change:** Route now moves laterally into the guarded side lane while still behind the rear wall line, then advances down the landing. Added a camera-path regression asserting the lane waypoint remains behind the wall line and the lens faces down the corridor.
- **Validation:** GitHub Actions `npm run typecheck`, `npm test`, and `npm run build` all passed on this source checkpoint. At the time the state was recorded, the Chromium installation step was still running; a fresh screenshot artifact and post-fix rendered acceptance are **not yet verified**.
- **Boundaries:** No merge to `main`, no manual Vercel deployment, no paid dependencies or services. PR #5 remains open and draft.

### Next loop
Verify the newly captured upper-landing and upper-bridge frames from the current source checkpoint. If the turn now clears the wall, continue with the remaining stair descent, roof-hatch and outdoor-route frames; record any remaining visible defect as a separate, bounded fix.


## Loop 006 — Upper-landing camera composition

**State:** Source typecheck, unit tests and production build passed. Fresh browser capture is still running at checkpoint creation; post-fix rendered acceptance is not yet verified.
- **Source changes:** [`b83b838`](https://github.com/teyyara/darboussedra/commit/b83b8387dbfcfefe32bd74cc4c69b0c46edf69e0) preserves two intentionally inward-facing camera headings at the first upper-corridor waypoints; camera position remains on the guarded side lane. [`e0c1bc6`](https://github.com/teyyara/darboussedra/commit/e0c1bc60a744bf9f56b420f185fe3301583a9708) corrects the regression assertion to match the intentional inward view.
- **Baseline evidence:** [CI artifact from run 39050232013](https://github.com/teyyara/darboussedra/actions/runs/39050232013) showed the upper landing frame still dominated by a close bedroom side wall.
- **Validation:** [CI run 39051454455](https://github.com/teyyara/darboussedra/actions/runs/39051454455) reports typecheck, tests and production build passed. The Chromium capture step is still in progress; no post-change artifact was available at the moment this record was written.
- **Scope:** PR #5 stays open/draft. No merge to `main` or manual production deployment. GitHub's configured Vercel integration may automatically publish a PR preview; no direct Vercel deploy/promotion command was invoked.

### Next action
Inspect the fresh `14-upper-landing-turn.png` and `16-upper-bridge-after-ascent.png` frames after run 39051454455 finishes. Verify that the central landing is more visible and the walking trajectory stays clear of the stair opening; if not, revisit the landing/bedroom corridor proportions rather than only adjusting yaw again.


## Loop 007 — Improve the 3D rendering finish

**State:** Source typecheck, tests and production build passed. Current Chromium browser capture is still in setup; the rendered result of the latest lighting/material pass is pending.

- **Source commit:** [`40dfb0c`](https://github.com/teyyara/darboussedra/commit/40dfb0ce8495fe42977072584d20876284c737d5)
- **CI run:** [Foundation checks #39051923842](https://github.com/teyyara/darboussedra/actions/runs/39051923842).
- **Rendering changes:** enabled WebGL antialiasing; applied ACES filmic tone mapping at neutral exposure to control bright plaster highlights; reduced ambient fill and slightly rebalanced hemisphere/key lighting so surfaces have more shape; tightened the directional-light shadow camera and increased the shadow map from 1024 to 2048; increased segment counts for garden foliage and rooftop planter leaves to reduce visibly faceted shapes.
- **Rationale from browser screenshots:** prior exterior and interior renders appeared pale/flat, tree foliage was strongly polygonal, and shadow detail was weak over large scene regions. The changes aim to improve contrast, edges and depth without adding packages or external assets.
- **Validation:** in CI run 39051923842, typecheck, unit tests and production build passed. Chromium install was the currently active workflow step at checkpoint time, so the effect of filmic tone mapping and updated shadow quality is not yet visually certified.
- **Scope boundaries:** no new packages, paid dependencies, remote models or services; no changes to the room registry; no main merge or manual Vercel deployment.

### Next action
Inspect the new `01-exterior-desktop.png`, `05-living-room-eye-level.png`, `12-rooftop-eye-level.png`, and stair-landing frames from run 39051923842. Compare brightness, material separation, foliage faceting and shadow quality against the previous artifact. Keep PR #5 draft-only until visual QA of the actual result is complete.


## Loop 008 — Kitchen prop readability and rendering

**State:** Latest source checks passed on the kitchen fix. Chromium visual capture is in progress and has not yet produced a new artifact.
- **Source commit:** [`505cda4`](https://github.com/teyyara/darboussedra/commit/505cda4d687ca5fe3c5e63eb64b9a32c8aca76a3)
- **CI run:** [Foundation checks #39052224425](https://github.com/teyyara/darboussedra/actions/runs/39052224425).
- **Problem confirmed from rendered baseline:** The kitchen refrigerator's pale block geometry blended into the pale wall and sat near the camera's main view, reading more like an architectural obstruction than an appliance.
- **Change:** Moved the refrigerator deeper into the rear-left kitchen corner, added a differentiated body and inset front panel, upper-compartment seam, vertical handle, and top cap. The worktop, cabinets and registered room footprint remain unchanged.
- **Prior render-polish change:** [`40dfb0c`](https://github.com/teyyara/darboussedra/commit/40dfb0ce8495fe42977072584d20876284c737d5) adds antialiasing, ACES filmic tone mapping, a rebalanced light rig, tighter 2048 shadow map, and smoother foliage primitives. Its browser run [39051923842](https://github.com/teyyara/darboussedra/actions/runs/39051923842) still had not completed the capture step at checkpoint time. Effects on actual rendered quality and capture/performance are therefore not certified.
- **Validation:** On [run 39052224425](https://github.com/teyyara/darboussedra/actions/runs/39052224425), `npm run typecheck`, `npm test`, and `npm run build` all passed. Browser screenshot capture had started but no artifact was ready at checkpoint time.
- **Scope:** No packages/assets/services added. PR #5 remains draft and unmerged; no manual Vercel deploy/promotion performed.

### Next action
Inspect the new `06-kitchen-eye-level.png` and `01-exterior-desktop.png` from run 39052224425, then compare the lighting/shadow change against the prior artifact. If either capture run continues to stall, check which Playwright phase is waiting and bound that wait or tune software-renderer shadow cost before adding more visual effects.


## Loop 009 — Interior finish details

**State:** Skirting detail has been committed and CI is running. The kitchen-appliance screenshot for prior source commit 505cda4 is still pending because its browser-capture step has remained in progress. Fresh source validation for the current commit is queued/running.

- **Source commit:** [`a74afe4`](https://github.com/teyyara/darboussedra/commit/a74afe4e985bca0ce4fb75fc48b37f8ce02af21c)
- **CI run:** [Foundation checks #39052442310](https://github.com/teyyara/darboussedra/actions/runs/39052442310).
- **Visual source evidence:** [Loop 007 browser artifact from run 39051923842](https://github.com/teyyara/darboussedra/actions/runs/39051923842) is complete. Its report recorded 10/10 expected room arrivals, zero page runtime errors, no Playwright notes, a detected WebGL2 context, and correct upward/downward stair camera pitch. Screenshots show more distinct light/shadow and smoother foliage than the earlier baseline, but interiors remain intentionally blocky and wall-floor transitions are abrupt.
- **Kitchen prop:** commit [`505cda4`](https://github.com/teyyara/darboussedra/commit/505cda4d687ca5fe3c5e63eb64b9a32c8aca76a3) moved the refrigerator deeper into the rear-left corner and added a differentiated front panel, freezer seam, handle and top cap. Its [CI run 39052224425](https://github.com/teyyara/darboussedra/actions/runs/39052224425) passed typecheck/tests/build; browser capture still had not completed when last checked.
- **Interior skirting:** this commit adds a low-profile baseboard in each registered room, derived from existing non-opening wall runs so the trim does not bridge doorways. Trim colors vary mildly for spiritual/private/shared spaces. No room footprints, door openings, furnishing layout outside the fridge, or navigation paths were changed.
- **Current validation:** run 39052442310 had started dependency installation at checkpoint time; typecheck, tests, build and browser capture remain pending for the latest commit.
- **Scope:** no dependencies or outside assets added; no main merge or manual Vercel deployment. PR #5 remains draft.

### Next action
Check the newest CI run, then review the updated kitchen view plus a bedroom/landing view to see whether the fridge is more legible and skirting gives the rooms clearer edge definition without visual clutter. If the screenshot runs continue to stall after code checks, investigate Playwright capture timing or software WebGL performance before adding more geometry.


## Loop 010 — Upper-landing camera composition

**State:** Camera route source fix committed. Fresh CI is running; no post-fix browser verdict claimed yet.
- **Source commit:** [`1b89548`](https://github.com/teyyara/darboussedra/commit/1b895480bc625763fdd9277aabf7767f30a7f4c9)
- **CI run:** [Foundation checks #39052970714](https://github.com/teyyara/darboussedra/actions/runs/39052970714).
- **Evidence that motivated the change:** browser capture from [run 39052442310](https://github.com/teyyara/darboussedra/actions/runs/39052442310), artifact `darboussedra-visual-review`. The `15a-upper-landing-to-stair.png` and `16-upper-bridge-after-ascent.png` frames show that on the narrow side lane the camera stares along the lane at a blank wall or into the next stair flight, giving little view of the stair opening.
- **Change:** side-lane waypoints now carry a mild inward gaze toward the opening. When reversing the ground stair route, preserved headings reverse their forward/back component but keep the inward lateral glance. The travel positions and guarded side-lane remain unchanged. Added a regression test covering both directions.
- **Previously validated polish:** [Loop 007 run 39051923842](https://github.com/teyyara/darboussedra/actions/runs/39051923842) passed browser checks, with 10/10 arrivals, zero runtime errors and correct stair ascent/descent pitch. [Loop 008 run 39052224425](https://github.com/teyyara/darboussedra/actions/runs/39052224425) passed source and browser checks; the fridge panel/handle reads clearly in the kitchen capture. [Loop 009 run 39052442310](https://github.com/teyyara/darboussedra/actions/runs/39052442310) passed source and browser checks; skirting is visible and doorway openings remain clear.
- **Current validation:** CI run 39052970714 was at dependency installation when this checkpoint was written; typecheck, tests, build and browser artifact remain pending for this camera change.
- **Scope:** no dependency or layout changes. PR #5 stays draft/unmerged. No manual Vercel deployment.

### Next action
Inspect the new `14-upper-landing-turn.png`, `15a-upper-landing-to-stair.png`, and `16-upper-bridge-after-ascent.png` after run 39052970714 completes. Verify that camera glances into the stair opening during both ascent and return travel, while the direction of walking remains legible.


## Loop 011 — First landing-turn gaze

**State:** The screenshot review proved the prior Loop 010 gaze adjustment still left the first lateral turn looking into the rear bedroom wall. A focused fix and regression test are committed; new CI run is queued.
- **Source commit:** [`fb5bbb5`](https://github.com/teyyara/darboussedra/commit/fb5bbb57bf24032fc0dc687087c0631827952703)
- **CI run:** [Foundation checks #39053389810](https://github.com/teyyara/darboussedra/actions/runs/39053389810).
- **Direct screenshot evidence:** [Loop 010 run 39052970714](https://github.com/teyyara/darboussedra/actions/runs/39052970714), artifact `darboussedra-visual-review`. Its `14-upper-landing-turn.png` frame recorded camera position `[0.77, 4.65, -4.019]` and direction nearly `[0, 0, 1]`: the camera faced directly forward along the rear bedroom-wall line during the lateral step onto the bridge. The `16-upper-bridge-after-ascent.png` image also showed the upper flight dominating the view rather than a clear open stairwell.
- **Change:** the first side-lane pose in `groundStairWalkway()` is now explicitly aimed inward (`[-0.42, 0.91]`) and has `preserveHeading: true`, rather than allowing the path-tangent logic to orient it along the wall. Added a regression test for that exact lateral step and strengthened the count of intentional inward views.
- **Previous Loop 010:** source checks and browser review passed, but visual composition did not meet the goal. This is a targeted follow-up, not a claim that the camera problem is solved.
- **Validation for Loop 011:** CI run 39053389810 was queued at checkpoint creation; no checks or screenshots have yet been claimed.
- **Scope:** same route positions and stair geometry; no dependencies or room-footprint changes. PR #5 remains draft and unmerged; no manual Vercel deployment.

### Next action
Inspect `14-upper-landing-turn.png`, `15a-upper-landing-to-stair.png`, and `16-upper-bridge-after-ascent.png` from run 39053389810. The first frame must no longer show a tangent-facing direction during the lateral turn; if the open stairwell still isn't readable, review the physical wall/railing layout rather than layering on further heading patches.


## Loop 012 — Persistent sky and non-blank environment

**State:** Source typecheck, unit tests, and production build passed. Fresh browser screenshot capture is in progress, so the final visual result remains pending.

- **Source commit:** [`0007460`](https://github.com/teyyara/darboussedra/commit/000746089e11575f5b8d5d97800402e2b701a2c5)
- **CI run:** [Foundation checks #39056997214](https://github.com/teyyara/darboussedra/actions/runs/39056997214).
- **Defect evidence:** the previous browser artifact from [run 39053389810](https://github.com/teyyara/darboussedra/actions/runs/39053389810), frame `01-exterior-desktop.png`, showed a cream/beige page background where the sky should be, despite an earlier sky-dome component. The screen lacked a visible sun or sky features. The camera frames during room/stair transitions also exposed large backdrop-colored openings where architectural surfaces were out of view.
- **Change:** `SkyEnvironment` is now a camera-safe sky dome anchored to the camera's horizontal position, with a stronger blue-to-warm-horizon gradient. The WebGL scene background is explicitly set to blue as a fallback, so the page's cream background cannot show through a cleared canvas. Added a warm sun disk and soft halo plus two restrained distant cloud clusters. Reduced the desktop/mobile global wash to keep the scene colours from being flattened.
- **Design intent:** actual near house geometry continues to draw over the far environment; the sky fills uncovered sightlines instead of a blank transparent/cream field. The source uses procedural geometry and local colour/materials only, no remote assets or paid dependencies.
- **Validation:** [run 39056997214](https://github.com/teyyara/darboussedra/actions/runs/39056997214) passed `npm run typecheck`, `npm test`, and `npm run build`. Chromium installed successfully; `Capture exterior, walkthrough, floor/map and mobile views` was still in progress at checkpoint time. Do not claim sky visibility or in-motion surface coverage as visually verified until the artifact is inspected.
- **Scope:** no room layout or navigation changes; no new dependencies. PR #5 remains draft/unmerged. No manual Vercel deployment.

### Next action
Inspect `01-exterior-desktop.png`, `08-exterior-mobile.png`, and the stair/landing frames from run 39056997214. Confirm the sky is visibly blue with a sun/cloud details at desktop and mobile widths, and that room transition gaps show a coherent environment without the sun/cloud layer drawing over nearby walls. If captures stall again, preserve this checkpoint and investigate the screenshot workflow separately from application behavior.


## Loop 013 — Sky decoration occlusion

**State:** Source checks and fresh browser review passed. The wall-occlusion issue is visually improved; a distinct sun is still not readable in the default exterior frame and is handled as a focused follow-up in Loop 014.

- **Source commit:** [`34889ca`](https://github.com/teyyara/darboussedra/commit/34889caf7e4459655028d95f911c6904346b59ca)
- **CI run:** [Foundation checks #39058157769](https://github.com/teyyara/darboussedra/actions/runs/39058157769), artifact [`darboussedra-visual-review`](https://github.com/teyyara/darboussedra/actions/runs/39058157769) (artifact ID `12110771029`).
- **Visual finding:** In `15a-upper-landing-to-stair.png`, the sun disk is cut by the upper wall edge and no cloud appears painted across the nearby walls. The `14-upper-landing-turn.png` and `16-upper-bridge-after-ascent.png` frames show the exterior sky filling open sightlines without the earlier decoration overlay defect.
- **Automated browser review:** 10/10 room arrivals succeeded; WebGL2 detected; runtime errors and review notes were empty; stair ascent/descent pitch checks passed; desktop and mobile each exposed all 13 room destinations; mobile document width equaled the 390 px viewport with no horizontal overflow; navigation hints were visible.
- **Source checks:** `npm run typecheck`, `npm test`, `npm run build`, and Chromium setup passed.
- **Remaining visual issue:** `01-exterior-desktop.png` shows only a faint edge/halo at the roofline, not a clearly visible sun disc. This is a separate composition issue from wall occlusion.
- **Boundaries:** PR #5 remains draft/unmerged; no manual Vercel deployment or promotion; no external assets/dependencies added.

### Next action

Review the sun framing after Loop 014 moves the disk/halo sideways relative to the exterior camera. Keep depth testing enabled so walls continue to occlude the sky decorations in movement frames.

## Loop 014 — Make the sun visible above the exterior roofline

**State:** Source change committed; source checks and screenshot capture are queued/in progress. The new sun position is not yet visually verified.

- **Source commit:** [`b14c7a3`](https://github.com/teyyara/darboussedra/commit/b14c7a3abf5168d210f65462a569d97092f04a2e).
- **CI run:** [Foundation checks #39058615280](https://github.com/teyyara/darboussedra/actions/runs/39058615280).
- **Evidence motivating the change:** the Loop 013 exterior screenshot had a plausible warm-blue gradient and cloud, but the sun was hidden behind the house. The stair/landing images showed depth occlusion behaving as expected.
- **Change:** Moves the sun disk and halo to local sky position `[-28, 12, -60]`, offset from the default exterior camera's view of the house so the sun can appear above/right of the roofline. Depth testing remains enabled for the disk, halo, and clouds.
- **Validation:** The previous run [39058157769](https://github.com/teyyara/darboussedra/actions/runs/39058157769) passed typecheck, tests, build, and browser review. Run 39058615280 is currently queued, so Loop 014's own source and visual checks remain pending.
- **Scope:** no camera path, room geometry, footprint, dependency, or asset change. PR #5 stays open/draft. No merge to `main` or manual Vercel deployment.

### Next action

Inspect `01-exterior-desktop.png`, `08-exterior-mobile.png`, `14-upper-landing-turn.png`, and `15a-upper-landing-to-stair.png` from run 39058615280. The sun should be clearly visible in open sky and still be hidden naturally by nearby walls.



## Loop 015 — Procedural PBR material realism

**Source checkpoint:** [`9722fee`](https://github.com/teyyara/darboussedra/commit/9722fee072544d9013e2fa6dff5ddf794f11304e)  
**Validation run:** [39059712137](https://github.com/teyyara/darboussedra/actions/runs/39059712137) — TypeScript, tests, and production build passed; Chromium walkthrough capture is still running.

### Changes
- Added browser-generated, deterministic albedo and bump textures for plaster, wood, stone and fabric; no downloaded/paid textures or runtime services.
- Added an equirectangular procedural sky reflection for physically based surfaces.
- Changed the facade panes from emissive mustard-coloured blocks to tinted physical glass with clearcoat and environment reflections.
- Raised the sky sun and reduced the landing-page wash to preserve outdoor colour.
- Tuned daylight balance and enabled a higher rendering pixel-ratio ceiling on capable devices.
- Added six tests that check material selection, and ensure glossy glazing, greenery and the environment ground plane are left unchanged.

### Acceptance state
- Source checks: **PASS**.
- Browser screenshot capture: **IN PROGRESS** at checkpoint time.
- Visual quality, mobile appearance and rendered material assignment: **NOT YET ACCEPTED** until the latest artifact is available and inspected.
- Dependencies added: **0**. No paid service/API/assets introduced.
- PR #5 remains open and draft. No merge to `main` or manual Vercel deployment.

### Next action
Inspect the new exterior and representative room, landing/stair, rooftop and mobile screenshots. Check for visible plaster/wood texture scale, glass reflections, a clear sun above the roofline, wall occlusion, any bright or blank voids, runtime errors and mobile performance. If any material category looks wrong, correct the classifier before treating this realism pass as accepted.


## Loop 016 — Softer furniture and prop silhouettes

- Source commit [`42d6b5a`](https://github.com/teyyara/darboussedra/commit/42d6b5a5b7aaa4244261eb5e5cd8e1ccaf4b214b) uses Three.js `RoundedBoxGeometry` for furniture and prop boxes. Bevel radii are scaled to object thickness so chair legs and tabletops retain their silhouettes.
- Added four unit tests for radius bounds, thin dimensions and invalid inputs.
- Validation run [39059973378](https://github.com/teyyara/darboussedra/actions/runs/39059973378) is queued at checkpoint time. TypeScript, tests, build and rendered screenshots are **not yet confirmed** for Loop 016.
- The prior Loop 015 run [39059712137](https://github.com/teyyara/darboussedra/actions/runs/39059712137) had passed TypeScript, tests and production build, but its Chromium walkthrough capture remained in progress and had not published an artifact.
- No dependency added; no paid asset/service introduced. PR #5 remains draft and unmerged. No manual deployment performed.

### Next action
Inspect the fresh visual artifact after CI publishes it. Confirm the new bevels soften furniture edges without altering proportions, then verify material patterns and reflections from Loop 015 under real screenshots. If Chromium capture stalls again, report that limitation clearly rather than claiming visual acceptance.


## Loop 017 — Close interior sky gaps with a real ceiling

- Source commit [`776e92a`](https://github.com/teyyara/darboussedra/commit/776e92ac2f09df4bc34901863a9ce1c15ad13bc6) adds a continuous roof-underside ceiling to indoor and stair-transition views. It is split into four panels around the registered rooftop stair hatch rather than filling the hatch itself.
- The independent upper-room ceiling tiles have been removed in favour of the one continuous top plane; ground-floor room ceilings remain unchanged.
- Added three geometry tests for coverage area, hatch clearance and bounds.
- CI run [39060417666](https://github.com/teyyara/darboussedra/actions/runs/39060417666) was in progress after commit creation; validation outcome is pending.
- Earlier screenshot evidence from the Loop 014 artifact showed blue sky above blank walls during upper landing-to-stair travel. Loop 017 targets this directly, but the fix is **not visually accepted** until a new artifact is captured and inspected.
- No new dependency or paid asset/service added. PR #5 remains draft/unmerged. No manual deployment.

### Next action
Inspect current CI and the newest exterior/upper landing/stair screenshots. Verify indoor camera frames show a continuous ceiling except the actual roof hatch and confirm the roof climb remains navigable, then inspect blank room framing/material behavior. Do not declare visual acceptance on source checks alone.


## Loop 018 — Room ceiling fixtures and architectural cornices

- Source commit [`3aea28f`](https://github.com/teyyara/darboussedra/commit/3aea28fa6798c1fbbac8831bedac66be1afb872a) adds a scaled warm flush-mount fixture to room ceilings and a subtle non-shadow-casting point light in the currently selected room.
- Adds a continuous cornice to each owned wall run, using the same portal-aware wall intervals so trim never spans a real doorway. Replaces the back-wall-only top strip with consistent trim around rooms.
- Adds three tests for ground and upper ceiling fixture height alignment and ceiling behavior for non-enclosed rooftop destinations.
- CI run [39060862214](https://github.com/teyyara/darboussedra/actions/runs/39060862214) is running. Source validation and rendered review are pending until completion.
- Latest available browser evidence still predates loops 015–018; visual fixes are not yet certified.
- No dependencies or paid assets/services added. PR #5 stays open/draft; no merge to `main` or manual deployment.

### Next action
Review new captures of Family Table, Kitchen, private bedrooms, upper landing/stairs and rooftop. Check that lighting warms the active room without making it orange, cornices respect portal gaps, the continuous ceiling blocks unwanted sky sightlines while the roof hatch remains open, and no room is reduced to a blank wall. Do not call visual acceptance until screenshots are available.


## Loop 018 — Room ceiling fixtures and architectural cornices

- Source commit [`3aea28f`](https://github.com/teyyara/darboussedra/commit/3aea28fa6798c1fbbac8831bedac66be1afb872a) adds warm flush ceiling fixtures and a restrained local point light for the selected room; it also adds portal-aware cornice trim around owned wall runs.
- First validation attempt [39060862214](https://github.com/teyyara/darboussedra/actions/runs/39060862214) caught a JSX closing-brace typo. This is repaired in [`0fef440`](https://github.com/teyyara/darboussedra/commit/0fef44087d026ff2440ec129e9bfb9cb743c596c).
- The fresh validation run [39060937008](https://github.com/teyyara/darboussedra/actions/runs/39060937008) is running. TypeScript, unit tests, build and browser captures are not yet confirmed for the corrected source.
- Earlier room transition screenshots exposed a large sky sightline above the upper landing. Loop 017 added a roof-underside ceiling with an open stair hatch; visual verification remains blocked while browser capture jobs stall.
- No paid services/assets or dependencies added. PR #5 remains draft, no merge to `main`, no manual deployment.

### Next action
Confirm Loop 018 TypeScript/tests/build pass, then inspect a fresh screenshot artifact for ceiling, cornice, fixture placement, hatch clearance, empty wall views and mobile. If Chromium capture keeps stalling, report that limitation honestly and focus on a reproducible local check rather than claiming a visual pass.


## Loop 019 — Room-aware Moroccan wall accents

- Source commit [`61d0060`](https://github.com/teyyara/darboussedra/commit/61d00606d2bd3889fb4cdca583841541467be877) adds one framed geometric wall accent to each enclosed room. Wall selection follows the room's first-person viewing direction; placement uses `getRoomWallRuns` so frames stay inside uninterrupted wall segments. Rear-window walls, the garden and rooftop are excluded.
- Added `wallDecor.test.ts` to check all 11 enclosed destinations, wall-run containment, vertical clearance and exclusion of outdoor scenes.
- Fresh CI run [39061389044](https://github.com/teyyara/darboussedra/actions/runs/39061389044) is queued. No source checks are claimed for Loop 019 yet.
- Earlier run [39060937008](https://github.com/teyyara/darboussedra/actions/runs/39060937008) remains stuck at browser capture and has no screenshot artifact. Source checks passed after the Loop 018 JSX repair, but the latest artwork and ceiling still need visual confirmation.
- No paid asset/dependency, backend, data store, merge to `main`, or manual deployment was added/performed. PR #5 stays draft-only.

### Next action
Confirm Loop 019 typecheck, tests and production build. Review a fresh room-by-room screenshot artifact when the capture job is available; do not treat the older Loop 014 screenshots as proof of the new geometry.


## Loop 020 — Bounded browser visual capture

- Source commit [`64b3297`](https://github.com/teyyara/darboussedra/commit/64b3297f57a201bcb5018da5f15b66b5303fbe9b) bounds Playwright launch, navigation, room-arrival, camera-phase and screenshot waits. Missed stair-camera phases are recorded as notes and the report is written in a `finally` block, so an early interaction failure still leaves a partial artifact.
- Loop 019 source checks passed in [run 39061389044](https://github.com/teyyara/darboussedra/actions/runs/39061389044): TypeScript, tests and production build. Its browser-capture step still had not completed or published screenshots at last check.
- Loop 020 validation [run 39061538620](https://github.com/teyyara/darboussedra/actions/runs/39061538620) is in progress. Its result is not yet claimed.
- No paid services/assets, new dependencies, backend, storage, merge to `main`, or manual deployment.

### Next action
Confirm run 39061538620's checks and inspect its uploaded visual artifact when capture finishes. The newly added wall accents are not visually accepted until the actual rendered frames can be reviewed.


## Loop 021 — Browser capture timing adjustment

- Source commit [914b2c6](https://github.com/teyyara/darboussedra/commit/914b2c628a85a2818af8baad20bc4a377ae6a3c6) allows more time for software-rendered WebGL screenshots and room arrivals, and leaves CSS animation in its natural state during capture.
- Run [39061980927](https://github.com/teyyara/darboussedra/actions/runs/39061980927) passed install, TypeScript, tests, production build and Chromium setup; browser capture was still in progress at last check.
- Earlier Loop 020 artifact [12111348841](https://github.com/teyyara/darboussedra/actions/runs/39061538620) preserved a partial report showing 12-second screenshot timeouts and an arrival wait too short for the actual walk duration.

## Loop 022 — Exterior daylight framing and arrival details

- Source commit [c5b078b](https://github.com/teyyara/darboussedra/commit/c5b078b62271f45db23a5beb50a0e30f4624c84b) lowers the sun and cloud groups into the exterior camera frustum, keeps the second cloud cluster in view, adds understated entrance sconces, and reduces the landing-page wash so the actual 3D façade is clearer.
- Added a sky-layout regression test to guard sun/cloud placement in the exterior camera frame.
- Run [39062169991](https://github.com/teyyara/darboussedra/actions/runs/39062169991) passed install, TypeScript, tests, production build and Chromium setup; its browser-capture step was still running. Updated sky/sconce screenshots have not yet been inspected.

## Loop 023 — Camera-aware artwork placement

- Successful visual-review artifact [12111871924](https://github.com/teyyara/darboussedra/actions/runs/39061389044) confirmed the wall art renders. Manual review found the kitchen piece too close in screen space to the fridge and the living-room piece cropped at the edge of the view.
- Source commit [43d23f6](https://github.com/teyyara/darboussedra/commit/43d23f6cf0aa79ce7f71e315aeea0f6224f19a17) scores wall segments against the destination camera direction and excludes the kitchen appliance wall and library shelving wall. Regression tests cover those reservations and the living-room wall choice.
- Run [39062350399](https://github.com/teyyara/darboussedra/actions/runs/39062350399) is running; results for this latest wall-selection change are not yet confirmed.

## Visual evidence notes

- Full browser review [39060937008](https://github.com/teyyara/darboussedra/actions/runs/39060937008) passed with 10/10 destination arrivals, no browser runtime errors/notes, correct stair ascent/descent camera pitch, and usable 390px mobile width.
- The actual frames nevertheless showed a sun clipped near the top of the exterior, sparse rooms, and a broad sky sightline at the upper landing. The visible sky may be the intentional stair hatch, so keep verifying the new frame rather than sealing that opening blindly.
- Loops 021–023 visual review is not yet complete. Do not claim final visual acceptance until fresh screenshots from the latest source are available.

### Next action
Confirm run 39062350399. Retrieve fresh visual-review screenshots and re-check the sun/cloud framing, entrance sconces, kitchen and living-room artwork, upper landing/hatch and mobile view. PR #5 remains draft; main and manual deployment are untouched.


## Loop 024 — Avoid the living-room doorway sightline

- Commit [3cebb5c](https://github.com/teyyara/darboussedra/commit/3cebb5c82709da44965557d01dfc879a5cef2483) reserves the living-room back wall from artwork because the library opening causes a crop/through-corridor composition.
- Source typecheck/tests/build passed. Browser run [39062513825](https://github.com/teyyara/darboussedra/actions/runs/39062513825) stopped during room-to-map navigation and uploaded partial artifact [12111769521](https://github.com/teyyara/darboussedra/actions/runs/39062513825). The picture on the left wall was still cropped, so composition remains a follow-up rather than an accepted visual result.

## Loops 025–028 — Fitted kitchen surfaces

- Commit [eb7977e](https://github.com/teyyara/darboussedra/commit/eb7977e4754153b2653ece5ff712c70d33adb9d1) adds fitted counter details: four cooktop burners, controls, a sink basin and rim, a mixer tap and front cabinet doors. Geometry checks verify the cooktop/sink stay within the worktop.
- Commits [d20cf0a](https://github.com/teyyara/darboussedra/commit/d20cf0ae272bd5525b213957bf299fabbeefde6a) and [ced4cd6](https://github.com/teyyara/darboussedra/commit/ced4cd68d37e23b834b9a0245e38f2a42b43bdcb) repair a duplicate JSX opening and let the rounded-prop renderer accept optional metalness for the stainless fixtures/hardware.
- Run [39062964881](https://github.com/teyyara/darboussedra/actions/runs/39062964881) passed TypeScript, tests and production build after these repairs; browser capture was still active and had not published an artifact at last check.

## Loop 029 — Mediterranean garden planting

- Commit [dc1c0ae](https://github.com/teyyara/darboussedra/commit/dc1c0ae0406799cba72cd6a83a6907b04590dbfa) replaces the conical placeholder evergreens with irregular olive-style canopies, visible branches and lower shrubs. Plant coordinates are centralized in gardenPlants.ts.
- The first garden bounds test failed because the generic trunk-depth assertion was more conservative than the actual crown geometry. Loop 031 corrects that check to use the crown extents and still asserts each canopy/shrub lies within the garden footprint.

## Loop 030 — Prevent parallel visual jobs from piling up

- Commit [f973a5d](https://github.com/teyyara/darboussedra/commit/f973a5d31294df8ccb7459a0f31c11be1262738c) adds a workflow concurrency group per pull request and cancels superseded validation runs. A follow-up push cancelled run [39063129512](https://github.com/teyyara/darboussedra/actions/runs/39063129512), demonstrating that later commits no longer need to queue behind every stale browser-capture run.

## Loop 031 — Garden bounds assertion and current checks

- Commit [8b8c44d](https://github.com/teyyara/darboussedra/commit/8b8c44db1ec20e29155275d81c0a4b322ebc50c4) reduces a false-positive generic tree depth bound and leaves the per-crown and per-shrub bounds checks intact.
- Run [39063164627](https://github.com/teyyara/darboussedra/actions/runs/39063164627) has passed TypeScript, tests, production build and Chromium installation; browser capture is running. No new garden screenshot has been visually reviewed yet.
- The previous complete capture [39060937008](https://github.com/teyyara/darboussedra/actions/runs/39060937008) passed 10/10 room arrivals, runtime checks and stair camera pitch. Later captures showed the lowered sun/entrance sconces, but one room arrival and some timed stair frames can still miss the capture phase.

## Current acceptance state

- Latest source-check result: pass for the exact source revision 8b8c44db1ec20e29155275d81c0a4b322ebc50c4.
- Visual acceptance: pending fresh artifact from run 39063164627. The still-open living-room picture crop must be reassessed alongside the new kitchen fixtures and olive-style planting.
- PR #5 remains open and draft-only. Main stays at 501cc6ccf3e6926504dfcd051ac98147360cd48a. No manual Vercel deployment; no paid dependencies/services/assets.

### Next action
Inspect run 39063164627's fresh visual artifact when uploaded. Verify the kitchen counter, sink/cooktop, olive trees and shrubs, the entrance sky/sconces, upper landing, room-art framing and 390px mobile layout before claiming final visual acceptance.


## Loop 032 — Living-room artwork sizing

- Source commit [9a71e80](https://github.com/teyyara/darboussedra/commit/9a71e8064a47c6d84e1b93f8b0f325a48c64941e) caps the living-room wall accent at 0.62 m instead of 0.88 m after the actual screenshot showed the frame cropped at the left side of the first-person view. A regression test protects that size ceiling.
- Latest visual confirmation is pending; the old screenshot is evidence for the issue, not proof that the smaller piece is now correctly framed.

## Loop 033 — Finished roof stair-hatch reveal

- Source commit [a53100d](https://github.com/teyyara/darboussedra/commit/a53100dfd7c21439bcd7c5598e8349b8d28eb3d1) adds a restrained timber reveal around the roof stair hatch. Its strips sit entirely on the solid ceiling side so the intended stair opening and head clearance remain unchanged.
- Added a regression test to assert all four trim strips avoid overlapping the open hatch area.
- Run [39063511034](https://github.com/teyyara/darboussedra/actions/runs/39063511034) is queued for this exact source commit. The earlier run [39063399389](https://github.com/teyyara/darboussedra/actions/runs/39063399389) for Loop 032 is still at browser capture; no current artifact is published for either commit.

### Current acceptance state
- Latest source checks are pending for Loop 032/033. Loop 031's typecheck/tests/build passed before that later source change, but its browser capture was cancelled by a newer push without publishing an artifact.
- Do not claim the living-room crop or stair-hatch framing fixed until fresh screenshots from the newest source are inspected.
- PR #5 remains open and draft-only. Main is unchanged; no manual deployment or paid assets/services/dependencies.


## Loop 034 — Kitchen composition

- Source commit [2f0ee6c](https://github.com/teyyara/darboussedra/commit/2f0ee6c2ee3e193e9ac8ce6ac1bea99db9eb5d4b) redirected the kitchen view toward the worktop, sink and cooktop rather than the refrigerator. The first target did not satisfy eye-level / horizontal framing rules, which CI caught.
- The camera was refined in [68baa60](https://github.com/teyyara/darboussedra/commit/68baa601ff4c0a7052e534f00b0fa2662d2ea904) to keep a 0.4 m target drop and maintain a modest diagonal view. A regression test asserts that the camera still points toward the fitted worktop.

## Loop 035 — Deterministic room screenshots plus a movement probe

- Source commit [cc221f7](https://github.com/teyyara/darboussedra/commit/cc221f772d1aed57153d857475fff9c5431faef5) captures static room/exterior/map views with reduced motion so an incomplete slow route does not leave the whole room photo set half-finished.
- It then uses a separate browser page to re-enable normal motion and capture the lower stair flight, upper landing, roof stair flight, hatch clearance and descent. The intention is to preserve real animated movement checks while keeping still-image evidence complete.

## Loop 036 — Current validation

- Run [39070069994](https://github.com/teyyara/darboussedra/actions/runs/39070069994) has passed typecheck, tests, production build and Chromium installation. Its browser capture is running; no artifact has been published yet.
- The prior full frame set [39063511034](https://github.com/teyyara/darboussedra/actions/runs/39063511034) documented the incomplete route issue: the captured entrance, kitchen, library and prayer-room views were still marked WALKING TO, and the test timed out trying to reopen the map while the camera was moving. The new capture flow separates those static views from its movement probe.

### Current acceptance state
- Source checks: PASS for commit 68baa601ff4c0a7052e534f00b0fa2662d2ea904.
- Visual acceptance: PENDING. Inspect fresh kitchen and living-room compositions, garden planting, roof-hatch trim, desktop exterior and mobile map before treating the latest geometry as accepted.
- PR #5 remains open and draft-only; main is unchanged, and no manual Vercel deployment or paid services/assets/dependencies were added.

### Next action
Retrieve the artifact from run 39070069994 after capture finishes, inspect all rendered views and the movement report, then address any remaining concrete issues.


## Loop 037–038 — Camera clearance and composition tests

- [`1191265`](https://github.com/teyyara/darboussedra/commit/11912659d9c665059c0b38f3484cf27194ea4b95) placed the kitchen camera on the walkable side of the counter and added minimum clearance assertions.
- [`62b1f64`](https://github.com/teyyara/darboussedra/commit/62b1f64e9dbcc310209862015eb6f9299e17c385) updated the kitchen-target expectations, re-aimed the living-room camera away from the rear doorway, and tests the framed artwork position with a PerspectiveCamera projection.
- A fresh screenshot [`05-living-room-eye-level.png`](https://github.com/teyyara/darboussedra/actions/runs/39070641063) showed the artwork inside the frame, while the sofa still occupies much of the foreground. The kitchen is improved but worktop remains dominant in the foreground; Loop 044 pulls it further back.

## Loop 039–040 — Make the library look stocked

- [`d42a4bd`](https://github.com/teyyara/darboussedra/commit/d42a4bd17086f16a1cb9ca2fe180c4be7f158040) moved book spines to the room-facing side of the shelf backing, and added geometry tests.
- [`9c3e602`](https://github.com/teyyara/darboussedra/commit/9c3e6024693b6d7474ec03809b0fa231573c856e) adjusted the upper row so books clear the board above it.
- Full room frames from artifact [12114724022](https://github.com/teyyara/darboussedra/actions/runs/39071686186) show the shelf appears fully stocked, although the volumes read as simplified blocks rather than individually textured printed books. Loop 045 increases the count to 27.

## Loop 041–042 — Garden path

- [`66d7ae1`](https://github.com/teyyara/darboussedra/commit/66d7ae125724570f0feae82c9d44b575de5bce36) adds a doorstep and six staggered stone pavers; tests bound them inside the garden and preserve visible grass joints.
- [`bf98c5c`](https://github.com/teyyara/darboussedra/commit/bf98c5c9af8254e9b924be82b618d9fffd37e9a4) corrected the test to permit the intentionally authored 0.40m stone depth.

## Loop 043–044 — Rooftop tea nook and kitchen framing

- [`9c8a652`](https://github.com/teyyara/darboussedra/commit/9c8a6528d6ce32492b2440b04c4f5d1930203cb9) adds a rug and low tea-table set to make the rooftop seating read as a lived-in place, with bounding tests to keep the furniture clear of the stair hatch and parapet.
- [`e0267c0`](https://github.com/teyyara/darboussedra/commit/e0267c0148d4c730a939433c2380409f0f9f086d) pulls the kitchen viewpoint back from the countertop; tests now assert a minimum lateral clearance and room-boundary clearance.
- Actual screenshots show these details render, but the tea set is still far to the left in the rooftop shot, and the kitchen worktop occupies much of the foreground. Loop 047 retargets the two outdoor compositions; kitchen further pullback can be revisited only after fresh views.

## Loop 045–046 — Denser library and settled-view review

- [`992954f`](https://github.com/teyyara/darboussedra/commit/992954f7809a075413b904b0705a32d47066f327) increases the book count from 18 to 27 (three rows of nine) with shelf/spine geometry tests.
- [`619e545`](https://github.com/teyyara/darboussedra/commit/619e54590401923a3ec2c7a7575525c089e9d4d1) fixes the capture’s arrival predicate to require the expected room title and enabled navigation button, and deep-links settled room stills so the screenshots no longer depend on chaining long walks.
- Run [39071795119](https://github.com/teyyara/darboussedra/actions/runs/39071795119) was superseded while the movement probe was still running. It uploaded partial artifact [12115955169](https://github.com/teyyara/darboussedra/actions/runs/39071795119) with the full room/mobile still set and ascent/landing/roof-stair frames, but the process was cancelled before `browser-review.json` and the remaining movement frames were uploaded.

## Loop 047 — Garden and rooftop view framing

- Source commit [`fc2ddb1`](https://github.com/teyyara/darboussedra/commit/fc2ddb1ca808d27ae05bcc38a2f5a507708e2b6d) moves the olive-style trees forward into the garden so they flank the walking line instead of visually merging with the house facade. The camera is moved closer to the garden centreline and tilted slightly downward to keep the pavers in the frame.
- Rooftop camera now aims at the bench/rug/tea-table nook while looking down across the terrace, instead of centring the empty deck and hatch.
- Added regression expectations for tree clearance, garden-path framing and the rooftop seating target.
- Run [39072071748](https://github.com/teyyara/darboussedra/actions/runs/39072071748) has passed TypeScript, tests, production build and Chromium installation. Its new screenshots are still being captured; the new camera framing is not yet visually accepted.

### Next action
Inspect the fresh screenshots from run 39072071748 once the artifact appears. Confirm the garden path and both trees frame correctly, rooftop seating lands in the view without hiding the hatch, and the movement probe produces an ascent, roof-hatch and descent report. PR #5 remains draft-only; main and manual deployment remain untouched.


## Loop 048 — Camera-phase rules and bounded follow-up

- Source commit [`f9bfeaf`](https://github.com/teyyara/darboussedra/commit/f9bfeafc13158c620fb8eebe837e76c0e87e4fa3) centralizes camera-phase windows in `scripts/visualReviewPhases.mjs` and adds unit tests for the roof hatch, landing and lower stair phases.
- The hatch window no longer requires `x > 1` at the same time as roof-zone/y/z predicates; that requirement was unnecessarily restrictive because the camera rises through the hatch near the stair centre.
- Rooftop arrival now returns an explicit success result. If it fails, the script records a note and skips the descent map click instead of trying to reopen the map while the route is still moving.
- Run [39072431412](https://github.com/teyyara/darboussedra/actions/runs/39072431412) passed typecheck, tests and production build, then was cancelled by the next push during browser capture. Partial artifact [12115603048](https://github.com/teyyara/darboussedra/actions/runs/39072431412) has only early room views.

## Loop 049 — Give the descent probe enough time

- Source commit [`bf40c6e`](https://github.com/teyyara/darboussedra/commit/bf40c6e12f4e16692b69122fccbfc416afd07a39) lets the lower-stair descent capture wait up to 90 seconds for the actual lower stair flight.
- The motivation is concrete in the previous movement report [39072071748](https://github.com/teyyara/darboussedra/actions/runs/39072071748): it captured the roof-hatch exit and completed the rooftop transition, but the descent screenshot was at route progress 33/56, camera zone `upper`, elevation 4.65, with pitch `-0.033`. This correctly failed the requirement to look downward on the lower stairs.
- Run [39072491627](https://github.com/teyyara/darboussedra/actions/runs/39072491627) has passed TypeScript, unit tests, production build and Chromium installation. Its browser capture is running; the updated descent frame/report are not published yet.

## Loop 047 visual follow-up

- Garden and rooftop destination framing from [`fc2ddb1`](https://github.com/teyyara/darboussedra/commit/fc2ddb1ca808d27ae05bcc38a2f5a507708e2b6d) has passed source tests. Its screenshots are still needed to verify centered stepping stones, olive trees clear of the façade, and the tea nook in the rooftop view.
- The last complete still set visually confirms the exterior/paver entrance, filled library and fitted kitchen. The garden path view was still tree/corner-biased and the roof tea set remained off to the far left; Loop 047 changes those cameras but has not yet been visually accepted.

### Next action
Inspect run 39072491627's fresh artifact and report. Verify that the garden camera frames the stone path and olive trees, the rooftop camera frames the tea nook without losing hatch context, and the movement report has all of hatch exit plus a real lower-stair descent frame with downward camera pitch. PR #5 remains draft-only; main and manual deployment remain untouched.


## Loop 050 — Keep the garden path and both olives in view

- Source commit [`de1ffa3`](https://github.com/teyyara/darboussedra/commit/de1ffa3709f971114a591389062a24884200068d) lowers the garden camera target from 1.4m to 0.9m, giving a still eye-level ground view enough downward pitch to show the pavers rather than cropping them at the bottom.
- Moves the two olive-style tree centres inward from x = ±2.72m to ±1.95m. Regression tests preserve more than 0.7m of clearance between crown extent and the central walking line while keeping planting inside the garden footprint.
- This change is grounded in actual frames from [run 39072071748](https://github.com/teyyara/darboussedra/actions/runs/39072071748), artifact [12115513027](https://github.com/teyyara/darboussedra/actions/runs/39072071748): the prior garden view cropped the close pavers and exposed only one olive tree, while the other was beyond the field of view.
- Run [39072824788](https://github.com/teyyara/darboussedra/actions/runs/39072824788) is queued behind the prior visual capture; Loop 050 source checks are not yet claimed.

### Current validation state
- Loop 049 run [39072491627](https://github.com/teyyara/darboussedra/actions/runs/39072491627) passed typecheck, tests, production build and Chromium installation; its capture step is still in progress at last check.
- Loop 048 source checks passed. The last complete movement report confirms the hatch-exit screenshot was captured, but the descent screenshot was at route waypoint 33/56 in the upper landing with cameraDirectionY -0.033. Loop 049 extends the lower-stair phase wait to 90s to avoid accepting that false frame.
- Visual acceptance of Loop 047's garden/roof camera poses and Loop 050's inward tree placement remains pending new screenshots. Don't merge or deploy manually; PR #5 stays open/draft and main is unchanged.


## Loop 065 — Cloud readability, outdoor rendering scope, and walkthrough validation

- **Scope:** Improve the visible exterior sky and make the existing neighborhood buildings render only while the camera is outside. No new furniture, garden props, rooftop decoration, external assets, paid services, APIs, or dependencies were added.
- **Sky:** Enlarged the existing overlapping ellipsoid cloud lobes and spaced the two clusters more naturally beside the single sun disc. The existing sky projection tests continue to constrain the cloud groups to the visible frame.
- **Scene cost:** The four procedural neighborhood buildings, windows, parapets, sidewalk and road remain visible for exterior/garden/outdoor shots, but their meshes are removed from the render while the camera is indoors. This avoids unnecessary background geometry on every interior frame.
- **Browser QA repair:** The previous branch run [39083452560](https://github.com/teyyara/darboussedra/actions/runs/39083452560) passed install, typecheck, unit tests, production build and Chromium install. Its rendered review failed only in the late movement probe: it timed out waiting for the lower-stair descent capture at 45 seconds and then evaluated an upper-landing frame as the descent. The capture window now allows 90 seconds; its movement/pitch assertions remain intact so a wrong camera angle is not silently accepted.
- **Validation status:** CI for this checkpoint must re-run before any merge decision. The earlier failure is not counted as a passing browser test. The Vercel checks for the prior revision reported a build-rate limit; no manual Vercel deployment was issued.
- **Checkpoint:** This status and the source changes are committed together on the current work branch. The exact commit SHA is the verified branch HEAD.
- **Next:** Inspect the new GitHub Actions results and visual-review artifact. Merge only if the capture completes and the actual descent view passes; otherwise repair the camera route rather than relaxing the assertion.


## Loop 066 — Room-scale composition and more reliable stair gaze

- **No-new-decoration constraint retained:** this loop adds no furniture, wall art, rugs, garden items, rooftop objects, assets, or dependencies.
- **Living Room arrival:** move the existing camera pose farther from the sofa and aim across the room at a more useful angle. The sofa/furniture set itself is unchanged; the goal is to stop the current viewpoint making the sofa dominate most of the frame while leaving a large empty wall.
- **Lower stair descent:** increase the downward bias of intermediate camera poses from the existing mild angle to a more useful approximately 20-degree descent gaze. Tighten the unit regression and Chromium screenshot threshold so the actual captured descent must pitch down between 0.3 and 0.5 in normalized direction-Y. The 90-second phase window stays; the test does not accept a stale landing capture.
- **Clouds:** enlarge the vertical/depth profile of the already-requested cloud lobes so they read as fuller cumulus puffs. The single sun disc remains unlayered; no new sky props are introduced.
- **Scope boundary:** the room registry already derives same-level portals and checks room footprints and stair clearances. This loop does not invent a new family floor plan; it improves the confirmed camera-framing fault and retains the architectural geometry audit for the next pass.
- **Validation:** require a new full GitHub run of typecheck, tests, production build, and Chromium captures. Do not merge this revision unless the actual stair descent view passes. Never run a manual Vercel deployment.


### Loop 066 camera-framing follow-up

- The first full CI run reported 116 passing unit tests and one genuine regression: the wider living-room camera move pushed the existing geometric wall art out of the first-person view cone. The stair-path and cloud tests passed.
- Re-aimed the living-room view farther across the room to keep the existing feature within frame while leaving the furniture untouched. The next CI run must confirm both the original art-framing invariant and the more downward stair-descent invariant.
- This was a camera correction prompted by the test failure, not a reason to loosen the visual assertion. No decorations were added.


## Loop 067 — Stair-flight eye-line correction

**State:** Validated by GitHub Actions and reviewed from the fresh Chromium screenshots for commit [192e70c](https://github.com/teyyara/darboussedra/commit/192e70cfb1b981237a91ca3d18d1cf4594fa714c). PR #7 remains open and unmerged.

- **CI run:** [39132738897](https://github.com/teyyara/darboussedra/actions/runs/39132738897) passed typecheck, the full unit suite, production build, Chromium visual capture, and screenshot upload.
- **Rendered confirmation:** Browser report recorded no runtime errors or review notes, all expected room arrivals, no mobile horizontal overflow, ascent direction-Y -0.192, and descent direction-Y -0.489. The fresh ascent and descent views now show individual stair treads clearly; the upper flight still shows the hatch reveal/edge crossing the climb path.
- **Next issue:** The roof flight runs from Z=2.05 to Z=-2.68, but the hatch only spans Z=-2.725 to Z=-0.875. The camera eye reaches roof level before entering the hatch, so the underside trim crosses the view near eye height. Fix the actual flight/opening alignment rather than increasing camera pitch further.
- **Scope:** No new decorations or assets. No dependency changes. No main merge and no manual Vercel deployment.


## Loop 068 — Roof-stair headroom and hatch alignment

**State:** Superseded after fresh Chromium review exposed an upper-corridor overlap and descent screenshot timeout. PR #7 remains open and unmerged.

- **Problem confirmed from Loop 067 screenshots:** The lower stair eye-line correction works and brings the treads into view. The roof stair still passes beneath the hatch's front reveal while the eye is already at near-roof height, creating a horizontal bar directly across the first-person climb.
- **Outcome:** The flight/opening arrangement in commit [14f3a51](https://github.com/teyyara/darboussedra/commit/14f3a5114a1f8dc858e0e4eff9bc087088467369) cleared the hatch at roof height but ran directly over the upper corridor. Loop 069 restores the prior flight endpoint and adjusts the opening instead.
- **Regression coverage:** Assert that camera waypoints near roof height lie inside the opening. Update guardrail coverage tests to check the right-side rail reaches the front edge yet leaves a safe exit gap at the rear.
- **Boundaries:** No decorations, room-object changes, assets, dependencies, main merge or manual Vercel deployment.
- **Next action:** Inspect fresh roof-stair, hatch-clearance, and descent screenshots from the exact current commit; if the new opening looks too large or leaks into bedroom views, adjust it based on those captures.


### Loop 068 validation follow-up

- The first CI run for [29b705a](https://github.com/teyyara/darboussedra/commit/29b705a95c12381384fd4a49f541d1777fd2fc0e) correctly found stale layout assertions: they required the roof flight to start exactly at the far edge of the upper landing, instead of anywhere safely inside its footprint, and treated z=0 as beyond the hatch even though the new opening extends there.
- The roof-opening headroom regression, camera route suite, interior ceiling panel test, hatch rail tests, and roof deck grout tests passed on that run. Updated the layout validator and assertions to express the new landing connection and hatch boundary rather than remove validation.
- No merge or manual deployment.


## Loop 069 — Preserve upper-corridor headroom and capture descent reliably

**State:** Reviewed from exact commit [168a4e8](https://github.com/teyyara/darboussedra/commit/168a4e836c66f38f9485cd3cecda3787917141dc), with all CI checks passing. PR #7 remains open and unmerged.

- **Geometry:** Restore the roof-flight start/end to Z=2.05 and Z=-2.68, preserving the upper corridor clear of the flight's underside. Extend the roof opening to Z=-3.15..1.45 so the near-roof camera samples stay above the opening; the top stair exit retains about 0.47m of rear clearance.
- **Guardrails:** Keep three-sided timber protection and the right-side rail exit gap; update the required clear offset to match the restored stair-end coordinate. The egress point remains clear of the rail in X as well as Z.
- **Screenshot capture:** Increase only stair/landing screenshot timeout from 30 to 45 seconds. The capture remains mandatory and the visual gate still fails if it cannot be captured; this does not skip or weaken any review.
- **Regression coverage:** Check the restored flight-end against the landing edge, camera eye-height positions inside the enlarged hatch, roof-camera-zone boundary outside the opening, and the right-side guardrail egress gap.
- **Boundaries:** No decorations, furniture, assets, dependencies, main merge or manual Vercel deployment.
- **Rendered review:** [CI run 39134710065](https://github.com/teyyara/darboussedra/actions/runs/39134710065) passed typecheck, the full unit suite, build, Chromium review and artifact upload. Browser report has 20 screenshots, no runtime errors or review notes, rooftop route reached 56/56, descent frame captured successfully, mobile width 390/390 with no overflow. Descent gaze-Y was -0.486 and ascent gaze-Y -0.192.
- **Next visual issue:** The upper-landing turn image still frames too much of the roof-stair underside. Inspection of geometry showed the scripted side-lane camera at x=0.77, only 0.12m from the inner guardrail, despite the usable bridge strip being about 0.55m wide.


### Loop 069 validation follow-up

- The CI run for [10ec23c](https://github.com/teyyara/darboussedra/commit/10ec23cc30eec55ed5a229ecfed73f5941109c0e) passed typecheck but correctly rejected two geometry invariants: early near-roof camera poses extended beyond the opening's forward edge, and the last roof walkway waypoint returned over the hatch after reaching solid deck.
- Shifted the hatch forward to Z=1.45 while retaining its rear edge at Z=-3.15. The top stair ends at Z=-2.68 and its egress point remains outside the rail in X with about 0.48m Z offset.
- Re-routed the final roof waypoint along the right-hand deck to a point beyond the hatch front edge before heading toward the terrace. The hatch-crossing assertion stays strict (no more than the single final stair point is over the opening at roof eye height).
- The stair/landing screenshot budget is now 45 seconds, still a hard fail if the image cannot be captured. Full CI rerun pending; no merge or manual deployment.


## Loop 070 — Center the upper walking lane

**State:** Validated by full CI and fresh Chromium review in [run 39135488044](https://github.com/teyyara/darboussedra/actions/runs/39135488044); PR #7 remains open and unmerged.

- **Change:** The camera is now centered at X=0.925 in the usable bridge strip, midway between the inner rail and outer edge; the room footprint, hatch and rail geometry are unchanged.
- **Rendered result:** Typecheck, unit tests, production build and Chromium capture passed. Browser report contained 20 screenshots, no runtime errors or review notes, full room arrivals, no mobile overflow and correctly pitched ascent/descent frames. The upper-turn screenshot confirms the safe centered position, but its direction-Y was only -0.034, leaving the staircase underside visually dominant.
- **Decision:** Keep the lane-position correction and add only a modest downward upper-bridge gaze. Do not move the staircase or reduce the visual QA bar to solve a framing problem.
- **Boundaries:** No furniture/decorations, assets or dependencies; no main merge or manual Vercel deployment.


## Loop 071 — Lower upper-bridge sightline without changing the stair geometry

**State:** Validated by full CI and fresh Chromium screenshots in [run 39136250094](https://github.com/teyyara/darboussedra/actions/runs/39136250094). PR #7 remains open and unmerged.

- **Rendered report:** All 20 screenshots captured, no browser runtime errors or notes, every expected room arrival succeeded, WebGL2 is available, and the mobile document is exactly 390px wide with no overflow. The upper-landing frame direction-Y is -0.227; stair ascent is -0.193 and descent is -0.505.
- **Visual finding for next loop:** The upper-turn view is less sky/ceiling dominated, but the family-table doorway still reveals a blank-looking stair hall in its settled view. The source shows the stair flight and upper circulation are intentionally hidden whenever the camera is not transitioning between storeys.
- **Change:** Loop 072 selectively reveals the ground flight and its head landing only when settled in Family Table, the room whose back portal opens directly into the stair hall. Other ground-floor views continue to hide the stairs, and all upstairs private-room walls/objects remain hidden from ground views.
- **Scope:** No decorations, assets or dependencies. PR #7 remains open; no main merge or manual Vercel deployment.


## Loop 072 — Show the real staircase from the family-table doorway

**State:** Validated by full CI and fresh Chromium screenshots in [run 39137068586](https://github.com/teyyara/darboussedra/actions/runs/39137068586). PR #7 remains open and unmerged.

- **Rendered result:** All 21 review files uploaded, no browser runtime errors or notes, WebGL2 is available, all expected arrivals succeeded, and the mobile document has no horizontal overflow. The Family Table view exposes the actual stair flight/landing, while the Library remains free of upstairs stair geometry.
- **Decision:** Keep the stair visibility exception restricted to the only ground-floor stair-hall doorway. Next, improve the cramped Pets' Corner through a room-footprint rebalance rather than adding props.
- **Boundaries:** No decorations, assets or dependencies. No main merge or manual Vercel deployment.


## Loop 073 — Rebalance library and Pets' Corner width

**State:** Validated by full CI and fresh Chromium screenshots in [run 39137920514](https://github.com/teyyara/darboussedra/actions/runs/39137920514). PR #7 remains open and unmerged.

- **Rendered result:** All 20 screenshots captured, no runtime errors or browser review notes, full room arrivals passed, WebGL2 was detected, and mobile had no horizontal overflow. Pets' Corner is visibly wider; its existing feeding bowl and scratch post stay in bounds. The narrowed library keeps its full three-row shelf and 27 readable books.
- **Visual follow-up:** The Library frame reveals only the edge of its existing wall accent at the right side. Loop 074 shifts only the destination aim toward the space between the shelf and that wall so the current room contents compose together.
- **Boundaries:** No decorations, props, assets, dependencies, main merge or manual Vercel deployment.


## Loop 074 — Frame the existing library contents

**State:** Validated by TypeScript, unit tests, production build, and fresh Chromium review in [run 39138693955](https://github.com/teyyara/darboussedra/actions/runs/39138693955). PR #7 remains open and unmerged.

- **Rendered result:** All 20 screenshots captured, no browser runtime errors or review notes, and the route, WebGL and mobile checks passed. The library bookshelf remains visible, but the artwork still appears as a thin edge-on sliver on the right wall.
- **Finding:** The prior assertion checked the artwork's projected corners, not whether its wall-facing surface had a useful viewing angle. The camera was almost parallel to the right wall, so an in-frame bounding box did not equal a readable artwork face.
- **Decision:** Keep the 2.2m library / 2.0m Pets' Corner reallocation and preserve the bookshelf; change the camera position and heading rather than moving or adding artwork.
- **Scope:** No props, decor, assets, dependencies, main merge or manual Vercel deployment.


## Loop 075 — Correct library wall-facing angle without sacrificing the bookshelf

**State:** Validated by full TypeScript, unit tests, production build and fresh Chromium review in [run 39139869351](https://github.com/teyyara/darboussedra/actions/runs/39139869351). PR #7 remains open and unmerged.

- **Rendered result:** All screenshot and route checks passed with no runtime errors or review notes. The library accent now reads face-on rather than as an edge-on sliver, while the existing bookshelf stays prominent and all three book rows remain within the asserted framing bounds.
- **Regression coverage:** The wall-art test checks its full projected bounds and a wall-facing cosine above 0.32 (the initial 0.5 threshold proved infeasible without crowding the opposite bookshelf). Representative book spines from each row are projected into the viewport. The first CI attempt also caught and corrected a test-only TypeScript mistake.
- **Scope:** No new decorations, furniture, wall art or assets; no dependency changes, merge or manual Vercel deployment.


## Loop 076 — Center Pets' Corner framing around the existing bed and scratch post

**State:** Validated by full CI and Chromium review in [run 39140563309](https://github.com/teyyara/darboussedra/actions/runs/39140563309). PR #7 remains open and unmerged.

- **Problem confirmed from Loop 075 screenshot:** The wider Pets' Corner still feels like a corridor because the camera stands left of centre, letting the library doorway/frame dominate the foreground while the bed is pushed to one side and the scratch post becomes the main focal object.
- **Change:** Move the camera to the room centre X=-2.2 and narrow the rightward gaze to X=-1.85. Aim between the existing bed and scratch post; all room dimensions, wall art, floor marker, pet props, doors and shelving stay unchanged.
- **Regression coverage:** A Three.js perspective camera projects the existing bed centre and scratch-post centre into the first-person frame. It also asserts a centred camera and modest horizontal offset, while the existing room footprint, target-in-room, vertical framing and camera-path checks remain active.
- **Scope:** No new decorations, furniture, props, assets or dependencies; no main merge and no manual Vercel deployment.
- **Rendered result:** The bed and scratch post share the first-person view and the library doorway takes less of the foreground than before. No browser errors or review notes were reported.


## Loop 077 — Frame the full existing prayer mat from the entry side

**State:** Validated by full CI and fresh Chromium review in [run 39141142520](https://github.com/teyyara/darboussedra/actions/runs/39141142520). PR #7 remains open and unmerged.

- **Rendered result:** All 21 visual-review files were captured and uploaded, no browser runtime errors or review notes were reported, all expected arrivals passed, WebGL2 was detected, and mobile had no horizontal overflow. The full prayer mat fits inside the view.
- **Follow-up found by screenshot inspection:** The mat is still too dominant; the upper part of the window is clipped, and only a sliver of the existing left-wall accent is visible.
- **Decision:** Pull the camera slightly toward the room entry and aim diagonally across it. Raise the target from Y=0.25 to Y=0.65 so the view balances the mat with the window and wall context while retaining the full mat.
- **Scope:** No decor, props, furniture, assets, dependencies, merge, or manual Vercel deployment.
- **Next action:** Inspect the fresh prayer-room eye-level frame. Verify the complete mat reads clearly with some floor space around it while the window and surrounding wall remain visible.


## Loop 078 — Balance the prayer mat with the window and existing wall accent

**State:** Superseded: first CI run found the raised gaze cropped a mat corner and the art still on the entry wall; see Loop 079 correction.

- **Problem confirmed from Loop 077 screenshot:** All four mat corners are technically in-frame, but the mat dominates the lower half. The high window is clipped at the top, and the existing wall accent is cut to a thin edge at the left.
- **Change:** Move the camera 0.55m toward the entry edge (Z=-0.45), shift it slightly to the right side (X=4.5), raise the target from Y=0.25 to Y=0.65, and aim farther across the room to X=2.8. Room footprint, windows, mat, art, doors, walls, and lighting are unchanged.
- **Regression coverage:** Keep the four corners of the existing 1.05m × 1.75m mat in the viewport. Add a projection test for all four corners of the existing prayer-room wall accent and assert a minimum wall-facing angle. Existing room-bounds and route checks remain active.
- **Scope:** No new decorations, assets, furniture or prop changes, dependencies, merge, or manual Vercel deployment.
- **Next action:** Inspect the new prayer-room screenshot; confirm floor space around the mat, the window, and the whole wall accent are visible together.


## Loop 079 — Recover full mat framing and move the existing accent off the entry wall

**State:** Validated by the complete CI pipeline and fresh Chromium review in [run 39144271635](https://github.com/teyyara/darboussedra/actions/runs/39144271635). PR #7 remains open and unmerged.

- **Loop 078 result:** Typecheck passed but unit tests exposed two real visual constraints: the raised Y=0.65 target cropped the near prayer-mat corner (projected Y=-1.070), and the existing art's front-wall placement lay almost directly beside the camera (projected X=-0.953).
- **Camera:** Keep the prayer-room destination near the entry edge at Z=-0.45; shift X to 4.8 to increase distance from the near mat corner, and lower the target to Y=0.35 so the floor mat returns inside frame while maintaining a diagonal view.
- **Wall accent placement:** Reserve the existing front/entry wall for the doorway so the unchanged wall-art accent is selected from an available side-wall run and is no longer immediately beside the destination camera.
- **Regression coverage:** Keep the four-corner mat projection test. Keep the four-corner artwork projection and wall-facing-angle assertions, and explicitly require the selected wall accent not to use the entry wall. CI confirms the mat now passes but the wall accent top corner projects to Y=0.963; Loop 079 follow-up moves only that existing accent down 0.15m and locks its resulting height, preserving the 0.9 viewport limit.
- **Boundaries:** No new decorations, furniture, props or assets; no dependency changes, merge or manual Vercel deployment.
- **Next action:** Inspect new prayer-room and neighboring kitchen screenshots. Confirm mat, window and whole existing wall accent read coherently without an entry-wall obstruction.


### Loop 079 follow-up — Adjust the existing prayer-room accent height

- The second CI attempt passed the full mat-corner test and the entry-wall exclusion/horizontal artwork checks. The only remaining failure was the top artwork corner at projected Y=0.963, just outside the 0.9 limit.
- Lowered the **existing prayer-room wall accent only** by 0.15m (center height from floorThickness + 1.36 to floorThickness + 1.21). Other rooms' art heights are unchanged. The mat and art framing tests remain strict.
- Full CI and fresh Chromium review pending on this follow-up. No new decor, assets, props, merge, or manual deployment.


## Loop 080 — Clear the upper landing fascia during the ground-stair ascent

**State:** TypeScript, unit tests, production build, Chromium walkthrough, and screenshot upload passed in [run 39147313124](https://github.com/teyyara/darboussedra/actions/runs/39147313124). PR #7 remains open and unmerged.

- **Rendered result:** All route arrivals, WebGL2, runtime-error, and mobile overflow checks passed. The lower stair treads remain individually readable early in the climb.
- **Visual defect still present:** The ascent screenshot at camera position Y=3.206 / Z=-2.362 has direction-Y -0.022. A broad fascia still crosses the central view. The prior browser gate allowed a near-level gaze, so it was not strict enough to guarantee actual visual clearance.
- **Decision:** Keep the physical landing, stairs, bridge width and rails unchanged. In Loop 081, increase only the upward pitch used while the eye crosses upper-floor height; earlier stair treads continue to use the slight downward gaze, and descent continues to look firmly downward.
- **Boundaries:** No decorations, room props, assets or dependencies changed; no main merge or manual Vercel deployment.


## Loop 081 — Require a positive clearance angle over the upper landing

**State:** Source checks passed, but the full Chromium run failed on the stricter gate in [run 39150511314](https://github.com/teyyara/darboussedra/actions/runs/39150511314). PR #7 remains open and unmerged.

- **Camera result:** The 0.25 late-ascent coefficient is active and the route-level target-height test passed. The browser frame still measured direction-Y -0.192 because it was captured at Y=2.914, Z=-1.991, before the eye reached the landing-clearance band around Y=3.04–3.42, Z=-2.7 to -2.1.
- **Root cause:** The broad lower-stair-flight phase allowed any Y from 2.9 to 4.25 and Z from -4.2 to -1.0, so it selected an earlier tread pose instead of the eye-height transition. The stricter camera gate correctly failed this capture.
- **Change for Loop 082:** Add a dedicated narrow lower-stair-clearance phase for the ascent screenshot only. Keep the broad lower-stair-flight phase for descent, where the camera must continue looking down the lower treads.
- **Scope:** No new decorations, furniture, props, assets, dependencies, main merge or manual Vercel deployment.


## Loop 082 — Capture the actual landing-clearance segment

**State:** Validated by typecheck, all tests, build, Chromium capture and artifact upload in [run 39151219362](https://github.com/teyyara/darboussedra/actions/runs/39151219362). PR #7 remains open and unmerged.

- **Rendered result:** The dedicated phase matcher captured the ascent at Y=3.089, Z=-2.213, with direction-Y +0.102; descent remained at direction-Y -0.488. All routes arrived, no browser runtime errors or review notes were reported, WebGL2 was detected, and mobile had no horizontal overflow.
- **Visual finding:** The stricter up-pitch is now measured in the intended zone, but the camera still looks directly down the stair axis into the rear landing fascia/wall. The face is less dominant than in the prior near-level frame, but the upper side corridor remains out of view.
- **Decision:** Keep the deterministic capture phase and positive ascent pitch. Loop 083 adds a small forward/right turn in the clearance segment to bring the existing side landing lane into the view, with a new horizontal-direction check. Earlier treads and descending gaze remain unchanged.
- **Scope:** No decorations, assets or room geometry changed; no merge or manual Vercel deployment.


## Loop 083 — Look into the side landing while clearing the fascia

**State:** Camera heading and dual-axis regression committed; full CI and new Chromium screenshots pending. PR #7 remains open and unmerged.

- **Problem confirmed from Loop 082 screenshot:** With the capture now correctly at Y=3.089 / Z=-2.213, the ascent gaze pitches upward (+0.102) but keeps pointing straight along -Z. The remaining center slab is the rear landing fascia/wall; the side landing lane only comes into the route after the top tread.
- **Change:** During the narrow upper-floor clearance segment only, bias the gaze approximately 0.4 units toward +X per unit of remaining stair run while retaining the 0.25 upward-pitch coefficient. This anticipates the turn into the existing right-side bridge lane. Earlier treads keep their down-gaze and reverse/descent retains the stronger downward angle.
- **Regression coverage:** Camera path tests now require both target Y above eye level and target X ahead toward the side lane for clearance poses. Chromium checks the actual screenshot vector has positive X direction between 0.2 and 0.5 and Y direction between 0.10 and 0.32. Existing route, WebGL, mobile, runtime-error, descent and room-directory gates remain mandatory.
- **Scope:** No decor, props, furniture, assets, dependencies, room dimensions or physical stair geometry changed. No merge or manual deployment.
- **Next action:** Inspect the new ascent screenshot for a visible right-hand bridge/landing beyond the fascia, without losing stair treads or introducing a wall-aim snap.

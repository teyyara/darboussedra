# AEOS Status — Dar Boussedra

**State:** LOOP 013 SKY DECORATION OCCLUSION — SOURCE CHECKS PASS, BROWSER REVIEW PENDING  
**Active keyphrase:** DAR BOUSSEDRA — LOOP 013: ENSURE SKY DECORATIONS RESPECT WALL DEPTH  
**Run ID:** 20261017-darboussedra-aeos-v3-loop013  
**Loop:** 013 · **Candidate:** dar-boussedra-sky-occlusion-013  
**Repository:** https://github.com/teyyara/darboussedra  
**Branch:** fix/loop-004-architecture-coherence  
**Base main:** 501cc6ccf3e6926504dfcd051ac98147360cd48a  
**Latest source-code checkpoint commit:** 34889caf7e4459655028d95f911c6904346b59ca  
**Last updated:** 2026-10-17

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

**State:** Source changes committed; TypeScript, tests, and production build pass. Browser capture is in progress; visual acceptance is not yet claimed.

- **Source commit:** [`34889ca`](https://github.com/teyyara/darboussedra/commit/34889caf7e4459655028d95f911c6904346b59ca)
- **CI run:** [Foundation checks #39058157769](https://github.com/teyyara/darboussedra/actions/runs/39058157769).
- **Observed defect:** The fresh artifact from [run 39056997214](https://github.com/teyyara/darboussedra/actions/runs/39056997214) showed a blue sky, but the sun halo and cloud shapes appeared over nearby walls in stair/landing frames because their materials bypassed depth testing.
- **Change:** The sky dome remains a persistent non-depth-writing backdrop. Sun/halo/cloud materials now use depth testing so intervening architecture can occlude them. The sun was raised to improve the chance of reading clearly against the exterior sky. No house layout, camera path, or room visibility rules changed.
- **Validation:** In run 39058157769, `npm run typecheck`, `npm test`, `npm run build`, and Chromium setup passed. Screenshot capture is still active; the new artifact is not available yet, so wall occlusion, sun visibility, and the current transition frames remain unverified.
- **Boundaries:** PR #5 remains open and draft. No merge to `main`, manual Vercel deploy, new dependencies, or remote assets.

### Next action

Inspect the artifact from run 39058157769 when available: `01-exterior-desktop.png`, `08-exterior-mobile.png`, `14-upper-landing-turn.png`, `15a-upper-landing-to-stair.png`, and `16-upper-bridge-after-ascent.png`. Confirm that sky decorations sit behind walls, the sun is visible in the open sky rather than clipped out or hidden by the house, and movement frames no longer show a misleading blank/transparent canvas. If the capture remains pending, resume from this exact commit and run without an unbounded wait.

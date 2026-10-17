# Loop 016 — Softer furniture and prop silhouettes

Date: 2026-10-17  
Repository: https://github.com/teyyara/darboussedra  
Branch: `fix/loop-004-architecture-coherence`  
PR #5: https://github.com/teyyara/darboussedra/pull/5 (open/draft)

## Source change
- [`42d6b5a`](https://github.com/teyyara/darboussedra/commit/42d6b5a5b7aaa4244261eb5e5cd8e1ccaf4b214b) replaces hard-edged box geometry used by furniture and props with Three.js `RoundedBoxGeometry`.
- `getPropCornerRadius` computes bevels from the thinnest dimension and caps their radius, keeping shelves/tabletops thin and narrow chair legs recognisable.
- Added four unit tests covering furniture bevels, thin top surfaces, chair legs, radius caps and invalid dimensions.

## Validation
- CI run [39059973378](https://github.com/teyyara/darboussedra/actions/runs/39059973378) is queued at checkpoint time.
- No TypeScript/test/build outcome or browser screenshot is claimed for Loop 016 yet.
- The prior Loop 015 source checks passed on [run 39059712137](https://github.com/teyyara/darboussedra/actions/runs/39059712137), but the browser-capture step remained in progress without an artifact.
- No dependency, paid asset or service added.

## Next action
Inspect Loop 016 exterior, furnishing, stair/landing, rooftop and mobile frames when available. Confirm softened silhouettes improve the furniture without distortion and review Loop 015 surface detail and sun/glass behavior. Never declare visual acceptance without inspecting fresh captures.

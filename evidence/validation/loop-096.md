# Loop 096 — Upper-floor structural substrate

Date: 2026-10-18
Branch: fix/loop-064-moroccan-exterior-and-layout

## Change
- Added a small pure geometry module that builds one ground substrate panel and four upper-floor panels around the intentional stairwell.
- Rendered the panels below room finish floors and gated them with the existing floor/zone visibility state.
- Added unit tests asserting ground stair coverage, upper panel bounds, panel edges around the opening, and that the upper substrate sits below the finish-floor level.

## Guardrails
- The upper central stairwell remains open; no full slab covers the stair path.
- No decorations, new dependencies, merge to main, or manual Vercel deployment.

## Validation
- Pending CI typecheck, unit tests, production build and visual review. Inspect upstairs landing, stair opening, bedroom thresholds, and ground stair approach before accepting.

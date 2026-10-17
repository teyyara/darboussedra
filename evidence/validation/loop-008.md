# Loop 008 — Kitchen rendering/readability fix

Date: 2026-10-17
Repository: https://github.com/teyyara/darboussedra
Branch: `fix/loop-004-architecture-coherence`
PR #5: https://github.com/teyyara/darboussedra/pull/5 (open/draft)

## Baseline evidence
- [Browser capture run 39051454455](https://github.com/teyyara/darboussedra/actions/runs/39051454455), artifact `darboussedra-visual-review`.
- Frame `06-kitchen-eye-level.png` showed the fridge's pale, undecorated cuboid blending into the plaster and sitting in the dominant camera sightline. The cabinets and worktop are more recognizable, so the appliance needed a stronger material/shape distinction and a less obstructive placement.

## Source changes
- Prior lighting/edge pass: [`40dfb0c`](https://github.com/teyyara/darboussedra/commit/40dfb0ce8495fe42977072584d20876284c737d5) adds antialiasing, ACES filmic tone mapping, a more shaped light rig, tighter/higher-resolution shadow map, and smoother tree/planter primitives.
- Kitchen fix: [`505cda4`](https://github.com/teyyara/darboussedra/commit/505cda4d687ca5fe3c5e63eb64b9a32c8aca76a3) moves the fridge to the rear-left corner and adds a contrasting enamel body, inset door panel, freezer seam, handle and top cap. Counter/cabinet position and room geometry are unchanged.

## Validation
- [CI run 39052224425](https://github.com/teyyara/darboussedra/actions/runs/39052224425): typecheck, unit tests, production build passed. Browser capture was in progress at checkpoint time.
- [CI run 39051923842](https://github.com/teyyara/darboussedra/actions/runs/39051923842): typecheck, unit tests, production build passed. Browser capture remained in progress for longer than expected; no artifact was available at checkpoint time. Do not claim the lighting changes visually passed.
- Therefore the kitchen prop improvement and the new lighting/material result still need fresh screenshot review.

## Boundary
- PR #5 remains open and draft; main unchanged.
- No manual Vercel deployment or promotion performed. The existing repository integration may update the preview automatically.
- No additional packages, remote assets, paid services or backends.

## Next action
Inspect `06-kitchen-eye-level.png` and `01-exterior-desktop.png` from run 39052224425. Compare the lighting/shadow result against baseline. If the capture runs remain stalled, investigate Playwright phase waits or software WebGL shadow-map cost before widening the render pass.

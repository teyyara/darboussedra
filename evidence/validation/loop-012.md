# Loop 012 — Persistent sky and no-blank backdrop

Date: 2026-10-17
Repository: https://github.com/teyyara/darboussedra
Branch: `fix/loop-004-architecture-coherence`
PR #5: https://github.com/teyyara/darboussedra/pull/5 (open/draft)

## Evidence-based diagnosis
- Previous browser capture [run 39053389810](https://github.com/teyyara/darboussedra/actions/runs/39053389810), artifact `darboussedra-visual-review`.
- The exterior frame `01-exterior-desktop.png` had beige/cream sky pixels matching the page/shell colour and no visible sun or blue sky. A prior sky sphere existed in source but did not appear reliably in the rendered frame.
- The in-motion upper landing images showed large uninterrupted backdrop-coloured openings where the camera can see through missing/hidden surfaces. The task requires no blank/transparent void when storey visibility changes.

## Source change
- [`0007460`](https://github.com/teyyara/darboussedra/commit/000746089e11575f5b8d5d97800402e2b701a2c5) updates `src/house/HouseScene.tsx` and `src/styles.css`.
- `SkyEnvironment` uses a camera-safe radius-90 sphere with a stronger blue zenith and warm low horizon. It follows the camera horizontally while retaining world-height horizon, stays present during every location/level transition, and uses explicit non-fogged, non-depth-writing sky materials.
- The WebGL `scene.background` is explicitly set to `#8fc9ed` in renderer creation as a fallback so an absent/occluded dome cannot reveal the application shell's cream background.
- Adds a warm visible sun disk and translucent halo plus two restrained procedural cloud forms far outside the house.
- Reduces desktop and mobile global wash opacity so the sky and 3D materials remain perceptible beneath DOM UI.
- No external assets, dependencies, room footprints, navigation paths, or paid services added.

## Validation
- [CI run 39056997214](https://github.com/teyyara/darboussedra/actions/runs/39056997214): `npm run typecheck`, `npm test`, and `npm run build` passed. Chromium installed successfully. At checkpoint time the walkthrough screenshot-capture step was still running and no artifact was published.
- Consequently, blue-sky visibility, the sun, mobile appearance, and no-blank transition frames are **not yet visually verified**.

## Boundaries
- PR #5 remains draft/unmerged; main unchanged.
- No manual Vercel deployment or promotion command.
- Zero new dependencies or remote assets.

## Next action
Inspect `01-exterior-desktop.png`, `08-exterior-mobile.png`, `14-upper-landing-turn.png`, `15-stair-descent-midflight.png`, and `16-upper-bridge-after-ascent.png` when the artifact from run 39056997214 becomes available. Ensure sky is visible outdoors and walls/sky/ground provide a coherent non-blank view during movement, without the sky layer appearing over nearby surfaces.

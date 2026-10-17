# Loop 015 — Procedural PBR material realism

Date: 2026-10-17  
Repository: https://github.com/teyyara/darboussedra  
Branch: `fix/loop-004-architecture-coherence`  
PR #5: https://github.com/teyyara/darboussedra/pull/5 (open/draft)

## Source changes
- [`d48b246`](https://github.com/teyyara/darboussedra/commit/d48b24686a2b583b77858cb080a447a3fa0d1970): procedural PBR textures, sky reflections, balanced lighting, stronger sky visibility and reduced exterior wash.
- [`2b2a46f`](https://github.com/teyyara/darboussedra/commit/2b2a46fc48a1cab5c173f60c9bb2a11a08154ee1): classify source material colours in sRGB space to avoid treating warm plaster as wood.
- [`9722fee`](https://github.com/teyyara/darboussedra/commit/9722fee072544d9013e2fa6dff5ddf794f11304e): physically based tinted exterior glass.

## Implementation notes
- Albedo and bump textures for plaster, wood, stone and fabric are generated locally from seeded canvas patterns. No remote asset downloads, paid features or new dependencies are required.
- A procedural equirectangular sky map provides soft image-based reflections to physically based surfaces.
- Surface assignment intentionally skips glossy materials, reflective metals, foliage and the very large environment ground plane.
- Exterior panes now use a tinted `meshPhysicalMaterial` with clearcoat and environment reflections.
- The sun was moved higher; daylight balance was reweighted, the preferred device pixel ratio ceiling increased to 1.6, and the landing-page wash was reduced.

## Validation checkpoint
- CI run [39059712137](https://github.com/teyyara/darboussedra/actions/runs/39059712137): **TypeScript, unit tests, production build PASS**.
- Added six regression tests covering plaster, wood, fabric, stone, glass/metal and foliage/environment exclusions.
- The automated Chromium screenshot capture is still in progress, and no artifact was available at checkpoint time. **Visual acceptance is pending.** No claims are made yet about the final appearance or runtime performance.
- No new dependencies, paid APIs/assets, merge to `main`, or manual deployment.

## Next action
Inspect the new exterior, rooms, upper landing/stairs, rooftop and mobile screenshots when available. Confirm textured walls and furniture remain natural rather than noisy or tiled, glass reflections are subtle, the sun clears the roof, nearby walls occlude sky decorations correctly, no camera frame is blank, and there are no browser/runtime or mobile-overflow regressions.

# Memory Validation

## Canonical strategy
- AEOS v4.1 stored in .autonomous/STRATEGY.md.
- .autonomous/STATE.json is canonical; legacy .aeos state is historical loop-050 only.
- Cold-start recovery previously passed.

## Visual capture baseline
- Run 39185169298: source gates passed, 21 screenshots saved, 14/14 arrivals, no runtime errors, mobile overflow false. Browser review failed because ascent-clearance and landing-turn predicates were false. Artifact 12157699074 SHA a53e368cd993b25a2cb61e18702396c10d3e78171fd86effd98b2d8716ad6cd5.
- Run 39186386526: typecheck passed; unit test step failed 8 cameraPath tests (131/139 passed); build/browser skipped.
- Loop 103a source commit 81210677c12b1e1a10a521af6abca537f29b42e0 reconciles the inward upper-bridge look with test expectations and expands the late clearance turn so the entire near-top band has a shallow upward aim. Fresh validation pending.

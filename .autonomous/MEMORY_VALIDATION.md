# Memory Validation

## Canonical strategy
- AEOS v4.1 is stored in .autonomous/STRATEGY.md; .autonomous/STATE.json is canonical.
- Legacy .aeos state is historical loop-050 only.
- Cold-start recovery previously passed.

## Loop 103b / 104
- Run 39186902422 / artifact 12158258421, SHA 2d392ab1cc39bb9613ec40fc8c2df8aafc8ee037f6f9cad5cec9842800b087b6: source gates passed, all 21 frames, 14/14 arrivals, no runtime errors/mobile overflow.
- Visual gate failed upperLandingAiming.looksAlongBridge. Direction [-0.339,-0.227,0.913]. Frames 13b/14 show wall/fascia and stair-underside obstruction, despite passing ascent aim predicates.
- Loop104 source commit dd44aec75ab73fc0d4ce5f7e05afc6157c181c83 reduces late-ascent lateral angle and softens the upper-bridge inward vector. New CI/browser evidence pending.

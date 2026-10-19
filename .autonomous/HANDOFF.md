# Handoff — Dar Boussedra

**STATUS: CHECKPOINTED / IN PROGRESS. Loop 104 camera adjustment committed; fresh validation pending.**

## Candidate
- Branch: fix/loop-064-moroccan-exterior-and-layout
- Loop 104 source commit: dd44aec75ab73fc0d4ce5f7e05afc6157c181c83
- Open PR #7: https://github.com/teyyara/darboussedra/pull/7
- Main baseline: e06af00a049eb72b173295438bbeb8e384c6fef5.
- AEOS v4.1 is canonical.

## Loop 103b evidence
Workflow 39186902422: https://github.com/teyyara/darboussedra/actions/runs/39186902422
Artifact 12158258421: https://github.com/teyyara/darboussedra/actions/runs/39186902422/artifacts/12158258421
SHA-256: 2d392ab1cc39bb9613ec40fc8c2df8aafc8ee037f6f9cad5cec9842800b087b6
Source gates passed; 21 screenshots, 14/14 room arrivals, no runtime errors, no mobile overflow. Frames 16/17 show actual distinct roof stair/hatch positions. Visual gate still failed: upperLandingAiming.looksAlongBridge=false, direction [-0.339,-0.227,0.913]. Image 13b is mostly near-field wall; image14 points too far inward at the stair underside. Ascent clearance/anticipation predicates passed.

## Loop 104
Source commit dd44aec75ab73fc0d4ce5f7e05afc6157c181c83 reduces late-ascent lateral glance factor 0.45 to 0.20, and softens four bridge direction vectors [-0.35,0.94] to [-0.08,0.99]. Tests require only a slight inward target bias while retaining forward bridge focus and route bounds.

## Exact next action
Inspect Foundation validation for the final head. Require source tests/build and inspect images 13b/14/16/17. Both upper-landing aim predicates and both ascent predicates must pass; the landing must show the open bridge rather than the wall/underside, and roof frames 16/17 must stay real and distinct.

## Constraints
No decorations, paid dependencies, merge to main while visual acceptance fails/unknown, or manual Vercel deployment.

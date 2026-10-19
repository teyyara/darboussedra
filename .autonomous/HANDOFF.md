# Handoff — Dar Boussedra

**STATUS: CHECKPOINTED; Loop 098 implementation committed, validation pending.**

## Current candidate
- Branch: fix/loop-064-moroccan-exterior-and-layout
- Source-change commit: 4fecdacd646ef616cafabbc803c23ad08cb60149; entrance camera pose plus regression test.
- This memory-aware checkpoint is the current PR branch HEAD; resolve its exact SHA from GitHub before proceeding.
- Open PR: https://github.com/teyyara/darboussedra/pull/7
- Main baseline remains e06af00a049eb72b173295438bbeb8e384c6fef5.

## Cold-start recovery
PASS. The complete v4.1 strategy and required memory files exist. The strategy version matches STATE.json, JSON parses, and a fresh reconstruction recovered the project stack, permanent destinations, no-decor/no-pay/no-deploy constraints, candidate PR/branch, latest browser failure and concrete next task. The stale checkpoint pointer now points to source commit 4fecdacd646ef616cafabbc803c23ad08cb60149. The old .aeos state remains an explicitly historical loop-050 snapshot.

## Loop 098 change
Entrance destination camera moved to an off-axis human-height pose at [0.65, 1.65, 4.2], aiming at [-0.65, 1.35, 1.65] inside the connected Family Table footprint. A new regression test protects entrance position bounds, target-room bounds and diagonal gaze. No room geometry, décor, dependencies or assets changed. This change is not yet visually accepted.

## Prior evidence
Workflow 39177873937 passed typecheck/tests/build but failed its browser gate. Artifact 12154942342 shows a tunnel-like entrance, opaque wall/fascia during late ascent, three phase timeouts, and a 45-second screenshot timeout. The stair issue remains open.

## Next action
Inspect the new Foundation checks workflow for the final branch head. If source checks pass, inspect fresh entrance screenshots and the browser report. Keep the entrance issue open unless the actual render shows a coherent vestibule view. Then fix the stair-top view in a separate bounded loop.

## Constraints
No new decorations, paid dependencies/services, manual Vercel deployment, or merge to main with a failing/unknown browser gate. Do not weaken assertions to get a green result.

# Handoff — Dar Boussedra

**STATUS: CHECKPOINTED; Loop 099 correction committed, validation pending.**

## Candidate
- Branch: fix/loop-064-moroccan-exterior-and-layout
- Latest source checkpoint: 10ff07e0882133bb68a31c8333c90e4d64340719 (revises regression expectations for the entrance sightline).
- Memory-aware branch head: resolve the exact SHA on GitHub after this checkpoint.
- PR #7: https://github.com/teyyara/darboussedra/pull/7
- Main remains at e06af00a049eb72b173295438bbeb8e384c6fef5; no merge or deployment occurred.

## Methodology and memory
AEOS v4.1 is stored fully in .autonomous/STRATEGY.md and versioned history. Cold-start recovery PASS: required files exist, state parses, strategy/constraints/branch/latest failure/next task can be reconstructed. Legacy .aeos state is retained as a historical loop-050 snapshot.

## Loop 098/099
Loop 098 changed entrance destination camera to [0.65, 1.65, 4.2] looking diagonally toward [-0.65, 1.35, 1.65] inside Family Table. Run 39181779811 on commit 1d9f0cdb5d5bd8bb2e2081501e9cec15dea9d72e passed typecheck but failed tests (131 passed, 2 failed). Existing tests demanded a centered X-axis gaze and a focus target inside the entry footprint, contradicting the intended view through the shared doorway. Build and browser capture were skipped.

Loop 099 updates those assertions to verify: the camera is inside the entrance, the focus is inside Family Table, and the diagonal ray crosses the real shared opening. Other room focus points remain constrained to their own rooms. This correction is **not yet validated**.

## Prior visual evidence
Run 39177873937 / artifact 12154942342 showed a tunnel-like entrance, wall/fascia obscuring the stair-top view, and camera-phase/screenshot timeouts. That is earlier evidence and the stair issue remains open.

## Next exact action
Inspect the new GitHub Actions run for the final branch head. If source checks pass, inspect the new entrance image and browser-review.json. Do not mark the entrance resolved unless the image confirms it; then handle the stair-top defect as a separate loop.

## Constraints
No new decor, paid dependencies/services, manual Vercel deployment or merge to main while validation fails/unknown.

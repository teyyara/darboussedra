# Loop 018 — Room lighting and cornice detail

Date: 2026-10-17  
Repository: https://github.com/teyyara/darboussedra  
Branch: `fix/loop-004-architecture-coherence`  
PR #5: https://github.com/teyyara/darboussedra/pull/5 (open/draft)

## Source changes
- [`3aea28f`](https://github.com/teyyara/darboussedra/commit/3aea28fa6798c1fbbac8831bedac66be1afb872a) adds a compact warm flush-mount fixture per enclosed room, with a restrained point light in the selected destination. Cornice trim follows portal-aware owned wall runs.
- [`0fef440`](https://github.com/teyyara/darboussedra/commit/0fef44087d026ff2440ec129e9bfb9cb743c596c) fixes a JSX syntax typo detected by the first TypeScript run.
- Added three tests for ground and upper ceiling-bottom heights and to ensure roof destinations are not treated as enclosed room ceilings.

## Validation
- Initial run [39060862214](https://github.com/teyyara/darboussedra/actions/runs/39060862214) failed TypeScript because of a missing JSX closing brace in the cornice render. The mistake has been corrected.
- Fresh run [39060937008](https://github.com/teyyara/darboussedra/actions/runs/39060937008) is in progress; no passing status is claimed yet.
- The browser capture jobs for earlier iterations have remained stalled. Fresh visual review is pending; no visual acceptance is claimed.
- No new dependency/paid asset/service. No merge or manual deployment.

## Next action
Confirm run 39060937008 source checks and inspect current browser screenshots if published. Review upper landing ceiling/stair hatch, room lighting colour balance, door openings/cornice trim, empty wall framing and mobile.

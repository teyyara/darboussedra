# Loop 018 — Room lighting and cornice detail

Date: 2026-10-17  
Repository: https://github.com/teyyara/darboussedra  
Branch: `fix/loop-004-architecture-coherence`  
PR #5: https://github.com/teyyara/darboussedra/pull/5 (open/draft)

## Source change
- [`3aea28f`](https://github.com/teyyara/darboussedra/commit/3aea28fa6798c1fbbac8831bedac66be1afb872a) adds a compact warm flush ceiling fixture in each enclosed room. The selected room gets a restrained local point light; the other room fixtures remain visually present without each adding a point light.
- Continuous cornice trims are generated from portal-aware owned wall runs, so trim follows room boundaries and never bridges a door opening.
- Adds three tests for ground/upper ceiling bottom heights and ensuring the rooftop is not treated as an enclosed room ceiling.

## Validation
- CI run [39060862214](https://github.com/teyyara/darboussedra/actions/runs/39060862214) was running at checkpoint time.
- Visual acceptance pending; previous screenshot evidence predates these changes.
- No added dependency, paid asset, paid API, merge or manual deployment.

## Next action
Inspect the fresh Family Table, Kitchen, bedroom, upper landing/stair, rooftop and mobile screenshots. Confirm the fixtures are subtle, the room light does not over-saturate the scene, cornices remain clear of doors, and the new ceiling panels prevent unintended sky leaks.

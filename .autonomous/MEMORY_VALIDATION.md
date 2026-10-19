# Memory Validation

## Canonical strategy
- AEOS v4.1 remains in .autonomous/STRATEGY.md.
- .autonomous/STATE.json is canonical; the legacy .aeos state is a historical loop-050 snapshot.
- Cold-start recovery previously passed.

## Camera validation
- Loop 102 run 39185169298: source gates passed, 21 screenshots saved, 14/14 arrivals, no runtime errors; clearance aiming predicates failed. Artifact 12157699074 SHA a53e368cd993b25a2cb61e18702396c10d3e78171fd86effd98b2d8716ad6cd5.
- Loop 103a run 39186716661: typecheck passed; 137/139 tests passed; browser/build skipped.
- Loop 103b commit bf7be9496af8121116e70450089332a9588412f6 preserves the -Z final-tread gaze and +Z actual-landing gaze distinction and expands the tangent exception to cover the full clearance zone. Validation pending.

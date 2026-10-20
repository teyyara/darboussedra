# Memory Validation

## Canonical strategy
- AEOS v4.1 retained in .autonomous/STRATEGY.md.
- .autonomous/STATE.json is current project state; .aeos/state.json is a historical snapshot.

## Loop108 and Loop109
- Run39346813018/artifact12232020376: source gates passed; browser review failed on route-phase timeouts/skips and 13/14 arrivals. Artifact SHA-256 98dca1d627dc715e130d2c6410ca472d8674a0f881052439a7b6a0837650ad1b.
- Loop108 always-render mode during transition showed some movement but did not sufficiently advance through the first phase; fallback screenshot writes then advanced the route. Camera framing is not accepted.
- Loop109 commit 46503a0e292e7389b5e8e47916ba2e08b470e3a2 switches to DPR1, 1024² shadow map and non-auto-updating shadows while moving, refreshes shadow map at state/zone changes, and restores normal idle quality. Fresh validation pending.

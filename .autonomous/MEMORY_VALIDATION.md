# Memory Validation

## Canonical strategy/state
- AEOS v4.1 is retained in .autonomous/STRATEGY.md.
- .autonomous/STATE.json is the canonical current project state. Legacy .aeos/state.json is historical.
- Cold-start recovery previously passed.

## Loop107 / Loop108
- Run39192199546 / artifact12160731750: source gates passed; browser failed with first phase timeout and four skipped phase captures; descent also timed out; only 13/14 arrivals settled.
- Fallback position at first phase timeout was [0.989,1.65,2.027], progress0/56, speed0.301; later fallbacks recorded progress4,19,26,40,56. These are not valid target-phase images.
- Loop108 source commit 2d1a43a3d92315add7129b4211e5af1de9af4b50 switches frameloop to always during transitions and demand when settled. Fresh full validation pending.

# Memory Validation

## Canonical strategy
- AEOS v4.1 full strategy remains in .autonomous/STRATEGY.md.
- .autonomous/STATE.json is canonical; the legacy .aeos/state.json is a historical loop-050 snapshot.
- Cold-start reconstruction previously passed.

## Loop 102 review / Loop 103 candidate
- Run 39185169298 passed source gates: 22 test files / 138 tests, production build and Chromium setup. It saved 21 screenshots, settled 14/14 arrivals, reported no runtime errors and no mobile horizontal overflow.
- The browser gate still failed because clearsUpperLandingOnAscent and anticipatesUpperLandingTurn were false.
- Artifact 12157699074 SHA-256 a53e368cd993b25a2cb61e18702396c10d3e78171fd86effd98b2d8716ad6cd5 shows actual roof-stair and hatch-clear positions.
- Loop 103 source commit 87d5d43ddfe22cfe74ae15772fb811f1ea11b334 smooths late-ascent yaw/pitch, aims the upper bridge inward and adds camera-path regression checks. Validation pending.

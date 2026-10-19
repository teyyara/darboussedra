# Memory Validation

## Canonical strategy
- AEOS v4.1 is stored in .autonomous/STRATEGY.md; .autonomous/STATE.json is canonical.
- Legacy .aeos state is historical loop-050 only.

## Loop 104 / Loop 105
- Run 39187622415, artifact 12158767554: source gates passed but visual frames 13b/14/16/17 were invalid fallback screenshots at [3.45,7.2,0.5], route 56/56. Phase 2 and all subsequent phases timed out.
- Root cause: clearance match window too narrow and script tests excluded from Vitest.
- Loop 105 source commit 2cf72fb2001e05a1e8db90b513ebe3e2ae519a87 widens the clearance window, adds bounded timeout/fail-fast reporting and includes scripts phase tests. Fresh validation pending; don't assess camera vectors until phase matches.

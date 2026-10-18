# Loop 091 — Final stair-ascent sightline

Date: 2026-10-18
Repository: https://github.com/teyyara/darboussedra
Branch: fix/loop-064-moroccan-exterior-and-layout
Status: source checkpoint committed; CI pending

## Baseline evidence

Loop 090 source commit `5dac21368616957aea3513c304de63cf97960d2e` passed [Foundation checks run 39166944037](https://github.com/teyyara/darboussedra/actions/runs/39166944037). The visual artifact reported 14/14 arrivals and no runtime errors. Its `13b-stair-ascent-landing-clearance.png` still showed a near-frame-filling blank fascia/wall; reported camera position was `[0, 4.321, -3.782]` and direction `[0.386, 0.128, -0.914]`.

## Implementation

- In the final-tread clearance band only, change the view vector to point toward the right-side upper bridge and positive Z rather than following the negative-Z stair tangent into the fascia.
- Increase the vertical aim slightly so the upper landing reads beyond the fascia, without changing camera position, room layout, stairs, or scene props.
- Add a regression assertion that the late-ascent clearance poses aim toward positive Z across the landing.

## Scope and validation

No furniture or decoration was added. No new dependency or asset was added. No manual Vercel deployment or merge to `main` was performed. CI and the refreshed visual screenshot must pass before the fix is accepted.

# Requirements Traceability

| ID | MUST | Acceptance criteria and verification | Status |
|---|---|---|---|
| ARCH-001 | Physical coherence | No unintended overlaps, holes or impossible portals; geometry tests plus rendered transitions | FAIL / IN PROGRESS |
| WALK-001 | Plausible first-person movement | Eye height, real doors, stair/landing/hatch traversal; route tests plus fresh browser movement captures | FAIL (stair clearance) |
| VIEW-001 | No tunnel-like entrance | Off-axis eye-level vestibule view, inside footprint; bounds test and fresh entrance screenshot | FAIL |
| RENDER-001 | No blank frames/pop-in | Profile runtime and visibility handoffs; record frame/readiness evidence | NOT CERTIFIED |
| EXT-001 | Moroccan neighborhood exterior | Façade, adjoining houses, street, sky and clouds coherent; desktop/mobile screenshots | PARTIAL |
| UX-001 | Discoverable movement | Clear click/hover cues, accessible map and stable transitions; browser interaction checks | PARTIAL |
| DECOR-001 | No unapproved decor | No new decorative objects/assets before explicit user authorization; diff review | MUST REMAIN PASS |
| COST-001 | Free-only / no manual deploy | No paid services/dependencies, no manual deploy; inspect changes and operations | PASS for this session |
| A11Y-001 | WCAG 2.2 AA target | Keyboard, accessible names, focus, reduced motion, responsive layout; automated/manual checks | NOT YET VERIFIED |

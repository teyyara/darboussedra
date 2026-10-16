# Architecture and Implementation Decisions

1. **Stable renderer stack.** React + TypeScript + Vite; React Three Fiber v9-compatible APIs with React 19; Three.js WebGL 2.
2. **Local-first.** No backend, database, accounts, family-content collection/storage, remote asset pack, paid API/assets, analytics, tracking or secrets.
3. **Single typed room registry.** src/house/rooms.ts owns the 13 room identities, levels, positions, footprints, camera presets and connection metadata.
4. **Revisable floor plan.** Current proportions are an initial blockout, not a surveyed/approved family floor plan.
5. **Room rendering.** Floors and low cutaway walls use room scene position/footprint; doorway openings and thresholds signal circulation. Indoor, garden and rooftop routes render context-appropriate geometry.
6. **Reduced motion and render cost.** Camera position and target ease together and the Canvas uses demand rendering. Reduced motion snaps directly to its target.
7. **Load performance.** HouseScene is lazy-loaded. Latest CI build moved the initial entry chunk from 1,123.97 kB minified (313.07 kB gzip) to 235.24 kB (73.54 kB gzip); the deferred scene itself remains 890.96 kB (240.04 kB gzip) with a Vite warning. Avoid increasing the warning limit simply to hide it; consider further splitting only with actual measurements.
8. **Route safety.** A shared route helper safely handles unknown and malformed room paths, covered by unit tests.
9. **Validation honesty.** CI typecheck, unit tests and production build are green on main. Visual browser, keyboard/mobile, real-device performance and accessibility conformance remain unverified because connected browser/Vercel inspection was denied.
10. **Vercel boundary.** The owner manages Vercel. Git-connected deployments follow the owner's project settings. The agent does not manually deploy/promote/rollback.
11. **Public-repository data minimization.** Keep an actionable project summary instead of republishing the full source brief or entire operating prompt verbatim.

12. **Loop 004 geometry contract.** `HOUSE_LAYOUT` and `rooms.ts` own shell dimensions, room bounds, floor elevations, landing positions, stair endpoints and the roof opening. Spatial plan positions derive from the same room coordinates and footprints.
13. **Connections mean geometry.** A declared same-level room edge is valid only when a usable shared boundary exists; both wall gaps derive from that connection. Stair hall and upper landing openings are explicit circulation portals, not additional permanent destinations. All 13 public room slugs remain stable.
14. **Acceptance evidence.** Code invariants and CI cannot establish rendered visual correctness or collision-free camera paths. Loop 004 remains visually unaccepted until real browser images/interaction checks cover the facade/entry, ground and upper rooms, stairs, rooftop, garden, plan tabs, mobile, keyboard, reduced motion, fallback and console.
15. **Family approval.** The changed proportions and spatial relationships remain a provisional blockout. In particular, Pets’ Corner width, Musalla proportions, central stair-hall arrangement, stair pitch and threshold layout require family review before the floor plan is treated as final.

16. **Loop 004 CI outcome.** GitHub Actions run [38945553894](https://github.com/teyyara/darboussedra/actions/runs/38945553894) passed TypeScript typecheck, 12 unit tests across three files, and the production build for the correction branch. This does not certify the rendered architecture.
17. **No merge without visual acceptance.** The Loop 004 branch/PR remains unmerged; no manual Vercel deployment is permitted in this loop. A green preview status is not substitute evidence for browser screenshots and interaction review.

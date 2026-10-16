# Architecture and Implementation Decisions

1. **Compatible stable renderer stack.** Use React, TypeScript, Vite, Three.js and React Three Fiber v9-compatible APIs with React 19; avoid alpha APIs.
2. **Local-first.** No database, backend, account system, media provider, remote asset pack, analytics, tracking or secrets. Geometry is generated locally.
3. **Single typed room registry.** src/house/rooms.ts supplies room names/slugs, levels, connections, camera poses and map positions. Keep exact slugs from the const source while widening the public list to the Room interface so optional fields remain usable across all rooms.
4. **Revisable floor plan.** Current room coordinates are an early blockout proposal, not a family-approved or surveyed architectural drawing. Centralize coordinates for iteration.
5. **Accessible fallback.** Feature-detect WebGL 2; retain semantic HTML controls and show a local 2D illustration if rendering cannot be used.
6. **Shared route parsing.** A safe helper resolves direct room paths and contains malformed URL decoding; unit tests cover known, unknown and malformed destinations.
7. **Motion/performance.** Camera position and target ease together. The canvas uses demand-based rendering and invalidates only while a transition is in progress; reduced-motion preference snaps camera state.
8. **Small routing controller.** A compact pathname/history controller is adequate for the foundation; reconsider if route complexity expands.
9. **Honest validation.** The implementation environment cannot reach GitHub/npm or run a browser. Remote CI runs install, typecheck, tests and build, and the current main code commit has all four checks passing. Browser visual/accessibility behavior remains unverified.
10. **Vercel boundary.** The owner manages Vercel. This agent does not manually deploy/promote/rollback; Git integration may act according to the owner's project settings.
11. **Public-repository data minimization.** Store an actionable project summary instead of duplicating the full source brief or entire operating prompt verbatim.

# Architecture and Implementation Decisions

1. **Compatible stable renderer stack.** Start with React, TypeScript, Vite, Three.js and React Three Fiber v9-compatible APIs with React 19; avoid alpha APIs.
2. **Local-first.** No database, backend, account system, media provider, remote asset pack, analytics, tracking or secrets. Geometry is generated locally.
3. **Single typed room registry.** src/house/rooms.ts supplies room names/slugs, level, connections, camera poses and map positions to navigation and map components.
4. **Revisable floor plan.** Current room coordinates are an early blockout proposal, not a family-approved or surveyed architectural drawing. Centralize coordinates for iteration.
5. **Accessible fallback.** Feature-detect WebGL 2; retain semantic HTML controls and show a local 2D illustration if rendering cannot be used.
6. **Small routing controller.** A compact pathname/history controller is adequate for the foundation; reconsider if route complexity expands.
7. **Honest validation.** The implementation environment could not reach GitHub/npm or run a browser. A free GitHub Actions workflow performs typecheck, registry tests and build; its result must be observed and not assumed.
8. **Public-repository data minimization.** Store the working requirements and progress ledger rather than duplicating the full source brief and entire operating prompt verbatim into this public repository.

# Decisions and Assumptions — Loop 001

1. Use React, TypeScript, Vite, Three.js and the stable React Three Fiber v9-compatible line with React 19.
2. Keep the prototype local-first: no backend, auth, database, media provider, remote asset pack, analytics, tracking or secrets.
3. src/house/rooms.ts is the source of truth for destinations, floors, connections, camera poses and map positions.
4. Current coordinates are a revisable proposal, not a family-approved floor plan.
5. Feature-detect WebGL 2; retain semantic HTML navigation if 3D cannot run.
6. A small pathname/history controller is enough for this first version.
7. The local runtime could not reach GitHub/npm or run a browser. GitHub Actions is configured but remains unverified until its actual result is observed.
8. The public repository contains an actionable project summary instead of duplicating the full source brief or full operating prompt verbatim.

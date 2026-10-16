# Dar Boussedra — Digital Family Home

A local-first, intentionally unfurnished 3D family house. The first milestone establishes architecture, room navigation, a single room registry, and accessible fallback behavior before rooms are furnished.

## Run locally

Requirements: Node.js 20.19+ and npm.

~~~bash
npm install
npm run dev
~~~

Quality commands: `npm run typecheck`, `npm test`, `npm run build`, and `npm run validate`.

## Architecture

- `src/house/rooms.ts` owns permanent room IDs/slugs, floor labels, camera poses, connections and map coordinates.
- `src/house/HouseScene.tsx` builds procedural Three.js / React Three Fiber geometry without remote models.
- `src/components/HouseMap.tsx` creates map destinations and semantic room controls from the registry.
- `src/App.tsx` coordinates browser paths/history, reduced motion and WebGL fallback.
- `PRODUCT_CONTRACT.md`, `DECISIONS.md` and `AEOS_STATUS.md` track scope and progression.

The layout is an initial, revisable proposal, not a final approved floor plan. No backend, authentication, database, media uploads, family-content storage, analytics, paid assets/APIs or deployment automation are included. Private rooms are destinations only and do not imply an authentication boundary.

Loop 001 is a foundation checkpoint, not certification of the complete house. Real-browser and build checks remain pending when not explicitly evidenced in `AEOS_STATUS.md`.

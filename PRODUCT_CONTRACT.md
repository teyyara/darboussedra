# Dar Boussedra — Product Contract v1.0

Status: initial scope transcribed from the supplied Master Build Strategy. This contract sets scope; it does not certify completion.

## Purpose
Dar Boussedra (دار بوسدرة) is a private digital family home and a place the family can call home despite distance. The house itself is the primary information architecture.
Tagline: Our digital house. Always a place to come home to.

## Permanent pillars
Remember where we came from; stay connected to one another; keep creating memories together.

## Required permanent spaces
Front Door / Entrance; Living Room; Kitchen; Family Table; Library; Garden; Rooftop; Pets' Corner / Cat Space; Prayer Room / Musalla; and one private room each for Zakariae, Zineb, Meryem and Fatiha.
Yahya's possible remembrance space remains an unplaced future concept; no location or experience is approved.

## First milestone
Create an intentionally unfurnished architectural house before adding future content. Provide an exterior arrival, recognizable entrance, room destinations, floor/map overview, contextual location label, return navigation and stable direct room paths.

## Visual direction
Warm, cinematic, tactile and calm. Use cream, sand, plaster, natural wood, restrained terracotta and olive/sage. Avoid clichés, excessive effects, game-like controls and intrusive memorial content. The floor plan is a revisable proposal. Keep text in accessible HTML, not 3D textures.

## Functional and technical boundaries
React + TypeScript + Vite, React Three Fiber v9 / React 19-compatible APIs, Three.js WebGL 2 with feature detection, procedural local geometry, single typed registry for room/route/map metadata, semantic HTML room controls, keyboard focus, touch-sized controls, reduced-motion compliance, and a navigable 2D fallback.
No authentication, backend, family database, media uploads/storage, Google Drive, paid APIs/assets, analytics, tracking, payments or public deployment. The front end does not enforce the privacy of private rooms.

## Acceptance gates
Stage A requires installation, typecheck, tests and production build to pass and all 13 room destinations to be present exactly once with valid metadata. The full empty-house milestone also requires legible distinct room architecture, coherent connections/stairs/roof/garden, scene-map alignment, and real-browser verification of navigation, accessibility, mobile and fallback paths.

No deployment is authorized in Loop 001. A build alone does not establish runtime correctness or production readiness.

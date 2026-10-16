# Master Build Strategy — Working Summary

The user-provided source remains available as an attached conversation file. This concise project summary records the implementation constraints without republishing the full source document in the public repository.

- Build the empty architectural house first, then furnish it gradually.
- Required permanent spaces: entrance, living room, kitchen, family table, library, garden, rooftop, pets' corner, prayer room, and four private rooms.
- Yahya's remembrance space is future-only and has no approved location or design.
- Use one source of truth for room navigation, scene destinations, and map coordinates.
- Guided click/tap navigation is preferred over a character controller; provide direct room URLs, history handling, an always-reachable map and return action.
- Critical navigation must use semantic HTML controls, not 3D hit testing alone.
- Honor reduced motion; support keyboard, touch and small screens. Provide a complete 2D route when WebGL 2 is unavailable.
- Use local procedural geometry and zero paid dependencies. Do not add accounts, database, storage, uploads, analytics, tracking, future content features or deployment.
- Style direction: calm, welcoming, warm plaster/sand/terracotta/wood/olive, with restrained regional detail and no over-decoration.
- The plan is intentionally revisable; do not claim an approved floor plan.

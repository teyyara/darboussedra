# Dar Boussedra — Project Memory

## Purpose
A private immersive digital family home. The house is the website: a logically laid-out Moroccan family home explored in first-person 3D, with an accessible map alternative.

## Stack
Vite + React + TypeScript; Three.js / React Three Fiber; Vitest; GitHub Actions and Playwright/Chromium for PR visual review; Vercel is Git-connected.

## Reconciled candidate
- Main baseline: e06af00a049eb72b173295438bbeb8e384c6fef5.
- Candidate: fix/loop-064-moroccan-exterior-and-layout, source commit 4acf977818f22ff486ff82636f146ea6de2ed28f, open PR #7.
- Latest source checks pass but the latest candidate's browser review fails. Do not certify or merge it yet.

## Non-negotiable scope
- Architecture and movement first; no new decor, furniture, ornaments, rugs, wall art, garden/roof set dressing, extra assets or paid dependencies until explicit user approval.
- Remove the tunnel-like entrance view; ensure believable room adjacency, walls, floors, portals and stairs.
- Keep non-blank surroundings, with Moroccan neighborhood, sky, sun without odd circles, and soft clouds.
- Movement should be human-scale, fluid and discoverable. Diagnose pop-in/stalls before optimizing.
- Do not manually deploy to Vercel; do not merge an unvalidated candidate.
- Preserve the potential future remembrance space without inventing its location or content.

## Source documents
PRODUCT_CONTRACT.md, docs/architecture-and-rendering-repair-roadmap.md, AEOS_STATUS.md and evidence/validation.

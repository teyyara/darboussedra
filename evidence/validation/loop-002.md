# Loop 002 Validation Record

Date: 2026-10-16  
Repository: teyyara/darboussedra  
Main code commit: ea7b18db1e5e546ce3eb8f59606094639a01cff3

| Check | Result | Evidence |
|---|---|---|
| TypeScript fix | PASS | PR #1; CI run [38939325121](https://github.com/teyyara/darboussedra/actions/runs/38939325121) |
| Main pipeline after PR #1 | PASS | [Run 38939453758](https://github.com/teyyara/darboussedra/actions/runs/38939453758) |
| Map/route/camera improvement | PASS | PR #2; CI run [38939602877](https://github.com/teyyara/darboussedra/actions/runs/38939602877) |
| Main pipeline after PR #2 | PASS | [Run 38939743480](https://github.com/teyyara/darboussedra/actions/runs/38939743480) |
| npm install | PASS in CI | Both current CI workflows |
| Typecheck | PASS in CI | Main code checkpoint |
| Unit tests | PASS in CI | Includes registry and malformed-room-path tests |
| Production build | PASS in CI | Vite production build completed |
| Local clone/install/checks | NOT RUN | Local runtime could not resolve GitHub/npm by DNS |
| Real-browser visual/accessibility test | NOT AVAILABLE | No browser automation in this runtime |
| Vercel preview inspection | BLOCKED | Connected Vercel inspection returned HTTP 403 for the project/team |
| Manual deployment by agent | NOT PERFORMED | Owner handles Vercel; no deploy/promote/rollback action used |

These results establish that the source typechecks, tests and builds in GitHub Actions. They do not establish visual quality, real-browser interaction correctness, accessibility conformance or measured performance.

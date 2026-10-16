# Loop 003 Validation Record

Date: 2026-10-16  
Repository: teyyara/darboussedra  
Merged code commit: d237375a364f25b0e30dade08f9b02790396b966

| Check | Result | Evidence |
|---|---|---|
| TypeScript/map/camera repair (PR #1) | PASS | [CI 38939325121](https://github.com/teyyara/darboussedra/actions/runs/38939325121) |
| Map selection, safe route parsing and camera transitions (PR #2) | PASS | [CI 38939602877](https://github.com/teyyara/darboussedra/actions/runs/38939602877) |
| Lazy-load 3D scene (PR #3) | PASS | [CI 38940215415](https://github.com/teyyara/darboussedra/actions/runs/38940215415) |
| Architecture/cutaway (PR #4) | PASS after correction | [CI 38940746330](https://github.com/teyyara/darboussedra/actions/runs/38940746330) |
| Post-merge main validation | PASS | [CI 38940864901](https://github.com/teyyara/darboussedra/actions/runs/38940864901) |
| Vercel status on latest main | SUCCESS | [Deployment record](https://vercel.com/tyyr1/darboussedra/DANV2BrnCW8Cw3mdT67WmYzQLuyF) |
| Automated test summary | PASS | 2 files / 5 tests passed |
| Bundle split | PASS, warning remains | Entry 235.24 kB minified/73.54 kB gzip; deferred scene 890.96 kB/240.04 kB gzip |
| First architectural commit | FAILED, not merged | [CI 38940681868](https://github.com/teyyara/darboussedra/actions/runs/38940681868) reported TS1005 at the missing hemisphereLight args bracket; fixed in subsequent PR commit |
| Local typecheck/build | NOT RUN | Local runtime could not access GitHub/npm by DNS |
| Visual browser/accessibility QA | NOT AVAILABLE | Connected Vercel/browser inspection denied access |
| Manual deployment by agent | NOT PERFORMED | Owner manages Vercel; Git integration runs under owner settings |

Successful CI validates install, typecheck, unit tests and production build, not final visual quality, runtime interaction, accessibility compliance or measured frame rate.

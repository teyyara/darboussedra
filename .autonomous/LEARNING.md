# Engineering Lessons

- Passing typecheck/tests/build is not proof that the 3D house looks coherent.
- The entrance screenshot shows the foreground door frame aligned with a farther portal; change the view/layout rather than calling it realistic.
- Stair checks anticipatesUpperLandingTurn and clearsUpperLandingOnAscent are false even though all room arrivals settle.
- Inspect partial artifacts from failed runs before modifying code.
- Repeated pushes cancel superseded browser captures; make one coherent source change per loop and wait for its evidence.
- The 45-second screenshot timeout is a real failure to diagnose, not permission to relax the gate.


## Loop 100 learning
- An overall workflow SUCCESS can conceal incomplete visual evidence when the capture script records phase timeouts but exits successfully.
- Two phase images at exactly the same position are not independent evidence; inspect routeProgress, cameraPosition, runtime errors and hold-token telemetry with the frames.
- Camera direction predicates and source tests are not visual acceptance; actual screenshots remain necessary.


## Loop 101 learning
- A shared TTL is not a hard bound if its timestamp is rewritten while the match remains true.
- Per-token deadline telemetry made the renewal bug identifiable.
- Two fallback screenshots at the same position and missing target-phase images are a browser-review failure even if source tests pass.


## Loop 102 learning
- Per-token expiry prevents renewal loops but cannot by itself prevent an already-running phase timeout from elapsing while an earlier capture holds the camera.
- Phase waiters need to be sequenced, with the next watcher armed immediately before predecessor-hold release. A guard prevents an overlapping phase window from matching the old held frame.
- The visual review must fail if expected phase screenshots are missing or fallback frames show the same stale position.

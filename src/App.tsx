import {lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {type HouseLocation, type RoomSlug} from "./house/rooms";
import {roomFromPath} from "./house/routes";
import {HouseMap} from "./components/HouseMap";
import {SceneErrorBoundary} from "./components/SceneErrorBoundary";
import {StaticHouseIllustration} from "./components/SceneFallback";
import {useReducedMotion} from "./hooks/useReducedMotion";

const HouseScene = lazy(() => import("./house/HouseScene").then((module) => ({default: module.HouseScene})));

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [webgl, setWebgl] = useState<"checking" | "yes" | "no">("checking");
  const [settledLocation, setSettledLocation] = useState<HouseLocation>("exterior");
  const [walking, setWalking] = useState(false);
  const pathRef = useRef(path);
  const walkingRef = useRef(false);
  const previous = useRef("/");
  const reducedMotion = useReducedMotion();
  const room = useMemo(() => roomFromPath(path), [path]);
  const map = path === "/house/map";
  const invalid = path !== "/" && !map && !room;
  const activeRoom = room ?? (map ? roomFromPath(previous.current) : undefined);
  // The spatial plan is an HTML overlay; opening it must not replace the 3D scene/location.
  const current: HouseLocation = map
    ? ((activeRoom?.slug as RoomSlug | undefined) ?? "exterior")
    : room ? (room.slug as RoomSlug) : "exterior";

  useEffect(() => {
    const onPop = () => {
      const nextPath = window.location.pathname;
      if (nextPath === "/house/map") previous.current = pathRef.current;
      else if (pathRef.current === "/house/map") previous.current = nextPath;
      pathRef.current = nextPath;
      setPath(nextPath);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    try {
      setWebgl(document.createElement("canvas").getContext("webgl2") ? "yes" : "no");
    } catch {
      setWebgl("no");
    }
  }, []);

  useEffect(() => {
    document.title = room ? room.name + " — Dar Boussedra" : map ? "House map — Dar Boussedra" : "Dar Boussedra — Our Digital Family Home";
  }, [room, map]);

  const go = useCallback((next: string) => {
    if (pathRef.current !== "/house/map") previous.current = pathRef.current;
    if (pathRef.current !== next) window.history.pushState({}, "", next);
    pathRef.current = next;
    setPath(next);
  }, []);
  const openMap = useCallback(() => go("/house/map"), [go]);
  const closeMap = useCallback(() => go(previous.current === "/house/map" ? "/" : previous.current), [go]);
  const select = useCallback((slug: RoomSlug) => {
    if (walkingRef.current) return;
    go("/room/" + slug);
  }, [go]);
  const handleTransitionChange = useCallback((moving: boolean) => {
    walkingRef.current = moving;
    setWalking(moving);
  }, []);

  useEffect(() => {
    if (!map) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMap();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [map, closeMap]);

  return <main className="app-shell" data-view={room && !map ? "room" : "home"}>
    <div className="scene-layer">
      {webgl === "checking"
        ? <p className="loading" role="status">Preparing the house…</p>
        : webgl === "no"
          ? <StaticHouseIllustration />
          : <SceneErrorBoundary><Suspense fallback={<StaticHouseIllustration />}>
            <HouseScene location={current} settledLocation={settledLocation} reducedMotion={reducedMotion}
              onArrive={setSettledLocation} onTransitionChange={handleTransitionChange}
              onDoorActivate={(entering) => {
                if (walkingRef.current) return;
                if (entering) select("entrance");
                else go("/");
              }}
              onSelect={select} />
          </Suspense></SceneErrorBoundary>}
    </div>
    <div className="wash" />
    <header className="header">
      <a href="/" onClick={(event) => { event.preventDefault(); go("/"); }} aria-label="Dar Boussedra home">
        <strong>Dar Boussedra</strong><small>دار بوسدرة</small>
      </a>
      <button type="button" disabled={walking} onClick={openMap}>House map ↗</button>
    </header>
    {path === "/" && settledLocation === "exterior" && <section className="welcome" aria-labelledby="welcome-title">
      <p className="eyebrow">OUR FAMILY HOME</p>
      <h1 id="welcome-title">A place to<br /><em>come home to.</em></h1>
      <p>Even when we are far apart, we still have a home we can return to. This one is ours to shape, together.</p>
      <button className="primary" type="button" onClick={() => select("entrance")}>Enter the house ↗</button>
      <button className="plain" type="button" onClick={openMap}>Explore all rooms →</button>
    </section>}
    {room && <section className={"welcome room-welcome" + (walking ? " is-walking" : "")} aria-labelledby="room-title">
      <p className="eyebrow">{settledLocation === room.slug ? "YOU ARE HERE" : "WALKING TO"}</p>
      <h1 id="room-title">{room.name}</h1>
      <p>{settledLocation === room.slug
        ? "Click a terracotta floor marker or doorway to keep exploring the connected house."
        : "Following the connected rooms and stairs at a slower walking pace."}</p>
      <button className="primary" type="button" disabled={walking} onClick={openMap}>Open the house map ↗</button>
      <button className="plain" type="button" disabled={settledLocation !== room.slug} onClick={() => go("/")}>Return outside →</button>
    </section>}
    {map && <HouseMap active={activeRoom?.slug} onSelect={select} onClose={closeMap} />}
    {path === "/" && settledLocation !== "exterior" && <section className={"welcome room-welcome" + (walking ? " is-walking" : "")} aria-label="Returning outside">
      <p className="eyebrow">WALKING OUTSIDE</p>
      <h1>Heading back out</h1>
      <p>Following the same rooms and doorway in reverse.</p>
    </section>}
    {!map && <aside className="navigation-guide" aria-label="3D navigation instructions">
      <span className="navigation-guide-icon" aria-hidden="true">{current === "exterior" ? "↘" : "⌖"}</span>
      <span className="navigation-guide-copy">
        <strong>{walking ? (room ? "Walking to " + room.name : "Following the route outside") : current === "exterior" && settledLocation !== "exterior" ? "Following the route outside" : room ? "Walk to another room" : "Start at the front door"}</strong>
        <small>{walking
          ? "Let the camera finish the doorway and stair route. Navigation becomes available on arrival."
          : room
            ? "Click a terracotta floor marker or doorway to walk. Open House map for any destination."
            : "Click the gold marker above the front door to enter, or use House map."}</small>
      </span>
    </aside>}
    {invalid && <section className="welcome" aria-labelledby="missing-title">
      <p className="eyebrow">WRONG TURN</p>
      <h1 id="missing-title">Let's find<br /><em>our way home.</em></h1>
      <button className="primary" type="button" onClick={openMap}>Open the house map ↗</button>
      <button className="plain" type="button" onClick={() => go("/")}>Return outside →</button>
    </section>}
    <footer><span>Always a place to come home to.</span><span>Built for family, not for an audience.</span>{reducedMotion && <small>Reduced motion</small>}</footer>
  </main>;
}

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
  const pathRef = useRef(path);
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
  const select = useCallback((slug: RoomSlug) => go("/room/" + slug), [go]);

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

  return <main className="app-shell">
    <div className="scene-layer">
      {webgl === "checking"
        ? <p className="loading" role="status">Preparing the house…</p>
        : webgl === "no"
          ? <StaticHouseIllustration />
          : <SceneErrorBoundary><Suspense fallback={<StaticHouseIllustration />}>
            <HouseScene location={current} reducedMotion={reducedMotion}
              onDoorActivate={(entering) => entering ? select("entrance") : go("/")}
              onSelect={select} />
          </Suspense></SceneErrorBoundary>}
    </div>
    <div className="wash" />
    <header className="header">
      <a href="/" onClick={(event) => { event.preventDefault(); go("/"); }} aria-label="Dar Boussedra home">
        <strong>Dar Boussedra</strong><small>دار بوسدرة</small>
      </a>
      <button type="button" onClick={openMap}>House map ↗</button>
    </header>
    {path === "/" && <section className="welcome" aria-labelledby="welcome-title">
      <p className="eyebrow">OUR FAMILY HOME</p>
      <h1 id="welcome-title">A place to<br /><em>come home to.</em></h1>
      <p>Even when we are far apart, we still have a home we can return to. This one is ours to shape, together.</p>
      <button className="primary" type="button" onClick={() => select("entrance")}>Enter the house ↗</button>
      <button className="plain" type="button" onClick={openMap}>Explore all rooms →</button>
    </section>}
    {room && <section className="welcome room-welcome" aria-labelledby="room-title">
      <p className="eyebrow">YOU ARE HERE</p>
      <h1 id="room-title">{room.name}</h1>
      <p>A quiet, intentionally empty space. The architecture comes first; what belongs here can be decided over time.</p>
      <button className="primary" type="button" onClick={openMap}>Open the house map ↗</button>
      <button className="plain" type="button" onClick={() => go("/")}>Return outside →</button>
    </section>}
    {map && <HouseMap active={activeRoom?.slug} onSelect={select} onClose={closeMap} />}
    {invalid && <section className="welcome" aria-labelledby="missing-title">
      <p className="eyebrow">WRONG TURN</p>
      <h1 id="missing-title">Let's find<br /><em>our way home.</em></h1>
      <button className="primary" type="button" onClick={openMap}>Open the house map ↗</button>
      <button className="plain" type="button" onClick={() => go("/")}>Return outside →</button>
    </section>}
    <footer><span>Always a place to come home to.</span><span>Built for family, not for an audience.</span>{reducedMotion && <small>Reduced motion</small>}</footer>
  </main>;
}

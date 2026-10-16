import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {HouseScene} from "./house/HouseScene";
import {getRoomBySlug,type HouseLocation,type RoomSlug} from "./house/rooms";
import {HouseMap} from "./components/HouseMap";
import {SceneErrorBoundary} from "./components/SceneErrorBoundary";
import {StaticHouseIllustration} from "./components/SceneFallback";
import {useReducedMotion} from "./hooks/useReducedMotion";

export default function App(){
  const [path,setPath]=useState(window.location.pathname);
  const [webgl,setWebgl]=useState<"checking"|"yes"|"no">("checking");
  const pathRef=useRef(path),previous=useRef("/");
  const reducedMotion=useReducedMotion();
  const room=useMemo(()=>{
    if(!path.startsWith("/room/")) return undefined;
    try{return getRoomBySlug(decodeURIComponent(path.slice(6)));}catch{return undefined;}
  },[path]);
  const map=path==="/house/map",invalid=path!=="/"&&!map&&!room;
  const current:HouseLocation=map?"map":room?(room.slug as RoomSlug):"exterior";

  useEffect(()=>{const onPop=()=>{pathRef.current=window.location.pathname;setPath(window.location.pathname);};window.addEventListener("popstate",onPop);return()=>window.removeEventListener("popstate",onPop);},[]);
  useEffect(()=>{try{setWebgl(document.createElement("canvas").getContext("webgl2")?"yes":"no");}catch{setWebgl("no");}},[]);
  useEffect(()=>{document.title=room?room.name+" — Dar Boussedra":map?"House map — Dar Boussedra":"Dar Boussedra — Our Digital Family Home";},[room,map]);

  const go=useCallback((next:string)=>{if(pathRef.current!=="/house/map")previous.current=pathRef.current;if(pathRef.current!==next)window.history.pushState({},"",next);pathRef.current=next;setPath(next);},[]);
  const openMap=useCallback(()=>go("/house/map"),[go]);
  const closeMap=useCallback(()=>go(previous.current==="/house/map"?"/":previous.current),[go]);
  const select=useCallback((slug:RoomSlug)=>go("/room/"+slug),[go]);
  useEffect(()=>{if(!map)return;const key=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();closeMap();}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);},[map,closeMap]);

  return <main className="app-shell">
    <div className="scene-layer">
      {webgl==="checking"?<p className="loading" role="status">Preparing the house…</p>:webgl==="no"?<StaticHouseIllustration/>:<SceneErrorBoundary><HouseScene location={current} reducedMotion={reducedMotion} onEnter={()=>select("entrance")} onSelect={select}/></SceneErrorBoundary>}
    </div>
    <div className="wash"/>
    <header className="header">
      <a href="/" onClick={event=>{event.preventDefault();go("/");}} aria-label="Dar Boussedra home"><strong>Dar Boussedra</strong><small>دار بوسدرة</small></a>
      <button type="button" onClick={openMap}>House map ↗</button>
    </header>
    {path==="/"&&<section className="welcome" aria-labelledby="welcome-title"><p className="eyebrow">OUR FAMILY HOME</p><h1 id="welcome-title">A place to<br/><em>come home to.</em></h1><p>Even when we are far apart, we still have a home we can return to. This one is ours to shape, together.</p><button className="primary" type="button" onClick={()=>select("entrance")}>Enter the house ↗</button><button className="plain" type="button" onClick={openMap}>Explore all rooms →</button></section>}
    {room&&<section className="welcome" aria-labelledby="room-title"><p className="eyebrow">YOU ARE HERE</p><h1 id="room-title">{room.name}</h1><p>A quiet, intentionally empty space. The architecture comes first; what belongs here can be decided over time.</p><button className="primary" type="button" onClick={openMap}>Open the house map ↗</button><button className="plain" type="button" onClick={()=>go("/")}>Return outside →</button></section>}
    {map&&<HouseMap active={room?.slug} onSelect={select} onClose={closeMap}/>}
    {invalid&&<section className="welcome" aria-labelledby="missing-title"><p className="eyebrow">WRONG TURN</p><h1 id="missing-title">Let's find<br/><em>our way home.</em></h1><button className="primary" type="button" onClick={openMap}>Open the house map ↗</button><button className="plain" type="button" onClick={()=>go("/")}>Return outside →</button></section>}
    <footer><span>Always a place to come home to.</span><span>Built for family, not for an audience.</span>{reducedMotion&&<small>Reduced motion</small>}</footer>
  </main>;
}

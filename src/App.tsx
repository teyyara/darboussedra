import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {HouseMap} from "./components/HouseMap";
import {SceneErrorBoundary} from "./components/SceneErrorBoundary";
import {StaticHouseIllustration} from "./components/SceneFallback";
import {HouseScene} from "./house/HouseScene";
import {getRoomBySlug,type HouseLocation,type RoomSlug} from "./house/rooms";
import {useReducedMotion} from "./hooks/useReducedMotion";

type Route={kind:"exterior"}|{kind:"map"}|{kind:"room";slug:RoomSlug;room:NonNullable<ReturnType<typeof getRoomBySlug>>}|{kind:"not-found"};
function resolveRoute(pathname:string):Route{
 const path=pathname.length>1?pathname.replace(/\/+$/,""):"/";
 if(path==="/")return {kind:"exterior"};if(path==="/house/map")return {kind:"map"};
 const match=path.match(/^\/room\/([^/]+)$/);
 if(match){try{const room=getRoomBySlug(decodeURIComponent(match[1]));if(room)return {kind:"room",slug:room.slug,room};}catch{return {kind:"not-found"};}}
 return {kind:"not-found"};
}
function BrandMark(){return <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M4 15.5 16 5l12 10.5v12H4z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M12 27V18h8v9M2.8 16.4 16 4l13.2 12.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg></span>;}
function LoadingState(){return <div className="scene-message" role="status" aria-live="polite"><span className="loading-orbit" aria-hidden="true"/><p>Preparing the house…</p></div>;}
export default function App(){
 const [pathname,setPathname]=useState(()=>window.location.pathname);
 const [webglStatus,setWebglStatus]=useState<"checking"|"available"|"unavailable">("checking");
 const reducedMotion=useReducedMotion(),currentPath=useRef(pathname),lastNonMapPath=useRef("/");
 const route=useMemo(()=>resolveRoute(pathname),[pathname]);
 useEffect(()=>{currentPath.current=pathname;},[pathname]);
 useEffect(()=>{const onPopState=()=>{const path=window.location.pathname;currentPath.current=path;setPathname(path);};window.addEventListener("popstate",onPopState);return ()=>window.removeEventListener("popstate",onPopState);},[]);
 useEffect(()=>{try{const ctx=document.createElement("canvas").getContext("webgl2",{failIfMajorPerformanceCaveat:true});setWebglStatus(ctx?"available":"unavailable");}catch{setWebglStatus("unavailable");}},[]);
 useEffect(()=>{document.title=route.kind==="room"?route.room.name+" — Dar Boussedra":route.kind==="map"?"Explore the House — Dar Boussedra":"Dar Boussedra — Our Digital Family Home";},[route]);
 const navigate=useCallback((next:string)=>{if(currentPath.current!=="/house/map")lastNonMapPath.current=currentPath.current;if(currentPath.current!==next)window.history.pushState({},"",next);currentPath.current=next;setPathname(next);},[]);
 const openMap=useCallback(()=>navigate("/house/map"),[navigate]);
 const closeMap=useCallback(()=>{const previous=resolveRoute(lastNonMapPath.current);navigate(previous.kind==="map"||previous.kind==="not-found"?"/":lastNonMapPath.current);},[navigate]);
 useEffect(()=>{if(route.kind!=="map")return;const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();closeMap();}};window.addEventListener("keydown",onKey);return ()=>window.removeEventListener("keydown",onKey);},[route.kind,closeMap]);
 const selectRoom=useCallback((slug:RoomSlug)=>navigate("/room/"+slug),[navigate]),enterHouse=useCallback(()=>selectRoom("entrance"),[selectRoom]);
 const sceneLocation:HouseLocation=route.kind==="map"?"map":route.kind==="room"?route.slug:"exterior";
 let activeSlug:string|undefined;
 if(route.kind==="room")activeSlug=route.slug;
 if(route.kind==="map"){const previous=resolveRoute(lastNonMapPath.current);if(previous.kind==="room")activeSlug=previous.slug;}
 return <main className="app-shell">
  <div className="scene-layer">{webglStatus==="checking"&&<LoadingState/>}{webglStatus==="unavailable"&&<StaticHouseIllustration/>}{webglStatus==="available"&&<SceneErrorBoundary><HouseScene location={sceneLocation} reducedMotion={reducedMotion} onEnterHouse={enterHouse} onSelectRoom={selectRoom}/></SceneErrorBoundary>}</div>
  <div className="atmosphere-wash" aria-hidden="true"/>
  <header className="site-header">
   <a className="brand-lockup" href="/" onClick={(event)=>{event.preventDefault();navigate("/");}} aria-label="Dar Boussedra home"><BrandMark/><span className="brand-copy"><strong>Dar Boussedra</strong><small>دار بوسدرة</small></span></a>
   <div className="header-right"><span className="privacy-note"><span className="privacy-dot"/> A home that stays close</span><button className="map-trigger" type="button" onClick={openMap}><span className="map-trigger-icon" aria-hidden="true">⌘</span>House map<span className="button-arrow" aria-hidden="true">↗</span></button></div>
  </header>
  {route.kind==="exterior"&&<section className="welcome-card" aria-labelledby="welcome-title"><p className="eyebrow"><span className="eyebrow-rule"/> OUR FAMILY HOME</p><h1 id="welcome-title">A place to<br/><em>come home to.</em></h1><p className="welcome-copy">Even when we are far apart, we still have a home we can return to. This one is ours to shape, together.</p><div className="welcome-actions"><button className="primary-button" type="button" onClick={enterHouse}>Enter the house <span aria-hidden="true">↗</span></button><button className="text-button" type="button" onClick={openMap}>Explore all rooms <span aria-hidden="true">→</span></button></div><div className="welcome-meta"><span className="meta-line"/><span>The house is ready for its first visit</span></div></section>}
  {route.kind==="room"&&<section className="location-card" aria-labelledby="location-title"><p className="eyebrow"><span className="eyebrow-rule"/> YOU ARE HERE</p><p className="location-index">{String(getLocationIndex(route.slug)).padStart(2,"0")} <span>/ 13 SPACES</span></p><h1 id="location-title">{route.room.name}</h1><p className="location-copy">A quiet, intentionally empty space. The architecture comes first; what belongs here can be decided over time.</p><div className="location-actions"><button className="primary-button" type="button" onClick={openMap}>Open the house map <span aria-hidden="true">↗</span></button><button className="text-button" type="button" onClick={()=>navigate("/")}>Return outside <span aria-hidden="true">→</span></button></div><p className="location-footnote"><span className="status-dot"/> No furniture or family content has been added yet.</p></section>}
  {route.kind==="map"&&<HouseMap activeSlug={activeSlug} onSelectRoom={selectRoom} onClose={closeMap}/>}
  {route.kind==="not-found"&&<section className="location-card not-found-card" aria-labelledby="not-found-title"><p className="eyebrow"><span className="eyebrow-rule"/> WRONG TURN</p><h1 id="not-found-title">Let's find<br/><em>our way home.</em></h1><p className="location-copy">That space is not in the house plan. You can return outside or choose from the room map.</p><div className="location-actions"><button className="primary-button" type="button" onClick={openMap}>Open the house map <span aria-hidden="true">↗</span></button><button className="text-button" type="button" onClick={()=>navigate("/")}>Return outside <span aria-hidden="true">→</span></button></div></section>}
  <footer className="site-footer"><span className="footer-quote">Always a place to come home to.</span><span className="footer-right">{reducedMotion&&<span className="motion-note">Reduced motion</span>}<span className="footer-separator">·</span><span>Built for family, not for an audience.</span></span></footer>
 </main>;
}
function getLocationIndex(slug:RoomSlug):number{return ["entrance","living-room","kitchen","family-table","library","pets-corner","prayer-room","zakariae-room","zineb-room","meryem-room","fatiha-room","garden","rooftop"].indexOf(slug)+1;}

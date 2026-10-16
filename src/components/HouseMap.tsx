import {rooms,type Room,type RoomSlug} from "../house/rooms";
interface HouseMapProps{activeSlug?:string;onSelectRoom:(slug:RoomSlug)=>void;onClose:()=>void;}
function FloorPlan({title,floorRooms,activeSlug,onSelectRoom}:{title:string;floorRooms:readonly Room[];activeSlug?:string;onSelectRoom:(slug:RoomSlug)=>void;}){
 return <section className="map-level" aria-labelledby={"map-"+title.toLowerCase().replaceAll(" ","-")}>
  <div className="map-level-heading"><span className="level-index">{title==="Ground Floor"?"01":"02"}</span><h3 id={"map-"+title.toLowerCase().replaceAll(" ","-")}>{title}</h3><span className="level-count">{floorRooms.length} spaces</span></div>
  <div className="map-plan" aria-label={title+" room plan"}>{floorRooms.map((room)=><button type="button" key={room.id} className={"plan-room"+(activeSlug===room.slug?" is-current":"")}
   style={{left:room.mapPosition.x+"%",top:room.mapPosition.y+"%",width:room.mapPosition.width+"%",height:room.mapPosition.height+"%"}}
   onClick={()=>onSelectRoom(room.slug)} aria-current={activeSlug===room.slug?"location":undefined} title={"Visit "+room.name}><span>{room.name}</span></button>)}</div>
 </section>;
}
export function HouseMap({activeSlug,onSelectRoom,onClose}:HouseMapProps){
 const ground=rooms.filter((room)=>room.level==="ground"),upper=rooms.filter((room)=>room.level==="upper"),outdoor=rooms.filter((room)=>room.level==="outdoor"||room.level==="roof");
 return <section className="map-panel" aria-labelledby="map-title">
  <div className="map-panel-top"><div><p className="eyebrow">FIND YOUR WAY HOME</p><h2 id="map-title">Explore the house</h2><p className="map-description">Choose any space directly. Every room is still intentionally empty.</p></div>
   <button className="icon-button close-map" type="button" onClick={onClose} aria-label="Close the house map"><span aria-hidden="true">×</span></button></div>
  <div className="map-levels"><FloorPlan title="Ground Floor" floorRooms={ground} activeSlug={activeSlug} onSelectRoom={onSelectRoom}/><FloorPlan title="Upper Floor" floorRooms={upper} activeSlug={activeSlug} onSelectRoom={onSelectRoom}/></div>
  <section className="map-level outdoor-level" aria-labelledby="map-outdoor"><div className="map-level-heading"><span className="level-index">03</span><h3 id="map-outdoor">Open air</h3><span className="level-count">Garden & roof</span></div>
   <div className="outdoor-destinations">{outdoor.map((room)=><button type="button" key={room.id} className={"outdoor-destination"+(activeSlug===room.slug?" is-current":"")} onClick={()=>onSelectRoom(room.slug)} aria-current={activeSlug===room.slug?"location":undefined}>
    <span className="destination-glyph" aria-hidden="true">{room.level==="roof"?"↗":"✳"}</span><span><strong>{room.name}</strong><small>{room.level==="roof"?"Above the house":"Beyond the entrance"}</small></span><span className="destination-arrow" aria-hidden="true">→</span>
   </button>)}</div>
  </section>
  <p className="map-footnote"><span className="map-dot"/> Selected location <span className="map-divider">·</span> The layout is a revisable proposal.</p>
 </section>;
}

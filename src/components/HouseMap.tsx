import {rooms,type Room,type RoomSlug} from "../house/rooms";
export function HouseMap({active,onSelect,onClose}:{active?:string;onSelect:(slug:RoomSlug)=>void;onClose:()=>void}){
 const ground=rooms.filter(r=>r.level==="ground"),upper=rooms.filter(r=>r.level==="upper"),outside=rooms.filter(r=>r.level==="outdoor"||r.level==="roof");
 const group=(title:string,list:readonly Room[]) => <section className="map-level"><h3>{title}</h3><div className="map-rooms">{list.map(r=><button type="button" key={r.id} className={active===r.slug?"current":""} aria-current={active===r.slug?"location":undefined} onClick={()=>onSelect(r.slug as RoomSlug)}>{r.name}</button>)}</div></section>;
 return <section className="map-panel" aria-labelledby="map-title"><header><div><p className="eyebrow">FIND YOUR WAY HOME</p><h2 id="map-title">Explore the house</h2></div><button type="button" className="close" onClick={onClose} aria-label="Close map">×</button></header>{group("Ground floor",ground)}{group("Upper floor",upper)}{group("Open air",outside)}<p className="map-note">Every room is intentionally empty. The plan is a revisable proposal.</p></section>;
}

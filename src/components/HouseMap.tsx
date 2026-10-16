import {useEffect, useMemo, useState, type CSSProperties} from "react";
import {
  HOUSE_LAYOUT, REQUIRED_ROOM_SLUGS, getRoomBySlug, roomBounds, rooms,
  type Room, type RoomSlug,
} from "../house/rooms";

type PlanZone = "ground" | "upper" | "garden" | "rooftop";
const zones: { id: PlanZone; label: string; heading: string; description: string }[] = [
  { id: "ground", label: "Ground floor", heading: "Ground floor", description: "Entrance and shared rooms use the same coordinates as the 3D shell." },
  { id: "upper", label: "Upper floor", heading: "Upper floor", description: "Four separate private rooms open onto a shared landing around the stairwell." },
  { id: "garden", label: "Garden", heading: "Garden", description: "The garden meets the entrance threshold along the same Z-axis as the house." },
  { id: "rooftop", label: "Rooftop", heading: "Rooftop terrace", description: "The stair exit is represented as an opening through the terrace floor." },
];
function zoneForRoom(slug?: string): PlanZone {
  const room = slug ? getRoomBySlug(slug) : undefined;
  if (room?.level === "upper") return "upper";
  if (room?.level === "outdoor") return "garden";
  if (room?.level === "roof") return "rooftop";
  return "ground";
}
function roomsForZone(zone: PlanZone): readonly Room[] {
  if (zone === "ground") return rooms.filter((room) => room.level === "ground");
  if (zone === "upper") return rooms.filter((room) => room.level === "upper");
  if (zone === "garden") return rooms.filter((room) => room.slug === "garden");
  return rooms.filter((room) => room.slug === "rooftop");
}
const shellBounds = {
  minX: -HOUSE_LAYOUT.exterior.width / 2 - 0.35,
  maxX: HOUSE_LAYOUT.exterior.width / 2 + 0.35,
  minZ: -HOUSE_LAYOUT.exterior.depth / 2 - 0.35,
  maxZ: HOUSE_LAYOUT.exterior.depth / 2 + 0.35,
};
function boundsFor(zone: PlanZone, list: readonly Room[]) {
  if (zone === "ground" || zone === "upper" || zone === "rooftop") return shellBounds;
  const bounds = list.map(roomBounds);
  return {
    minX: Math.min(...bounds.map((bound) => bound.minX)) - 0.35,
    maxX: Math.max(...bounds.map((bound) => bound.maxX)) + 0.35,
    minZ: Math.min(...bounds.map((bound) => bound.minZ)) - 0.35,
    maxZ: Math.max(...bounds.map((bound) => bound.maxZ)) + 0.35,
  };
}
function roomStyle(room: Room, bounds: ReturnType<typeof boundsFor>): CSSProperties {
  const geometry = roomBounds(room), width = bounds.maxX - bounds.minX, depth = bounds.maxZ - bounds.minZ;
  return {
    left: ((geometry.minX - bounds.minX) / width * 100) + "%",
    top: ((bounds.maxZ - geometry.maxZ) / depth * 100) + "%",
    width: ((geometry.maxX - geometry.minX) / width * 100) + "%",
    height: ((geometry.maxZ - geometry.minZ) / depth * 100) + "%",
  };
}
function shellStyle(bounds: ReturnType<typeof boundsFor>): CSSProperties {
  const width = bounds.maxX - bounds.minX, depth = bounds.maxZ - bounds.minZ;
  return {
    left: ((-HOUSE_LAYOUT.exterior.width / 2 - bounds.minX) / width * 100) + "%",
    top: ((bounds.maxZ - HOUSE_LAYOUT.exterior.depth / 2) / depth * 100) + "%",
    width: (HOUSE_LAYOUT.exterior.width / width * 100) + "%",
    height: (HOUSE_LAYOUT.exterior.depth / depth * 100) + "%",
  };
}
function shaftStyle(bounds: ReturnType<typeof boundsFor>): CSSProperties {
  const opening = HOUSE_LAYOUT.stairs.roofOpening, width = bounds.maxX - bounds.minX, depth = bounds.maxZ - bounds.minZ;
  return {
    left: ((opening.centerX - opening.width / 2 - bounds.minX) / width * 100) + "%",
    top: ((bounds.maxZ - (opening.centerZ + opening.depth / 2)) / depth * 100) + "%",
    width: (opening.width / width * 100) + "%",
    height: (opening.depth / depth * 100) + "%",
  };
}
function stairwellStyle(bounds: ReturnType<typeof boundsFor>): CSSProperties {
  const flight = HOUSE_LAYOUT.stairs.groundFlight, width = bounds.maxX - bounds.minX, depth = bounds.maxZ - bounds.minZ;
  const minZ = Math.min(flight.from[2], flight.to[2]), maxZ = Math.max(flight.from[2], flight.to[2]);
  return {
    left: ((-HOUSE_LAYOUT.stairs.shaftWidth / 2 - bounds.minX) / width * 100) + "%",
    top: ((bounds.maxZ - maxZ) / depth * 100) + "%",
    width: (HOUSE_LAYOUT.stairs.shaftWidth / width * 100) + "%",
    height: ((maxZ - minZ) / depth * 100) + "%",
  };
}
function floorZoneStyle(zone: { centerX: number; centerZ: number; width: number; depth: number }, bounds: ReturnType<typeof boundsFor>): CSSProperties {
  const width = bounds.maxX - bounds.minX, depth = bounds.maxZ - bounds.minZ;
  return {
    left: ((zone.centerX - zone.width / 2 - bounds.minX) / width * 100) + "%",
    top: ((bounds.maxZ - (zone.centerZ + zone.depth / 2)) / depth * 100) + "%",
    width: (zone.width / width * 100) + "%",
    height: (zone.depth / depth * 100) + "%",
  };
}
export function HouseMap({active, onSelect, onClose}: {active?: string; onSelect: (slug: RoomSlug) => void; onClose: () => void}) {
  const [zone, setZone] = useState<PlanZone>(() => zoneForRoom(active));
  useEffect(() => { if (active) setZone(zoneForRoom(active)); }, [active]);
  const currentZone = zones.find((item) => item.id === zone) ?? zones[0];
  const planRooms = useMemo(() => roomsForZone(zone), [zone]);
  const bounds = useMemo(() => boundsFor(zone, planRooms), [zone, planRooms]);
  const directoryGroups = [
    { title: "Ground floor", list: rooms.filter((room) => room.level === "ground") },
    { title: "Upper floor", list: rooms.filter((room) => room.level === "upper") },
    { title: "Garden and rooftop", list: rooms.filter((room) => room.level === "outdoor" || room.level === "roof") },
  ];
  return <section className="map-panel" aria-labelledby="map-title">
    <header className="map-panel-header">
      <div><p className="eyebrow">FIND YOUR WAY HOME</p><h2 id="map-title">Explore the house</h2></div>
      <button type="button" className="close" onClick={onClose} aria-label="Close map">×</button>
    </header>
    <section className="map-spatial" aria-labelledby="spatial-title">
      <div className="map-spatial-heading"><div><h3 id="spatial-title">Spatial plan</h3><p>{currentZone.description}</p></div></div>
      <div className="map-zone-tabs" role="group" aria-label="Choose a floor or outdoor area">
        {zones.map((item) => <button key={item.id} type="button" aria-pressed={zone === item.id}
          className={zone === item.id ? "selected" : ""} onClick={() => setZone(item.id)}>{item.label}</button>)}
      </div>
      <div className="plan-scroll" aria-label={currentZone.heading + " plan"}>
        <div className={"plan-canvas plan-" + zone}
          style={{aspectRatio: (bounds.maxX - bounds.minX) + " / " + (bounds.maxZ - bounds.minZ)}}>
          {(zone === "ground" || zone === "upper") && <div className="plan-shell-outline" style={shellStyle(bounds)} aria-hidden="true" />}
          {planRooms.map((room) => <button key={room.id} type="button"
            className={"plan-room-button " + (active === room.slug ? "current" : "")}
            style={roomStyle(room, bounds)} onClick={() => onSelect(room.slug as RoomSlug)}
            aria-current={active === room.slug ? "location" : undefined} title={"Go to " + room.name}>
            <span>{room.name}</span>
          </button>)}
          {(zone === "ground" || zone === "upper") && <div className="plan-stair-shaft plan-stairwell" style={stairwellStyle(bounds)} aria-hidden="true"><span>{zone === "ground" ? "Stairs to upper floor" : "Open stairwell"}</span></div>}
          {zone === "upper" && <div className="plan-floor-zone plan-upper-bridge" style={floorZoneStyle(HOUSE_LAYOUT.upperBridge, bounds)} aria-hidden="true"><span>Stair bridge</span></div>}
          {zone === "upper" && <div className="plan-floor-zone plan-upper-landing" style={floorZoneStyle(HOUSE_LAYOUT.upperLanding, bounds)} aria-hidden="true"><span>Upper landing</span></div>}
          {zone === "rooftop" && <div className="plan-stair-shaft" style={shaftStyle(bounds)} aria-hidden="true"><span>Stair opening</span></div>}
          {zone === "garden" && <div className="plan-garden-path" aria-hidden="true"><span>Entry path</span></div>}
        </div>
      </div>
      <p className="map-spatial-caption">{planRooms.length} destination{planRooms.length === 1 ? "" : "s"} shown · selectable · based on registered world coordinates</p>
    </section>
    <section className="map-directory" aria-labelledby="directory-title">
      <h3 id="directory-title">Room directory</h3>
      <p className="map-directory-note">Accessible list alternative to the spatial plan. All 13 permanent destinations are included.</p>
      {directoryGroups.map((group) => <section className="map-level" key={group.title}>
        <h4>{group.title}</h4>
        <div className="map-rooms">{group.list.map((room) => <button type="button" key={room.id}
          className={active === room.slug ? "current" : ""} aria-current={active === room.slug ? "location" : undefined}
          onClick={() => onSelect(room.slug as RoomSlug)}>{room.name}</button>)}</div>
      </section>)}
      <p className="map-note">The plan is a revisable architectural proposal. Every room is intentionally unfurnished.</p>
      <p className="map-count" aria-label="Room registry count">{rooms.length} of {REQUIRED_ROOM_SLUGS.length} permanent destinations registered</p>
    </section>
  </section>;
}

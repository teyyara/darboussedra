import { HOUSE_LAYOUT, type Room } from "./rooms";

/** Local underside height of the ceiling associated with a room's scene group. */
export function getRoomCeilingBottomLocal(room: Pick<Room, "level" | "scenePosition">): number {
  if (room.level === "upper") {
    // The shared ceiling is the underside of a 0.18 m roof slab centred 0.09 m below roofY.
    return HOUSE_LAYOUT.roofY - 0.18 - room.scenePosition[1];
  }
  // Ground room ceilings are centred at floor + wall height - 0.04 with a thickness of 0.08 m.
  return HOUSE_LAYOUT.floorThickness + HOUSE_LAYOUT.roomWallHeight - 0.08;
}

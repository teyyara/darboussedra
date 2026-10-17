import { HOUSE_LAYOUT, getRoomWallRuns, type Room, type WallSide, type Vector3Tuple } from "./rooms";

export interface RoomWallDecor {
  readonly key: string;
  readonly side: WallSide;
  readonly position: Vector3Tuple;
  readonly rotationY: number;
  readonly width: number;
  readonly height: number;
  readonly frameColor: string;
  readonly fieldColor: string;
  readonly accentColor: string;
}

const SIDES: readonly WallSide[] = ["front", "back", "left", "right"];

const ACCENT_BY_ROOM: Readonly<Record<string, string>> = {
  "entrance": "#b45d43",
  "living-room": "#657d70",
  "family-table": "#bd684b",
  "kitchen": "#bd985d",
  "library": "#456d61",
  "pets-corner": "#829579",
  "prayer-room": "#718778",
  "zakariae-room": "#477b79",
  "zineb-room": "#ad7c9e",
  "meryem-room": "#c18170",
  "fatiha-room": "#788a63",
};

function preferredWall(room: Room): WallSide {
  const facingX = room.camera.target[0] - room.camera.position[0];
  const facingZ = room.camera.target[2] - room.camera.position[2];
  if (Math.abs(facingZ) >= Math.abs(facingX)) return facingZ < 0 ? "back" : "front";
  return facingX < 0 ? "left" : "right";
}

/**
 * Place one framed Moroccan-inspired wall accent on an uninterrupted wall run.
 * Selection is camera-aware so the art belongs to the wall most naturally seen
 * from the room's first-person destination. Rear-window walls are never decorated.
 */
export function getRoomWallDecor(room: Room): RoomWallDecor[] {
  if (room.level === "outdoor" || room.level === "roof") return [];

  const preferred = preferredWall(room);
  const orderedSides = [preferred, ...SIDES.filter((side) => side !== preferred)];
  const rearWindowWall = room.scenePosition[2] - room.footprint[1] / 2 <= -3.8;
  const candidates = orderedSides.flatMap((side, priority) => {
    if (rearWindowWall && side === "back") return [];
    return getRoomWallRuns(room, side)
      .map((run) => ({ side, run, priority, length: run.end - run.start }))
      .filter((candidate) => candidate.length >= 0.58);
  }).sort((a, b) => a.priority - b.priority || b.length - a.length);

  const chosen = candidates[0];
  if (!chosen) return [];

  const width = Math.min(room.level === "upper" ? 0.72 : 0.88, chosen.length - 0.18);
  if (width < 0.4) return [];
  const height = width >= 0.68 ? 0.7 : 0.58;
  const along = (chosen.run.start + chosen.run.end) / 2;
  const [roomWidth, roomDepth] = room.footprint;
  const halfWidth = roomWidth / 2;
  const halfDepth = roomDepth / 2;
  const inset = 0.085;
  let position: Vector3Tuple;
  let rotationY: number;

  switch (chosen.side) {
    case "front":
      position = [along, HOUSE_LAYOUT.floorThickness + 1.36, halfDepth - inset];
      rotationY = Math.PI;
      break;
    case "back":
      position = [along, HOUSE_LAYOUT.floorThickness + 1.36, -halfDepth + inset];
      rotationY = 0;
      break;
    case "right":
      position = [halfWidth - inset, HOUSE_LAYOUT.floorThickness + 1.36, along];
      rotationY = -Math.PI / 2;
      break;
    case "left":
      position = [-halfWidth + inset, HOUSE_LAYOUT.floorThickness + 1.36, along];
      rotationY = Math.PI / 2;
      break;
  }

  return [{
    key: room.slug + "-wall-art",
    side: chosen.side,
    position,
    rotationY,
    width,
    height,
    frameColor: room.kind === "spiritual" ? "#76664e" : room.kind === "private" ? "#7e553f" : "#85553d",
    fieldColor: room.kind === "spiritual" ? "#e7e1ca" : "#ead9bd",
    accentColor: ACCENT_BY_ROOM[room.slug] ?? "#ae8053",
  }];
}

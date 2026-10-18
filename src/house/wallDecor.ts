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

// Reserve walls whose visible surface is occupied or visually dominated by other architecture.
const RESERVED_WALLS_BY_ROOM: Readonly<Record<string, readonly WallSide[]>> = {
  kitchen: ["back"], // fridge and tall appliance cluster
  library: ["left"], // full-height shelving
  "living-room": ["back"], // the shared library doorway makes this wall read as a corridor, cropping art at the frame edge
  "prayer-room": ["front"], // keep the entry opening clear and avoid placing art beside the destination camera
};

function wallPosition(room: Room, side: WallSide, along: number, y: number): Vector3Tuple {
  const [roomWidth, roomDepth] = room.footprint;
  const inset = 0.085;
  switch (side) {
    case "front": return [along, y, roomDepth / 2 - inset];
    case "back": return [along, y, -roomDepth / 2 + inset];
    case "right": return [roomWidth / 2 - inset, y, along];
    case "left": return [-roomWidth / 2 + inset, y, along];
  }
}

function wallRotation(side: WallSide): number {
  switch (side) {
    case "front": return Math.PI;
    case "back": return 0;
    case "right": return -Math.PI / 2;
    case "left": return Math.PI / 2;
  }
}

function facingAlignment(room: Room, localPosition: Vector3Tuple): number {
  const [roomX, , roomZ] = room.scenePosition;
  const [cameraX, , cameraZ] = room.camera.position;
  const [targetX, , targetZ] = room.camera.target;
  const forwardX = targetX - cameraX;
  const forwardZ = targetZ - cameraZ;
  const toArtX = roomX + localPosition[0] - cameraX;
  const toArtZ = roomZ + localPosition[2] - cameraZ;
  const forwardLength = Math.hypot(forwardX, forwardZ);
  const artLength = Math.hypot(toArtX, toArtZ);
  if (forwardLength < 0.001 || artLength < 0.001) return -1;
  return (forwardX * toArtX + forwardZ * toArtZ) / (forwardLength * artLength);
}

/**
 * Add one framed Moroccan-inspired accent in the room's actual view cone.
 * Placement uses an uninterrupted wall run, avoids rear windows and tall built-ins,
 * and scores each candidate against the room's first-person camera direction to keep
 * art from being pushed into the edge of the frame just because a wall is longer.
 */
export function getRoomWallDecor(room: Room): RoomWallDecor[] {
  if (room.level === "outdoor" || room.level === "roof") return [];

  const rearWindowWall = room.scenePosition[2] - room.footprint[1] / 2 <= -3.8;
  const reservedWalls = RESERVED_WALLS_BY_ROOM[room.slug] ?? [];
  const y = HOUSE_LAYOUT.floorThickness + 1.36;
  const candidates = SIDES.flatMap((side) => {
    if ((rearWindowWall && side === "back") || reservedWalls.includes(side)) return [];
    return getRoomWallRuns(room, side)
      .map((run) => {
        const length = run.end - run.start;
        const along = (run.start + run.end) / 2;
        const position = wallPosition(room, side, along, y);
        return { side, run, length, along, position, score: facingAlignment(room, position) };
      })
      .filter((candidate) => candidate.length >= 0.58 && candidate.score > 0.05);
  }).sort((a, b) => b.score - a.score || b.length - a.length);

  const chosen = candidates[0];
  if (!chosen) return [];

  const preferredWidth = room.slug === "living-room" ? 0.62 : room.level === "upper" ? 0.72 : 0.88;
  const width = Math.min(preferredWidth, chosen.length - 0.18);
  if (width < 0.4) return [];
  const height = width >= 0.68 ? 0.7 : 0.58;
  return [{
    key: room.slug + "-wall-art",
    side: chosen.side,
    position: chosen.position,
    rotationY: wallRotation(chosen.side),
    width,
    height,
    frameColor: room.kind === "spiritual" ? "#76664e" : room.kind === "private" ? "#7e553f" : "#85553d",
    fieldColor: room.kind === "spiritual" ? "#e7e1ca" : "#ead9bd",
    accentColor: ({
      entrance: "#b45d43",
      "living-room": "#657d70",
      "family-table": "#bd684b",
      kitchen: "#bd985d",
      library: "#456d61",
      "pets-corner": "#829579",
      "prayer-room": "#718778",
      "zakariae-room": "#477b79",
      "zineb-room": "#ad7c9e",
      "meryem-room": "#c18170",
      "fatiha-room": "#788a63",
    } as Readonly<Record<string, string>>)[room.slug] ?? "#ae8053",
  }];
}

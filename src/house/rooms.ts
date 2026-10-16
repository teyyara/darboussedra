export type RoomKind = "entry" | "interior" | "outdoor" | "private" | "spiritual";
export type RoomLevel = "ground" | "upper" | "outdoor" | "roof";
export type WallSide = "front" | "back" | "left" | "right";
export type Vector3Tuple = readonly [number, number, number];

export interface Room {
  readonly id: string; readonly slug: string; readonly name: string; readonly kind: RoomKind; readonly level: RoomLevel;
  /** World-space center of the room's floor tile. */
  readonly scenePosition: Vector3Tuple;
  readonly camera: { readonly position: Vector3Tuple; readonly target: Vector3Tuple };
  /** Width along X and depth along Z; present for all 13 destinations. */
  readonly footprint: readonly [number, number];
  /** Physical same-level connections; every edge must have a matching boundary and doorway. */
  readonly connectedTo: readonly string[];
}
export interface SharedDoorway { readonly side: WallSide; readonly neighborSide: WallSide; readonly offset: number; readonly width: number; readonly worldX: number; readonly worldZ: number; }
export interface RoomPortalOpening { readonly side: WallSide; readonly offset: number; readonly width: number; readonly targetSlug?: string; readonly zone?: string; readonly worldX: number; readonly worldZ: number; }

const EPSILON = 0.025;
const MIN_DOOR_WIDTH = 0.8;
const DEFAULT_DOOR_WIDTH = 0.92;
const FLOOR_THICKNESS = 0.14;

export const HOUSE_LAYOUT = {
  exterior: { width: 11.2, depth: 9.5, wallThickness: 0.22, wallHeight: 5.55 },
  entrance: { doorWidth: 1.5, doorHeight: 2.3 },
  groundY: 0, upperY: 3, roofY: 5.55,
  floorThickness: FLOOR_THICKNESS, roomWallHeight: 2.41,
  upperLanding: { centerX: 0, centerZ: 1.25, width: 10.2, depth: 1.6, levelY: 3 },
  upperBridge: { centerX: 0, centerZ: -1.935, width: 2.4, depth: 4.77, levelY: 3 },
  stairs: {
    width: 1, shaftWidth: 2.4, openingWidth: 1.45, groundDoorwayWidth: 1.2,
    // The stair begins just beyond the family-table portal and climbs toward the rear landing.
    groundFlight: { from: [0, 0.14, -0.5] as Vector3Tuple, to: [0, 3.14, -4.32] as Vector3Tuple, steps: 16 },
    roofFlight: { from: [0, 3.14, 2.05] as Vector3Tuple, to: [0, 5.55, -1.8] as Vector3Tuple, steps: 14 },
    roofOpening: { centerX: 0, centerZ: -1.8, width: 1.65, depth: 1.85 },
  },
} as const;

const roomDefinitions = [
  { id: "entrance", slug: "entrance", name: "Front Door & Entrance", kind: "entry", level: "ground",
    scenePosition: [0, HOUSE_LAYOUT.groundY, 3.695], camera: { position: [0, 1.65, 4.2], target: [0, 1.35, 2.85] },
    footprint: [2.1, 1.89], connectedTo: ["family-table", "garden"] },
  { id: "living-room", slug: "living-room", name: "Living Room", kind: "interior", level: "ground",
    scenePosition: [-3.6, HOUSE_LAYOUT.groundY, 1.175], camera: { position: [-2.65, 1.65, 2.05], target: [-4.05, 1.25, 0.35] },
    footprint: [3.6, 3.15], connectedTo: ["family-table", "library"] },
  { id: "family-table", slug: "family-table", name: "Family Table", kind: "interior", level: "ground",
    scenePosition: [0, HOUSE_LAYOUT.groundY, 1.175], camera: { position: [1.15, 1.65, 2.3], target: [-1.15, 1.1, -0.15] },
    footprint: [3.6, 3.15], connectedTo: ["entrance", "living-room", "kitchen"] },
  { id: "kitchen", slug: "kitchen", name: "Kitchen", kind: "interior", level: "ground",
    scenePosition: [3.6, HOUSE_LAYOUT.groundY, 1.175], camera: { position: [4.95, 1.65, 2.2], target: [3.2, 1.25, 0.35] },
    footprint: [3.6, 3.15], connectedTo: ["family-table", "prayer-room"] },
  { id: "library", slug: "library", name: "Library", kind: "interior", level: "ground",
    scenePosition: [-4.1, HOUSE_LAYOUT.groundY, -2.49], camera: { position: [-2.95, 1.65, -0.55], target: [-4.85, 1.25, -2.4] },
    footprint: [2.6, 4.18], connectedTo: ["living-room", "pets-corner"] },
  { id: "pets-corner", slug: "pets-corner", name: "Pets' Corner", kind: "interior", level: "ground",
    scenePosition: [-2.0, HOUSE_LAYOUT.groundY, -2.49], camera: { position: [-2.6, 1.65, -0.65], target: [-1.9, 1.05, -3.1] },
    footprint: [1.6, 4.18], connectedTo: ["library"] },
  { id: "prayer-room", slug: "prayer-room", name: "Prayer Room / Musalla", kind: "spiritual", level: "ground",
    scenePosition: [3.3, HOUSE_LAYOUT.groundY, -2.49], camera: { position: [4.45, 1.65, -1.8], target: [3.75, 1.0, -3.14] },
    footprint: [4.2, 4.18], connectedTo: ["kitchen"] },
  { id: "zakariae-room", slug: "zakariae-room", name: "Zakariae's Private Room", kind: "private", level: "upper",
    scenePosition: [-4.25, HOUSE_LAYOUT.upperY, -1.75], camera: { position: [-4.75, HOUSE_LAYOUT.upperY + 1.65, 0.1], target: [-3.8, HOUSE_LAYOUT.upperY + 1.35, -1.9] },
    footprint: [2.3, 4.4], connectedTo: [] },
  { id: "zineb-room", slug: "zineb-room", name: "Zineb's Private Room", kind: "private", level: "upper",
    scenePosition: [-2.15, HOUSE_LAYOUT.upperY, -1.75], camera: { position: [-2.55, HOUSE_LAYOUT.upperY + 1.65, 0.1], target: [-1.75, HOUSE_LAYOUT.upperY + 1.35, -1.9] },
    footprint: [1.9, 4.4], connectedTo: [] },
  { id: "meryem-room", slug: "meryem-room", name: "Meryem's Private Room", kind: "private", level: "upper",
    scenePosition: [2.15, HOUSE_LAYOUT.upperY, -1.75], camera: { position: [1.75, HOUSE_LAYOUT.upperY + 1.65, 0.1], target: [2.55, HOUSE_LAYOUT.upperY + 1.35, -1.9] },
    footprint: [1.9, 4.4], connectedTo: [] },
  { id: "fatiha-room", slug: "fatiha-room", name: "Fatiha's Private Room", kind: "private", level: "upper",
    scenePosition: [4.25, HOUSE_LAYOUT.upperY, -1.75], camera: { position: [3.75, HOUSE_LAYOUT.upperY + 1.65, 0.1], target: [4.7, HOUSE_LAYOUT.upperY + 1.35, -1.9] },
    footprint: [2.3, 4.4], connectedTo: [] },
  { id: "garden", slug: "garden", name: "Garden", kind: "outdoor", level: "outdoor",
    scenePosition: [0, HOUSE_LAYOUT.groundY, 7.15], camera: { position: [2.6, 1.65, 8.5], target: [0, 1.75, 7.5] },
    footprint: [7.4, 5.0], connectedTo: ["entrance"] },
  { id: "rooftop", slug: "rooftop", name: "Rooftop Terrace", kind: "outdoor", level: "roof",
    scenePosition: [0, HOUSE_LAYOUT.roofY, 0], camera: { position: [3.45, HOUSE_LAYOUT.roofY + 1.65, 0.5], target: [0.55, HOUSE_LAYOUT.roofY, -1.7] },
    footprint: [10.6, 8.6], connectedTo: [] },
] as const satisfies readonly Room[];

export const rooms: readonly Room[] = roomDefinitions;
export type RoomSlug = (typeof roomDefinitions)[number]["slug"];
export type HouseLocation = "exterior" | "map" | RoomSlug;
export const REQUIRED_ROOM_SLUGS = [
  "entrance", "living-room", "kitchen", "family-table", "library", "garden", "rooftop",
  "pets-corner", "prayer-room", "zakariae-room", "zineb-room", "meryem-room", "fatiha-room",
] as const;

export const ROOM_ACCESS_PORTALS: readonly { readonly room: string; readonly targetSlug?: string; readonly zone: string; readonly side: WallSide; readonly offset: number; readonly width: number }[] = [
  { room: "family-table", zone: "stair-hall", side: "back", offset: 0, width: HOUSE_LAYOUT.stairs.groundDoorwayWidth },
  { room: "zakariae-room", targetSlug: "zakariae-room", zone: "upper-landing", side: "front", offset: 0, width: DEFAULT_DOOR_WIDTH },
  { room: "zineb-room", targetSlug: "zineb-room", zone: "upper-landing", side: "front", offset: 0, width: DEFAULT_DOOR_WIDTH },
  { room: "meryem-room", targetSlug: "meryem-room", zone: "upper-landing", side: "front", offset: 0, width: DEFAULT_DOOR_WIDTH },
  { room: "fatiha-room", targetSlug: "fatiha-room", zone: "upper-landing", side: "front", offset: 0, width: DEFAULT_DOOR_WIDTH },
];

export const EXTERIOR_CAMERA = { position: [6.1, 5.1, 12.8] as Vector3Tuple, target: [0, 1.75, 3.8] as Vector3Tuple };
// The map is an HTML floor plan; never switch the 3D scene into an overhead view for it.
export const MAP_CAMERA = EXTERIOR_CAMERA;

export function getRoomBySlug(slug: string): Room | undefined {
  return rooms.find((room) => room.slug === slug);
}

/** The front door is a navigation boundary, not a dead-end interaction. */
export function getFrontDoorAction(location: HouseLocation): "enter" | "exit" | undefined {
  if (location === "exterior") return "enter";
  if (location === "entrance") return "exit";
  return undefined;
}
export function roomBounds(room: Room) {
  const [x, , z] = room.scenePosition;
  const [width, depth] = room.footprint;
  return { minX: x - width / 2, maxX: x + width / 2, minZ: z - depth / 2, maxZ: z + depth / 2 };
}

export interface RoomWallInterval { readonly start: number; readonly end: number; }

/**
 * Partition room boundary wall runs so shared partitions are rendered once.
 * Coordinates are local to the room along the selected side. The exterior entrance
 * facade is supplied by the exterior shell, whose actual door is already cut out.
 */
/** Select one owner for portal frames/click targets shared by two adjacent rooms. */
export function roomOwnsPortalFrame(room: Room, opening: RoomPortalOpening): boolean {
  if (!opening.targetSlug || opening.targetSlug === room.slug) return true;
  if (room.slug === "entrance" && opening.side === "front") return true;
  const ownerIndex = rooms.findIndex((item) => item.slug === room.slug);
  const targetIndex = rooms.findIndex((item) => item.slug === opening.targetSlug);
  return targetIndex >= 0 && ownerIndex < targetIndex;
}

export function getRoomWallIntervals(room: Room, side: WallSide): RoomWallInterval[] {
  if (room.slug === "entrance" && side === "front") return [];
  const [width, depth] = room.footprint;
  const length = side === "front" || side === "back" ? width : depth;
  const bounds = roomBounds(room);
  const roomIndex = rooms.findIndex((item) => item.slug === room.slug);
  const neighbors: { start: number; end: number; index: number }[] = [];

  for (const neighbor of rooms) {
    if (neighbor.slug === room.slug || Math.abs(neighbor.scenePosition[1] - room.scenePosition[1]) > EPSILON) continue;
    const other = roomBounds(neighbor);
    let touches = false;
    let overlapStart = 0;
    let overlapEnd = 0;
    if (side === "front" && Math.abs(bounds.maxZ - other.minZ) <= EPSILON) {
      touches = true; overlapStart = Math.max(bounds.minX, other.minX); overlapEnd = Math.min(bounds.maxX, other.maxX);
      overlapStart -= room.scenePosition[0]; overlapEnd -= room.scenePosition[0];
    } else if (side === "back" && Math.abs(bounds.minZ - other.maxZ) <= EPSILON) {
      touches = true; overlapStart = Math.max(bounds.minX, other.minX); overlapEnd = Math.min(bounds.maxX, other.maxX);
      overlapStart -= room.scenePosition[0]; overlapEnd -= room.scenePosition[0];
    } else if (side === "right" && Math.abs(bounds.maxX - other.minX) <= EPSILON) {
      touches = true; overlapStart = Math.max(bounds.minZ, other.minZ); overlapEnd = Math.min(bounds.maxZ, other.maxZ);
      overlapStart -= room.scenePosition[2]; overlapEnd -= room.scenePosition[2];
    } else if (side === "left" && Math.abs(bounds.minX - other.maxX) <= EPSILON) {
      touches = true; overlapStart = Math.max(bounds.minZ, other.minZ); overlapEnd = Math.min(bounds.maxZ, other.maxZ);
      overlapStart -= room.scenePosition[2]; overlapEnd -= room.scenePosition[2];
    }
    if (touches && overlapEnd - overlapStart > EPSILON) neighbors.push({
      start: Math.max(-length / 2, overlapStart), end: Math.min(length / 2, overlapEnd),
      index: rooms.findIndex((item) => item.slug === neighbor.slug),
    });
  }

  const breaks = [...new Set([
    -length / 2, length / 2,
    ...neighbors.flatMap((item) => [item.start, item.end]),
  ])].sort((a, b) => a - b);
  const owned: RoomWallInterval[] = [];
  for (let i = 0; i < breaks.length - 1; i += 1) {
    const start = breaks[i], end = breaks[i + 1];
    if (end - start <= EPSILON) continue;
    const middle = (start + end) / 2;
    const touching = neighbors.filter((item) => middle > item.start - EPSILON && middle < item.end + EPSILON);
    if (touching.length === 0 || touching.every((item) => roomIndex < item.index)) {
      const previous = owned[owned.length - 1];
      if (previous && Math.abs(previous.end - start) <= EPSILON) {
        owned[owned.length - 1] = { start: previous.start, end };
      } else owned.push({ start, end });
    }
  }
  return owned;
}

/** Return geometry for a declared door only if the two rooms share a sufficiently wide physical boundary. */
export function getSharedBoundary(room: Room, neighbor: Room): SharedDoorway | undefined {
  if (Math.abs(room.scenePosition[1] - neighbor.scenePosition[1]) > EPSILON * 4) return undefined;
  const a = roomBounds(room), b = roomBounds(neighbor);
  const overlapX = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
  const overlapZ = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
  const entranceBoundary = (room.slug === "entrance" && neighbor.slug === "garden") ||
    (room.slug === "garden" && neighbor.slug === "entrance");
  const stairBoundary = (room.slug === "family-table" && neighbor.slug === "pets-corner") ||
    (room.slug === "pets-corner" && neighbor.slug === "family-table");
  const requestedWidth = entranceBoundary ? HOUSE_LAYOUT.entrance.doorWidth :
    stairBoundary ? HOUSE_LAYOUT.stairs.groundDoorwayWidth : DEFAULT_DOOR_WIDTH;
  const build = (side: WallSide, neighborSide: WallSide, offset: number, overlap: number, worldX: number, worldZ: number) => {
    const width = Math.min(requestedWidth, overlap - 0.18);
    if (width < MIN_DOOR_WIDTH) return undefined;
    return { side, neighborSide, offset, width, worldX, worldZ };
  };
  if (Math.abs(a.maxZ - b.minZ) <= EPSILON && overlapX >= MIN_DOOR_WIDTH) {
    const worldX = (Math.max(a.minX, b.minX) + Math.min(a.maxX, b.maxX)) / 2;
    return build("front", "back", worldX - room.scenePosition[0], overlapX, worldX, a.maxZ);
  }
  if (Math.abs(a.minZ - b.maxZ) <= EPSILON && overlapX >= MIN_DOOR_WIDTH) {
    const worldX = (Math.max(a.minX, b.minX) + Math.min(a.maxX, b.maxX)) / 2;
    return build("back", "front", worldX - room.scenePosition[0], overlapX, worldX, a.minZ);
  }
  if (Math.abs(a.maxX - b.minX) <= EPSILON && overlapZ >= MIN_DOOR_WIDTH) {
    const worldZ = (Math.max(a.minZ, b.minZ) + Math.min(a.maxZ, b.maxZ)) / 2;
    return build("right", "left", worldZ - room.scenePosition[2], overlapZ, a.maxX, worldZ);
  }
  if (Math.abs(a.minX - b.maxX) <= EPSILON && overlapZ >= MIN_DOOR_WIDTH) {
    const worldZ = (Math.max(a.minZ, b.minZ) + Math.min(a.maxZ, b.maxZ)) / 2;
    return build("left", "right", worldZ - room.scenePosition[2], overlapZ, a.minX, worldZ);
  }
  return undefined;
}

/** Wall gaps and their clickable targets come from the same room registry/connection graph. */
export function getRoomPortalOpenings(room: Room): RoomPortalOpening[] {
  const openings: RoomPortalOpening[] = [];
  for (const slug of room.connectedTo) {
    const neighbor = getRoomBySlug(slug);
    if (!neighbor) continue;
    const boundary = getSharedBoundary(room, neighbor);
    if (boundary) openings.push({ ...boundary, targetSlug: neighbor.slug });
  }
  for (const portal of ROOM_ACCESS_PORTALS) {
    if (portal.room !== room.slug) continue;
    const [x, , z] = room.scenePosition;
    const [width, depth] = room.footprint;
    const worldX = portal.side === "left" ? x - width / 2 : portal.side === "right" ? x + width / 2 : x + portal.offset;
    const worldZ = portal.side === "back" ? z - depth / 2 : portal.side === "front" ? z + depth / 2 : z + portal.offset;
    openings.push({ ...portal, worldX, worldZ });
  }
  return openings;
}

/**
 * Return owned, non-doorway wall runs in local side coordinates. Walls, trim,
 * and other details can consume these same runs so no decorative piece bridges a portal.
 */
export function getRoomWallRuns(
  room: Room,
  side: WallSide,
  openings: readonly RoomPortalOpening[] = getRoomPortalOpenings(room),
): RoomWallInterval[] {
  const ownedIntervals = getRoomWallIntervals(room, side);
  const sorted = openings.filter((opening) => opening.side === side).slice().sort((a, b) => a.offset - b.offset);
  const runs: RoomWallInterval[] = [];
  for (const interval of ownedIntervals) {
    let cursor = interval.start;
    for (const opening of sorted) {
      const start = Math.max(interval.start, opening.offset - opening.width / 2);
      const end = Math.min(interval.end, opening.offset + opening.width / 2);
      if (end <= cursor + EPSILON) continue;
      if (start > cursor + EPSILON) runs.push({ start: cursor, end: start });
      cursor = Math.max(cursor, end);
    }
    if (cursor < interval.end - EPSILON) runs.push({ start: cursor, end: interval.end });
  }
  return runs.filter((run) => run.end - run.start > EPSILON);
}

/** Source-level invariants that tests can run whenever the floor plan changes. */
export function roomRegistryIssues(): string[] {
  const issues: string[] = [];
  const ids = rooms.map((room) => room.id), slugs = rooms.map((room) => room.slug);
  if (new Set(ids).size !== ids.length) issues.push("Room IDs must be unique.");
  if (new Set(slugs).size !== slugs.length) issues.push("Room slugs must be unique.");
  if (rooms.length !== REQUIRED_ROOM_SLUGS.length) issues.push("The permanent room registry must contain exactly 13 destinations.");
  for (const slug of REQUIRED_ROOM_SLUGS) {
    if (slugs.filter((candidate) => candidate === slug).length !== 1) issues.push("Required room must exist exactly once: " + slug);
  }
  const innerHalfWidth = HOUSE_LAYOUT.exterior.width / 2 - HOUSE_LAYOUT.exterior.wallThickness / 2;
  const innerHalfDepth = HOUSE_LAYOUT.exterior.depth / 2 - HOUSE_LAYOUT.exterior.wallThickness / 2;
  for (const room of rooms) {
    const values = [...room.scenePosition, ...room.camera.position, ...room.camera.target, ...room.footprint];
    if (values.some((value) => !Number.isFinite(value))) issues.push("Non-finite geometry or camera pose: " + room.slug);
    if (room.footprint.some((value) => value <= 0)) issues.push("Footprint must be positive: " + room.slug);
    for (const neighborSlug of room.connectedTo) {
      const neighbor = getRoomBySlug(neighborSlug);
      if (!neighbor) { issues.push("Unknown connection " + neighborSlug + " from " + room.slug); continue; }
      if (!neighbor.connectedTo.includes(room.slug)) issues.push("Connection must be reciprocal: " + room.slug + " ↔ " + neighborSlug);
      if (!getSharedBoundary(room, neighbor)) issues.push("Declared connection has no usable shared doorway: " + room.slug + " ↔ " + neighborSlug);
    }
    if (room.level === "ground" || room.level === "upper") {
      const bounds = roomBounds(room);
      if (bounds.minX < -innerHalfWidth || bounds.maxX > innerHalfWidth || bounds.minZ < -innerHalfDepth || bounds.maxZ > innerHalfDepth) {
        issues.push("Room extends beyond the usable house shell: " + room.slug);
      }
    }
  }
  for (let i = 0; i < rooms.length; i += 1) {
    for (let j = i + 1; j < rooms.length; j += 1) {
      const first = rooms[i], second = rooms[j];
      if (Math.abs(first.scenePosition[1] - second.scenePosition[1]) > EPSILON) continue;
      const a = roomBounds(first), b = roomBounds(second);
      const overlapX = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
      const overlapZ = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
      if (overlapX > EPSILON && overlapZ > EPSILON) issues.push("Room footprints overlap: " + first.slug + " / " + second.slug);
    }
  }
  for (const room of rooms.filter((candidate) => candidate.level === "upper")) {
    if (!ROOM_ACCESS_PORTALS.some((portal) => portal.room === room.slug && portal.zone === "upper-landing")) {
      issues.push("Upper-floor room lacks a doorway to the landing: " + room.slug);
    }
    const bounds = roomBounds(room), halfShaft = HOUSE_LAYOUT.stairs.shaftWidth / 2;
    if (bounds.maxX > -halfShaft && bounds.minX < halfShaft) issues.push("Upper room overlaps the stairwell opening: " + room.slug);
  }
  const stairPortal = ROOM_ACCESS_PORTALS.find((portal) => portal.room === "family-table" && portal.zone === "stair-hall");
  if (!stairPortal || stairPortal.width < HOUSE_LAYOUT.stairs.width + 0.14) issues.push("Ground stair clearance exceeds the doorway into the stair hall.");
  const groundFlight = HOUSE_LAYOUT.stairs.groundFlight;
  const stairHalfWidth = HOUSE_LAYOUT.stairs.shaftWidth / 2;
  const stairMinZ = Math.min(groundFlight.from[2], groundFlight.to[2]);
  const stairMaxZ = Math.max(groundFlight.from[2], groundFlight.to[2]);
  for (const room of rooms.filter((candidate) => candidate.level === "ground")) {
    const bounds = roomBounds(room);
    const overlapsStairWell = bounds.maxX > -stairHalfWidth + EPSILON && bounds.minX < stairHalfWidth - EPSILON &&
      bounds.maxZ > stairMinZ + EPSILON && bounds.minZ < stairMaxZ - EPSILON;
    if (overlapsStairWell) issues.push("Ground room footprint blocks the stairwell: " + room.slug);
  }
  const ground = HOUSE_LAYOUT.stairs.groundFlight, roof = HOUSE_LAYOUT.stairs.roofFlight;
  const groundStepRunZ = (ground.to[2] - ground.from[2]) / ground.steps;
  const lastStepIndex = ground.steps - 1;
  const lastGroundTreadMinZ = ground.from[2] + groundStepRunZ * (lastStepIndex + 0.5) -
    (Math.abs(groundStepRunZ) + 0.035) / 2;
  const rearInteriorFaceZ = -HOUSE_LAYOUT.exterior.depth / 2 + HOUSE_LAYOUT.exterior.wallThickness / 2;
  if (lastGroundTreadMinZ < rearInteriorFaceZ + 0.05) issues.push("Last ground stair tread intersects or approaches the rear shell wall.");
  const upperSurface = HOUSE_LAYOUT.upperY + HOUSE_LAYOUT.floorThickness;
  if (Math.abs(ground.from[1] - HOUSE_LAYOUT.floorThickness) > EPSILON) issues.push("Ground stair does not begin at the ground floor surface.");
  if (Math.abs(ground.to[1] - upperSurface) > EPSILON) issues.push("Ground stair does not meet the upper-floor landing.");
  if (Math.abs(roof.from[1] - upperSurface) > EPSILON) issues.push("Roof stair does not begin at the upper landing surface.");
  if (Math.abs(roof.to[1] - HOUSE_LAYOUT.roofY) > EPSILON) issues.push("Roof stair does not meet the rooftop surface.");
  if (ground.steps < 2 || roof.steps < 2 || HOUSE_LAYOUT.stairs.width + 0.2 > HOUSE_LAYOUT.stairs.shaftWidth) issues.push("Stair flights do not fit the configured circulation shaft.");
  const opening = HOUSE_LAYOUT.stairs.roofOpening;
  if (opening.width < HOUSE_LAYOUT.stairs.width + 0.2 || Math.abs(roof.to[0] - opening.centerX) > opening.width / 2 ||
      Math.abs(roof.to[2] - opening.centerZ) > opening.depth / 2) issues.push("Rooftop stair exit does not fit inside the roof opening.");
  if (Math.abs(ground.to[2] - (HOUSE_LAYOUT.upperBridge.centerZ - HOUSE_LAYOUT.upperBridge.depth / 2)) > EPSILON ||
      Math.abs(roof.from[2] - (HOUSE_LAYOUT.upperLanding.centerZ + HOUSE_LAYOUT.upperLanding.depth / 2)) > EPSILON) {
    issues.push("Stair flights are disconnected from their landings.");
  }
  return issues;
}

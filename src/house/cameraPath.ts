import {
  EXTERIOR_CAMERA, HOUSE_LAYOUT, getRoomBySlug, getRoomPortalOpenings, rooms,
  type HouseLocation, type Room, type RoomPortalOpening, type Vector3Tuple,
} from "./rooms";

export interface CameraPose {
  readonly position: Vector3Tuple;
  readonly target: Vector3Tuple;
}

type NavigationNode = string;
interface RouteEdge { readonly to: NavigationNode; readonly waypoints: readonly CameraPose[]; }

const STAIR_BOTTOM = "__stair-bottom__";
const UPPER_LANDING = "__upper-landing__";
const HEAD_HEIGHT = 1.65;
const STAIR_HEAD_HEIGHT = 1.51;
const DOORWAY_CLEARANCE = 0.42;
const SIDE_DIRECTION: Record<RoomPortalOpening["side"], readonly [number, number]> = {
  front: [0, 1], back: [0, -1], left: [-1, 0], right: [1, 0],
};

function eyeHeight(room: Room): number {
  return room.scenePosition[1] + HEAD_HEIGHT;
}

function poseFacing(position: Vector3Tuple, direction: readonly [number, number]): CameraPose {
  return {
    position,
    target: [position[0] + direction[0] * 1.2, position[1] - 0.04, position[2] + direction[1] * 1.2],
  };
}

function reverseRoute(path: readonly CameraPose[]): CameraPose[] {
  return [...path].reverse().map((pose) => ({
    position: pose.position,
    target: [2 * pose.position[0] - pose.target[0], pose.position[1] - 0.04, 2 * pose.position[2] - pose.target[2]],
  }));
}

function addEdge(graph: Map<NavigationNode, RouteEdge[]>, from: NavigationNode, to: NavigationNode, waypoints: readonly CameraPose[]) {
  const edges = graph.get(from) ?? [];
  if (!edges.some((edge) => edge.to === to)) edges.push({ to, waypoints });
  graph.set(from, edges);
  if (!graph.has(to)) graph.set(to, []);
}

function roomDoorwayPath(room: Room, neighbor: Room, opening: RoomPortalOpening): CameraPose[] {
  const [dx, dz] = SIDE_DIRECTION[opening.side];
  const inside: Vector3Tuple = [
    opening.worldX - dx * DOORWAY_CLEARANCE, eyeHeight(room), opening.worldZ - dz * DOORWAY_CLEARANCE,
  ];
  const beyond: Vector3Tuple = [
    opening.worldX + dx * DOORWAY_CLEARANCE, eyeHeight(neighbor), opening.worldZ + dz * DOORWAY_CLEARANCE,
  ];
  return [poseFacing(inside, [dx, dz]), poseFacing(beyond, [dx, dz])];
}

function sampledStairWaypoints(flight: {
  readonly from: Vector3Tuple; readonly to: Vector3Tuple; readonly steps: number;
}): CameraPose[] {
  const risePerStep = (flight.to[1] - flight.from[1]) / flight.steps;
  const runPerStep = (flight.to[2] - flight.from[2]) / flight.steps;
  // Walk the staircase tread by tread instead of cutting diagonally through it.
  const indices = Array.from({ length: flight.steps }, (_, index) => index);
  const direction: readonly [number, number] = runPerStep < 0 ? [0, -1] : [0, 1];
  return indices.map((index) => {
    const treadTop = flight.from[1] + risePerStep * (index + 1);
    const z = flight.from[2] + runPerStep * (index + 0.5);
    return poseFacing([flight.from[0], treadTop + STAIR_HEAD_HEIGHT, z], direction);
  });
}

function groundStairWalkway(): CameraPose[] {
  const flight = HOUSE_LAYOUT.stairs.groundFlight;
  const upperEye = HOUSE_LAYOUT.upperY + HEAD_HEIGHT;
  const top: Vector3Tuple = [flight.to[0], flight.to[1] + STAIR_HEAD_HEIGHT, flight.to[2]];
  const sideLaneX = HOUSE_LAYOUT.upperBridge.centerX + HOUSE_LAYOUT.stairs.openingWidth / 2 + 0.12;
  return [
    ...sampledStairWaypoints(flight),
    poseFacing(top, [0, -1]),
    // Follow an in-place U-turn as a short walking arc: move onto the head landing,
    // round the stair opening, then face forward along the guarded side lane.
    poseFacing([0.2, upperEye, flight.to[2] + 0.06], [0.6, -0.8]),
    poseFacing([0.43, upperEye, flight.to[2] + 0.18], [1, 0]),
    poseFacing([sideLaneX, upperEye, flight.to[2] + 0.46], [0.65, 0.76]),
    poseFacing([sideLaneX, upperEye, flight.to[2] + 0.62], [0, 1]),
    ...[-2.8, -1.8, -0.8, 0.2].map((z) => poseFacing([sideLaneX, upperEye, z], [0, 1])),
    // Rejoin the full-width upper landing beyond the end of the open stair shaft.
    poseFacing([sideLaneX * 0.7, upperEye, 0.72], [0.2, 1]),
    poseFacing([0, upperEye, 1.05], [0, 1]),
  ];
}

function roofStairWalkway(): CameraPose[] {
  const flight = HOUSE_LAYOUT.stairs.roofFlight;
  const upperEye = HOUSE_LAYOUT.upperY + HEAD_HEIGHT;
  const roofEye = HOUSE_LAYOUT.roofY + HEAD_HEIGHT;
  const openingBackEdge = HOUSE_LAYOUT.stairs.roofOpening.centerZ - HOUSE_LAYOUT.stairs.roofOpening.depth / 2;
  return [
    poseFacing([0, upperEye, HOUSE_LAYOUT.upperLanding.centerZ + 0.38], [0, 1]),
    poseFacing([flight.from[0], upperEye, flight.from[2]], [0, 1]),
    // Turn around on the upper landing without stepping beyond its front edge.
    poseFacing([0.25, upperEye, flight.from[2] - 0.05], [0.6, 0.8]),
    poseFacing([0.42, upperEye, flight.from[2] - 0.09], [1, 0]),
    poseFacing([0.28, upperEye, flight.from[2] - 0.11], [0.6, -0.8]),
    poseFacing([0.1, upperEye, flight.from[2] - 0.10], [0, -1]),
    ...sampledStairWaypoints(flight),
    poseFacing([flight.to[0], roofEye, flight.to[2]], [0, -1]),
    // The flight finishes at the rear lip of the hatch. Keep walking rearward
    // until both feet are on solid terrace deck before turning across the roof.
    poseFacing([0, roofEye, openingBackEdge - 0.18], [0, -1]),
    poseFacing([0.55, roofEye, openingBackEdge - 0.30], [1, 0]),
    poseFacing([1.0, roofEye, openingBackEdge - 0.08], [0.7, 0.7]),
    poseFacing([1.25, roofEye, -2.1], [0, 1]),
    poseFacing([1.25, roofEye, -1.1], [0, 1]),
    poseFacing([1.9, roofEye, -0.1], [0.7, 0.7]),
    poseFacing([0, roofEye, 0.6], [0, 1]),
  ];
}

function buildRouteGraph(): Map<NavigationNode, RouteEdge[]> {
  const graph = new Map<NavigationNode, RouteEdge[]>();
  graph.set("exterior", []);
  for (const room of rooms) graph.set(room.slug, []);
  graph.set(STAIR_BOTTOM, []);
  graph.set(UPPER_LANDING, []);

  // Each declared same-level connection becomes a walk through its real shared doorway.
  for (const room of rooms) {
    for (const targetSlug of room.connectedTo) {
      const neighbor = getRoomBySlug(targetSlug);
      const opening = getRoomPortalOpenings(room).find((candidate) => candidate.targetSlug === targetSlug);
      if (!neighbor || !opening) continue;
      // The entrance↔garden edge is the real front door, but needs an outdoor
      // approach arc after the threshold rather than a diagonal jump to the final pose.
      if ((room.slug === "entrance" && neighbor.slug === "garden") ||
          (room.slug === "garden" && neighbor.slug === "entrance")) continue;
      addEdge(graph, room.slug, neighbor.slug, roomDoorwayPath(room, neighbor, opening));
    }
  }

  const frontZ = HOUSE_LAYOUT.exterior.depth / 2;
  const entrance = getRoomBySlug("entrance");
  const garden = getRoomBySlug("garden");
  const gardenDoor = entrance && getRoomPortalOpenings(entrance).find((opening) => opening.targetSlug === "garden");
  if (entrance && garden && gardenDoor) {
    const entranceToGarden = [
      ...roomDoorwayPath(entrance, garden, gardenDoor),
      poseFacing([0.2, HEAD_HEIGHT, 5.45], [0.3, 0.95]),
      poseFacing([0.45, HEAD_HEIGHT, 5.9], [0.7, 0.7]),
      poseFacing([1.1, HEAD_HEIGHT, 6.25], [1, 0]),
      poseFacing([1.9, HEAD_HEIGHT, 6.6], [0.8, 0.3]),
      poseFacing([2.35, HEAD_HEIGHT, 7.25], [0.3, 0.95]),
      poseFacing([2.6, HEAD_HEIGHT, 8.1], [0.05, 1]),
    ];
    addEdge(graph, entrance.slug, garden.slug, entranceToGarden);
    addEdge(graph, garden.slug, entrance.slug, reverseRoute(entranceToGarden));
  }

  const doorDirection: readonly [number, number] = [0, -1];
  const outsideEntry: CameraPose[] = [
    poseFacing([0, HEAD_HEIGHT, frontZ + 2.15], doorDirection),
    poseFacing([0, HEAD_HEIGHT, frontZ + 0.54], doorDirection),
    poseFacing([0, HEAD_HEIGHT, frontZ - 0.54], doorDirection),
  ];
  addEdge(graph, "exterior", "entrance", outsideEntry);
  addEdge(graph, "entrance", "exterior", reverseRoute(outsideEntry));

  // The garden is approached outdoors rather than through the rooms.
  if (garden) {
    const [x, , z] = garden.scenePosition;
    const gardenApproach = [
      poseFacing([x, eyeHeight(garden), frontZ + 2.15], [0, -1]),
      poseFacing([x, eyeHeight(garden), z + 0.55], [0, -1]),
    ];
    addEdge(graph, "exterior", "garden", gardenApproach);
    addEdge(graph, "garden", "exterior", reverseRoute(gardenApproach));
  }

  // The staircase starts just beyond the family-table back opening.
  const family = getRoomBySlug("family-table");
  const stairPortal = family && getRoomPortalOpenings(family).find((opening) => opening.zone === "stair-hall");
  const groundFlight = HOUSE_LAYOUT.stairs.groundFlight;
  if (family && stairPortal) {
    const familySide: Vector3Tuple = [stairPortal.worldX, eyeHeight(family), stairPortal.worldZ + 0.35];
    const stairFoot: Vector3Tuple = [groundFlight.from[0], eyeHeight(family), groundFlight.from[2]];
    const familyToStair = [poseFacing(familySide, [0, -1]), poseFacing(stairFoot, [0, -1])];
    addEdge(graph, family.slug, STAIR_BOTTOM, familyToStair);
    addEdge(graph, STAIR_BOTTOM, family.slug, reverseRoute(familyToStair));
  }

  const groundWalkway = groundStairWalkway();
  addEdge(graph, STAIR_BOTTOM, UPPER_LANDING, groundWalkway);
  addEdge(graph, UPPER_LANDING, STAIR_BOTTOM, reverseRoute(groundWalkway));

  // Private rooms open to a single continuous bridge/landing, never directly into another bedroom.
  for (const room of rooms.filter((candidate) => candidate.level === "upper")) {
    const opening = getRoomPortalOpenings(room).find((candidate) => candidate.zone === "upper-landing");
    if (!opening) continue;
    const [dx, dz] = SIDE_DIRECTION[opening.side];
    const inside: Vector3Tuple = [
      opening.worldX - dx * DOORWAY_CLEARANCE, eyeHeight(room), opening.worldZ - dz * DOORWAY_CLEARANCE,
    ];
    const landingSide: Vector3Tuple = [
      opening.worldX + dx * DOORWAY_CLEARANCE, eyeHeight(room), opening.worldZ + dz * DOORWAY_CLEARANCE,
    ];
    const roomToLanding = [poseFacing(inside, [dx, dz]), poseFacing(landingSide, [dx, dz])];
    addEdge(graph, room.slug, UPPER_LANDING, roomToLanding);
    addEdge(graph, UPPER_LANDING, room.slug, reverseRoute(roomToLanding));
  }

  const roofWalkway = roofStairWalkway();
  addEdge(graph, UPPER_LANDING, "rooftop", roofWalkway);
  addEdge(graph, "rooftop", UPPER_LANDING, reverseRoute(roofWalkway));
  return graph;
}

function shortestRoute(graph: Map<NavigationNode, RouteEdge[]>, from: NavigationNode, to: NavigationNode): RouteEdge[] | undefined {
  if (from === to) return [];
  const queue: NavigationNode[] = [from];
  const visited = new Set<NavigationNode>([from]);
  const previous = new Map<NavigationNode, { node: NavigationNode; edge: RouteEdge }>();
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor];
    for (const edge of graph.get(current) ?? []) {
      if (visited.has(edge.to)) continue;
      visited.add(edge.to);
      previous.set(edge.to, { node: current, edge });
      if (edge.to === to) {
        const path: RouteEdge[] = [];
        let node = to;
        while (node !== from) {
          const step = previous.get(node);
          if (!step) return undefined;
          path.unshift(step.edge);
          node = step.node;
        }
        return path;
      }
      queue.push(edge.to);
    }
  }
  return undefined;
}

function normalizeNode(location: HouseLocation): NavigationNode {
  return location === "map" ? "exterior" : location;
}

/** Navigate at human height through registered doorways, the lower stair, bridge and roof stair. */
export function makeCameraPath(from: HouseLocation, to: HouseLocation, finalPose: CameraPose): CameraPose[] {
  const start = normalizeNode(from);
  const destination = normalizeNode(to);
  if (start === destination) return [finalPose];
  const route = shortestRoute(buildRouteGraph(), start, destination);
  if (!route) return [finalPose];

  const sourcePose = start === "exterior" ? EXTERIOR_CAMERA : getRoomBySlug(start)?.camera ?? EXTERIOR_CAMERA;
  const poses = [...route.flatMap((edge) => edge.waypoints), finalPose];
  // Aim intermediate waypoints along the actual path tangent, not stale per-node
  // lookAt targets. This stops camera turns from facing directly into a wall at
  // doorways and landings, while preserving the destination's authored composition.
  const positions = [sourcePose.position, ...poses.map((pose) => pose.position)];
  return poses.map((pose, index) => {
    if (index === poses.length - 1) return finalPose;
    const previous = positions[index];
    const next = positions[index + 2];
    const dx = next[0] - previous[0];
    const dz = next[2] - previous[2];
    const length = Math.hypot(dx, dz);
    if (length < 0.08) return pose;
    return poseFacing(pose.position, [dx / length, dz / length]);
  });
}

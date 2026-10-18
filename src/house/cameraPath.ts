import {
  EXTERIOR_CAMERA, HOUSE_LAYOUT, getRoomBySlug, getRoomPortalOpenings, rooms,
  type HouseLocation, type Room, type RoomPortalOpening, type Vector3Tuple,
} from "./rooms";

export interface CameraPose {
  readonly position: Vector3Tuple;
  readonly target: Vector3Tuple;
  /** Preserve an authored viewing direction where a tight landing needs a deliberate glance into the hall. */
  readonly preserveHeading?: boolean;
  /** Keep an intentionally authored target when the route tangent would point at a wall or the horizon. */
  readonly preserveTarget?: boolean;
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

function poseFacing(
  position: Vector3Tuple,
  direction: readonly [number, number],
  preserveHeading = false,
): CameraPose {
  return {
    position,
    target: [position[0] + direction[0] * 1.2, position[1] - 0.04, position[2] + direction[1] * 1.2],
    ...(preserveHeading ? { preserveHeading: true } : {}),
  };
}

function poseFacingDown(
  position: Vector3Tuple,
  direction: readonly [number, number],
  downwardAim = 0.7,
): CameraPose {
  const pose = poseFacing(position, direction);
  return {
    ...pose,
    // Point below the horizon so the first step onto the roof includes the deck
    // and hatch guardrails instead of a mostly empty sky frame.
    target: [pose.target[0], position[1] - downwardAim, pose.target[2]],
    preserveTarget: true,
  };
}

function reverseRoute(path: readonly CameraPose[]): CameraPose[] {
  return [...path].reverse().map((pose) => ({
    position: pose.position,
    // The stair-side bridge gaze is an inward sightline, not a travel heading.
    // Keep looking through the stairwell when reversing instead of flipping toward the bedroom wall.
    target: pose.preserveHeading
      ? [
          // Keep the side-of-stairwell view tied to the opening itself, not to
          // the direction of travel. This lets the return route look into the
          // opening from either end of the upper bridge instead of at a wall.
          pose.position[0] + (pose.target[0] - pose.position[0]),
          HOUSE_LAYOUT.upperY + 0.8,
          HOUSE_LAYOUT.upperBridge.centerZ,
        ]
      : pose.preserveTarget
        ? pose.target
        : [2 * pose.position[0] - pose.target[0], pose.position[1] - 0.04, 2 * pose.position[2] - pose.target[2]],
    ...(pose.preserveHeading ? { preserveHeading: true } : {}),
    ...(pose.preserveTarget ? { preserveTarget: true } : {}),
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
    // Finish the turn laterally while still behind the rear bedroom-wall line,
    // then move forward along the guarded landing. The former diagonal U-turn
    // aimed the camera straight into the bedroom's side wall for several frames.
    // The lateral step is the critical turn: a tangent-facing pose here looks
    // straight into the rear bedroom wall. Keep the camera on the protected lane
    // but start looking through the open stairwell before the forward walk begins.
    poseFacing([sideLaneX, upperEye, flight.to[2]], [-0.42, 0.91], true),
    // Continue the inward view along the upper bridge rather than tracking the wall.
    poseFacing([sideLaneX, upperEye, flight.to[2] + 0.2], [-0.42, 0.91], true),
    poseFacing([sideLaneX, upperEye, flight.to[2] + 0.6], [-0.25, 0.97], true),
    // The side lane is narrow and bordered by bedroom walls. Let the view glance
    // toward the open stair shaft as the camera walks forward, instead of staring
    // at an uninterrupted wall; reverseRoute mirrors travel but keeps this inward glance.
    ...[-2.8, -1.8, -0.8, 0.2].map((z) => poseFacing([sideLaneX, upperEye, z], [-0.34, 0.94], true)),
    // Rejoin the full-width upper landing beyond the end of the open stair shaft.
    poseFacing([sideLaneX * 0.7, upperEye, 0.72], [0.2, 1]),
    poseFacing([0, upperEye, 1.05], [0, 1]),
  ];
}

function roofStairWalkway(): CameraPose[] {
  const flight = HOUSE_LAYOUT.stairs.roofFlight;
  const upperEye = HOUSE_LAYOUT.upperY + HEAD_HEIGHT;
  const roofEye = HOUSE_LAYOUT.roofY + HEAD_HEIGHT;
  const opening = HOUSE_LAYOUT.stairs.roofOpening;
  const openingRightEdge = opening.centerX + opening.width / 2;
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
    // Step sideways past the hatch edge onto solid deck, then turn into the
    // open terrace. Moving toward the rear parapet first made the camera stare
    // at a blank wall while its feet were still clearing the opening.
    poseFacingDown([openingRightEdge + 0.16, roofEye, flight.to[2] + 0.05], [1, 0]),
    poseFacingDown([1.45, roofEye, flight.to[2] + 0.48], [0.7, 0.7]),
    poseFacingDown([1.65, roofEye, -1.55], [0, 1]),
    poseFacing([1.85, roofEye, -0.55], [0.3, 1]),
    poseFacing([1.9, roofEye, 0.1], [0.7, 0.7]),
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
  // Aim intermediate waypoints along the actual 3D path tangent, not stale
  // per-node lookAt targets. Include vertical travel: a horizontal gaze on a
  // steep flight looks into the landing underside instead of at the steps.
  // Preserve the destination's authored composition for the final room view.
  const positions = [sourcePose.position, ...poses.map((pose) => pose.position)];
  return poses.map((pose, index) => {
    if (index === poses.length - 1) return finalPose;
    if (pose.preserveHeading) return pose;
    const previous = positions[index];
    const next = positions[index + 2];
    const dx = next[0] - previous[0];
    const dy = next[1] - previous[1];
    const dz = next[2] - previous[2];
    const horizontalLength = Math.hypot(dx, dz);
    if (horizontalLength < 0.08) return pose;

    const lookAhead = 1.2;
    if (pose.preserveTarget) {
      // Preserve the authored downward pitch while still deriving horizontal
      // gaze from the path tangent. This avoids a sideways snap at each deck turn.
      return {
        position: pose.position,
        target: [
          pose.position[0] + dx / horizontalLength * lookAhead,
          pose.target[1],
          pose.position[2] + dz / horizontalLength * lookAhead,
        ],
        preserveTarget: true,
      };
    }

    // Keep the next treads in view instead of staring at the upper wall or landing
    // fascia. Looking slightly down on ascent exposes upcoming step edges; a stronger
    // down-slope gaze on descent keeps the steps readable before the lower floor.
    const verticalAim = dy * (dy >= 0 ? -0.25 : 0.75);
    const length = Math.hypot(dx, verticalAim, dz);
    return {
      position: pose.position,
      target: [
        pose.position[0] + dx / length * lookAhead,
        pose.position[1] + verticalAim / length * lookAhead,
        pose.position[2] + dz / length * lookAhead,
      ],
    };
  });
}

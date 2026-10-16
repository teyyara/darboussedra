import { HOUSE_LAYOUT, type HouseLocation, type Vector3Tuple } from "./rooms";

export interface CameraPose {
  readonly position: Vector3Tuple;
  readonly target: Vector3Tuple;
}

/**
 * Camera waypoints used to move between areas without clipping through the
 * front facade. The two doorway points straddle the facade at eye height;
 * the camera only rises above the wall envelope after it is fully inside.
 */
export function makeCameraPath(from: HouseLocation, to: HouseLocation, finalPose: CameraPose): CameraPose[] {
  const frontZ = HOUSE_LAYOUT.exterior.depth / 2;
  const outside: CameraPose = { position: [0, 2.65, 7.2], target: [0, 1.3, 3.65] };
  const doorwayOuter: CameraPose = {
    position: [0, 1.55, frontZ + 0.75],
    target: [0, 1.35, frontZ - 0.35],
  };
  const doorwayInner: CameraPose = {
    position: [0, 1.55, frontZ - 0.75],
    target: [0, 1.35, frontZ - 1.8],
  };
  const inside: CameraPose = {
    position: [0, 6.25, frontZ - 1.7],
    target: [0, 1.2, frontZ - 3.1],
  };
  const high: CameraPose = { position: [0, 8.2, 0], target: [0, 1.3, 0] };
  const roofAccess: CameraPose = { position: [0, 8.1, -1.8], target: [0, 5.7, -1.8] };

  if (from === to) return [finalPose];

  // The garden is already outside: do not route a garden-to-exterior move through the house.
  if (from === "exterior" && to === "garden") return [outside, finalPose];
  if (from === "garden" && to === "exterior") return [outside, finalPose];

  // Rooftop access stays above the registered roof envelope and uses the stair opening.
  if (from === "rooftop") return [roofAccess, high, finalPose];
  if (to === "rooftop") return [high, roofAccess, finalPose];

  if (from === "exterior" || from === "garden") {
    return [outside, doorwayOuter, doorwayInner, inside, finalPose];
  }
  if (to === "exterior" || to === "garden") {
    return [inside, doorwayInner, doorwayOuter, outside, finalPose];
  }

  // Interior-to-interior navigation rises above the walls before repositioning.
  return [high, finalPose];
}

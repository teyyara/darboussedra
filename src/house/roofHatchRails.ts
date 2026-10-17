import { HOUSE_LAYOUT, type Vector3Tuple } from "./rooms";

export interface RoofHatchGuardRail {
  readonly key: string;
  /** Top and middle rail positions/sizes in world coordinates. */
  readonly position: Vector3Tuple;
  readonly size: Vector3Tuple;
  readonly midRailPosition: Vector3Tuple;
  readonly midRailSize: Vector3Tuple;
  readonly posts: readonly Vector3Tuple[];
}

/**
 * Timber guardrails around the roof-stair opening.
 * The rear-right corner remains open so the route can step sideways out of the hatch.
 */
export function getRoofHatchGuardRails(): RoofHatchGuardRail[] {
  const opening = HOUSE_LAYOUT.stairs.roofOpening;
  const left = opening.centerX - opening.width / 2;
  const right = opening.centerX + opening.width / 2;
  const back = opening.centerZ - opening.depth / 2;
  const front = opening.centerZ + opening.depth / 2;
  const roofY = HOUSE_LAYOUT.roofY;
  const postHeight = 0.82;
  const postY = roofY + postHeight / 2;
  const railY = roofY + postHeight;
  const postSpacing = 0.46;

  const alongZ = (key: string, x: number, start: number, end: number): RoofHatchGuardRail => {
    const length = end - start;
    const count = Math.max(1, Math.ceil(length / postSpacing));
    return {
      key,
      position: [x, railY, (start + end) / 2],
      size: [0.075, 0.075, length + 0.075],
      midRailPosition: [x, roofY + postHeight * 0.45, (start + end) / 2],
      midRailSize: [0.075, 0.055, length + 0.075],
      posts: Array.from({ length: count + 1 }, (_, index) => [
        x, postY, start + length * index / count,
      ] as Vector3Tuple),
    };
  };
  const alongX = (key: string, z: number, start: number, end: number): RoofHatchGuardRail => {
    const length = end - start;
    const count = Math.max(1, Math.ceil(length / postSpacing));
    return {
      key,
      position: [(start + end) / 2, railY, z],
      size: [length + 0.075, 0.075, 0.075],
      midRailPosition: [(start + end) / 2, roofY + postHeight * 0.45, z],
      midRailSize: [length + 0.075, 0.055, 0.075],
      posts: Array.from({ length: count + 1 }, (_, index) => [
        start + length * index / count, postY, z,
      ] as Vector3Tuple),
    };
  };

  // Full left side, a rear-left return, and a short right-front rail make an
  // unmistakable hatch edge while keeping the rear-right egress corner clear.
  return [
    alongZ("left-hatch-rail", left - 0.04, back - 0.02, front + 0.02),
    alongX("rear-left-hatch-rail", back - 0.04, left - 0.02, opening.centerX + 0.08),
    alongZ("right-front-hatch-rail", right + 0.04, front - 0.68, front + 0.02),
  ];
}

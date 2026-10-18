import { HOUSE_LAYOUT, type Vector3Tuple } from "./rooms";

export type StructuralFloorLevel = "ground" | "upper";

export interface StructuralFloorPanel {
  readonly key: string;
  readonly position: Vector3Tuple;
  readonly size: Vector3Tuple;
}

const SUBSTRATE_THICKNESS = HOUSE_LAYOUT.floorThickness - 0.042;

function halfWidth(): number {
  return (HOUSE_LAYOUT.exterior.width - HOUSE_LAYOUT.exterior.wallThickness * 2) / 2;
}
function halfDepth(): number {
  return (HOUSE_LAYOUT.exterior.depth - HOUSE_LAYOUT.exterior.wallThickness * 2) / 2;
}
function makePanel(key: string, levelY: number, x: number, z: number, width: number, depth: number): StructuralFloorPanel {
  return {
    key,
    position: [x, levelY - SUBSTRATE_THICKNESS / 2 - 0.002, z],
    size: [width, SUBSTRATE_THICKNESS, depth],
  };
}

/**
 * Substrate below the room finish floors. It closes registry seams and perimeter strips;
 * the upper level leaves only the intended central stairwell void.
 */
export function getStructuralFloorPanels(level: StructuralFloorLevel): StructuralFloorPanel[] {
  const y = level === "ground" ? HOUSE_LAYOUT.groundY : HOUSE_LAYOUT.upperY;
  const hw = halfWidth(), hd = halfDepth();
  if (level === "ground") return [makePanel("ground-continuous", y, 0, 0, hw * 2, hd * 2)];

  const openingWidth = HOUSE_LAYOUT.stairs.openingWidth;
  const openingDepth = HOUSE_LAYOUT.stairs.roofOpening.depth;
  const openingCenterZ = HOUSE_LAYOUT.stairs.roofOpening.centerZ;
  const left = HOUSE_LAYOUT.upperBridge.centerX - openingWidth / 2;
  const right = HOUSE_LAYOUT.upperBridge.centerX + openingWidth / 2;
  const back = openingCenterZ - openingDepth / 2;
  const front = openingCenterZ + openingDepth / 2;
  return [
    makePanel("upper-left-wing", y, (-hw + left) / 2, 0, hw + left, hd * 2),
    makePanel("upper-right-wing", y, (right + hw) / 2, 0, hw - right, hd * 2),
    makePanel("upper-front-strip", y, HOUSE_LAYOUT.upperBridge.centerX, (front + hd) / 2, openingWidth, hd - front),
    makePanel("upper-rear-strip", y, HOUSE_LAYOUT.upperBridge.centerX, (-hd + back) / 2, openingWidth, back + hd),
  ].filter((p) => p.size[0] > 0.02 && p.size[2] > 0.02);
}

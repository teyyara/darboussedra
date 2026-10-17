import { HOUSE_LAYOUT } from "./rooms";

export interface InteriorCeilingPanel {
  readonly x: number;
  readonly z: number;
  readonly width: number;
  readonly depth: number;
}

/**
 * Split the underside of the roof around the exact roof-stair hatch.
 * The panels cover the complete usable ceiling footprint except the hatch,
 * so an interior or stair camera cannot see exterior sky through missing slabs.
 */
export function getInteriorRoofCeilingPanels(): InteriorCeilingPanel[] {
  const halfWidth = (HOUSE_LAYOUT.exterior.width - HOUSE_LAYOUT.exterior.wallThickness) / 2;
  const halfDepth = (HOUSE_LAYOUT.exterior.depth - HOUSE_LAYOUT.exterior.wallThickness) / 2;
  const opening = HOUSE_LAYOUT.stairs.roofOpening;
  const left = opening.centerX - opening.width / 2;
  const right = opening.centerX + opening.width / 2;
  const back = opening.centerZ - opening.depth / 2;
  const front = opening.centerZ + opening.depth / 2;

  return [
    { x: (-halfWidth + left) / 2, z: 0, width: left + halfWidth, depth: halfDepth * 2 },
    { x: (right + halfWidth) / 2, z: 0, width: halfWidth - right, depth: halfDepth * 2 },
    { x: opening.centerX, z: (-halfDepth + back) / 2, width: opening.width, depth: back + halfDepth },
    { x: opening.centerX, z: (front + halfDepth) / 2, width: opening.width, depth: halfDepth - front },
  ].filter((panel) => panel.width > 0.02 && panel.depth > 0.02);
}

export interface InteriorHatchTrim {
  readonly x: number;
  readonly z: number;
  readonly width: number;
  readonly depth: number;
}

/** Timber hatch lining mounted completely outside the clear stairwell opening. */
export function getInteriorRoofHatchTrim(): InteriorHatchTrim[] {
  const opening = HOUSE_LAYOUT.stairs.roofOpening;
  const trimWidth = 0.075;
  const left = opening.centerX - opening.width / 2;
  const right = opening.centerX + opening.width / 2;
  const back = opening.centerZ - opening.depth / 2;
  const front = opening.centerZ + opening.depth / 2;
  return [
    { x: left - trimWidth / 2, z: opening.centerZ, width: trimWidth, depth: opening.depth },
    { x: right + trimWidth / 2, z: opening.centerZ, width: trimWidth, depth: opening.depth },
    { x: opening.centerX, z: back - trimWidth / 2, width: opening.width, depth: trimWidth },
    { x: opening.centerX, z: front + trimWidth / 2, width: opening.width, depth: trimWidth },
  ];
}

export interface RoofDeckOpening {
  readonly centerX: number;
  readonly centerZ: number;
  readonly width: number;
  readonly depth: number;
}

export interface RoofDeckTileJoint {
  /** "x" runs along the X axis with Z fixed; "z" runs along Z with X fixed. */
  readonly axis: "x" | "z";
  readonly coordinate: number;
  readonly start: number;
  readonly end: number;
}

export interface RoofDeckTileLayout {
  readonly width: number;
  readonly depth: number;
  readonly opening: RoofDeckOpening;
  readonly spacing?: number;
  readonly parapetInset?: number;
  readonly openingClearance?: number;
}

/**
 * Creates subtle tile-grout runs for the roof terrace.
 * The lines stop short of both the parapet and the stair opening; no run can
 * paint over the void above the stairs or add collision geometry to the route.
 */
export function getRoofDeckTileJoints(layout: RoofDeckTileLayout): RoofDeckTileJoint[] {
  const { width, depth, opening } = layout;
  const spacing = layout.spacing ?? 0.82;
  const parapetInset = layout.parapetInset ?? 0.12;
  const openingClearance = layout.openingClearance ?? 0.035;

  if (
    !Number.isFinite(width) || !Number.isFinite(depth) ||
    !Number.isFinite(spacing) || width <= 0 || depth <= 0 || spacing <= 0 ||
    !Number.isFinite(parapetInset) || parapetInset < 0 ||
    !Number.isFinite(openingClearance) || openingClearance < 0 ||
    ![opening.centerX, opening.centerZ, opening.width, opening.depth].every(Number.isFinite) ||
    opening.width <= 0 || opening.depth <= 0
  ) return [];

  const halfWidth = width / 2 - parapetInset;
  const halfDepth = depth / 2 - parapetInset;
  if (halfWidth <= 0 || halfDepth <= 0) return [];

  const openLeft = opening.centerX - opening.width / 2;
  const openRight = opening.centerX + opening.width / 2;
  const openBack = opening.centerZ - opening.depth / 2;
  const openFront = opening.centerZ + opening.depth / 2;
  const joints: RoofDeckTileJoint[] = [];
  const near = (value: number, start: number, end: number) =>
    value >= start - openingClearance && value <= end + openingClearance;
  const add = (axis: "x" | "z", coordinate: number, start: number, end: number) => {
    if (end - start > 0.08) joints.push({ axis, coordinate, start, end });
  };

  // Horizontal grout joints are split into left and right runs whenever their
  // height overlaps the stair opening (including a small safety margin).
  const maxXIndex = Math.floor(halfWidth / spacing);
  for (let index = -maxXIndex; index <= maxXIndex; index += 1) {
    const x = index * spacing;
    if (Math.abs(x) < 0.05) continue;
    // x-oriented lines use this value as their Z coordinate; the name is local to the grid.
  }

  const maxZIndex = Math.floor(halfDepth / spacing);
  for (let index = -maxZIndex; index <= maxZIndex; index += 1) {
    const z = index * spacing;
    if (near(z, openBack, openFront)) {
      add("x", z, -halfWidth, openLeft - openingClearance);
      add("x", z, openRight + openingClearance, halfWidth);
    } else {
      add("x", z, -halfWidth, halfWidth);
    }
  }

  const maxX = Math.floor(halfWidth / spacing);
  for (let index = -maxX; index <= maxX; index += 1) {
    const x = index * spacing;
    if (near(x, openLeft, openRight)) {
      add("z", x, -halfDepth, openBack - openingClearance);
      add("z", x, openFront + openingClearance, halfDepth);
    } else {
      add("z", x, -halfDepth, halfDepth);
    }
  }

  return joints;
}

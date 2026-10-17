import { describe, expect, it } from "vitest";
import { HOUSE_LAYOUT, getRoomBySlug } from "./rooms";
import { getRoofDeckTileJoints } from "./roofDeckTiles";

const rooftop = getRoomBySlug("rooftop")!;
const opening = HOUSE_LAYOUT.stairs.roofOpening;
const layout = {
  width: rooftop.footprint[0],
  depth: rooftop.footprint[1],
  opening,
};

function intersectsOpening(
  joint: ReturnType<typeof getRoofDeckTileJoints>[number],
  clearance = 0.035,
): boolean {
  const openLeft = opening.centerX - opening.width / 2 - clearance;
  const openRight = opening.centerX + opening.width / 2 + clearance;
  const openBack = opening.centerZ - opening.depth / 2 - clearance;
  const openFront = opening.centerZ + opening.depth / 2 + clearance;
  if (joint.axis === "x") {
    return joint.coordinate > openBack && joint.coordinate < openFront &&
      joint.start < openRight && joint.end > openLeft;
  }
  return joint.coordinate > openLeft && joint.coordinate < openRight &&
    joint.start < openFront && joint.end > openBack;
}

describe("rooftop tile-grout layout", () => {
  it("adds enough short grout runs to scale the broad deck without a texture dependency", () => {
    const joints = getRoofDeckTileJoints(layout);
    expect(joints.length).toBeGreaterThan(25);
    expect(joints.every((joint) => Number.isFinite(joint.coordinate) &&
      Number.isFinite(joint.start) && Number.isFinite(joint.end) &&
      joint.end - joint.start > 0.08)).toBe(true);
  });

  it("keeps every grout run off the stair hatch and its clearance margin", () => {
    const joints = getRoofDeckTileJoints(layout);
    expect(joints.length).toBeGreaterThan(0);
    for (const joint of joints) expect(intersectsOpening(joint)).toBe(false);
  });

  it("keeps the grout inside the parapet and limits segment spacing", () => {
    const joints = getRoofDeckTileJoints(layout);
    const maxX = layout.width / 2 - 0.12;
    const maxZ = layout.depth / 2 - 0.12;
    for (const joint of joints) {
      if (joint.axis === "x") {
        expect(Math.abs(joint.coordinate)).toBeLessThanOrEqual(maxZ);
        expect(Math.abs(joint.start)).toBeLessThanOrEqual(maxX);
        expect(Math.abs(joint.end)).toBeLessThanOrEqual(maxX);
      } else {
        expect(Math.abs(joint.coordinate)).toBeLessThanOrEqual(maxX);
        expect(Math.abs(joint.start)).toBeLessThanOrEqual(maxZ);
        expect(Math.abs(joint.end)).toBeLessThanOrEqual(maxZ);
      }
    }
  });

  it("returns no geometry for impossible dimensions", () => {
    expect(getRoofDeckTileJoints({...layout, width: 0})).toEqual([]);
    expect(getRoofDeckTileJoints({...layout, spacing: -1})).toEqual([]);
  });
});

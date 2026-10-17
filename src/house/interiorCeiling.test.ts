import { describe, expect, it } from "vitest";
import { HOUSE_LAYOUT } from "./rooms";
import { getInteriorRoofCeilingPanels } from "./interiorCeiling";

describe("interior roof ceiling continuity", () => {
  it("covers the usable roof footprint except for the roof stair hatch", () => {
    const panels = getInteriorRoofCeilingPanels();
    const houseArea = (HOUSE_LAYOUT.exterior.width - HOUSE_LAYOUT.exterior.wallThickness) *
      (HOUSE_LAYOUT.exterior.depth - HOUSE_LAYOUT.exterior.wallThickness);
    const hatch = HOUSE_LAYOUT.stairs.roofOpening.width * HOUSE_LAYOUT.stairs.roofOpening.depth;
    const coveredArea = panels.reduce((sum, panel) => sum + panel.width * panel.depth, 0);
    expect(panels).toHaveLength(4);
    expect(coveredArea).toBeCloseTo(houseArea - hatch, 6);
    expect(panels.every((panel) => panel.width > 0 && panel.depth > 0)).toBe(true);
  });

  it("keeps the full stair opening clear at its authored world coordinates", () => {
    const hatch = HOUSE_LAYOUT.stairs.roofOpening;
    const left = hatch.centerX - hatch.width / 2;
    const right = hatch.centerX + hatch.width / 2;
    const back = hatch.centerZ - hatch.depth / 2;
    const front = hatch.centerZ + hatch.depth / 2;
    const panels = getInteriorRoofCeilingPanels();
    for (const panel of panels) {
      const overlapsX = Math.min(panel.x + panel.width / 2, right) -
        Math.max(panel.x - panel.width / 2, left);
      const overlapsZ = Math.min(panel.z + panel.depth / 2, front) -
        Math.max(panel.z - panel.depth / 2, back);
      expect(overlapsX > 0.001 && overlapsZ > 0.001).toBe(false);
    }
  });

  it("does not extend outside the interior roof outline", () => {
    const halfWidth = (HOUSE_LAYOUT.exterior.width - HOUSE_LAYOUT.exterior.wallThickness) / 2;
    const halfDepth = (HOUSE_LAYOUT.exterior.depth - HOUSE_LAYOUT.exterior.wallThickness) / 2;
    for (const panel of getInteriorRoofCeilingPanels()) {
      expect(panel.x - panel.width / 2).toBeGreaterThanOrEqual(-halfWidth - 0.001);
      expect(panel.x + panel.width / 2).toBeLessThanOrEqual(halfWidth + 0.001);
      expect(panel.z - panel.depth / 2).toBeGreaterThanOrEqual(-halfDepth - 0.001);
      expect(panel.z + panel.depth / 2).toBeLessThanOrEqual(halfDepth + 0.001);
    }
  });
});

import { describe, expect, it } from "vitest";
import { GARDEN_SHRUBS, GARDEN_TREES } from "./gardenPlants";
import { getRoomBySlug } from "./rooms";

describe("garden planting bounds", () => {
  it("keeps tree trunks, canopies and shrubs inside the planted footprint", () => {
    const garden = getRoomBySlug("garden")!;
    const halfWidth = garden.footprint[0] / 2;
    const halfDepth = garden.footprint[1] / 2;

    for (const tree of GARDEN_TREES) {
      expect(Math.abs(tree.x)).toBeGreaterThan(1.8); // the crowns flank the path but remain visible in the garden view
      expect(Math.abs(tree.x) - 0.9).toBeGreaterThan(0.7); // keep a clear central walking corridor
      expect(tree.z).toBeGreaterThan(0); // planting is forward of the façade, not hidden against the wall
      expect(Math.abs(tree.x) + 0.72).toBeLessThan(halfWidth);
      expect(Math.abs(tree.z) + 0.72).toBeLessThan(halfDepth);
      for (const crown of tree.crowns) {
        expect(Math.abs(tree.x + crown.position[0]) + crown.scale[0]).toBeLessThan(halfWidth);
        expect(Math.abs(tree.z + crown.position[2]) + crown.scale[2]).toBeLessThan(halfDepth);
      }
    }
    for (const shrub of GARDEN_SHRUBS) {
      expect(Math.abs(shrub.x) + shrub.scale[0]).toBeLessThan(halfWidth);
      expect(Math.abs(shrub.z) + shrub.scale[2]).toBeLessThan(halfDepth);
    }
  });

  it("uses irregular, overlapping crowns rather than conical placeholders", () => {
    expect(GARDEN_TREES).toHaveLength(2);
    expect(GARDEN_TREES.every((tree) => tree.crowns.length >= 4 && tree.branches.length >= 2)).toBe(true);
    expect(GARDEN_SHRUBS).toHaveLength(4);
  });
});

import { describe, expect, it } from "vitest";
import { getRoomBySlug } from "./rooms";
import { getGardenPavers } from "./gardenPath";

describe("garden stepping-stone path", () => {
  it("connects the porch to the inner garden without spilling beyond the plot", () => {
    const garden = getRoomBySlug("garden")!;
    const stones = getGardenPavers();
    const halfWidth = garden.footprint[0] / 2;
    const halfDepth = garden.footprint[1] / 2;
    expect(stones).toHaveLength(6);

    for (const stone of stones) {
      const c = Math.abs(Math.cos(stone.rotationY));
      const s = Math.abs(Math.sin(stone.rotationY));
      const extentX = c * stone.size[0] / 2 + s * stone.size[2] / 2;
      const extentZ = s * stone.size[0] / 2 + c * stone.size[2] / 2;
      expect(Math.abs(stone.position[0]) + extentX).toBeLessThan(halfWidth);
      expect(Math.abs(stone.position[2]) + extentZ).toBeLessThan(halfDepth);
      expect(stone.size[0]).toBeGreaterThan(0.6);
      expect(stone.size[2]).toBeGreaterThan(0.4);
    }
    expect(stones.map(stone => stone.position[2])).toEqual(
      [...stones].map(stone => stone.position[2]).sort((a, b) => a - b),
    );
  });

  it("leaves small visible grass joints between the staggered stones", () => {
    const stones = getGardenPavers();
    for (let index = 1; index < stones.length; index += 1) {
      const previous = stones[index - 1];
      const current = stones[index];
      const previousBack = previous.position[2] + previous.size[2] / 2;
      const currentFront = current.position[2] - current.size[2] / 2;
      expect(currentFront).toBeGreaterThan(previousBack);
      expect(currentFront - previousBack).toBeLessThan(0.25);
    }
  });
});

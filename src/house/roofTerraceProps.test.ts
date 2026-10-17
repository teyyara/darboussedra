import { describe, expect, it } from "vitest";
import { HOUSE_LAYOUT, getRoomBySlug } from "./rooms";
import { ROOF_SEATING_RUG, ROOF_TEA_STOOLS, ROOF_TEA_TABLE, type RoofRectangle } from "./roofTerraceProps";

function intersects(
  a: RoofRectangle,
  bounds: { left: number; right: number; back: number; front: number },
): boolean {
  const left = a.position[0] - a.size[0] / 2;
  const right = a.position[0] + a.size[0] / 2;
  const back = a.position[1] - a.size[1] / 2;
  const front = a.position[1] + a.size[1] / 2;
  return Math.min(right, bounds.right) - Math.max(left, bounds.left) > 0.001 &&
    Math.min(front, bounds.front) - Math.max(back, bounds.back) > 0.001;
}

describe("rooftop seating layout", () => {
  it("keeps the rug, table and stools inside the parapet outline", () => {
    const rooftop = getRoomBySlug("rooftop")!;
    const halfWidth = rooftop.footprint[0] / 2 - 0.07;
    const halfDepth = rooftop.footprint[1] / 2 - 0.07;
    const pieces = [ROOF_SEATING_RUG, ROOF_TEA_TABLE, ...ROOF_TEA_STOOLS];
    for (const piece of pieces) {
      expect(Math.abs(piece.position[0]) + piece.size[0] / 2).toBeLessThan(halfWidth);
      expect(Math.abs(piece.position[1]) + piece.size[1] / 2).toBeLessThan(halfDepth);
    }
  });

  it("keeps all added seating clear of the stair hatch opening", () => {
    const opening = HOUSE_LAYOUT.stairs.roofOpening;
    const bounds = {
      left: opening.centerX - opening.width / 2,
      right: opening.centerX + opening.width / 2,
      back: opening.centerZ - opening.depth / 2,
      front: opening.centerZ + opening.depth / 2,
    };
    for (const piece of [ROOF_SEATING_RUG, ROOF_TEA_TABLE, ...ROOF_TEA_STOOLS]) {
      expect(intersects(piece, bounds)).toBe(false);
    }
  });

  it("gives the bench a textile base and provides a compact tea-table arrangement", () => {
    expect(ROOF_SEATING_RUG.size[0]).toBeGreaterThan(2.4);
    expect(ROOF_SEATING_RUG.size[1]).toBeGreaterThan(1.5);
    expect(ROOF_TEA_TABLE.size[0]).toBeLessThan(1.1);
    expect(ROOF_TEA_STOOLS).toHaveLength(2);
  });
});

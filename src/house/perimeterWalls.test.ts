import { describe, expect, it } from "vitest";
import { getExteriorFacadePanels, getInteriorPerimeterWallPanels } from "./perimeterWalls";
import { HOUSE_LAYOUT } from "./rooms";

const intersects = (aMin: number, aMax: number, bMin: number, bMax: number) =>
  Math.min(aMax, bMax) - Math.max(aMin, bMin) > 0.001;

describe("interior perimeter walls", () => {
  it("closes both long sides and the rear while preserving the front facade", () => {
    const panels = getInteriorPerimeterWallPanels();
    const { width, depth, wallThickness, wallHeight } = HOUSE_LAYOUT.exterior;
    expect(panels).toHaveLength(14);

    for (const side of ["left-side", "right-side"] as const) {
      const wall = panels.find((panel) => panel.key === side);
      expect(wall).toBeDefined();
      expect(wall!.size).toEqual([wallThickness + 0.18, wallHeight, depth]);
      // Extend past the room boundary so a sliver of sky cannot show through a seam.
      const innerFace = Math.abs(wall!.position[0]) - wall!.size[0] / 2;
      expect(innerFace).toBeLessThan(width / 2 - 0.15);
      expect(Math.abs(wall!.position[0])).toBeCloseTo(width / 2);
    }

    const rear = panels.find((panel) => panel.key === "rear");
    expect(rear?.position[2]).toBeCloseTo(-depth / 2);
    expect(rear?.size).toEqual([width, wallHeight, wallThickness]);
    expect(panels.filter((panel) => panel.key.startsWith("front-"))).toHaveLength(11);
  });

  it("leaves the full-height doorway opening clear below the lintel", () => {
    const { depth, wallHeight } = HOUSE_LAYOUT.exterior;
    const frontZ = depth / 2;
    const halfDoor = HOUSE_LAYOUT.entrance.doorWidth / 2;
    const facade = getExteriorFacadePanels().filter((panel) => Math.abs(panel.position[2] - frontZ) < 0.001);

    for (const panel of facade) {
      const xMin = panel.position[0] - panel.size[0] / 2;
      const xMax = panel.position[0] + panel.size[0] / 2;
      const yMin = panel.position[1] - panel.size[1] / 2;
      const yMax = panel.position[1] + panel.size[1] / 2;
      if (intersects(xMin, xMax, -halfDoor, halfDoor)) {
        expect(yMin).toBeGreaterThanOrEqual(HOUSE_LAYOUT.entrance.doorHeight - 0.001);
      }
      expect(yMax).toBeLessThanOrEqual(wallHeight + 0.001);
    }
  });

  it("keeps glass openings in the front facade free of plaster panels", () => {
    const { width } = HOUSE_LAYOUT.exterior;
    const windowCenter = width / 2 - 2.55;
    const facade = getExteriorFacadePanels();
    for (const center of [-windowCenter, windowCenter]) {
      for (const [bottom, top] of [[1.6, 2.6], [3.575, 4.575]] as const) {
        for (const panel of facade) {
          const xMin = panel.position[0] - panel.size[0] / 2;
          const xMax = panel.position[0] + panel.size[0] / 2;
          const yMin = panel.position[1] - panel.size[1] / 2;
          const yMax = panel.position[1] + panel.size[1] / 2;
          if (intersects(xMin, xMax, center - 0.6, center + 0.6)) {
            expect(intersects(yMin, yMax, bottom, top)).toBe(false);
          }
        }
      }
    }
  });

  it("keeps all perimeter panels three-dimensional and finite", () => {
    const panels = getInteriorPerimeterWallPanels();
    expect(panels.every((panel) => panel.size.every((dimension) => dimension > 0))).toBe(true);
    expect(panels.every((panel) => panel.position.every(Number.isFinite))).toBe(true);
  });
});

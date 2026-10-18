import { describe, expect, it } from "vitest";
import { HOUSE_LAYOUT } from "./rooms";
import { getStructuralFloorPanels } from "./structuralFloors";

describe("structural floor substrate", () => {
  it("covers the ground footprint and the lower stair approach", () => {
    const [slab] = getStructuralFloorPanels("ground");
    const flight = HOUSE_LAYOUT.stairs.groundFlight;
    const minX = slab.position[0] - slab.size[0] / 2;
    const maxX = slab.position[0] + slab.size[0] / 2;
    const minZ = slab.position[2] - slab.size[2] / 2;
    const maxZ = slab.position[2] + slab.size[2] / 2;
    expect(getStructuralFloorPanels("ground")).toHaveLength(1);
    expect(minX).toBeLessThan(-HOUSE_LAYOUT.stairs.width / 2);
    expect(maxX).toBeGreaterThan(HOUSE_LAYOUT.stairs.width / 2);
    expect(minZ).toBeLessThan(flight.to[2]);
    expect(maxZ).toBeGreaterThan(flight.from[2]);
    expect(slab.position[1] + slab.size[1] / 2).toBeCloseTo(HOUSE_LAYOUT.groundY - 0.002);
  });

  it("fills upper-floor perimeter strips while preserving only the central stairwell", () => {
    const panels = getStructuralFloorPanels("upper");
    expect(panels).toHaveLength(4);
    const hw = (HOUSE_LAYOUT.exterior.width - HOUSE_LAYOUT.exterior.wallThickness * 2) / 2;
    const hd = (HOUSE_LAYOUT.exterior.depth - HOUSE_LAYOUT.exterior.wallThickness * 2) / 2;
    const openingWidth = HOUSE_LAYOUT.stairs.openingWidth;
    const openingDepth = HOUSE_LAYOUT.stairs.roofOpening.depth;
    const left = HOUSE_LAYOUT.upperBridge.centerX - openingWidth / 2;
    const right = HOUSE_LAYOUT.upperBridge.centerX + openingWidth / 2;
    const back = HOUSE_LAYOUT.stairs.roofOpening.centerZ - openingDepth / 2;
    const front = HOUSE_LAYOUT.stairs.roofOpening.centerZ + openingDepth / 2;
    const byKey = new Map(panels.map(p => [p.key, p]));
    expect(byKey.get("upper-left-wing")!.position[0] + byKey.get("upper-left-wing")!.size[0] / 2).toBeCloseTo(left);
    expect(byKey.get("upper-right-wing")!.position[0] - byKey.get("upper-right-wing")!.size[0] / 2).toBeCloseTo(right);
    expect(byKey.get("upper-front-strip")!.position[2] - byKey.get("upper-front-strip")!.size[2] / 2).toBeCloseTo(front);
    expect(byKey.get("upper-rear-strip")!.position[2] + byKey.get("upper-rear-strip")!.size[2] / 2).toBeCloseTo(back);
    expect(panels.every(p => p.position[0] - p.size[0] / 2 >= -hw - 0.001)).toBe(true);
    expect(panels.every(p => p.position[0] + p.size[0] / 2 <= hw + 0.001)).toBe(true);
    expect(panels.every(p => p.position[2] - p.size[2] / 2 >= -hd - 0.001)).toBe(true);
    expect(panels.every(p => p.position[2] + p.size[2] / 2 <= hd + 0.001)).toBe(true);
    expect(panels.every(p => p.position[1] + p.size[1] / 2 < HOUSE_LAYOUT.upperY)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { MOROCCAN_NEIGHBORHOOD, MOROCCAN_STREET, neighborhoodLayoutIssues } from "./neighborhoodLayout";
import { EXTERIOR_CAMERA, HOUSE_LAYOUT } from "./rooms";

describe("Moroccan exterior context", () => {
  it("places real building masses around the home without covering its shell", () => {
    expect(MOROCCAN_NEIGHBORHOOD).toHaveLength(4);
    expect(neighborhoodLayoutIssues()).toEqual([]);
    for (const building of MOROCCAN_NEIGHBORHOOD) {
      expect(building.width).toBeGreaterThan(5.5);
      expect(building.height).toBeGreaterThan(4);
      expect(Math.abs(building.centerX) - building.width / 2).toBeGreaterThan(HOUSE_LAYOUT.exterior.width / 2);
    }
  });

  it("places the exterior view beside a connected sidewalk and residential road", () => {
    const sidewalkMin = MOROCCAN_STREET.sidewalk.centerZ - MOROCCAN_STREET.sidewalk.depth / 2;
    const sidewalkMax = MOROCCAN_STREET.sidewalk.centerZ + MOROCCAN_STREET.sidewalk.depth / 2;
    const roadMin = MOROCCAN_STREET.road.centerZ - MOROCCAN_STREET.road.depth / 2;
    const roadMax = MOROCCAN_STREET.road.centerZ + MOROCCAN_STREET.road.depth / 2;
    expect(sidewalkMax).toBeGreaterThanOrEqual(9.65);
    expect(Math.abs(sidewalkMax - roadMin)).toBeLessThanOrEqual(0.025);
    expect(EXTERIOR_CAMERA.position[2]).toBeGreaterThan(roadMin);
    expect(EXTERIOR_CAMERA.position[2]).toBeLessThan(roadMax);
    expect(neighborhoodLayoutIssues()).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { getKitchenFixtureLayout } from "./kitchenLayout";
import { HOUSE_LAYOUT } from "./rooms";

describe("fitted kitchen fixture layout", () => {
  it("keeps the cooktop and sink inside the counter instead of overhanging the room edge", () => {
    const layout = getKitchenFixtureLayout(3.6);
    const topLeft = layout.counterCenterX - 0.82 / 2;
    const topRight = layout.counterCenterX + 0.82 / 2;
    const topBack = -0.05 - 2.2 / 2;
    const topFront = -0.05 + 2.2 / 2;

    for (const fixture of [layout.cooktop, layout.sink]) {
      expect(fixture.center[0] - fixture.size[0] / 2).toBeGreaterThanOrEqual(topLeft);
      expect(fixture.center[0] + fixture.size[0] / 2).toBeLessThanOrEqual(topRight);
      expect(fixture.center[2] - fixture.size[2] / 2).toBeGreaterThanOrEqual(topBack);
      expect(fixture.center[2] + fixture.size[2] / 2).toBeLessThanOrEqual(topFront);
    }
    expect(layout.sink.center[2] - layout.sink.size[2] / 2)
      .toBeGreaterThan(layout.cooktop.center[2] + layout.cooktop.size[2] / 2);
  });

  it("keeps fitted cabinets, handles and tall fixtures within the kitchen footprint", () => {
    const width = 3.6;
    const layout = getKitchenFixtureLayout(width);
    const halfWidth = width / 2;
    expect(layout.cabinetFrontX).toBeGreaterThan(-halfWidth);
    expect(layout.cabinetFrontX).toBeLessThan(layout.counterCenterX);
    expect(layout.cabinetHandleX).toBeGreaterThan(-halfWidth);
    expect(layout.cabinetDoorZs.every((z) => z > -1.125 && z < 1.025)).toBe(true);
    expect(layout.cooktop.burners).toHaveLength(4);
    expect(layout.cooktop.controls).toHaveLength(4);
    expect(layout.sink.rim).toHaveLength(4);
    expect(HOUSE_LAYOUT.roomWallHeight).toBeGreaterThan(2.2);
  });
});

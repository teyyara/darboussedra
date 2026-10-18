import { describe, expect, it } from "vitest";
import { HOUSE_LAYOUT } from "./rooms";
import { getRoofHatchGuardRails } from "./roofHatchRails";

describe("roof hatch guardrails", () => {
  it("adds visible rails on three sides of the stair opening", () => {
    const rails = getRoofHatchGuardRails();
    expect(rails.map((rail) => rail.key)).toEqual([
      "left-hatch-rail",
      "rear-left-hatch-rail",
      "right-hatch-rail",
    ]);
    expect(rails.every((rail) => rail.size.every((dimension) => dimension > 0))).toBe(true);
    expect(rails.every((rail) => rail.position.every(Number.isFinite))).toBe(true);
    expect(rails.every((rail) => rail.posts.length >= 2)).toBe(true);
    expect(rails.every((rail) => rail.midRailSize[1] > 0 && rail.midRailSize[1] < rail.size[1])).toBe(true);
    expect(rails.every((rail) => rail.midRailPosition[1] > HOUSE_LAYOUT.roofY &&
      rail.midRailPosition[1] < rail.position[1])).toBe(true);
  });

  it("keeps the rear-right step-off gap clear while guarding the rest of the right edge", () => {
    const opening = HOUSE_LAYOUT.stairs.roofOpening;
    const rails = getRoofHatchGuardRails();
    const egressZ = HOUSE_LAYOUT.stairs.roofFlight.to[2] + 0.05;
    const back = opening.centerZ - opening.depth / 2;
    const front = opening.centerZ + opening.depth / 2;
    const rightEdge = opening.centerX + opening.width / 2;
    const rightRail = rails.find((rail) => rail.key === "right-hatch-rail")!;
    const minRailZ = rightRail.position[2] - rightRail.size[2] / 2;
    const maxRailZ = rightRail.position[2] + rightRail.size[2] / 2;
    expect(minRailZ - egressZ).toBeGreaterThan(0.75);
    expect(maxRailZ).toBeGreaterThan(front - 0.01);
    expect(minRailZ).toBeGreaterThan(back + 0.75);
    const rearRail = rails.find((rail) => rail.key === "rear-left-hatch-rail")!;
    expect(rearRail.position[0] + rearRail.size[0] / 2).toBeLessThan(rightEdge);
  });

  it("keeps the guardrails at roof level rather than hanging over the stair treads", () => {
    const rail = getRoofHatchGuardRails()[0];
    expect(rail.position[1]).toBeCloseTo(HOUSE_LAYOUT.roofY + 0.82);
    expect(rail.posts.every((post) => post[1] < rail.position[1])).toBe(true);
  });
});

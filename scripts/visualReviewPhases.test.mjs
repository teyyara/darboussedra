import { describe, expect, it } from "vitest";
import { isCameraPhaseMatch, isCameraRouteReady } from "./visualReviewPhases.mjs";

describe("visual review camera phase windows", () => {
  it("does not start a phase watch against an empty or previous-room route", () => {
    expect(isCameraRouteReady("rooftop", { destination: "family-table", routeProgress: "0/0" })).toBe(false);
    expect(isCameraRouteReady("rooftop", { destination: "rooftop", routeProgress: "0/0" })).toBe(false);
    expect(isCameraRouteReady("rooftop", { destination: "rooftop", routeProgress: "0/56" })).toBe(true);
  });


  it("separates the final top-tread clearance from the later upper-side landing", () => {
    const topTreadClearance = {
      position: [0, 4.65, -4.2],
      zone: "upper",
    };
    const upperSideLanding = {
      position: [0.925, 4.65, -2.8],
      zone: "upper",
    };

    expect(isCameraPhaseMatch("lower-stair-clearance", topTreadClearance)).toBe(true);
    expect(isCameraPhaseMatch("upper-side-landing", topTreadClearance)).toBe(false);
    expect(isCameraPhaseMatch("upper-side-landing", upperSideLanding)).toBe(true);
    expect(isCameraPhaseMatch("lower-stair-clearance", upperSideLanding)).toBe(false);
  });

  it("keeps the roof hatch-clear phase distinct from the earlier roof stair flight", () => {
    const roofFlight = { position: [0, 5.9, -1.0], zone: "upper" };
    const firstRoofTreads = { position: [0, 4.82, 1.88], zone: "upper" };
    const clearRoofDeck = { position: [1.25, 7.2, -2.35], zone: "roof" };

    expect(isCameraPhaseMatch("roof-stair-flight", firstRoofTreads)).toBe(true);
    expect(isCameraPhaseMatch("roof-stair-flight", roofFlight)).toBe(true);
    expect(isCameraPhaseMatch("roof-hatch-clear", roofFlight)).toBe(false);
    expect(isCameraPhaseMatch("roof-hatch-clear", clearRoofDeck)).toBe(true);
  });
});

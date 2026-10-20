import { describe, expect, it } from "vitest";
import { CAMERA_PHASE_RULES, isCameraPhaseMatch, isCameraRouteReady } from "./visualReviewPhases.mjs";

describe("browser-review stair camera phases", () => {
  it("waits for the selected destination to own a populated route before starting phase capture", () => {
    expect(isCameraRouteReady("rooftop", {
      destination: "family-table", routeProgress: "0/0",
    })).toBe(false);
    expect(isCameraRouteReady("rooftop", {
      destination: "rooftop", routeProgress: "0/0",
    })).toBe(false);
    expect(isCameraRouteReady("rooftop", {
      destination: "rooftop", routeProgress: "0/56",
    })).toBe(true);
    expect(isCameraRouteReady("rooftop", {
      destination: "rooftop", routeProgress: "3/56",
    })).toBe(true);
  });


  it("recognizes the roof deck only after the camera steps sideways clear of the hatch", () => {
    expect(isCameraPhaseMatch("roof-hatch-clear", {
      // The camera has exited the 1.65m-wide hatch to the right-side roof deck.
      position: [1.05, 6.74, -2.45],
      zone: "roof",
    })).toBe(true);
  });

  it("does not mistake the upper landing or stair flight for the roof hatch exit", () => {
    expect(isCameraPhaseMatch("roof-hatch-clear", {
      position: [0.12, 6.74, -2.45],
      zone: "upper",
    })).toBe(false);
    expect(isCameraPhaseMatch("roof-hatch-clear", {
      position: [0.12, 6.62, -2.45],
      zone: "roof",
    })).toBe(false);
    expect(isCameraPhaseMatch("roof-hatch-clear", {
      position: [1.3, 7.1, -0.4],
      zone: "roof",
    })).toBe(false);
  });

  it("separates the mid-flight view from the final-three-treads clearance band", () => {
    expect(isCameraPhaseMatch("lower-stair-midflight", {
      position: [0, 3.2, -2.36], zone: "ground",
    })).toBe(true);
    expect(isCameraPhaseMatch("lower-stair-clearance", {
      position: [0, 3.2, -2.36], zone: "ground",
    })).toBe(false);
    expect(isCameraPhaseMatch("lower-stair-midflight", {
      // A real browser fallback crossed here while the narrow window was missed.
      position: [0, 2.862, -1.924], zone: "ground",
    })).toBe(true);
    expect(isCameraPhaseMatch("lower-stair-midflight", {
      // The destination doorway/base is not yet mid-flight.
      position: [0, 1.9, -0.7], zone: "ground",
    })).toBe(false);
    expect(isCameraPhaseMatch("lower-stair-midflight", {
      // The upper landing belongs to its own phase window.
      position: [0.925, 4.65, -3.368], zone: "upper",
    })).toBe(false);
    expect(isCameraPhaseMatch("lower-stair-clearance", {
      position: [0, 4.65, -4.2], zone: "upper",
    })).toBe(true);
    expect(isCameraPhaseMatch("lower-stair-clearance", {
      position: [0, 4.35, -4.2], zone: "upper",
    })).toBe(true);
    expect(isCameraPhaseMatch("lower-stair-clearance", {
      position: [0, 4.139, -3.55], zone: "ground",
    })).toBe(false);
    expect(isCameraPhaseMatch("lower-stair-clearance", {
      position: [0, 4.0, -4.2], zone: "upper",
    })).toBe(false);
    expect(isCameraPhaseMatch("lower-stair-clearance", {
      position: [0, 4.65, -3.2], zone: "upper",
    })).toBe(false);
    expect(isCameraPhaseMatch("lower-stair-flight", {
      position: [0, 3.5, -2.6], zone: "ground",
    })).toBe(true);
  });

  it("keeps the upper landing windows distinct", () => {
    expect(isCameraPhaseMatch("upper-side-landing", {
      // Real right-side bridge-lane pose from the shared house layout.
      position: [0.925, 4.65, -2.8], zone: "upper",
    })).toBe(true);
    expect(isCameraPhaseMatch("upper-side-landing", {
      position: [0.2, 4.65, -2.8], zone: "upper",
    })).toBe(false);
    expect(isCameraPhaseMatch("upper-side-landing", {
      // Camera is on the side lane and has reached the turn but not yet the central landing.
      position: [0.925, 4.65, -3.368], zone: "upper",
    })).toBe(true);
  });
});

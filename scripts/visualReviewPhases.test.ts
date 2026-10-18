import { describe, expect, it } from "vitest";
import { CAMERA_PHASE_RULES, isCameraPhaseMatch } from "./visualReviewPhases.mjs";

describe("browser-review stair camera phases", () => {
  it("recognizes the roof hatch as soon as the camera clears the opening", () => {
    expect(isCameraPhaseMatch("roof-hatch-clear", {
      position: [0.12, 6.74, -2.45],
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
      position: [0, 2.914, -1.991], zone: "ground",
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
  });
});

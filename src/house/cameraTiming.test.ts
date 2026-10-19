import { describe, expect, it } from "vitest";
import {
  getCameraFrameDeltas,
  MAX_CAMERA_MOVEMENT_DELTA_SECONDS,
  MAX_CAMERA_ROTATION_DELTA_SECONDS,
  MAX_VISUAL_REVIEW_HOLD_MS,
  shouldHoldCameraForVisualReview,
} from "./cameraTiming";

describe("camera movement timing", () => {
  it("preserves normal frame timing at interactive frame rates", () => {
    expect(getCameraFrameDeltas(1 / 60)).toEqual({
      movementDelta: 1 / 60,
      rotationDelta: 1 / 60,
    });
  });

  it("lets translation catch up on slow frames while keeping rotation bounded", () => {
    expect(getCameraFrameDeltas(0.4)).toEqual({
      movementDelta: 0.4,
      rotationDelta: MAX_CAMERA_ROTATION_DELTA_SECONDS,
    });
  });

  it("bounds large or invalid frame times after suspension", () => {
    expect(getCameraFrameDeltas(3)).toEqual({
      movementDelta: MAX_CAMERA_MOVEMENT_DELTA_SECONDS,
      rotationDelta: MAX_CAMERA_ROTATION_DELTA_SECONDS,
    });
    expect(getCameraFrameDeltas(-2)).toEqual({movementDelta:0,rotationDelta:0});
    expect(getCameraFrameDeltas(Number.NaN)).toEqual({movementDelta:0,rotationDelta:0});
  });
});

describe("visual-review camera hold safety fuse", () => {
  it("allows a requested hold while its screenshot deadline is still live", () => {
    expect(shouldHoldCameraForVisualReview({
      activeTokenCount: 1, forceHold: false, holdUntilMs: 10_000, nowMs: 9_999,
    })).toBe(true);
    expect(MAX_VISUAL_REVIEW_HOLD_MS).toBe(50_000);
  });

  it("releases a stale token/flag after its deadline", () => {
    expect(shouldHoldCameraForVisualReview({
      activeTokenCount: 2, forceHold: true, holdUntilMs: 10_000, nowMs: 10_000,
    })).toBe(false);
  });

  it("does not pause normal navigation when no review hold is requested", () => {
    expect(shouldHoldCameraForVisualReview({
      activeTokenCount: 0, forceHold: false, holdUntilMs: 10_000, nowMs: 9_000,
    })).toBe(false);
  });

  it("fails open to movement when a hold deadline is missing or invalid", () => {
    for (const holdUntilMs of [undefined, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(shouldHoldCameraForVisualReview({
        activeTokenCount: 1, forceHold: true, holdUntilMs, nowMs: 9_000,
      })).toBe(false);
    }
  });
});


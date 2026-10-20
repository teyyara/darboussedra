import { describe, expect, it } from "vitest";
import {
  getCameraFrameDeltas,
  getCameraFrameLoopMode,
  shouldAutoUpdateShadowMap,
  getDirectionalShadowMapSize,
  MAX_CAMERA_MOVEMENT_DELTA_SECONDS,
  MAX_CAMERA_ROTATION_DELTA_SECONDS,
  MAX_VISUAL_REVIEW_HOLD_MS,
  getActiveVisualReviewHoldTokens,
} from "./cameraTiming";

describe("camera movement timing", () => {
  it("renders continuously during camera navigation and idles on demand", () => {
    expect(getCameraFrameLoopMode(true)).toBe("always");
    expect(getCameraFrameLoopMode(false)).toBe("demand");
  });

  it("caches shadow maps and lowers their resolution only while travelling", () => {
    expect(shouldAutoUpdateShadowMap(true)).toBe(false);
    expect(shouldAutoUpdateShadowMap(false)).toBe(true);
    expect(getDirectionalShadowMapSize(true)).toBe(1024);
    expect(getDirectionalShadowMapSize(false)).toBe(2048);
  });

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

describe("visual-review camera hold expiry", () => {
  it("holds a screenshot token only while its own deadline is live", () => {
    expect(getActiveVisualReviewHoldTokens({
      tokens: ["upper-landing"],
      deadlines: { "upper-landing": 10_000 },
      nowMs: 9_999,
    })).toEqual(["upper-landing"]);
    expect(MAX_VISUAL_REVIEW_HOLD_MS).toBe(50_000);
  });

  it("expires a stuck token without extending it because another token has a later deadline", () => {
    expect(getActiveVisualReviewHoldTokens({
      tokens: ["upper-landing", "roof-hatch"],
      deadlines: { "upper-landing": 10_000, "roof-hatch": 10_500 },
      nowMs: 10_001,
    })).toEqual(["roof-hatch"]);
  });

  it("fails open when a token has no valid deadline", () => {
    expect(getActiveVisualReviewHoldTokens({
      tokens: ["missing", "nan", "infinite"],
      deadlines: { nan: Number.NaN, infinite: Number.POSITIVE_INFINITY },
      nowMs: 9_000,
    })).toEqual([]);
  });

  it("does not pause normal navigation when there are no review tokens", () => {
    expect(getActiveVisualReviewHoldTokens({
      tokens: [],
      deadlines: { stale: 10_000 },
      nowMs: 9_000,
    })).toEqual([]);
  });

  it("fails open if the wall clock is invalid", () => {
    expect(getActiveVisualReviewHoldTokens({
      tokens: ["token"],
      deadlines: { token: 10_000 },
      nowMs: Number.NaN,
    })).toEqual([]);
  });
});

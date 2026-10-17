import { describe, expect, it } from "vitest";
import {
  getCameraFrameDeltas,
  MAX_CAMERA_MOVEMENT_DELTA_SECONDS,
  MAX_CAMERA_ROTATION_DELTA_SECONDS,
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

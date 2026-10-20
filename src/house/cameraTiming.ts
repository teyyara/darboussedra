/**
 * Camera movement timing.
 *
 * Keep translational progress tied to elapsed time on slower renderers, while
 * bounding a single frame's movement after background-tab suspension. Camera
 * rotation uses a tighter bound to avoid sudden heading flips.
 */
export const MAX_CAMERA_MOVEMENT_DELTA_SECONDS = 0.45;
export const MAX_CAMERA_ROTATION_DELTA_SECONDS = 0.2;

export function getCameraFrameDeltas(deltaSeconds: number): {
  movementDelta: number;
  rotationDelta: number;
} {
  const elapsed = Number.isFinite(deltaSeconds) ? Math.max(0, deltaSeconds) : 0;
  return {
    movementDelta: Math.min(elapsed, MAX_CAMERA_MOVEMENT_DELTA_SECONDS),
    rotationDelta: Math.min(elapsed, MAX_CAMERA_ROTATION_DELTA_SECONDS),
  };
}

/** Maximum time the browser review harness may pause a camera for one still. */
export const MAX_VISUAL_REVIEW_HOLD_MS = 50_000;

/**
 * Render continuously only while the camera is travelling. A demand-only loop can
 * otherwise stall a multi-waypoint camera path on software-rendered browsers.
 */
export function getCameraFrameLoopMode(isNavigating: boolean): "always" | "demand" {
  return isNavigating ? "always" : "demand";
}

/**
 * Return only holds whose own deadline remains live. Deadlines are per token so
 * a later screenshot cannot renew an older screenshot's stuck hold.
 */
export function getActiveVisualReviewHoldTokens(args: {
  readonly tokens: readonly string[];
  readonly deadlines: Readonly<Record<string, number>> | undefined;
  readonly nowMs: number;
}): string[] {
  if (!Number.isFinite(args.nowMs)) return [];
  return args.tokens.filter((token) => {
    const deadline = args.deadlines?.[token];
    return typeof deadline === "number" &&
      Number.isFinite(deadline) &&
      args.nowMs < deadline;
  });
}

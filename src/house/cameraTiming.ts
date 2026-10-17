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

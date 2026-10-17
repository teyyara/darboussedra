import type { Vector3Tuple } from "./rooms";

export interface SkyCloud {
  readonly position: Vector3Tuple;
  readonly size: Vector3Tuple;
  readonly opacity: number;
}

export interface SkyCloudGroup {
  /** X/Z follow the camera, while Y is a world-height coordinate. */
  readonly position: Vector3Tuple;
  readonly clouds: readonly SkyCloud[];
}

/** Sun and halo are separate meshes at the same camera-relative position. */
export const SKY_SUN_POSITION: Vector3Tuple = [-28, 12, -60];

export const SKY_CLOUD_GROUPS: readonly SkyCloudGroup[] = [
  {
    position: [-18, 12, -72],
    clouds: [
      { position: [0, 0, 0], size: [4.5, 1.25, 0.5], opacity: 0.58 },
      { position: [-2.3, -0.25, 0.05], size: [2.7, 1.0, 0.45], opacity: 0.58 },
      { position: [2.2, -0.18, -0.08], size: [2.9, 0.92, 0.45], opacity: 0.58 },
    ],
  },
  {
    // This second, smaller cluster stays within the broad desktop view rather than
    // being placed so far to the side that it can never be seen.
    position: [-5, 12, -78],
    clouds: [
      { position: [0, 0, 0], size: [3.5, 0.96, 0.45], opacity: 0.48 },
      { position: [-1.9, -0.18, 0], size: [2.1, 0.72, 0.4], opacity: 0.48 },
      { position: [1.7, -0.1, 0.04], size: [2.2, 0.75, 0.42], opacity: 0.48 },
    ],
  },
];

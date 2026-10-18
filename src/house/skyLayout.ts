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

/** The sun is one clean disc; avoid translucent oversized layers that look like rings. */
export const SKY_SUN_POSITION: Vector3Tuple = [-28, 34, -60];

/** Ellipsoid lobes overlap to read as soft, rounded clouds instead of flat white streaks. */
export const SKY_CLOUD_GROUPS: readonly SkyCloudGroup[] = [
  {
    position: [-23.5, 31, -72],
    clouds: [
      { position: [0, 0, 0], size: [3.4, 1.05, 0.65], opacity: 0.78 },
      { position: [-1.75, -0.1, 0.03], size: [1.75, 0.9, 0.6], opacity: 0.78 },
      { position: [1.7, -0.03, -0.02], size: [1.95, 0.92, 0.62], opacity: 0.78 },
      { position: [-0.58, 0.52, -0.08], size: [1.8, 1.1, 0.62], opacity: 0.78 },
      { position: [0.82, 0.48, 0.02], size: [1.4, 0.82, 0.56], opacity: 0.78 },
      { position: [-2.1, -0.3, -0.04], size: [1.1, 0.62, 0.48], opacity: 0.78 },
    ],
  },
  {
    position: [-8, 32.5, -78],
    clouds: [
      { position: [0, 0, 0], size: [2.7, 0.9, 0.56], opacity: 0.7 },
      { position: [-1.25, 0.03, 0.02], size: [1.45, 0.76, 0.5], opacity: 0.7 },
      { position: [1.25, 0.02, -0.02], size: [1.5, 0.75, 0.5], opacity: 0.7 },
      { position: [-0.2, 0.45, -0.06], size: [1.45, 0.74, 0.5], opacity: 0.7 },
      { position: [1.72, -0.12, 0.04], size: [0.9, 0.57, 0.45], opacity: 0.7 },
    ],
  },
];

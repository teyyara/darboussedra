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
    position: [-18, 31, -72],
    clouds: [
      { position: [0, 0, 0], size: [2.85, 0.78, 0.58], opacity: 0.78 },
      { position: [-1.55, -0.08, 0.03], size: [1.55, 0.72, 0.55], opacity: 0.78 },
      { position: [1.5, -0.05, -0.02], size: [1.65, 0.7, 0.56], opacity: 0.78 },
      { position: [-0.58, 0.42, -0.08], size: [1.55, 0.72, 0.54], opacity: 0.78 },
      { position: [0.82, 0.34, 0.02], size: [1.18, 0.58, 0.5], opacity: 0.78 },
      { position: [-2.05, -0.22, -0.04], size: [0.92, 0.46, 0.43], opacity: 0.78 },
    ],
  },
  {
    position: [-5, 32.5, -78],
    clouds: [
      { position: [0, 0, 0], size: [2.35, 0.65, 0.5], opacity: 0.7 },
      { position: [-1.12, 0.04, 0.02], size: [1.28, 0.57, 0.47], opacity: 0.7 },
      { position: [1.12, 0.02, -0.02], size: [1.3, 0.55, 0.46], opacity: 0.7 },
      { position: [-0.2, 0.36, -0.06], size: [1.24, 0.52, 0.44], opacity: 0.7 },
      { position: [1.72, -0.1, 0.04], size: [0.77, 0.42, 0.4], opacity: 0.7 },
    ],
  },
];

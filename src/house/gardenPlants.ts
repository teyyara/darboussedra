import type { Vector3Tuple } from "./rooms";

export interface OliveBranch {
  readonly position: Vector3Tuple;
  readonly rotation: Vector3Tuple;
  readonly length: number;
}

export interface OliveCrown {
  readonly position: Vector3Tuple;
  readonly scale: Vector3Tuple;
  readonly color: string;
}

export interface GardenTree {
  readonly key: string;
  readonly x: number;
  /** Local Z measured from the garden center. */
  readonly z: number;
  readonly trunkHeight: number;
  readonly branches: readonly OliveBranch[];
  readonly crowns: readonly OliveCrown[];
}

export interface GardenShrub {
  readonly key: string;
  readonly x: number;
  readonly z: number;
  readonly scale: Vector3Tuple;
  readonly color: string;
}

/** Small olive-tree silhouettes designed to sit behind the entrance path. */
export const GARDEN_TREES: readonly GardenTree[] = [
  {
    key: "left-olive",
    x: -2.72,
    z: -1.35,
    trunkHeight: 1.12,
    branches: [
      { position: [-0.18, 1.14, 0], rotation: [0, 0, -0.56], length: 0.56 },
      { position: [0.2, 1.22, 0.02], rotation: [0, 0, 0.5], length: 0.54 },
      { position: [0.03, 1.42, -0.02], rotation: [0.16, 0, 0.12], length: 0.4 },
    ],
    crowns: [
      { position: [0, 1.67, 0], scale: [0.68, 0.57, 0.63], color: "#78866c" },
      { position: [-0.38, 1.55, 0.06], scale: [0.43, 0.42, 0.48], color: "#8b9979" },
      { position: [0.37, 1.61, 0.05], scale: [0.46, 0.43, 0.5], color: "#849271" },
      { position: [0.08, 1.98, -0.03], scale: [0.43, 0.44, 0.45], color: "#96a181" },
    ],
  },
  {
    key: "right-olive",
    x: 2.72,
    z: -1.18,
    trunkHeight: 1.02,
    branches: [
      { position: [-0.16, 1.08, 0], rotation: [0.05, 0, -0.52], length: 0.5 },
      { position: [0.18, 1.1, 0.02], rotation: [-0.06, 0, 0.54], length: 0.48 },
      { position: [0.01, 1.32, -0.02], rotation: [0.14, 0, 0.08], length: 0.38 },
    ],
    crowns: [
      { position: [0.02, 1.56, 0], scale: [0.66, 0.54, 0.62], color: "#7b896d" },
      { position: [-0.34, 1.48, 0.08], scale: [0.43, 0.4, 0.45], color: "#909b7c" },
      { position: [0.34, 1.52, 0.04], scale: [0.45, 0.41, 0.49], color: "#84916f" },
      { position: [0.1, 1.87, -0.02], scale: [0.4, 0.4, 0.43], color: "#99a483" },
    ],
  },
];

export const GARDEN_SHRUBS: readonly GardenShrub[] = [
  { key: "edge-left-1", x: -3.22, z: -0.85, scale: [0.28, 0.24, 0.3], color: "#8b9878" },
  { key: "edge-left-2", x: -2.62, z: -0.94, scale: [0.32, 0.28, 0.31], color: "#79886c" },
  { key: "edge-right-1", x: 3.22, z: -0.78, scale: [0.28, 0.24, 0.3], color: "#899676" },
  { key: "edge-right-2", x: 2.62, z: -0.9, scale: [0.32, 0.28, 0.31], color: "#77866a" },
];

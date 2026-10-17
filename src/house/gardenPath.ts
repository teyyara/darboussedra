import type { Vector3Tuple } from "./rooms";

export interface GardenPaver {
  readonly key: string;
  /** Offsets are local to the garden center. */
  readonly position: Vector3Tuple;
  readonly size: Vector3Tuple;
  readonly rotationY: number;
  readonly color: string;
}

/** A lightly staggered route from the porch into the garden, with joints of visible grass. */
export function getGardenPavers(): GardenPaver[] {
  const stones = [
    { x: 0.02, z: -1.35, rotationY: 0.035, color: "#c4b69d" },
    { x: -0.08, z: -0.72, rotationY: -0.045, color: "#b8a98f" },
    { x: 0.055, z: -0.09, rotationY: 0.028, color: "#d0c0a4" },
    { x: -0.055, z: 0.54, rotationY: -0.025, color: "#c0b198" },
    { x: 0.09, z: 1.17, rotationY: 0.04, color: "#d1c1a6" },
    { x: 0.015, z: 1.8, rotationY: -0.03, color: "#beb096" },
  ];
  return stones.map((stone, index) => ({
    key: "garden-paver-" + index,
    position: [stone.x, 0.027, stone.z],
    size: [0.68 - (index % 2) * 0.035, 0.06, 0.45 - (index % 3) * 0.025],
    rotationY: stone.rotationY,
    color: stone.color,
  }));
}

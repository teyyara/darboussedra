export interface RoofRectangle {
  readonly position: readonly [number, number];
  readonly size: readonly [number, number];
}

/** Rooftop decor is kept in the side nook, away from the central stair-hatch/walkway lane. */
export const ROOF_SEATING_RUG: RoofRectangle = {
  position: [-3.55, -1.35],
  size: [2.65, 1.65],
};

export const ROOF_TEA_TABLE: RoofRectangle = {
  position: [-2.25, 0.05],
  size: [0.95, 0.68],
};

export const ROOF_TEA_STOOLS: readonly RoofRectangle[] = [
  { position: [-3.05, 0.05], size: [0.42, 0.42] },
  { position: [-1.45, 0.05], size: [0.42, 0.42] },
];

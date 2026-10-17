export type PropDimensions = readonly [width: number, height: number, depth: number];

/**
 * Return a scale-aware bevel radius for furniture and small architectural props.
 * Never exceeds 22% of the thinnest dimension, so thin table tops, trim and chair legs
 * remain legible rather than collapsing into a capsule shape.
 */
export function getPropCornerRadius(size: PropDimensions): number {
  const smallestDimension = Math.min(...size.map((dimension) => Math.abs(dimension)));
  if (!Number.isFinite(smallestDimension) || smallestDimension <= 0) return 0.002;
  return Math.max(0.002, Math.min(0.055, smallestDimension * 0.22));
}

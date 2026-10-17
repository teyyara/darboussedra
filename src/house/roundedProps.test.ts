import { describe, expect, it } from "vitest";
import { getPropCornerRadius } from "./roundedProps";

describe("scale-aware rounded prop geometry", () => {
  it("adds a soft but restrained bevel to furniture", () => {
    expect(getPropCornerRadius([2.65, 0.66, 2.35])).toBeCloseTo(0.055);
  });

  it("keeps thin tabletops and shelves from rounding away", () => {
    expect(getPropCornerRadius([2.65, 0.035, 2.35])).toBeCloseTo(0.0077);
  });

  it("keeps narrow chair legs nearly cylindrical without exceeding the radius cap", () => {
    expect(getPropCornerRadius([0.055, 0.3, 0.055])).toBeCloseTo(0.0121);
    expect(getPropCornerRadius([1, 1, 1])).toBe(0.055);
  });

  it("handles invalid dimensions safely", () => {
    expect(getPropCornerRadius([0, 1, 1])).toBe(0.002);
    expect(getPropCornerRadius([Number.NaN, 1, 1])).toBe(0.002);
  });
});

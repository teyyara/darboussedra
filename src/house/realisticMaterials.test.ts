import { describe, expect, it } from "vitest";
import { inferSurfaceKind } from "./realisticMaterials";

const base = {
  roughness: 0.92,
  metalness: 0,
  emissiveIntensity: 0,
  width: 2,
  height: 2.5,
  depth: 0.12,
};

describe("procedural surface material selection", () => {
  it("adds plaster relief to matte warm walls", () => {
    expect(inferSurfaceKind({ ...base, hue: 0.09, saturation: 0.18, lightness: 0.78 }))
      .toBe("plaster");
  });

  it("uses a wood grain on dark warm trim and doors", () => {
    expect(inferSurfaceKind({ ...base, hue: 0.075, saturation: 0.39, lightness: 0.34 }))
      .toBe("wood");
  });

  it("keeps wide padded furniture from receiving wood grain", () => {
    expect(inferSurfaceKind({
      ...base, hue: 0.075, saturation: 0.32, lightness: 0.4,
      width: 2.2, height: 0.62, depth: 0.16,
    })).toBe("fabric");
  });

  it("adds subtle tile variation to a broad horizontal floor surface", () => {
    expect(inferSurfaceKind({
      ...base, hue: 0.1, saturation: 0.16, lightness: 0.7,
      width: 5.5, height: 0.18, depth: 4.5,
    })).toBe("stone");
  });

  it("leaves glossy glass and reflective metal unmodified", () => {
    expect(inferSurfaceKind({ ...base, hue: 0.55, saturation: 0.1, lightness: 0.6, roughness: 0.3 }))
      .toBeNull();
    expect(inferSurfaceKind({ ...base, hue: 0.58, saturation: 0.08, lightness: 0.65, metalness: 0.5 }))
      .toBeNull();
  });

  it("leaves foliage and the huge environment plane unmodified", () => {
    expect(inferSurfaceKind({ ...base, hue: 0.3, saturation: 0.35, lightness: 0.52 }))
      .toBeNull();
    expect(inferSurfaceKind({ ...base, hue: 0.12, saturation: 0.09, lightness: 0.7, width: 220, height: 0.001, depth: 220 }))
      .toBeNull();
  });
});

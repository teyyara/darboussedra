import { describe, expect, it } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import { EXTERIOR_CAMERA, HOUSE_LAYOUT } from "./rooms";
import { SKY_CLOUD_GROUPS, SKY_SUN_POSITION } from "./skyLayout";

function projectedExteriorFeature(offset: Vector3TupleLike) {
  const camera = new PerspectiveCamera(66, 1440 / 1000, 0.1, 120);
  camera.position.set(...EXTERIOR_CAMERA.position);
  camera.lookAt(new Vector3(...EXTERIOR_CAMERA.target));
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  const worldPosition = new Vector3(
    camera.position.x + offset[0],
    offset[1],
    camera.position.z + offset[2],
  );
  return worldPosition.project(camera);
}

type Vector3TupleLike = readonly [number, number, number];

describe("exterior sky framing", () => {
  it("keeps the sun in the first-person exterior camera frustum instead of clipping it overhead", () => {
    const ndc = projectedExteriorFeature(SKY_SUN_POSITION);
    expect(ndc.z).toBeGreaterThan(-1);
    expect(ndc.z).toBeLessThan(1);
    expect(ndc.x).toBeGreaterThan(-0.95);
    expect(ndc.x).toBeLessThan(0.95);
    expect(ndc.y).toBeGreaterThan(-0.7);
    expect(ndc.y).toBeLessThan(0.9);
  });

  it("uses several soft rounded lobes per cloud group rather than flat halo-like streaks", () => {
    expect(SKY_CLOUD_GROUPS.every((group) => group.clouds.length >= 5)).toBe(true);
    expect(SKY_CLOUD_GROUPS.flatMap((group) => group.clouds).every((cloud) =>
      cloud.size[1] > 0.8 && cloud.size[2] > 0.6 && cloud.size[0] / cloud.size[1] < 4.5,
    )).toBe(true);
  });

  it("keeps rounded clouds above the main roof silhouette, not hidden behind the facade", () => {
    const centers = SKY_CLOUD_GROUPS.map((group) => projectedExteriorFeature(group.position));
    const frontZ = HOUSE_LAYOUT.exterior.depth / 2;
    const roofTop = projectedExteriorFeature([
      0,
      HOUSE_LAYOUT.roofY + 0.38,
      frontZ - EXTERIOR_CAMERA.position[2],
    ]);
    expect(centers.every((point) =>
      point.x > -0.85 && point.x < 0.85 && point.y > roofTop.y + 0.04 && point.y < 0.88,
    )).toBe(true);
    expect(centers.every((point) => point.z > -1 && point.z < 1)).toBe(true);
  });
});

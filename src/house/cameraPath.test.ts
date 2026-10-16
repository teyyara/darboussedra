import {describe, expect, it} from "vitest";
import {HOUSE_LAYOUT, EXTERIOR_CAMERA} from "./rooms";
import {makeCameraPath} from "./cameraPath";

const frontZ = HOUSE_LAYOUT.exterior.depth / 2;
const doorHeight = HOUSE_LAYOUT.entrance.doorHeight;

describe("3D camera paths", () => {
  it("enters through the front opening before rising above the wall", () => {
    const path = makeCameraPath("exterior", "entrance", EXTERIOR_CAMERA);
    expect(path).toHaveLength(5);

    const outsideDoor = path[1];
    const insideDoor = path[2];
    expect(outsideDoor.position[0]).toBe(0);
    expect(outsideDoor.position[2]).toBeGreaterThan(frontZ);
    expect(insideDoor.position[0]).toBe(0);
    expect(insideDoor.position[2]).toBeLessThan(frontZ);
    expect(outsideDoor.position[1]).toBeLessThan(doorHeight);
    expect(insideDoor.position[1]).toBeLessThan(doorHeight);

    const raisedInside = path[3];
    expect(raisedInside.position[2]).toBeLessThan(frontZ);
    expect(raisedInside.position[1]).toBeGreaterThan(HOUSE_LAYOUT.exterior.wallHeight);
  });

  it("exits through the same doorway in reverse at a passable eye height", () => {
    const path = makeCameraPath("entrance", "exterior", EXTERIOR_CAMERA);
    const insideDoor = path[1];
    const outsideDoor = path[2];

    expect(insideDoor.position[2]).toBeLessThan(frontZ);
    expect(outsideDoor.position[2]).toBeGreaterThan(frontZ);
    expect(insideDoor.position[0]).toBe(0);
    expect(outsideDoor.position[0]).toBe(0);
    expect(insideDoor.position[1]).toBeLessThan(doorHeight);
    expect(outsideDoor.position[1]).toBeLessThan(doorHeight);
  });

  it("brings garden-to-room transitions back to the front opening", () => {
    const path = makeCameraPath("garden", "family-table", EXTERIOR_CAMERA);
    expect(path[1].position[2]).toBeGreaterThan(frontZ);
    expect(path[2].position[2]).toBeLessThan(frontZ);
    expect(path[1].position[1]).toBeLessThan(doorHeight);
    expect(path[2].position[1]).toBeLessThan(doorHeight);
  });

  it("keeps rooftop transitions above the roof before using the stair opening", () => {
    const path = makeCameraPath("family-table", "rooftop", EXTERIOR_CAMERA);
    expect(path[0].position[1]).toBeGreaterThan(HOUSE_LAYOUT.roofY);
    expect(path[1].position[1]).toBeGreaterThan(HOUSE_LAYOUT.roofY);
  });
});

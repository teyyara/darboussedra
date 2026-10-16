import {describe, expect, it} from "vitest";
import {EXTERIOR_CAMERA, HOUSE_LAYOUT, getRoomBySlug, roomBounds, rooms} from "./rooms";
import {makeCameraPath} from "./cameraPath";

const frontZ = HOUSE_LAYOUT.exterior.depth / 2;
const doorHeight = HOUSE_LAYOUT.entrance.doorHeight;
const poseFor = (slug: string) => getRoomBySlug(slug)!.camera;

describe("3D camera paths", () => {
  it("uses standing eye-height, forward-facing views for every destination", () => {
    for (const room of rooms) {
      expect(room.camera.position[1], room.slug + " eye height").toBeCloseTo(room.scenePosition[1] + 1.65);
      const verticalLook = Math.abs(room.camera.target[1] - room.camera.position[1]);
      if (room.slug === "rooftop") {
        expect(verticalLook, "rooftop looks slightly down across the terrace").toBeGreaterThan(0.5);
        expect(verticalLook).toBeLessThan(1.0);
      } else if (room.slug === "garden") {
        expect(verticalLook, "garden view keeps the door and ground in frame").toBeLessThan(0.35);
      } else {
        expect(verticalLook, room.slug + " look angle").toBeLessThan(0.1);
      }
    }
    expect(EXTERIOR_CAMERA.position[1]).toBeGreaterThan(doorHeight);
    expect(EXTERIOR_CAMERA.position[1]).toBeLessThan(HOUSE_LAYOUT.exterior.wallHeight);
    expect(EXTERIOR_CAMERA.position[0]).toBeGreaterThan(HOUSE_LAYOUT.exterior.width / 2);
    expect(EXTERIOR_CAMERA.position[2]).toBeGreaterThan(frontZ);
    expect(Math.abs(EXTERIOR_CAMERA.target[0])).toBeLessThan(1);
    expect(EXTERIOR_CAMERA.target[2]).toBeLessThan(frontZ);
    expect(EXTERIOR_CAMERA.target[1]).toBeLessThan(EXTERIOR_CAMERA.position[1]);
  });

  it("keeps every destination camera and focus point inside the room named by the route", () => {
    for (const room of rooms) {
      const bounds = roomBounds(room);
      for (const [label, point] of [["camera", room.camera.position], ["focus", room.camera.target]] as const) {
        expect(point[0], room.slug + " " + label + " X").toBeGreaterThan(bounds.minX + 0.01);
        expect(point[0], room.slug + " " + label + " X").toBeLessThan(bounds.maxX - 0.01);
        expect(point[2], room.slug + " " + label + " Z").toBeGreaterThan(bounds.minZ + 0.01);
        expect(point[2], room.slug + " " + label + " Z").toBeLessThan(bounds.maxZ - 0.01);
      }
    }
  });

  it("walks through the real front opening before entering the entrance", () => {
    const path = makeCameraPath("exterior", "entrance", poseFor("entrance"));
    expect(path.length).toBeGreaterThanOrEqual(4);
    const outsideThreshold = path.find((pose) => pose.position[2] > frontZ && Math.abs(pose.position[0]) < 0.1);
    const insideThreshold = path.find((pose) => pose.position[2] < frontZ && pose.position[2] > frontZ - 1.2 && Math.abs(pose.position[0]) < 0.1);
    expect(outsideThreshold).toBeDefined();
    expect(insideThreshold).toBeDefined();
    expect(outsideThreshold!.position[1]).toBeLessThan(doorHeight);
    expect(insideThreshold!.position[1]).toBeLessThan(doorHeight);
    expect(path.every((pose) => pose.position[1] < HOUSE_LAYOUT.exterior.wallHeight)).toBe(true);
  });

  it("leaves the house by reversing through the same doorway at eye height", () => {
    const path = makeCameraPath("entrance", "exterior", EXTERIOR_CAMERA);
    const outsideThreshold = path.find((pose) => pose.position[2] > frontZ && Math.abs(pose.position[0]) < 0.1);
    const insideThreshold = path.find((pose) => pose.position[2] < frontZ && pose.position[2] > frontZ - 1.2 && Math.abs(pose.position[0]) < 0.1);
    expect(insideThreshold).toBeDefined();
    expect(outsideThreshold).toBeDefined();
    expect(path.every((pose) => pose.position[1] < HOUSE_LAYOUT.exterior.wallHeight)).toBe(true);
  });

  it("moves between same-floor rooms through their connecting doors without rising overhead", () => {
    const path = makeCameraPath("living-room", "kitchen", poseFor("kitchen"));
    expect(path.length).toBeGreaterThan(4);
    expect(path.every((pose) => Math.abs(pose.position[1] - 1.65) < 0.01)).toBe(true);
    expect(path.some((pose) => pose.position[0] < -1.8)).toBe(true);
    expect(path.some((pose) => pose.position[0] > 1.8)).toBe(true);
    expect(path.every((pose) => pose.position[1] < HOUSE_LAYOUT.exterior.wallHeight)).toBe(true);
  });

  it("travels from the family level to an upper room along the stair flight and bridge", () => {
    const path = makeCameraPath("entrance", "zineb-room", poseFor("zineb-room"));
    const lowStair = path.some((pose) => pose.position[2] > -1 && pose.position[1] > 1.7 && pose.position[1] < 2.5);
    const upperStair = path.some((pose) => pose.position[2] < -3.7 && pose.position[1] > HOUSE_LAYOUT.upperY + 1.4);
    expect(lowStair).toBe(true);
    expect(upperStair).toBe(true);
    expect(path.some((pose) => pose.position[2] > -3.7 && pose.position[2] < 0.45 && pose.position[1] > 4.5)).toBe(true);
    expect(Math.max(...path.map((pose) => pose.position[1]))).toBeLessThan(5.2);
  });

  it("climbs to the rooftop through the roof stair and hatch instead of an overhead camera jump", () => {
    const path = makeCameraPath("family-table", "rooftop", poseFor("rooftop"));
    expect(path.some((pose) => pose.position[1] > HOUSE_LAYOUT.upperY + 1.5 && pose.position[1] < HOUSE_LAYOUT.roofY + 0.5)).toBe(true);
    expect(path.some((pose) => pose.position[2] < HOUSE_LAYOUT.stairs.roofOpening.centerZ + 0.2 && pose.position[2] > HOUSE_LAYOUT.stairs.roofOpening.centerZ - 0.2 && pose.position[1] > HOUSE_LAYOUT.roofY)).toBe(true);
    expect(Math.max(...path.map((pose) => pose.position[1]))).toBeLessThanOrEqual(HOUSE_LAYOUT.roofY + 1.7);
  });

  it("descends from the roof and reaches ground rooms by the stair and doorway route", () => {
    const path = makeCameraPath("rooftop", "prayer-room", poseFor("prayer-room"));
    expect(path.some((pose) => pose.position[1] > HOUSE_LAYOUT.roofY + 1.2)).toBe(true);
    expect(path.some((pose) => pose.position[1] > HOUSE_LAYOUT.upperY + 1.0 && pose.position[1] < HOUSE_LAYOUT.roofY)).toBe(true);
    expect(path.some((pose) => pose.position[1] < 2.0 && pose.position[2] > -0.5)).toBe(true);
    expect(path.at(-1)).toEqual(poseFor("prayer-room"));
    expect(Math.max(...path.map((pose) => pose.position[1]))).toBeLessThanOrEqual(HOUSE_LAYOUT.roofY + 1.7);
  });

  it("leaves the garden through the front threshold before entering the house", () => {
    const path = makeCameraPath("garden", "living-room", poseFor("living-room"));
    expect(path.some((pose) => pose.position[2] > frontZ)).toBe(true);
    expect(path.some((pose) => pose.position[2] < frontZ)).toBe(true);
    expect(path.some((pose) => pose.position[2] < 2.75)).toBe(true);
    expect(path.every((pose) => pose.position[1] < 2.1)).toBe(true);
  });
});

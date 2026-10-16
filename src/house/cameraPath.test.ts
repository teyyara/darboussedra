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
        expect(verticalLook, "rooftop looks down across the terrace instead of at the horizon").toBeGreaterThan(1.0);
        expect(verticalLook).toBeLessThan(1.8);
      } else if (room.slug === "garden") {
        expect(verticalLook, "garden view keeps the ground in frame").toBeLessThan(0.35);
        expect(Math.abs(room.camera.position[0] - room.camera.target[0]), "garden view looks across the garden rather than down the front-door axis").toBeGreaterThan(1.5);
        expect(room.camera.target[2]).toBeGreaterThan(frontZ);
      } else if (room.slug === "family-table" || room.slug === "pets-corner") {
        expect(verticalLook, room.slug + " looks down enough to frame its furniture").toBeGreaterThan(0.3);
        expect(verticalLook).toBeLessThan(0.65);
      } else if (room.slug === "prayer-room") {
        expect(verticalLook, "prayer room camera must include the floor mat").toBeGreaterThan(0.6);
        expect(verticalLook).toBeLessThan(0.75);
      } else {
        expect(verticalLook, room.slug + " slight downward room framing").toBeGreaterThan(0.2);
        expect(verticalLook, room.slug + " remains an eye-level view").toBeLessThan(0.45);
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

  it("keeps the entrance view aligned with the passage and family-table view across the shared room", () => {
    const entrance = poseFor("entrance");
    expect(Math.abs(entrance.position[0] - entrance.target[0])).toBeLessThan(0.05);
    expect(entrance.position[2]).toBeGreaterThan(entrance.target[2]);
    const family = poseFor("family-table");
    expect(family.position[0]).toBeGreaterThan(0.8);
    expect(family.target[0]).toBeLessThan(-0.8);
    expect(family.position[2]).toBeGreaterThan(family.target[2]);
    expect(family.position[2] - family.target[2], "table is framed across the room, not from beside it").toBeGreaterThan(2.0);
  });

  it("frames indoor rooms diagonally across their usable floor rather than at the nearest wall", () => {
    for (const room of rooms.filter((item) => item.kind === "interior" || item.kind === "private" || item.kind === "spiritual")) {
      expect(Math.abs(room.camera.position[0] - room.camera.target[0]), room.slug + " cross-room X view").toBeGreaterThan(0.3);
      expect(Math.abs(room.camera.position[2] - room.camera.target[2]), room.slug + " cross-room Z view").toBeGreaterThan(0.3);
    }
  });

  it("aims room views toward their defining contents instead of blank walls", () => {
    const living = poseFor("living-room");
    const kitchen = poseFor("kitchen");
    const library = poseFor("library");
    const pets = poseFor("pets-corner");
    const prayer = poseFor("prayer-room");
    expect(living.target[2]).toBeLessThan(living.position[2]); // sofa sits toward the back of the living room
    expect(kitchen.target[0]).toBeGreaterThan(kitchen.position[0]); // counter and hob are along the right side
    expect(kitchen.target[2]).toBeLessThan(kitchen.position[2]);
    expect(library.target[0]).toBeLessThan(library.position[0]); // shelves run along the left wall
    expect(pets.target[0]).toBeGreaterThan(pets.position[0]);
    expect(pets.target[2]).toBeLessThan(pets.position[2]); // cat bed and scratch post are toward the rear
    expect(prayer.target[2]).toBeLessThan(prayer.position[2]); // prayer mat lies beyond the entry side
    for (const slug of ["zakariae-room", "zineb-room", "meryem-room", "fatiha-room"]) {
      const bedroom = poseFor(slug);
      expect(bedroom.position[2], slug + " arrives just inside its landing doorway").toBeGreaterThan(0);
      expect(bedroom.target[2], slug + " focus travels into the room").toBeLessThan(-1.0);
    }
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

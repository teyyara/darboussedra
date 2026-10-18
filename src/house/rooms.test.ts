import {describe, expect, it} from "vitest";
import {
  HOUSE_LAYOUT, REQUIRED_ROOM_SLUGS, ROOM_ACCESS_PORTALS, getFrontDoorAction, getRoomBySlug, getRoomPortalOpenings,
  getRoomWallIntervals, getRoomWallRuns, getSharedBoundary, roomBounds, roomOwnsPortalFrame, roomRegistryIssues, rooms,
} from "./rooms";

describe("authoritative room and architectural layout", () => {
  it("contains each required destination exactly once with stable IDs and slugs", () => {
    expect(rooms).toHaveLength(13);
    expect(new Set(rooms.map((room) => room.slug)).size).toBe(13);
    expect(new Set(rooms.map((room) => room.id)).size).toBe(13);
    for (const slug of REQUIRED_ROOM_SLUGS) expect(rooms.filter((room) => room.slug === slug)).toHaveLength(1);
  });
  it("aligns the walkable rooftop with the flat exterior roof and keeps terrace edges inside the shell", () => {
    const rooftop = getRoomBySlug("rooftop")!;
    expect(HOUSE_LAYOUT.exterior.wallHeight).toBe(HOUSE_LAYOUT.roofY);
    expect(rooftop.scenePosition[1]).toBe(HOUSE_LAYOUT.roofY);
    expect(rooftop.footprint[0]).toBeLessThan(HOUSE_LAYOUT.exterior.width);
    expect(rooftop.footprint[1]).toBeLessThan(HOUSE_LAYOUT.exterior.depth);
  });
  it("has no registry, footprint, enclosure, overlap, or declared-connection errors", () => {
    expect(roomRegistryIssues()).toEqual([]);
  });
  it("derives a physical doorway at every declared same-level room connection", () => {
    for (const room of rooms) {
      for (const slug of room.connectedTo) {
        const neighbor = getRoomBySlug(slug);
        expect(neighbor, room.slug + " -> " + slug).toBeDefined();
        expect(getSharedBoundary(room, neighbor!)).toBeDefined();
        const opening = getRoomPortalOpenings(room).find((item) => item.targetSlug === slug);
        expect(opening, room.slug + " portal to " + slug).toBeDefined();
        expect(opening!.width).toBeGreaterThanOrEqual(0.8);
      }
    }
  });
  it("opens all four private rooms onto the shared upper landing rather than into one another", () => {
    const privateRooms = rooms.filter((room) => room.level === "upper");
    expect(privateRooms).toHaveLength(4);
    for (const room of privateRooms) {
      expect(room.connectedTo).toEqual([]);
      expect(ROOM_ACCESS_PORTALS.some((portal) => portal.room === room.slug && portal.zone === "upper-landing")).toBe(true);
      expect(getRoomPortalOpenings(room).some((opening) => opening.zone === "upper-landing")).toBe(true);
    }
    expect(HOUSE_LAYOUT.upperLanding.centerZ - HOUSE_LAYOUT.upperLanding.depth / 2).toBeCloseTo(0.45);
  });
  it("keeps the ground and upper room footprints inside the shell and the garden adjoining the entrance", () => {
    const entrance = getRoomBySlug("entrance")!, garden = getRoomBySlug("garden")!;
    const halfWidth = HOUSE_LAYOUT.exterior.width / 2, halfDepth = HOUSE_LAYOUT.exterior.depth / 2;
    for (const room of rooms.filter((item) => item.level === "ground" || item.level === "upper")) {
      const bounds = roomBounds(room);
      expect(bounds.minX).toBeGreaterThan(-halfWidth + HOUSE_LAYOUT.exterior.wallThickness / 2 - 0.001);
      expect(bounds.maxX).toBeLessThan(halfWidth - HOUSE_LAYOUT.exterior.wallThickness / 2 + 0.001);
      expect(bounds.minZ).toBeGreaterThan(-halfDepth + HOUSE_LAYOUT.exterior.wallThickness / 2 - 0.001);
      expect(bounds.maxZ).toBeLessThan(halfDepth - HOUSE_LAYOUT.exterior.wallThickness / 2 + 0.001);
    }
    const entranceDoor = getSharedBoundary(entrance, garden);
    expect(entranceDoor).toBeDefined();
    expect(entranceDoor?.width).toBe(HOUSE_LAYOUT.entrance.doorWidth);
    expect(getRoomPortalOpenings(entrance).find((opening) => opening.targetSlug === "garden")?.width)
      .toBe(HOUSE_LAYOUT.entrance.doorWidth);
    expect(roomBounds(entrance).maxZ).toBeCloseTo(HOUSE_LAYOUT.exterior.depth / 2 - HOUSE_LAYOUT.exterior.wallThickness / 2);
    expect(getRoomPortalOpenings(getRoomBySlug("family-table")!).some((opening) => opening.zone === "stair-hall" && opening.width >= HOUSE_LAYOUT.stairs.width + 0.14)).toBe(true);
  });
  it("assigns shared partitions and portal frames to one room only", () => {
    const living = getRoomBySlug("living-room")!;
    const family = getRoomBySlug("family-table")!;
    const zakariae = getRoomBySlug("zakariae-room")!;
    const zineb = getRoomBySlug("zineb-room")!;
    expect(getRoomWallIntervals(living, "right")).toHaveLength(1);
    expect(getRoomWallIntervals(family, "left")).toEqual([]);
    expect(getRoomWallIntervals(zakariae, "right")).toHaveLength(1);
    expect(getRoomWallIntervals(zineb, "left")).toEqual([]);
    expect(getRoomWallIntervals(getRoomBySlug("entrance")!, "front")).toEqual([]);
    const livingDoor = getRoomPortalOpenings(living).find((opening) => opening.targetSlug === family.slug)!;
    const familyDoor = getRoomPortalOpenings(family).find((opening) => opening.targetSlug === living.slug)!;
    expect(roomOwnsPortalFrame(living, livingDoor)).toBe(true);
    expect(roomOwnsPortalFrame(family, familyDoor)).toBe(false);
  });
  it("keeps wall segments and decorative trim clear of every declared doorway", () => {
    for (const room of rooms) {
      const openings = getRoomPortalOpenings(room);
      for (const side of ["front", "back", "left", "right"] as const) {
        const runs = getRoomWallRuns(room, side, openings);
        for (const opening of openings.filter((item) => item.side === side)) {
          const openingStart = opening.offset - opening.width / 2;
          const openingEnd = opening.offset + opening.width / 2;
          for (const run of runs) {
            const overlap = Math.min(run.end, openingEnd) - Math.max(run.start, openingStart);
            expect(overlap, room.slug + " " + side + " wall trim must not span a doorway").toBeLessThanOrEqual(0.025);
          }
        }
      }
    }
    const familyTable = getRoomBySlug("family-table")!;
    expect(getRoomWallRuns(familyTable, "back").every((run) =>
      run.end <= -HOUSE_LAYOUT.stairs.groundDoorwayWidth / 2 + 0.025 ||
      run.start >= HOUSE_LAYOUT.stairs.groundDoorwayWidth / 2 - 0.025)).toBe(true);
  });
  it("lets the exterior door enter and the entrance door return outside, without acting as a shortcut from other rooms", () => {
    expect(getFrontDoorAction("exterior")).toBe("enter");
    expect(getFrontDoorAction("entrance")).toBe("exit");
    expect(getFrontDoorAction("family-table")).toBeUndefined();
    expect(getFrontDoorAction("rooftop")).toBeUndefined();
    expect(getFrontDoorAction("map")).toBeUndefined();
  });
  it("keeps the final ground stair tread clear of the rear wall", () => {
    const flight = HOUSE_LAYOUT.stairs.groundFlight;
    const stepRunZ = (flight.to[2] - flight.from[2]) / flight.steps;
    const finalStep = flight.steps - 1;
    const lastTreadMinZ = flight.from[2] + stepRunZ * (finalStep + 0.5) - (Math.abs(stepRunZ) + 0.035) / 2;
    const rearInteriorFaceZ = -HOUSE_LAYOUT.exterior.depth / 2 + HOUSE_LAYOUT.exterior.wallThickness / 2;
    expect(lastTreadMinZ).toBeGreaterThanOrEqual(rearInteriorFaceZ + 0.05);
  });
  it("keeps the family-room camera aim inside its footprint and toward the rear circulation", () => {
    const family = getRoomBySlug("family-table")!;
    const [positionX, , positionZ] = family.camera.position;
    const [targetX, , targetZ] = family.camera.target;
    const bounds = roomBounds(family);
    expect(targetX).toBeGreaterThan(bounds.minX);
    expect(targetX).toBeLessThan(bounds.maxX);
    expect(targetZ).toBeGreaterThan(bounds.minZ);
    expect(targetZ).toBeLessThan(bounds.maxZ);
    expect(targetZ).toBeLessThan(positionZ - 1);
    expect(Math.abs(targetX)).toBeLessThan(HOUSE_LAYOUT.stairs.groundDoorwayWidth / 2 - 0.1);
    expect(positionX).toBeGreaterThan(bounds.minX + 0.25);
    expect(positionX).toBeLessThan(bounds.maxX - 0.25);
    expect(positionZ).toBeLessThan(bounds.maxZ - 0.25);
  });

  it("frames the kitchen counter, rather than the refrigerator, in its first-person destination view", () => {
    const kitchen = getRoomBySlug("kitchen")!;
    const counterCenter = [
      kitchen.scenePosition[0] + kitchen.footprint[0] / 2 - 0.48,
      kitchen.scenePosition[2] - 0.05,
    ];
    const cameraToTarget = [
      kitchen.camera.target[0] - kitchen.camera.position[0],
      kitchen.camera.target[2] - kitchen.camera.position[2],
    ];
    const cameraToCounter = [
      counterCenter[0] - kitchen.camera.position[0],
      counterCenter[1] - kitchen.camera.position[2],
    ];
    expect(cameraToTarget[0] * cameraToCounter[0] + cameraToTarget[1] * cameraToCounter[1]).toBeGreaterThan(0);
    expect(Math.abs(kitchen.camera.target[0] - counterCenter[0])).toBeLessThan(0.5);
    expect(kitchen.camera.target[2]).toBeGreaterThan(kitchen.scenePosition[2] - 0.25);
    expect(kitchen.camera.target[2]).toBeLessThan(kitchen.camera.position[2]);

    const cameraLocalX = kitchen.camera.position[0] - kitchen.scenePosition[0];
    const cameraLocalZ = kitchen.camera.position[2] - kitchen.scenePosition[2];
    const counterMinX = kitchen.footprint[0] / 2 - 0.48 - 0.82 / 2;
    const counterMaxZ = -0.05 + 2.2 / 2;
    expect(Math.abs(cameraLocalX)).toBeLessThan(kitchen.footprint[0] / 2);
    expect(Math.abs(cameraLocalZ)).toBeLessThan(kitchen.footprint[1] / 2);
    expect(counterMinX - cameraLocalX).toBeGreaterThan(0.9);
    expect(cameraLocalZ).toBeGreaterThan(counterMaxZ);
    expect(kitchen.footprint[1] / 2 - cameraLocalZ).toBeGreaterThan(0.3);
  });

  it("keeps the ground stair shaft clear of every ground-floor room", () => {
    const flight = HOUSE_LAYOUT.stairs.groundFlight;
    const minZ = Math.min(flight.from[2], flight.to[2]), maxZ = Math.max(flight.from[2], flight.to[2]);
    const halfWidth = HOUSE_LAYOUT.stairs.shaftWidth / 2;
    for (const room of rooms.filter((candidate) => candidate.level === "ground")) {
      const bounds = roomBounds(room);
      const overlapsX = bounds.maxX > -halfWidth + 0.025 && bounds.minX < halfWidth - 0.025;
      const overlapsZ = bounds.maxZ > minZ + 0.025 && bounds.minZ < maxZ - 0.025;
      expect(overlapsX && overlapsZ, room.slug + " must not cover the stair void").toBe(false);
    }
  });
  it("joins the ground flight, upper landing, rooftop flight, and roof opening", () => {
    const stairs = HOUSE_LAYOUT.stairs, upperSurface = HOUSE_LAYOUT.upperY + HOUSE_LAYOUT.floorThickness;
    expect(stairs.groundFlight.from[1]).toBe(HOUSE_LAYOUT.floorThickness);
    expect(stairs.groundFlight.to[1]).toBe(upperSurface);
    expect(stairs.roofFlight.from[1]).toBe(upperSurface);
    expect(stairs.roofFlight.to[1]).toBe(HOUSE_LAYOUT.roofY);
    expect(stairs.groundFlight.to[2]).toBe(HOUSE_LAYOUT.upperBridge.centerZ - HOUSE_LAYOUT.upperBridge.depth / 2);
    const upperLanding = HOUSE_LAYOUT.upperLanding;
    expect(stairs.roofFlight.from[2]).toBeGreaterThan(upperLanding.centerZ - upperLanding.depth / 2);
    expect(stairs.roofFlight.from[2]).toBeLessThan(upperLanding.centerZ + upperLanding.depth / 2);
    expect(Math.abs(stairs.roofFlight.from[0] - upperLanding.centerX))
      .toBeLessThan(upperLanding.width / 2 - stairs.width / 2);
    expect(Math.abs(stairs.roofFlight.to[2] - stairs.roofOpening.centerZ)).toBeLessThan(stairs.roofOpening.depth / 2);
    expect(stairs.roofOpening.width).toBeGreaterThan(stairs.width);
  });
});

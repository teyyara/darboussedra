import {describe, expect, it} from "vitest";
import {
  HOUSE_LAYOUT, REQUIRED_ROOM_SLUGS, ROOM_ACCESS_PORTALS, getRoomBySlug, getRoomPortalOpenings,
  getSharedBoundary, roomBounds, roomRegistryIssues, rooms,
} from "./rooms";

describe("authoritative room and architectural layout", () => {
  it("contains each required destination exactly once with stable IDs and slugs", () => {
    expect(rooms).toHaveLength(13);
    expect(new Set(rooms.map((room) => room.slug)).size).toBe(13);
    expect(new Set(rooms.map((room) => room.id)).size).toBe(13);
    for (const slug of REQUIRED_ROOM_SLUGS) expect(rooms.filter((room) => room.slug === slug)).toHaveLength(1);
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
    expect(getSharedBoundary(entrance, garden)).toBeDefined();
    expect(roomBounds(entrance).maxZ).toBeCloseTo(HOUSE_LAYOUT.exterior.depth / 2 - HOUSE_LAYOUT.exterior.wallThickness / 2);
    expect(getRoomPortalOpenings(getRoomBySlug("family-table")!).some((opening) => opening.zone === "stair-hall" && opening.width >= HOUSE_LAYOUT.stairs.width + 0.14)).toBe(true);
  });
  it("keeps the first ground stair tread inside the rear wall's inner face", () => {
    const flight = HOUSE_LAYOUT.stairs.groundFlight;
    const stepRunZ = (flight.to[2] - flight.from[2]) / flight.steps;
    const firstTreadMinZ = flight.from[2] + stepRunZ / 2 - (Math.abs(stepRunZ) + 0.035) / 2;
    const rearInteriorFaceZ = -HOUSE_LAYOUT.exterior.depth / 2 + HOUSE_LAYOUT.exterior.wallThickness / 2;
    expect(firstTreadMinZ).toBeGreaterThanOrEqual(rearInteriorFaceZ + 0.05);
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
    expect(stairs.roofFlight.from[2]).toBe(HOUSE_LAYOUT.upperLanding.centerZ + HOUSE_LAYOUT.upperLanding.depth / 2);
    expect(Math.abs(stairs.roofFlight.to[2] - stairs.roofOpening.centerZ)).toBeLessThan(stairs.roofOpening.depth / 2);
    expect(stairs.roofOpening.width).toBeGreaterThan(stairs.width);
  });
});

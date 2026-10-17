import { describe, expect, it } from "vitest";
import { getRoomWallDecor } from "./wallDecor";
import { HOUSE_LAYOUT, getRoomWallRuns, rooms } from "./rooms";

const enclosedRooms = rooms.filter((room) => room.level === "ground" || room.level === "upper");

describe("room-specific wall accents", () => {
  it("gives every enclosed room a framed accent without crossing doors or windows", () => {
    expect(enclosedRooms).toHaveLength(11);

    for (const room of enclosedRooms) {
      const pieces = getRoomWallDecor(room);
      expect(pieces, room.slug).toHaveLength(1);

      for (const piece of pieces) {
        const hasRearWindow = room.scenePosition[2] - room.footprint[1] / 2 <= -3.8;
        if (hasRearWindow) expect(piece.side, room.slug).not.toBe("back");

        const along = piece.side === "front" || piece.side === "back"
          ? piece.position[0]
          : piece.position[2];
        const run = getRoomWallRuns(room, piece.side).find((candidate) =>
          along - piece.width / 2 >= candidate.start - 0.001 &&
          along + piece.width / 2 <= candidate.end + 0.001);
        expect(run, room.slug + " artwork must fit a solid wall run").toBeDefined();

        expect(piece.position[1] - piece.height / 2).toBeGreaterThan(HOUSE_LAYOUT.floorThickness);
        expect(piece.position[1] + piece.height / 2)
          .toBeLessThan(HOUSE_LAYOUT.floorThickness + HOUSE_LAYOUT.roomWallHeight);
      }
    }
  });


  it("keeps wall art off tall built-ins such as the kitchen appliance and library shelves", () => {
    const kitchen = rooms.find((room) => room.slug === "kitchen")!;
    const library = rooms.find((room) => room.slug === "library")!;
    expect(getRoomWallDecor(kitchen)[0].side).not.toBe("back");
    expect(getRoomWallDecor(library)[0].side).not.toBe("left");
  });

  it("chooses a wall inside the named room's viewing direction rather than a side-on crop", () => {
    const livingRoom = rooms.find((room) => room.slug === "living-room")!;
    expect(getRoomWallDecor(livingRoom)[0].side).toBe("left");
  });

  it("does not add wall art to garden or rooftop views", () => {
    expect(getRoomWallDecor(rooms.find((room) => room.slug === "garden")!)).toEqual([]);
    expect(getRoomWallDecor(rooms.find((room) => room.slug === "rooftop")!)).toEqual([]);
  });
});

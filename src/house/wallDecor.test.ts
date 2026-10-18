import { describe, expect, it } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import { getRoomWallDecor } from "./wallDecor";
import { getLibraryBookProps } from "./libraryShelving";
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

  it("keeps the full existing library wall accent inside the first-person frame", () => {
    const library = rooms.find((room) => room.slug === "library")!;
    const artwork = getRoomWallDecor(library)[0];
    expect(artwork).toBeDefined();

    const camera = new PerspectiveCamera(50, 1440 / 1000, 0.1, 100);
    camera.position.set(...library.camera.position);
    camera.lookAt(new Vector3(...library.camera.target));
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    const center = new Vector3(
      library.scenePosition[0] + artwork.position[0],
      library.scenePosition[1] + artwork.position[1],
      library.scenePosition[2] + artwork.position[2],
    );
    const horizontalHalf = artwork.width / 2;
    const verticalHalf = artwork.height / 2;
    const viewToArtX = center.x - camera.position.x;
    const viewToArtZ = center.z - camera.position.z;
    // The right-wall interior face points toward -X. A near-zero X component
    // means the camera sees only the frame edge while walking parallel to that wall.
    const wallFacingCosine = viewToArtX / Math.hypot(viewToArtX, viewToArtZ);
    expect(wallFacingCosine).toBeGreaterThan(0.32);

    const books = getLibraryBookProps(library.footprint[0]);
    const representativeBooks = [books[4], books[13], books[22]];
    for (const book of representativeBooks) {
      const spine = new Vector3(
        library.scenePosition[0] + book.position[0],
        library.scenePosition[1] + book.position[1],
        library.scenePosition[2] + book.position[2],
      ).project(camera);
      expect(spine.x, "representative shelf spines stay horizontally visible").toBeGreaterThan(-0.9);
      expect(spine.x, "representative shelf spines stay horizontally visible").toBeLessThan(0.9);
      expect(spine.y, "representative shelf spines stay vertically visible").toBeGreaterThan(-0.85);
      expect(spine.y, "representative shelf spines stay vertically visible").toBeLessThan(0.85);
    }

    const corners = [];
    for (const horizontalSign of [-1, 1]) {
      for (const verticalSign of [-1, 1]) {
        const corner = center.clone();
        if (artwork.side === "front" || artwork.side === "back") {
          corner.x += horizontalSign * horizontalHalf;
        } else {
          corner.z += horizontalSign * horizontalHalf;
        }
        corner.y += verticalSign * verticalHalf;
        corners.push(corner.project(camera));
      }
    }

    expect(Math.min(...corners.map((point) => point.x))).toBeGreaterThan(-0.9);
    expect(Math.max(...corners.map((point) => point.x))).toBeLessThan(0.9);
    expect(Math.min(...corners.map((point) => point.y))).toBeGreaterThan(-0.85);
    expect(Math.max(...corners.map((point) => point.y))).toBeLessThan(0.85);
  });

  it("chooses a wall inside the named room's viewing direction rather than a side-on crop", () => {
    const livingRoom = rooms.find((room) => room.slug === "living-room")!;
    expect(getRoomWallDecor(livingRoom)[0].side).toBe("left");
  });

  it("keeps the existing prayer-room wall accent face-on and fully inside the entry view", () => {
    const prayerRoom = rooms.find((room) => room.slug === "prayer-room")!;
    const artwork = getRoomWallDecor(prayerRoom)[0];
    expect(artwork).toBeDefined();
    expect(artwork.side).not.toBe("front"); // don't mount the existing accent immediately behind the entry camera

    const camera = new PerspectiveCamera(50, 1440 / 1000, 0.1, 100);
    camera.position.set(...prayerRoom.camera.position);
    camera.lookAt(new Vector3(...prayerRoom.camera.target));
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    const center = new Vector3(
      prayerRoom.scenePosition[0] + artwork.position[0],
      prayerRoom.scenePosition[1] + artwork.position[1],
      prayerRoom.scenePosition[2] + artwork.position[2],
    );
    const viewToArtX = center.x - camera.position.x;
    const viewToArtZ = center.z - camera.position.z;
    const wallFacingCosine = Math.abs(viewToArtX) / Math.hypot(viewToArtX, viewToArtZ);
    expect(wallFacingCosine).toBeGreaterThan(0.75);

    for (const xSign of [-1, 1]) {
      for (const ySign of [-1, 1]) {
        const corner = center.clone();
        if (artwork.side === "front" || artwork.side === "back") {
          corner.x += xSign * artwork.width / 2;
        } else {
          corner.z += xSign * artwork.width / 2;
        }
        corner.y += ySign * artwork.height / 2;
        corner.project(camera);
        expect(corner.x, "prayer-room wall art stays horizontally visible").toBeGreaterThan(-0.95);
        expect(corner.x, "prayer-room wall art stays horizontally visible").toBeLessThan(0.95);
        expect(corner.y, "prayer-room wall art stays vertically visible").toBeGreaterThan(-0.9);
        expect(corner.y, "prayer-room wall art stays vertically visible").toBeLessThan(0.9);
      }
    }
  });

  it("keeps living-room art small enough to avoid the camera-edge crop", () => {
    const livingRoom = rooms.find((room) => room.slug === "living-room")!;
    const art = getRoomWallDecor(livingRoom);
    expect(art).toHaveLength(1);
    expect(art[0].side).toBe("left");
    expect(art[0].width).toBeLessThanOrEqual(0.62);
    expect(art[0].height).toBeLessThanOrEqual(0.58);
  });

  it("keeps the living-room geometric art inside the first-person camera frame", () => {
    const livingRoom = rooms.find((room) => room.slug === "living-room")!;
    const artwork = getRoomWallDecor(livingRoom)[0];
    const camera = new PerspectiveCamera(50, 1440 / 1000, 0.1, 100);
    camera.position.set(...livingRoom.camera.position);
    camera.lookAt(new Vector3(...livingRoom.camera.target));
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    const artWorldPosition = new Vector3(
      livingRoom.scenePosition[0] + artwork.position[0],
      livingRoom.scenePosition[1] + artwork.position[1],
      livingRoom.scenePosition[2] + artwork.position[2],
    );
    const projected = artWorldPosition.project(camera);
    expect(projected.x).toBeGreaterThan(-0.75);
    expect(projected.x).toBeLessThan(0.75);
    expect(projected.y).toBeGreaterThan(-0.75);
    expect(projected.y).toBeLessThan(0.75);
  });

  it("does not add wall art to garden or rooftop views", () => {
    expect(getRoomWallDecor(rooms.find((room) => room.slug === "garden")!)).toEqual([]);
    expect(getRoomWallDecor(rooms.find((room) => room.slug === "rooftop")!)).toEqual([]);
  });
});

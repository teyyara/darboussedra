import {describe, expect, it} from "vitest";
import {PerspectiveCamera, Vector3} from "three";
import {EXTERIOR_CAMERA, HOUSE_LAYOUT, getRoomBySlug, roomBounds, rooms} from "./rooms";
import {makeCameraPath} from "./cameraPath";

const frontZ = HOUSE_LAYOUT.exterior.depth / 2;
const doorHeight = HOUSE_LAYOUT.entrance.doorHeight;
const poseFor = (slug: string) => getRoomBySlug(slug)!.camera;
const upperBridgeSideLaneX = HOUSE_LAYOUT.upperBridge.centerX +
  HOUSE_LAYOUT.stairs.openingWidth / 2 +
  (HOUSE_LAYOUT.upperBridge.width - HOUSE_LAYOUT.stairs.openingWidth) / 4;

describe("3D camera paths", () => {
  it("centers the upper walking lane between the stairwell rail and outer bridge edge", () => {
    const openingRightEdge = HOUSE_LAYOUT.upperBridge.centerX + HOUSE_LAYOUT.stairs.openingWidth / 2;
    const outerEdge = HOUSE_LAYOUT.upperBridge.centerX + HOUSE_LAYOUT.upperBridge.width / 2;
    expect(upperBridgeSideLaneX - openingRightEdge).toBeCloseTo(outerEdge - upperBridgeSideLaneX);
    expect(upperBridgeSideLaneX).toBeLessThan(outerEdge);
  });

  it("uses standing eye-height, forward-facing views for every destination", () => {
    for (const room of rooms) {
      expect(room.camera.position[1], room.slug + " eye height").toBeCloseTo(room.scenePosition[1] + 1.65);
      const verticalLook = Math.abs(room.camera.target[1] - room.camera.position[1]);
      if (room.slug === "rooftop") {
        expect(verticalLook, "rooftop looks down across the terrace instead of at the horizon").toBeGreaterThan(1.0);
        expect(verticalLook).toBeLessThan(1.8);
        expect(room.camera.target[0], "rooftop camera frames the tea nook instead of empty deck").toBeLessThan(-1.5);
        expect(room.camera.target[2]).toBeGreaterThan(-0.8);
        expect(room.camera.target[2]).toBeLessThan(0.5);
      } else if (room.slug === "garden") {
        expect(verticalLook, "garden view tips down far enough to keep the stepping stones in frame").toBeGreaterThan(0.6);
        expect(verticalLook).toBeLessThan(0.9);
        expect(Math.abs(room.camera.position[0] - room.camera.target[0]), "garden view stays slightly diagonal while following the stone path").toBeGreaterThan(0.5);
        expect(Math.abs(room.camera.position[0] - room.camera.target[0])).toBeLessThan(1.3);
        expect(room.camera.target[2]).toBeGreaterThan(frontZ);
        expect(Math.abs(room.camera.target[0]), "garden camera keeps the stepping-stone route in frame").toBeLessThan(0.5);
        expect(room.camera.position[2]).toBeGreaterThan(frontZ);
        expect(room.camera.position[2]).toBeLessThan(room.scenePosition[2]);
        expect(room.camera.target[2]).toBeGreaterThan(room.scenePosition[2]);
      } else if (room.slug === "family-table" || room.slug === "pets-corner") {
        expect(verticalLook, room.slug + " looks down enough to frame its furniture").toBeGreaterThan(0.3);
        expect(verticalLook).toBeLessThan(0.65);
      } else if (room.slug === "library") {
        expect(verticalLook, "library view tilts down enough to keep the lower shelf in frame").toBeGreaterThan(0.2);
        expect(verticalLook).toBeLessThan(0.55);
      } else if (room.slug === "prayer-room") {
        expect(verticalLook, "prayer room gaze includes the mat without making it an extreme close-up").toBeGreaterThan(1.2);
        expect(verticalLook).toBeLessThan(1.4);
      } else {
        expect(verticalLook, room.slug + " slight downward room framing").toBeGreaterThan(0.2);
        expect(verticalLook, room.slug + " remains an eye-level view").toBeLessThan(0.45);
      }
    }
    expect(EXTERIOR_CAMERA.position[1], "the street view uses standing eye height").toBeCloseTo(1.65);
    expect(EXTERIOR_CAMERA.position[1]).toBeLessThan(HOUSE_LAYOUT.exterior.wallHeight);
    expect(EXTERIOR_CAMERA.target[1], "street view angles slightly upward to reveal the roofline and sky").toBeGreaterThan(EXTERIOR_CAMERA.position[1] + 1.0);
    expect(Math.abs(EXTERIOR_CAMERA.position[0]), "the street view is centered on the front entrance").toBeLessThan(0.1);
    expect(EXTERIOR_CAMERA.position[2]).toBeGreaterThan(frontZ);
    expect(Math.abs(EXTERIOR_CAMERA.target[0])).toBeLessThan(1);
    expect(EXTERIOR_CAMERA.target[2]).toBeLessThan(frontZ);
    expect(EXTERIOR_CAMERA.target[1]).toBeGreaterThan(EXTERIOR_CAMERA.position[1]);
  });

  it("keeps the entrance view aligned with the passage and family-table view across the shared room", () => {
    const entrance = poseFor("entrance");
    expect(Math.abs(entrance.position[0] - entrance.target[0])).toBeLessThan(0.05);
    expect(entrance.position[2]).toBeGreaterThan(entrance.target[2]);
    const family = poseFor("family-table");
    expect(family.position[0]).toBeGreaterThan(0.8);
    expect(Math.abs(family.target[0]), "family-table view centers the stair-hall doorway").toBeLessThan(0.15);
    expect(family.position[2]).toBeGreaterThan(family.target[2]);
    expect(family.position[2] - family.target[2], "table is framed across the room, not from beside it").toBeGreaterThan(2.0);
  });

  it("frames indoor rooms diagonally across their usable floor rather than at the nearest wall", () => {
    for (const room of rooms.filter((item) => item.kind === "interior" || item.kind === "private" || item.kind === "spiritual")) {
      expect(Math.abs(room.camera.position[0] - room.camera.target[0]), room.slug + " cross-room X view").toBeGreaterThan(0.3);
      expect(Math.abs(room.camera.position[2] - room.camera.target[2]), room.slug + " cross-room Z view").toBeGreaterThan(0.3);
    }
  });

  it("keeps the entire existing prayer mat in frame from the entry-side viewpoint", () => {
    const prayerRoom = getRoomBySlug("prayer-room")!;
    const prayer = prayerRoom.camera;
    expect(prayer.position[2]).toBeGreaterThan(-1.2); // remain near the entry half of the room

    const camera = new PerspectiveCamera(50, 1440 / 1000, 0.1, 100);
    camera.position.set(...prayer.position);
    camera.lookAt(new Vector3(...prayer.target));
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    const matCenter = new Vector3(
      prayerRoom.scenePosition[0] + 0.45,
      prayerRoom.scenePosition[1] + 0.05,
      prayerRoom.scenePosition[2] - 0.65,
    );
    for (const xSign of [-1, 1]) {
      for (const zSign of [-1, 1]) {
        const corner = matCenter.clone();
        corner.x += xSign * 1.05 / 2;
        corner.z += zSign * 1.75 / 2;
        corner.project(camera);
        expect(corner.x, "outer mat stays inside the horizontal frame").toBeGreaterThan(-0.85);
        expect(corner.x, "outer mat stays inside the horizontal frame").toBeLessThan(0.85);
        expect(corner.y, "near mat edge is not cropped below the frame").toBeGreaterThan(-0.85);
        expect(corner.y, "far mat edge is not cropped above the frame").toBeLessThan(0.85);
      }
    }
  });

  it("frames the existing pet bed and scratch post together instead of the doorway", () => {
    const petsRoom = getRoomBySlug("pets-corner")!;
    const pets = petsRoom.camera;
    expect(pets.position[0]).toBeCloseTo(petsRoom.scenePosition[0]); // stand near the centre of the wider 2m room
    expect(pets.target[0]).toBeGreaterThan(pets.position[0]);
    expect(pets.target[0] - pets.position[0]).toBeLessThan(0.4);

    const camera = new PerspectiveCamera(50, 1440 / 1000, 0.1, 100);
    camera.position.set(...pets.position);
    camera.lookAt(new Vector3(...pets.target));
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    const bed = new Vector3(
      petsRoom.scenePosition[0] - 0.15,
      petsRoom.scenePosition[1] + 0.23,
      petsRoom.scenePosition[2] - 0.82,
    ).project(camera);
    const scratchPost = new Vector3(
      petsRoom.scenePosition[0] + 0.48,
      petsRoom.scenePosition[1] + 0.52,
      petsRoom.scenePosition[2] - 1.15,
    ).project(camera);

    for (const [label, point] of [["pet bed", bed], ["scratch post", scratchPost]] as const) {
      expect(point.x, label + " remains inside the first-person horizontal frame").toBeGreaterThan(-0.8);
      expect(point.x, label + " remains inside the first-person horizontal frame").toBeLessThan(0.8);
      expect(point.y, label + " remains inside the first-person vertical frame").toBeGreaterThan(-0.8);
      expect(point.y, label + " remains inside the first-person vertical frame").toBeLessThan(0.4);
    }
  });

  it("aims room views toward their defining contents instead of blank walls", () => {
    const living = poseFor("living-room");
    const kitchen = poseFor("kitchen");
    const library = poseFor("library");
    const pets = poseFor("pets-corner");
    const prayer = poseFor("prayer-room");
    expect(living.target[2]).toBeLessThan(living.position[2]); // sofa sits toward the back of the living room
    expect(kitchen.target[0]).toBeGreaterThan(kitchen.position[0]); // frame the fitted hob and sink from inside the kitchen
    expect(kitchen.target[2]).toBeLessThan(kitchen.position[2]);
    expect(library.position[0]).toBeLessThan(rooms.find((room) => room.slug === "library")!.scenePosition[0]); // leave the camera off the right wall
    expect(library.target[0]).toBeGreaterThan(library.position[0]); // look diagonally toward the opposite wall
    expect(library.position[2]).toBeGreaterThan(-1.0); // stay near the doorway with clearance from both side walls
    expect(pets.target[0]).toBeGreaterThan(pets.position[0]);
    expect(pets.target[2]).toBeLessThan(pets.position[2]); // cat bed and scratch post are toward the rear
    expect(pets.target[0]).toBeGreaterThan(-2.2); // frame the bed and post together, not just the post
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

  it("keeps the roof-flight eye path inside the hatch before reaching roof height", () => {
    const path = makeCameraPath("family-table", "rooftop", poseFor("rooftop"));
    const flight = HOUSE_LAYOUT.stairs.roofFlight;
    const opening = HOUSE_LAYOUT.stairs.roofOpening;
    const back = opening.centerZ - opening.depth / 2;
    const front = opening.centerZ + opening.depth / 2;
    const nearRoof = path.filter((pose) =>
      pose.position[1] >= HOUSE_LAYOUT.roofY - 0.4 &&
      pose.position[1] <= HOUSE_LAYOUT.roofY + 0.1 &&
      pose.position[2] < flight.from[2] &&
      pose.position[2] > flight.to[2] + 0.2);

    expect(nearRoof.length).toBeGreaterThanOrEqual(3);
    expect(nearRoof.every((pose) =>
      pose.position[2] > back + 0.04 && pose.position[2] < front - 0.04)).toBe(true);
  });

  it("looks down to the roof deck immediately after clearing the hatch", () => {
    const path = makeCameraPath("family-table", "rooftop", poseFor("rooftop"));
    const opening = HOUSE_LAYOUT.stairs.roofOpening;
    const roofFlight = HOUSE_LAYOUT.stairs.roofFlight;
    const roofEye = HOUSE_LAYOUT.roofY + 1.65;
    const clearDeckViews = path.filter((pose) =>
      pose.preserveTarget &&
      Math.abs(pose.position[1] - roofEye) < 0.02 &&
      pose.position[0] > opening.centerX + opening.width / 2 &&
      pose.position[2] > roofFlight.to[2] - 0.1 && pose.position[2] < -1.0);

    expect(clearDeckViews.length).toBeGreaterThanOrEqual(3);
    expect(clearDeckViews.every((pose) => pose.target[1] < pose.position[1] - 0.6)).toBe(true);
    expect(clearDeckViews.every((pose) =>
      pose.target[0] !== pose.position[0] || pose.target[2] !== pose.position[2])).toBe(true);
  });

  it("descends from the roof and reaches ground rooms by the stair and doorway route", () => {
    const path = makeCameraPath("rooftop", "prayer-room", poseFor("prayer-room"));
    expect(path.some((pose) => pose.position[1] > HOUSE_LAYOUT.roofY + 1.2)).toBe(true);
    expect(path.some((pose) => pose.position[1] > HOUSE_LAYOUT.upperY + 1.0 && pose.position[1] < HOUSE_LAYOUT.roofY)).toBe(true);
    expect(path.some((pose) => pose.position[1] < 2.0 && pose.position[2] > -0.5)).toBe(true);
    expect(path.at(-1)).toEqual(poseFor("prayer-room"));
    expect(Math.max(...path.map((pose) => pose.position[1]))).toBeLessThanOrEqual(HOUSE_LAYOUT.roofY + 1.7);
  });

  it("keeps the reverse upper-landing gaze aimed into the open stairwell", () => {
    const path = makeCameraPath("rooftop", "family-table", poseFor("family-table"));
    const landingGaze = path.find((pose) => pose.preserveHeading &&
      pose.position[2] < -4.0 && pose.position[2] > -4.5);
    expect(landingGaze).toBeDefined();
    expect(landingGaze!.target[2]).toBeGreaterThan(landingGaze!.position[2]);
    expect(landingGaze!.target[1]).toBeCloseTo(landingGaze!.position[1] - 0.65);
  });

  it("keeps the upper bridge stairwell glance below the horizon in both travel directions", () => {
    const upperEye = HOUSE_LAYOUT.upperY + 1.65;
    const climb = makeCameraPath("family-table", "rooftop", poseFor("rooftop"));
    const forwardGlances = climb.filter((pose) =>
      pose.preserveHeading &&
      Math.abs(pose.position[1] - upperEye) < 0.02 &&
      pose.position[2] > -4.0 && pose.position[2] < -2.6);
    expect(forwardGlances.length).toBeGreaterThanOrEqual(2);
    expect(forwardGlances.every((pose) =>
      Math.abs(pose.target[1] - (pose.position[1] - 0.28)) < 0.001)).toBe(true);

    const returning = makeCameraPath("rooftop", "family-table", poseFor("family-table"));
    const reverseGlances = returning.filter((pose) =>
      pose.preserveHeading &&
      Math.abs(pose.position[1] - upperEye) < 0.02 &&
      pose.position[2] > -4.0 && pose.position[2] < -2.6);
    expect(reverseGlances.length).toBeGreaterThanOrEqual(2);
    expect(reverseGlances.every((pose) =>
      Math.abs(pose.target[1] - (pose.position[1] - 0.65)) < 0.001)).toBe(true);
  });

  it("aims down the lower stair flight while returning from the roof", () => {
    const path = makeCameraPath("rooftop", "family-table", poseFor("family-table"));
    const descendingTreads = path.filter((pose) =>
      !pose.preserveHeading &&
      pose.position[1] > 2.2 && pose.position[1] < 4.45 &&
      pose.position[2] < -1.0 && pose.position[2] > -4.3);
    expect(descendingTreads.length).toBeGreaterThan(3);
    expect(descendingTreads.some((pose) => pose.target[1] < pose.position[1] - 0.05)).toBe(true);
  });

  it("walks through a curved outdoor approach instead of turning to the garden pose in empty space", () => {
    const path = makeCameraPath("entrance", "garden", poseFor("garden"));
    const frontZ = HOUSE_LAYOUT.exterior.depth / 2;
    expect(path.some((pose) => pose.position[2] > frontZ)).toBe(true);
    expect(path.some((pose) => pose.position[0] > 1.5 && pose.position[2] > 6.4 && pose.position[2] < 7.5)).toBe(true);
    const outdoorArc = path.filter((pose) => pose.position[2] > frontZ + 0.3 && pose.position[2] < 8.2);
    expect(outdoorArc.length).toBeGreaterThanOrEqual(6);
    expect(path.at(-1)).toEqual(poseFor("garden"));
  });

  it("leaves the garden through the front threshold before entering the house", () => {
    const path = makeCameraPath("garden", "living-room", poseFor("living-room"));
    expect(path.some((pose) => pose.position[2] > frontZ)).toBe(true);
    expect(path.some((pose) => pose.position[2] < frontZ)).toBe(true);
    expect(path.some((pose) => pose.position[2] < 2.75)).toBe(true);
    expect(path.every((pose) => pose.position[1] < 2.1)).toBe(true);
  });
  it("follows the individual lower stair treads at a monotonic walking height", () => {
    const path = makeCameraPath("family-table", "rooftop", poseFor("rooftop"));
    const flight = HOUSE_LAYOUT.stairs.groundFlight;
    const stairSamples = path.filter((pose) =>
      pose.position[1] > 1.7 && pose.position[1] < HOUSE_LAYOUT.upperY + 1.5 &&
      pose.position[2] <= flight.from[2] + 0.02 && pose.position[2] >= flight.to[2] - 0.05);
    expect(stairSamples.length).toBeGreaterThanOrEqual(flight.steps - 2);
    for (let index = 1; index < stairSamples.length; index += 1) {
      expect(stairSamples[index].position[1]).toBeGreaterThan(stairSamples[index - 1].position[1]);
      expect(stairSamples[index].position[2]).toBeLessThan(stairSamples[index - 1].position[2]);
    }
  });

  it("looks over the upper landing edge when the ascending eye reaches floor level", () => {
    const flight = HOUSE_LAYOUT.stairs.groundFlight;
    const upperFloor = HOUSE_LAYOUT.upperY + HOUSE_LAYOUT.floorThickness;
    const climb = makeCameraPath("family-table", "rooftop", poseFor("rooftop"));
    const landingClearanceViews = climb.filter((pose) =>
      pose.position[1] >= upperFloor - 0.1 &&
      pose.position[1] <= upperFloor + 0.28 &&
      pose.position[2] < -0.5 &&
      pose.position[2] > flight.to[2] + 0.2);
    expect(landingClearanceViews.length).toBeGreaterThanOrEqual(1);
    expect(landingClearanceViews.every((pose) =>
      pose.target[1] >= pose.position[1] - 0.03)).toBe(true);
  });

  it("uses spatial landing turns instead of duplicate-position heading reversals", () => {
    for (const [from, to] of [
      ["family-table", "rooftop"],
      ["rooftop", "prayer-room"],
    ] as const) {
      const path = makeCameraPath(from, to, poseFor(to));
      for (let index = 1; index < path.length; index += 1) {
        const previous = path[index - 1];
        const current = path[index];
        const distance = Math.hypot(
          current.position[0] - previous.position[0],
          current.position[1] - previous.position[1],
          current.position[2] - previous.position[2],
        );
        if (distance >= 0.04) continue;
        const previousHeading = [previous.target[0] - previous.position[0], previous.target[2] - previous.position[2]];
        const currentHeading = [current.target[0] - current.position[0], current.target[2] - current.position[2]];
        const previousLength = Math.hypot(...previousHeading);
        const currentLength = Math.hypot(...currentHeading);
        const alignment = (previousHeading[0] * currentHeading[0] + previousHeading[1] * currentHeading[1]) /
          (previousLength * currentLength);
        expect(alignment, "near-identical positions should not ask the camera to reverse its heading").toBeGreaterThan(-0.7);
      }
    }
  });

  it("keeps the landing turn and head landing inside the rear stair boundary", () => {
    const flight = HOUSE_LAYOUT.stairs.groundFlight;
    const climb = makeCameraPath("family-table", "rooftop", poseFor("rooftop"));
    const descent = makeCameraPath("rooftop", "prayer-room", poseFor("prayer-room"));
    expect(Math.min(...climb.map((pose) => pose.position[2]))).toBeGreaterThanOrEqual(flight.to[2] - 0.005);
    expect(Math.min(...descent.map((pose) => pose.position[2]))).toBeGreaterThanOrEqual(flight.to[2] - 0.005);
    const landing = climb.filter((pose) =>
      Math.abs(pose.position[1] - (HOUSE_LAYOUT.upperY + 1.65)) < 0.02 &&
      pose.position[2] > flight.to[2] - 0.01 && pose.position[2] < flight.to[2] + 0.55);
    expect(landing.length).toBeGreaterThanOrEqual(2);
    expect(landing.some((pose) => pose.position[0] > 0.6)).toBe(true);
  });

  it("turns into the roof stair without leaving the upper landing footprint", () => {
    const path = makeCameraPath("family-table", "rooftop", poseFor("rooftop"));
    const upperEye = HOUSE_LAYOUT.upperY + 1.65;
    const landingFrontEdge = HOUSE_LAYOUT.upperLanding.centerZ + HOUSE_LAYOUT.upperLanding.depth / 2;
    const approach = path.filter((pose) =>
      Math.abs(pose.position[1] - upperEye) < 0.02 &&
      pose.position[2] > HOUSE_LAYOUT.stairs.roofFlight.from[2] - 0.35 &&
      pose.position[2] <= landingFrontEdge + 0.005);
    expect(approach.length).toBeGreaterThanOrEqual(5);
    expect(Math.max(...approach.map((pose) => pose.position[2]))).toBeLessThanOrEqual(landingFrontEdge + 0.005);
  });

  it("steps sideways from the roof hatch onto solid deck before crossing the terrace", () => {
    const path = makeCameraPath("family-table", "rooftop", poseFor("rooftop"));
    const roofEye = HOUSE_LAYOUT.roofY + 1.65;
    const opening = HOUSE_LAYOUT.stairs.roofOpening;
    const rightEdge = opening.centerX + opening.width / 2;
    const roofWaypoints = path.filter((pose) => Math.abs(pose.position[1] - roofEye) < 0.02);
    expect(roofWaypoints.some((pose) =>
      pose.position[0] > rightEdge + 0.08 &&
      pose.position[2] > opening.centerZ - opening.depth / 2 &&
      pose.position[2] < opening.centerZ + opening.depth / 2)).toBe(true);
    const hatchCrossers = roofWaypoints.filter((pose) =>
      pose.position[2] > opening.centerZ - opening.depth / 2 + 0.02 &&
      pose.position[2] < opening.centerZ + opening.depth / 2 - 0.02 &&
      Math.abs(pose.position[0]) < opening.width / 2 - 0.02);
    expect(hatchCrossers.length).toBeLessThanOrEqual(1);
  });

  it("keeps the next stair treads visible during both ascent and descent", () => {
    const lowerFlight = HOUSE_LAYOUT.stairs.groundFlight;
    const climb = makeCameraPath("family-table", "rooftop", poseFor("rooftop"));
    const ascentFrames = climb.filter((pose) =>
      pose.position[1] > lowerFlight.from[1] + 1.0 &&
      pose.position[1] < HOUSE_LAYOUT.upperY + 1.4 &&
      pose.position[2] < lowerFlight.from[2] - 0.2 &&
      pose.position[2] > lowerFlight.to[2] + 0.2);
    expect(ascentFrames.some((pose) =>
      pose.target[1] < pose.position[1] - 0.12 &&
      pose.target[1] > pose.position[1] - 0.38)).toBe(true);

    const descent = makeCameraPath("rooftop", "prayer-room", poseFor("prayer-room"));
    const descentFrames = descent.filter((pose) =>
      pose.position[1] > lowerFlight.from[1] + 1.0 &&
      pose.position[1] < HOUSE_LAYOUT.upperY + 1.4 &&
      pose.position[2] < lowerFlight.from[2] - 0.2 &&
      pose.position[2] > lowerFlight.to[2] + 0.2);
    expect(descentFrames.some((pose) =>
      pose.target[1] < pose.position[1] - 0.5 &&
      pose.target[1] > pose.position[1] - 0.75)).toBe(true);
  });

  it("uses the guarded side walkway to leave the lower stair opening", () => {
    const path = makeCameraPath("family-table", "rooftop", poseFor("rooftop"));
    const bridgeStart = HOUSE_LAYOUT.upperBridge.centerZ - HOUSE_LAYOUT.upperBridge.depth / 2;
    const bridgeEnd = HOUSE_LAYOUT.upperBridge.centerZ + HOUSE_LAYOUT.upperBridge.depth / 2;
    const sideLane = path.filter((pose) =>
      Math.abs(pose.position[1] - (HOUSE_LAYOUT.upperY + 1.65)) < 0.02 &&
      pose.position[2] > bridgeStart + 0.1 &&
      pose.position[2] < bridgeEnd - 0.1 &&
      Math.abs(pose.position[0] - HOUSE_LAYOUT.upperBridge.centerX) >
        HOUSE_LAYOUT.stairs.openingWidth / 2 + 0.04);
    expect(sideLane.length).toBeGreaterThanOrEqual(4);
    expect(sideLane.every((pose) =>
      Math.abs(pose.position[0] - HOUSE_LAYOUT.upperBridge.centerX) <
        HOUSE_LAYOUT.upperBridge.width / 2)).toBe(true);
  });

  it("turns onto the upper landing before looking along the bedroom wall", () => {
    const path = makeCameraPath("family-table", "rooftop", poseFor("rooftop"));
    const upperEye = HOUSE_LAYOUT.upperY + 1.65;
    const flightEndZ = HOUSE_LAYOUT.stairs.groundFlight.to[2];
    const sideLaneX = upperBridgeSideLaneX;
    const laneEntry = path.find((pose) =>
      Math.abs(pose.position[1] - upperEye) < 0.02 &&
      Math.abs(pose.position[0] - sideLaneX) < 0.02 &&
      Math.abs(pose.position[2] - (flightEndZ + 0.2)) < 0.03);

    expect(laneEntry, "the route reaches the side lane after clearing the stair edge").toBeDefined();
    expect(laneEntry!.position[2], "the turn remains behind the rear bedroom-wall line").toBeLessThan(-3.95);
    expect(laneEntry!.target[2] - laneEntry!.position[2]).toBeGreaterThan(1.0);
    expect(laneEntry!.target[0], "the authored view looks inward toward the central landing").toBeLessThan(laneEntry!.position[0] - 0.25);
  });

  it("aims inward from the upper landing while keeping the camera on the protected side lane", () => {
    const path = makeCameraPath("family-table", "rooftop", poseFor("rooftop"));
    const upperEye = HOUSE_LAYOUT.upperY + 1.65;
    const sideLaneX = upperBridgeSideLaneX;
    const turnViews = path.filter((pose) =>
      pose.preserveHeading &&
      Math.abs(pose.position[1] - upperEye) < 0.02 &&
      Math.abs(pose.position[0] - sideLaneX) < 0.02);

    expect(turnViews.length).toBeGreaterThanOrEqual(7);
    for (const pose of turnViews) {
      expect(pose.position[0]).toBeGreaterThan(HOUSE_LAYOUT.stairs.openingWidth / 2 + 0.08);
      expect(pose.target[0]).toBeLessThan(pose.position[0] - 0.25);
      expect(pose.target[2]).toBeGreaterThan(pose.position[2] + 0.9);
    }
  });

  it("looks into the stairwell at the first lateral step off the lower flight", () => {
    const path = makeCameraPath("family-table", "rooftop", poseFor("rooftop"));
    const flightEndZ = HOUSE_LAYOUT.stairs.groundFlight.to[2];
    const upperEye = HOUSE_LAYOUT.upperY + 1.65;
    const sideLaneX = upperBridgeSideLaneX;
    const turn = path.find((pose) =>
      pose.preserveHeading &&
      Math.abs(pose.position[1] - upperEye) < 0.02 &&
      Math.abs(pose.position[0] - sideLaneX) < 0.02 &&
      Math.abs(pose.position[2] - flightEndZ) < 0.02);

    expect(turn, "the lateral turn uses an authored inward gaze").toBeDefined();
    expect(turn!.target[0]).toBeLessThan(turn!.position[0] - 0.25);
    expect(turn!.target[2]).toBeGreaterThan(turn!.position[2] + 0.9);
  });

  it("keeps the stairwell in view while returning along the upper side lane", () => {
    const path = makeCameraPath("rooftop", "prayer-room", poseFor("prayer-room"));
    const upperEye = HOUSE_LAYOUT.upperY + 1.65;
    const sideLaneX = upperBridgeSideLaneX;
    const returnViews = path.filter((pose) =>
      pose.preserveHeading &&
      Math.abs(pose.position[1] - upperEye) < 0.02 &&
      Math.abs(pose.position[0] - sideLaneX) < 0.02 &&
      pose.position[2] > -3.0 && pose.position[2] < 0.3);

    expect(returnViews.length).toBeGreaterThanOrEqual(4);
    for (const pose of returnViews) {
      expect(pose.target[0], "gaze remains inward toward the stair opening").toBeLessThan(pose.position[0] - 0.25);
      expect(pose.target[2], "gaze is anchored over the stairwell, regardless of travel direction")
        .toBeCloseTo(HOUSE_LAYOUT.upperBridge.centerZ, 2);
      expect(pose.target[1], "return view looks down into the stairwell")
        .toBeLessThan(pose.position[1] - 0.5);
    }
  });

  it("keeps intermediate camera headings aligned with travel through outdoor and multi-storey turns", () => {
    for (const [from, to] of [
      ["zineb-room", "garden"],
      ["garden", "rooftop"],
      ["rooftop", "prayer-room"],
    ] as const) {
      const source = poseFor(from);
      const path = makeCameraPath(from, to, poseFor(to));
      const positions = [source.position, ...path.map((pose) => pose.position)];
      for (let index = 0; index < path.length - 1; index += 1) {
        if (path[index].preserveHeading) continue;
        const previous = positions[index];
        const next = positions[index + 2];
        const dx = next[0] - previous[0];
        const dz = next[2] - previous[2];
        const directionLength = Math.hypot(dx, dz);
        if (directionLength < 0.08) continue;
        const headingX = path[index].target[0] - path[index].position[0];
        const headingZ = path[index].target[2] - path[index].position[2];
        const headingLength = Math.hypot(headingX, headingZ);
        const alignment = (dx * headingX + dz * headingZ) / (directionLength * headingLength);
        expect(alignment, from + " → " + to + " waypoint " + index).toBeGreaterThan(0.98);
      }
    }
  });

});

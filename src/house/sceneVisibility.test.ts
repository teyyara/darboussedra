import {describe, expect, it} from "vitest";
import {getCameraZoneForPosition, getHouseSceneVisibility, shouldRenderInteriorPerimeterShell} from "./sceneVisibility";
import {HOUSE_LAYOUT} from "./rooms";

describe("level-aware house rendering", () => {
  it("never drops the perimeter shell between indoor and outdoor rendering states", () => {
    expect(shouldRenderInteriorPerimeterShell("family-table", false, "outside", false)).toBe(true);
    expect(shouldRenderInteriorPerimeterShell("garden", false, "outside", true)).toBe(true);
    expect(shouldRenderInteriorPerimeterShell("garden", true, "outside", true)).toBe(false);
    expect(shouldRenderInteriorPerimeterShell("exterior", false, "outside", false)).toBe(false);
    expect(shouldRenderInteriorPerimeterShell("family-table", false, "ground", false)).toBe(true);
  });

  it("switches to the outdoor scene just after the camera clears the facade", () => {
    const frontZ = HOUSE_LAYOUT.exterior.depth / 2;
    const outsideFace = frontZ + HOUSE_LAYOUT.exterior.wallThickness / 2;
    expect(getCameraZoneForPosition({x: 0, y: 1.65, z: outsideFace + 0.12})).toBe("outside");
    expect(getCameraZoneForPosition({x: 0, y: 1.65, z: frontZ - 0.2})).toBe("ground");
    expect(getCameraZoneForPosition({x: 0, y: HOUSE_LAYOUT.upperY + 1.65, z: 0})).toBe("upper");
    // At z=0 the camera is still above the extended hatch; this point clears its front edge.
    expect(getCameraZoneForPosition({x: 0, y: HOUSE_LAYOUT.roofY + 1.2, z: 0.9})).toBe("roof");
    expect(getCameraZoneForPosition({x: 0, y: HOUSE_LAYOUT.roofY + 0.95, z: 0})).toBe("upper");
  });

  it("keeps the interior visible until the camera clears the roof hatch horizontally", () => {
    const opening = HOUSE_LAYOUT.stairs.roofOpening;
    const aboveHatch = {
      x: opening.centerX,
      y: HOUSE_LAYOUT.roofY + 1.215,
      z: opening.centerZ,
    };
    expect(getCameraZoneForPosition(aboveHatch)).toBe("upper");

    // The actual path steps sideways past the opening before switching to roof visibility.
    const onDeckBesideHatch = {
      x: opening.centerX + opening.width / 2 + 0.16,
      y: HOUSE_LAYOUT.roofY + 1.65,
      z: HOUSE_LAYOUT.stairs.roofFlight.to[2] + 0.05,
    };
    expect(getCameraZoneForPosition(onDeckBesideHatch)).toBe("roof");
  });

  it("shows only the ground storey for a settled ground-floor room", () => {
    const visibility = getHouseSceneVisibility("family-table", "family-table", false);
    expect(visibility.showGroundRooms).toBe(true);
    expect(visibility.showUpperRooms).toBe(false);
    expect(visibility.showUpperCirculation).toBe(false);
    expect(visibility.showRoofDeck).toBe(false);
    expect(visibility.showGarden).toBe(false);
  });

  it("keeps the upper landing visible without exposing stair flights inside a private-room view", () => {
    const visibility = getHouseSceneVisibility("zineb-room", "zineb-room", false);
    expect(visibility.showGroundRooms).toBe(false);
    expect(visibility.showUpperRooms).toBe(true);
    expect(visibility.showUpperCirculation).toBe(true);
    expect(visibility.showRoofStairs).toBe(false);
    expect(visibility.showGroundStairs).toBe(false);
    expect(visibility.showRoofDeck).toBe(false);
  });

  it("reveals both storeys only when a walkthrough is actually changing floors", () => {
    const upward = getHouseSceneVisibility("zineb-room", "family-table", true);
    expect(upward.showGroundRooms).toBe(true);
    expect(upward.showUpperRooms).toBe(true);
    expect(upward.showUpperCirculation).toBe(true);
    expect(upward.showRoofDeck).toBe(false);

    const downward = getHouseSceneVisibility("family-table", "zineb-room", true);
    expect(downward.showGroundRooms).toBe(true);
    expect(downward.showUpperRooms).toBe(true);
  });

  it("keeps ground-floor rooms out of a settled rooftop view while leaving the hatch and stair visible", () => {
    const visibility = getHouseSceneVisibility("rooftop", "rooftop", false);
    expect(visibility.showGroundRooms).toBe(false);
    expect(visibility.showUpperRooms).toBe(false);
    expect(visibility.showUpperCirculation).toBe(true);
    expect(visibility.showRoofStairs).toBe(true);
    expect(visibility.showRoofDeck).toBe(true);
  });

  it("keeps exterior and garden views outside the room shells", () => {
    const exterior = getHouseSceneVisibility("exterior", "exterior", false);
    expect(exterior.showExteriorShell).toBe(true);
    expect(exterior.showGroundRooms).toBe(false);
    expect(exterior.showUpperRooms).toBe(false);
    expect(exterior.showGroundStairs).toBe(false);
    expect(exterior.showRoofStairs).toBe(false);

    const garden = getHouseSceneVisibility("garden", "garden", false);
    expect(garden.showExteriorShell).toBe(true);
    expect(garden.showGarden).toBe(true);
    expect(garden.showGroundRooms).toBe(false);
    expect(garden.showUpperRooms).toBe(false);
    expect(garden.showRoofDeck).toBe(true);
  });

  it("hides the roof slab while the camera is climbing to the rooftop", () => {
    const climbing = getHouseSceneVisibility("rooftop", "family-table", true);
    expect(climbing.showRoofDeck).toBe(false);
    expect(climbing.showRoofStairs).toBe(true);
    expect(climbing.showUpperRooms).toBe(true);
    expect(climbing.showGroundStairs).toBe(true);
  });

  it("keeps the shell at the front door until the camera crosses the threshold", () => {
    const approaching = getHouseSceneVisibility("entrance", "exterior", true, true);
    const inside = getHouseSceneVisibility("entrance", "exterior", true, false);
    expect(approaching.showExteriorShell).toBe(true);
    expect(inside.showExteriorShell).toBe(false);
    expect(inside.showGroundRooms).toBe(true);
  });

  it("renders the stairs and storeys while a route leaves an upper floor for outdoors", () => {
    const leaving = getHouseSceneVisibility("exterior", "zineb-room", true, false);
    expect(leaving.showExteriorShell).toBe(false);
    expect(leaving.showGroundRooms).toBe(true);
    expect(leaving.showUpperRooms).toBe(true);
    expect(leaving.showUpperCirculation).toBe(true);
    expect(leaving.showGroundStairs).toBe(true);
    expect(leaving.showRoofStairs).toBe(false);
  });

  it("keeps appropriate stair flights available for outside-to-roof travel", () => {
    const enteringRoof = getHouseSceneVisibility("rooftop", "exterior", true, true);
    expect(enteringRoof.showExteriorShell).toBe(true);
    expect(enteringRoof.showGroundRooms).toBe(true);
    expect(enteringRoof.showUpperRooms).toBe(true);
    expect(enteringRoof.showGroundStairs).toBe(true);
    expect(enteringRoof.showRoofStairs).toBe(true);
  });

  it("shows the garden and terrace deck outside, but removes them on the way indoors", () => {
    const outside = getHouseSceneVisibility("exterior", "exterior", false);
    expect(outside.showGarden).toBe(true);
    expect(outside.showRoofDeck).toBe(true);

    const entering = getHouseSceneVisibility("entrance", "exterior", true);
    expect(entering.showGarden).toBe(false);
    expect(entering.showRoofDeck).toBe(false);
    expect(entering.showExteriorShell).toBe(true);

    const garden = getHouseSceneVisibility("garden", "exterior", true);
    expect(garden.showGarden).toBe(true);
    expect(garden.showGroundRooms).toBe(false);
    expect(garden.showExteriorShell).toBe(true);
  });
  it("shows only the current storey while ascending and preserves required stair flights", () => {
    const lowerFlight = getHouseSceneVisibility("rooftop", "family-table", true, false, "ground");
    expect(lowerFlight.showGroundRooms).toBe(true);
    expect(lowerFlight.showUpperRooms).toBe(true);
    expect(lowerFlight.showUpperCirculation).toBe(true);
    expect(lowerFlight.showGroundStairs).toBe(true);
    expect(lowerFlight.showRoofStairs).toBe(false);
    expect(lowerFlight.showRoofDeck).toBe(false);

    const upperLanding = getHouseSceneVisibility("rooftop", "family-table", true, false, "upper");
    expect(upperLanding.showGroundRooms).toBe(true);
    expect(upperLanding.showUpperRooms).toBe(true);
    expect(upperLanding.showGroundStairs).toBe(true);
    expect(upperLanding.showRoofStairs).toBe(true);

    const roof = getHouseSceneVisibility("rooftop", "family-table", true, false, "roof");
    expect(roof.showGroundRooms).toBe(false);
    // Keep the upstairs partitions until the camera fully clears the hatch.
    expect(roof.showUpperRooms).toBe(true);
    expect(roof.showUpperCirculation).toBe(true);
    expect(roof.showRoofStairs).toBe(true);
    expect(roof.showRoofDeck).toBe(true);
  });

  it("stops drawing the interior as an upstairs route exits into the garden", () => {
    const upper = getHouseSceneVisibility("garden", "zineb-room", true, false, "upper");
    expect(upper.showUpperRooms).toBe(true);
    expect(upper.showGroundRooms).toBe(true);
    expect(upper.showGroundStairs).toBe(true);

    const lower = getHouseSceneVisibility("garden", "zineb-room", true, false, "ground");
    expect(lower.showGroundRooms).toBe(true);
    expect(lower.showUpperRooms).toBe(true);
    expect(lower.showGroundStairs).toBe(true);

    const outside = getHouseSceneVisibility("garden", "zineb-room", true, false, "outside");
    expect(outside.showExteriorShell).toBe(false);
    expect(outside.showGroundRooms).toBe(false);
    expect(outside.showUpperRooms).toBe(false);
    expect(outside.showGroundStairs).toBe(false);
    expect(outside.showGarden).toBe(true);
  });

  it("does not reveal stair geometry for an ordinary front-door entry", () => {
    const entering = getHouseSceneVisibility("entrance", "exterior", true, true, "ground");
    expect(entering.showGroundRooms).toBe(true);
    expect(entering.showUpperRooms).toBe(false);
    expect(entering.showUpperCirculation).toBe(false);
    expect(entering.showGroundStairs).toBe(false);
    expect(entering.showRoofStairs).toBe(false);
  });

  it("does not reveal the lower staircase when walking only between the upper floor and roof", () => {
    const upperToRoof = getHouseSceneVisibility("rooftop", "zineb-room", true, false, "upper");
    expect(upperToRoof.showUpperRooms).toBe(true);
    expect(upperToRoof.showUpperCirculation).toBe(true);
    expect(upperToRoof.showRoofStairs).toBe(true);
    expect(upperToRoof.showGroundStairs).toBe(false);
  });

});

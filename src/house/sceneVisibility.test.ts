import {describe, expect, it} from "vitest";
import {getHouseSceneVisibility} from "./sceneVisibility";

describe("level-aware house rendering", () => {
  it("shows only the ground storey for a settled ground-floor room", () => {
    const visibility = getHouseSceneVisibility("family-table", "family-table", false);
    expect(visibility.showGroundRooms).toBe(true);
    expect(visibility.showUpperRooms).toBe(false);
    expect(visibility.showUpperCirculation).toBe(false);
    expect(visibility.showRoofDeck).toBe(false);
    expect(visibility.showGarden).toBe(false);
  });

  it("shows the upper storey and its actual circulation for an upstairs room", () => {
    const visibility = getHouseSceneVisibility("zineb-room", "zineb-room", false);
    expect(visibility.showGroundRooms).toBe(false);
    expect(visibility.showUpperRooms).toBe(true);
    expect(visibility.showUpperCirculation).toBe(true);
    expect(visibility.showRoofStairs).toBe(true);
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
});

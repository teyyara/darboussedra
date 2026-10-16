import { getRoomBySlug, type HouseLocation } from "./rooms";

export type HouseSceneLevel = "exterior" | "ground" | "upper" | "outdoor" | "roof";

export interface HouseSceneVisibility {
  readonly showExteriorShell: boolean;
  readonly showGroundRooms: boolean;
  readonly showUpperRooms: boolean;
  readonly showUpperCirculation: boolean;
  readonly showGroundStairs: boolean;
  readonly showRoofStairs: boolean;
  readonly showGarden: boolean;
  readonly showRoofDeck: boolean;
}

function levelFor(location: HouseLocation): HouseSceneLevel {
  if (location === "exterior" || location === "map") return "exterior";
  if (location === "rooftop") return "roof";
  const room = getRoomBySlug(location);
  if (room?.level === "upper") return "upper";
  if (room?.level === "outdoor") return "outdoor";
  return "ground";
}

/**
 * Each settled destination gets its own coherent view: the exterior is not
 * overdrawn with room interiors, garden cameras do not sit inside house walls,
 * and an interior camera never looks through the opaque exterior shell.
 * Stair flights remain visible while traversing levels and at the rooftop,
 * rather than dominating every room in the house.
 */
export function getHouseSceneVisibility(
  location: HouseLocation,
  settledLocation: HouseLocation,
  transitioning: boolean,
): HouseSceneVisibility {
  const destinationLevel = levelFor(location);
  const sourceLevel = levelFor(settledLocation);
  const movingBetweenStoreys = transitioning && sourceLevel !== destinationLevel &&
    ["ground", "upper", "roof"].includes(sourceLevel) &&
    ["ground", "upper", "roof"].includes(destinationLevel);

  const showExteriorShell = location === "exterior" ||
    (location === "garden" && !transitioning) ||
    (transitioning && settledLocation === "exterior");

  const showGroundRooms = destinationLevel === "ground" ||
    (transitioning && sourceLevel === "ground");
  const showUpperRooms = destinationLevel === "upper" ||
    (transitioning && (sourceLevel === "upper" || sourceLevel === "roof" || destinationLevel === "roof"));
  const showUpperCirculation = destinationLevel === "upper" || destinationLevel === "roof" ||
    (transitioning && (sourceLevel === "upper" || sourceLevel === "roof"));
  const showGroundStairs = movingBetweenStoreys &&
    (sourceLevel === "ground" || destinationLevel === "ground");
  const showRoofStairs = (!transitioning && destinationLevel === "roof") ||
    (transitioning && (sourceLevel === "roof" || destinationLevel === "roof"));

  const showGarden = (!transitioning && (location === "exterior" || location === "garden")) ||
    (transitioning && location === "garden");
  const showRoofDeck = !transitioning &&
    (location === "exterior" || location === "garden" || location === "rooftop");

  return {
    showExteriorShell,
    showGroundRooms,
    showUpperRooms,
    showUpperCirculation,
    showGroundStairs,
    showRoofStairs,
    showGarden,
    showRoofDeck,
  };
}

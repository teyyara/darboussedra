import { getRoomBySlug, type HouseLocation } from "./rooms";

export type HouseSceneLevel = "exterior" | "ground" | "upper" | "outdoor" | "roof";
export type CameraZone = "outside" | "ground" | "upper" | "roof";

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

function usesUpperStorey(level: HouseSceneLevel): boolean {
  return level === "upper" || level === "roof";
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
  exteriorShellOverride?: boolean,
  cameraZone?: CameraZone,
): HouseSceneVisibility {
  const destinationLevel = levelFor(location);
  const sourceLevel = levelFor(settledLocation);
  const movingBetweenStoreys = transitioning && sourceLevel !== destinationLevel &&
    ["ground", "upper", "roof"].includes(sourceLevel) &&
    ["ground", "upper", "roof"].includes(destinationLevel);
  const sourceIsOutside = sourceLevel === "exterior" || sourceLevel === "outdoor";
  const destinationIsOutside = destinationLevel === "exterior" || destinationLevel === "outdoor";
  const crossingHouseBoundary = transitioning &&
    ((sourceIsOutside && !destinationIsOutside) || (!sourceIsOutside && destinationIsOutside));

  const calculatedExteriorShell = location === "exterior" ||
    (location === "garden" && !transitioning) ||
    (transitioning && settledLocation === "exterior");
  const showExteriorShell = exteriorShellOverride ?? calculatedExteriorShell;

  // While walking, reveal only the storey under the camera and the stair/landing
  // geometry needed for this route. This avoids drawing distant storeys through
  // the walls and hides the house interior as soon as the camera exits outdoors.
  if (transitioning && cameraZone) {
    const inside = cameraZone !== "outside";
    const routeUsesLowerStairs = movingBetweenStoreys ||
      (crossingHouseBoundary && (usesUpperStorey(sourceLevel) || usesUpperStorey(destinationLevel)));
    const routeUsesRoofStairs = sourceLevel === "roof" || destinationLevel === "roof" ||
      settledLocation === "rooftop" || location === "rooftop";
    const showGarden = cameraZone === "outside" &&
      (location === "garden" || location === "exterior" || settledLocation === "garden" || settledLocation === "exterior");
    return {
      showExteriorShell,
      showGroundRooms: cameraZone === "ground",
      showUpperRooms: cameraZone === "upper",
      showUpperCirculation: inside &&
        (cameraZone === "upper" || (cameraZone === "ground" && routeUsesLowerStairs)),
      showGroundStairs: inside && (cameraZone === "ground" || cameraZone === "upper") && routeUsesLowerStairs,
      showRoofStairs: inside && routeUsesRoofStairs && (cameraZone === "upper" || cameraZone === "roof"),
      showGarden,
      showRoofDeck: cameraZone === "roof",
    };
  }

  const showGroundRooms = destinationLevel === "ground" ||
    (transitioning && sourceLevel === "ground") || crossingHouseBoundary;
  const showUpperRooms = destinationLevel === "upper" ||
    (transitioning && (usesUpperStorey(sourceLevel) || destinationLevel === "roof")) ||
    (crossingHouseBoundary && (usesUpperStorey(sourceLevel) || usesUpperStorey(destinationLevel)));
  const showUpperCirculation = usesUpperStorey(destinationLevel) ||
    (transitioning && usesUpperStorey(sourceLevel)) ||
    (crossingHouseBoundary && (usesUpperStorey(sourceLevel) || usesUpperStorey(destinationLevel)));
  const showGroundStairs = (movingBetweenStoreys && (sourceLevel === "ground" || destinationLevel === "ground")) ||
    (crossingHouseBoundary && (usesUpperStorey(sourceLevel) || usesUpperStorey(destinationLevel)));
  const showRoofStairs = (!transitioning && destinationLevel === "roof") ||
    (transitioning && (sourceLevel === "roof" || destinationLevel === "roof"));

  const showGarden = (!transitioning && (location === "exterior" || location === "garden")) ||
    (transitioning && (location === "garden" || (location === "exterior" && !sourceIsOutside)));
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

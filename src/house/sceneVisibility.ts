import { HOUSE_LAYOUT, getRoomBySlug, type HouseLocation } from "./rooms";

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

const STAIR_CAMERA_HEIGHT = 1.51;
const NORMAL_CAMERA_HEIGHT = 1.65;

/**
 * The stair camera deliberately runs 14cm lower than a normal standing camera to
 * preserve head clearance. Estimate its floor from the authored flight when the
 * camera is actually on that flight, rather than switching levels one tread late.
 */
function cameraFloorY(position: { readonly x: number; readonly y: number; readonly z: number }): number {
  const flights = [HOUSE_LAYOUT.stairs.groundFlight, HOUSE_LAYOUT.stairs.roofFlight];
  for (const flight of flights) {
    const minZ = Math.min(flight.from[2], flight.to[2]) - 0.12;
    const maxZ = Math.max(flight.from[2], flight.to[2]) + 0.12;
    if (Math.abs(position.x - flight.from[0]) > HOUSE_LAYOUT.stairs.width / 2 + 0.12 ||
        position.z < minZ || position.z > maxZ) continue;
    const progress = (position.z - flight.from[2]) / (flight.to[2] - flight.from[2]);
    const floorAtZ = flight.from[1] + (flight.to[1] - flight.from[1]) * progress;
    const expectedEyeY = floorAtZ + STAIR_CAMERA_HEIGHT;
    // Only use the stair offset when both horizontal position and expected stair
    // elevation agree. Nearby room/hall cameras retain their normal standing height.
    if (Math.abs(position.y - expectedEyeY) <= 0.24) {
      return position.y - STAIR_CAMERA_HEIGHT;
    }
  }
  return position.y - NORMAL_CAMERA_HEIGHT;
}

export function getCameraZoneForPosition(position: { readonly x: number; readonly y: number; readonly z: number }): CameraZone {
  const exteriorFront = HOUSE_LAYOUT.exterior.depth / 2;
  // Switch outside as soon as the camera clears the façade, not a full metre later.
  // Otherwise the interior can vanish behind the camera before the garden is drawn.
  if (position.z > exteriorFront + HOUSE_LAYOUT.exterior.wallThickness / 2 + 0.1) return "outside";
  const floorY = cameraFloorY(position);
  const hatch = HOUSE_LAYOUT.stairs.roofOpening;
  const hatchClearance = 0.12;
  const stillOverHatch =
    Math.abs(position.x - hatch.centerX) <= hatch.width / 2 + hatchClearance &&
    Math.abs(position.z - hatch.centerZ) <= hatch.depth / 2 + hatchClearance;
  // Do not swap to rooftop visibility solely because the camera's eye reaches roof height.
  // It may still be physically inside the hatch, where removing the interior ceiling and
  // upper shell exposes a sky-only frame. Switch only after the camera clears the opening.
  if (floorY >= HOUSE_LAYOUT.roofY - 0.5 && !stillOverHatch) return "roof";
  if (floorY >= HOUSE_LAYOUT.upperY - 0.25) return "upper";
  return "ground";
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
    const routeUsesLowerStairs =
      (movingBetweenStoreys && (sourceLevel === "ground" || destinationLevel === "ground")) ||
      (crossingHouseBoundary && (usesUpperStorey(sourceLevel) || usesUpperStorey(destinationLevel)));
    const routeUsesRoofStairs = sourceLevel === "roof" || destinationLevel === "roof" ||
      settledLocation === "rooftop" || location === "rooftop";
    const showGarden = cameraZone === "outside" &&
      (location === "garden" || location === "exterior" || settledLocation === "garden" || settledLocation === "exterior");
    // Keep both levels' wall shells alive while the camera walks between floors.
    // Crossing a height threshold must not make the previous level disappear mid-step.
    const crossesUpperLevel = movingBetweenStoreys ||
      (crossingHouseBoundary && (usesUpperStorey(sourceLevel) || usesUpperStorey(destinationLevel)));
    const keepBothStoreys = crossesUpperLevel && (cameraZone === "ground" || cameraZone === "upper");
    return {
      showExteriorShell,
      showGroundRooms: cameraZone === "ground" || keepBothStoreys,
      // Keep the upper wall shell through the final roof-hatch transition. Otherwise
      // crossing the height threshold removes every interior wall before the camera lands.
      showUpperRooms: cameraZone === "upper" || keepBothStoreys ||
        (cameraZone === "roof" && routeUsesRoofStairs),
      showUpperCirculation: inside &&
        (cameraZone === "upper" ||
          (cameraZone === "ground" && routeUsesLowerStairs) ||
          (cameraZone === "roof" && routeUsesRoofStairs && transitioning)),
      showGroundStairs: inside && (cameraZone === "ground" || cameraZone === "upper") && routeUsesLowerStairs,
      showRoofStairs: inside && routeUsesRoofStairs && (cameraZone === "upper" || cameraZone === "roof"),
      showGarden,
      showRoofDeck: cameraZone === "roof",
    };
  }

  // The family-table doorway opens directly onto the stair hall. Keep that stair
  // and its upper landing visible in a settled view so the doorway does not reveal
  // an empty corridor; other ground-floor rooms keep the upstairs circulation hidden.
  const settledAtStairHall = !transitioning &&
    location === "family-table" && settledLocation === "family-table";
  const showGroundRooms = destinationLevel === "ground" ||
    (transitioning && sourceLevel === "ground") || crossingHouseBoundary;
  const showUpperRooms = destinationLevel === "upper" ||
    (transitioning && (usesUpperStorey(sourceLevel) || destinationLevel === "roof")) ||
    (crossingHouseBoundary && (usesUpperStorey(sourceLevel) || usesUpperStorey(destinationLevel)));
  const showUpperCirculation = usesUpperStorey(destinationLevel) ||
    (transitioning && usesUpperStorey(sourceLevel)) ||
    (crossingHouseBoundary && (usesUpperStorey(sourceLevel) || usesUpperStorey(destinationLevel))) ||
    settledAtStairHall;
  const showGroundStairs = (movingBetweenStoreys && (sourceLevel === "ground" || destinationLevel === "ground")) ||
    (crossingHouseBoundary && (usesUpperStorey(sourceLevel) || usesUpperStorey(destinationLevel)) ||
    settledAtStairHall);
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


/**
 * Keep the indoor boundary present until its outdoor replacement is definitely
 * visible. A room can mount before its camera-zone update, and door transitions
 * intentionally hide the exterior shell briefly while crossing the threshold.
 */
export function shouldRenderInteriorPerimeterShell(
  location: HouseLocation,
  showExteriorShell: boolean,
  cameraZone: CameraZone,
  transitioning: boolean,
): boolean {
  const indoorDestination = location !== "exterior" && location !== "map" && location !== "garden";
  return !showExteriorShell && (cameraZone !== "outside" || transitioning || indoorDestination);
}

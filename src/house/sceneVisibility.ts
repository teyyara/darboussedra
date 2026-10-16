import { getRoomBySlug, type HouseLocation } from "./rooms";

export type HouseSceneLevel = "ground" | "upper" | "roof";

export interface HouseSceneVisibility {
  readonly showGroundRooms: boolean;
  readonly showUpperRooms: boolean;
  readonly showUpperCirculation: boolean;
  readonly showGroundStairs: boolean;
  readonly showRoofStairs: boolean;
  readonly showGarden: boolean;
  readonly showRoofDeck: boolean;
}

function levelFor(location: HouseLocation): HouseSceneLevel {
  if (location === "rooftop") return "roof";
  const room = getRoomBySlug(location);
  if (room?.level === "upper") return "upper";
  return "ground";
}

/**
 * The walkthrough is level-aware: only the active storey is visible once
 * settled. Both floors are revealed only while the route physically traverses
 * between levels, and an interior room never carries the rooftop slab over it.
 */
export function getHouseSceneVisibility(
  location: HouseLocation,
  settledLocation: HouseLocation,
  transitioning: boolean,
): HouseSceneVisibility {
  const destinationLevel = levelFor(location);
  const sourceLevel = levelFor(settledLocation);

  const showGroundRooms = destinationLevel === "ground" || (transitioning && sourceLevel === "ground");
  const showUpperRooms = destinationLevel === "upper" ||
    (transitioning && (sourceLevel === "upper" || sourceLevel === "roof" || destinationLevel === "roof"));
  const showUpperCirculation = showUpperRooms || destinationLevel === "roof";
  const showGroundStairs = destinationLevel === "ground" || (transitioning && sourceLevel === "ground");
  const showRoofStairs = showUpperCirculation;

  const showGarden = transitioning
    ? location === "garden"
    : location === "exterior" || location === "garden";
  const showRoofDeck = transitioning
    ? location === "rooftop"
    : location === "exterior" || location === "garden" || location === "rooftop";

  return {
    showGroundRooms,
    showUpperRooms,
    showUpperCirculation,
    showGroundStairs,
    showRoofStairs,
    showGarden,
    showRoofDeck,
  };
}

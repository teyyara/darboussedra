import { EXTERIOR_CAMERA, HOUSE_LAYOUT, getRoomBySlug, roomBounds, type Vector3Tuple } from "./rooms";

export interface MoroccanNeighborBuilding {
  readonly id: string;
  readonly centerX: number;
  readonly centerZ: number;
  readonly width: number;
  readonly depth: number;
  readonly height: number;
  readonly wallColor: string;
  readonly trimColor: string;
  readonly frameColor: string;
  readonly glassColor: string;
}

export const MOROCCAN_NEIGHBORHOOD: readonly MoroccanNeighborBuilding[] = [
  {
    id: "west-neighbor",
    centerX: -9.35, centerZ: 0.4, width: 7.4, depth: 10.0, height: 4.65,
    wallColor: "#e0c7a5", trimColor: "#bd966e", frameColor: "#76543e", glassColor: "#75888a",
  },
  {
    id: "east-neighbor",
    centerX: 9.35, centerZ: 0.1, width: 7.4, depth: 10.0, height: 5.1,
    wallColor: "#e8d8bb", trimColor: "#b68d65", frameColor: "#75523b", glassColor: "#637d83",
  },
  {
    id: "west-row-house",
    centerX: -16.8, centerZ: -2.35, width: 7.5, depth: 9.3, height: 5.65,
    wallColor: "#d5b88f", trimColor: "#b08b66", frameColor: "#5e7478", glassColor: "#607a7d",
  },
  {
    id: "east-row-house",
    centerX: 16.8, centerZ: -2.6, width: 7.5, depth: 9.3, height: 4.75,
    wallColor: "#deceb2", trimColor: "#b9946c", frameColor: "#795b43", glassColor: "#657e82",
  },
];

export interface StreetSurface {
  readonly width: number;
  readonly depth: number;
  readonly centerZ: number;
  readonly centerY: number;
  readonly height: number;
}

export const MOROCCAN_STREET: Readonly<{
  sidewalk: StreetSurface;
  road: StreetSurface;
}> = {
  sidewalk: { width: 44, depth: 1.0, centerZ: 9.95, centerY: -0.03, height: 0.08 },
  road: { width: 44, depth: 5.1, centerZ: 13.0, centerY: -0.075, height: 0.08 },
};

/** Basic geometric checks for the procedural exterior context. */
export function neighborhoodLayoutIssues(): string[] {
  const issues: string[] = [];
  const shellHalfWidth = HOUSE_LAYOUT.exterior.width / 2;
  for (const building of MOROCCAN_NEIGHBORHOOD) {
    const values = [building.centerX, building.centerZ, building.width, building.depth, building.height];
    if (values.some((value) => !Number.isFinite(value)) || building.width <= 0 || building.depth <= 0 || building.height <= 0) {
      issues.push("Invalid neighborhood building geometry: " + building.id);
      continue;
    }
    if (Math.abs(building.centerX) - building.width / 2 <= shellHalfWidth + 0.025) {
      issues.push("Neighbor overlaps the main house footprint: " + building.id);
    }
    if (building.height < HOUSE_LAYOUT.roomWallHeight + 1.8) {
      issues.push("Neighbor building is too low to read as a house: " + building.id);
    }
  }

  const garden = getRoomBySlug("garden");
  if (garden) {
    const gardenBounds = roomBounds(garden);
    const sidewalkMin = MOROCCAN_STREET.sidewalk.centerZ - MOROCCAN_STREET.sidewalk.depth / 2;
    const sidewalkMax = MOROCCAN_STREET.sidewalk.centerZ + MOROCCAN_STREET.sidewalk.depth / 2;
    const roadMin = MOROCCAN_STREET.road.centerZ - MOROCCAN_STREET.road.depth / 2;
    const roadMax = MOROCCAN_STREET.road.centerZ + MOROCCAN_STREET.road.depth / 2;
    if (sidewalkMax < gardenBounds.maxZ - 0.3) issues.push("Sidewalk is disconnected from the front garden.");
    if (Math.abs(sidewalkMax - roadMin) > 0.025) issues.push("The sidewalk and street must meet without a gap.");
    if (EXTERIOR_CAMERA.position[2] < roadMin || EXTERIOR_CAMERA.position[2] > roadMax) {
      issues.push("Exterior starting camera should overlook the residential street edge.");
    }
  }
  return issues;
}

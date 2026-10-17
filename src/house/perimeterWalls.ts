import { HOUSE_LAYOUT, type Vector3Tuple } from "./rooms";

export interface FacadePanelGeometry {
  readonly position: Vector3Tuple;
  readonly size: Vector3Tuple;
}

export interface PerimeterWallPanel extends FacadePanelGeometry {
  readonly key: string;
}

/** The front facade is split around the doorway and four window apertures. */
export function getExteriorFacadePanels(): FacadePanelGeometry[] {
  const { width, depth, wallThickness, wallHeight } = HOUSE_LAYOUT.exterior;
  const frontZ = depth / 2;
  const halfWidth = width / 2;
  const doorWidth = HOUSE_LAYOUT.entrance.doorWidth;
  const doorHeight = HOUSE_LAYOUT.entrance.doorHeight;
  const frontWindowWidth = 1.3;
  const windowCenterX = halfWidth - 2.55;
  const windowOuterEdge = windowCenterX + frontWindowWidth / 2;
  const windowInnerEdge = windowCenterX - frontWindowWidth / 2;
  const outerPanelWidth = halfWidth - windowOuterEdge;
  const sidePanelWidth = windowInnerEdge - doorWidth / 2;
  const sidePanelCenter = (windowInnerEdge + doorWidth / 2) / 2;

  return [
    { position: [-(windowOuterEdge + halfWidth) / 2, wallHeight / 2, frontZ] as Vector3Tuple,
      size: [outerPanelWidth, wallHeight, wallThickness] as Vector3Tuple },
    { position: [-windowCenterX, 0.775, frontZ] as Vector3Tuple,
      size: [frontWindowWidth, 1.55, wallThickness] as Vector3Tuple },
    { position: [-windowCenterX, 3.1, frontZ] as Vector3Tuple,
      size: [frontWindowWidth, 0.8, wallThickness] as Vector3Tuple },
    { position: [-windowCenterX, (4.65 + wallHeight) / 2, frontZ] as Vector3Tuple,
      size: [frontWindowWidth, wallHeight - 4.65, wallThickness] as Vector3Tuple },
    { position: [-sidePanelCenter, wallHeight / 2, frontZ] as Vector3Tuple,
      size: [sidePanelWidth, wallHeight, wallThickness] as Vector3Tuple },
    { position: [0, (doorHeight + wallHeight) / 2, frontZ] as Vector3Tuple,
      size: [doorWidth, wallHeight - doorHeight, wallThickness] as Vector3Tuple },
    { position: [sidePanelCenter, wallHeight / 2, frontZ] as Vector3Tuple,
      size: [sidePanelWidth, wallHeight, wallThickness] as Vector3Tuple },
    { position: [windowCenterX, 0.775, frontZ] as Vector3Tuple,
      size: [frontWindowWidth, 1.55, wallThickness] as Vector3Tuple },
    { position: [windowCenterX, 3.1, frontZ] as Vector3Tuple,
      size: [frontWindowWidth, 0.8, wallThickness] as Vector3Tuple },
    { position: [windowCenterX, (4.65 + wallHeight) / 2, frontZ] as Vector3Tuple,
      size: [frontWindowWidth, wallHeight - 4.65, wallThickness] as Vector3Tuple },
    { position: [(windowOuterEdge + halfWidth) / 2, wallHeight / 2, frontZ] as Vector3Tuple,
      size: [outerPanelWidth, wallHeight, wallThickness] as Vector3Tuple },
  ];
}

/**
 * Closed indoor perimeter at the full exterior dimensions. These walls are separate
 * from room partitions: side walls complete the landing corridor and front panels
 * keep the entry facade intact without blocking the doorway or windows.
 */
export function getInteriorPerimeterWallPanels(): PerimeterWallPanel[] {
  const { width, depth, wallThickness, wallHeight } = HOUSE_LAYOUT.exterior;
  const halfWidth = width / 2;
  const frontZ = depth / 2;
  const backZ = -frontZ;

  return [
    {
      key: "left-side",
      position: [-halfWidth, wallHeight / 2, 0],
      size: [wallThickness + 0.18, wallHeight, depth],
    },
    {
      key: "right-side",
      position: [halfWidth, wallHeight / 2, 0],
      size: [wallThickness, wallHeight, depth],
    },
    {
      key: "rear",
      position: [0, wallHeight / 2, backZ],
      size: [width, wallHeight, wallThickness],
    },
    ...getExteriorFacadePanels().map((panel, index) => ({
      ...panel,
      key: "front-" + index,
    })),
  ];
}

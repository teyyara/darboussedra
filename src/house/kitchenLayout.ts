import type { Vector3Tuple } from "./rooms";

interface FittedPiece {
  readonly center: Vector3Tuple;
  readonly size: Vector3Tuple;
}

export interface KitchenFixtureLayout {
  readonly counterCenterX: number;
  readonly cabinetFrontX: number;
  readonly cabinetHandleX: number;
  readonly cabinetDoorZs: readonly number[];
  readonly cooktop: FittedPiece & {
    readonly burners: readonly Vector3Tuple[];
    readonly controls: readonly Vector3Tuple[];
  };
  readonly sink: FittedPiece & {
    readonly basinCenter: Vector3Tuple;
    readonly basinSize: Vector3Tuple;
    readonly rim: readonly FittedPiece[];
    readonly faucetBase: Vector3Tuple;
    readonly faucetStem: Vector3Tuple;
    readonly faucetSpout: Vector3Tuple;
    readonly faucetOutlet: Vector3Tuple;
  };
}

/** Dimensions and positions are local to the room floor, including the fitted counter top. */
export function getKitchenFixtureLayout(roomWidth: number): KitchenFixtureLayout {
  const counterCenterX = roomWidth / 2 - 0.48;
  const cooktopCenter: Vector3Tuple = [counterCenterX, 0.79, -0.58];
  const sinkCenter: Vector3Tuple = [counterCenterX, 0.785, 0.48];
  const offsetX = 0.12;
  const offsetZ = 0.13;
  return {
    counterCenterX,
    cabinetFrontX: counterCenterX - 0.37,
    cabinetHandleX: counterCenterX - 0.415,
    cabinetDoorZs: [-0.75, -0.05, 0.65],
    cooktop: {
      center: cooktopCenter,
      size: [0.5, 0.012, 0.52],
      burners: [
        [counterCenterX - offsetX, 0.798, -0.58 - offsetZ],
        [counterCenterX + offsetX, 0.798, -0.58 - offsetZ],
        [counterCenterX - offsetX, 0.798, -0.58 + offsetZ],
        [counterCenterX + offsetX, 0.798, -0.58 + offsetZ],
      ],
      controls: [
        [counterCenterX - 0.15, 0.798, -0.28],
        [counterCenterX - 0.05, 0.798, -0.28],
        [counterCenterX + 0.05, 0.798, -0.28],
        [counterCenterX + 0.15, 0.798, -0.28],
      ],
    },
    sink: {
      center: sinkCenter,
      size: [0.52, 0.014, 0.52],
      basinCenter: [counterCenterX, 0.786, 0.48],
      basinSize: [0.4, 0.008, 0.4],
      rim: [
        { center: [counterCenterX, 0.792, 0.48 - 0.2425], size: [0.52, 0.014, 0.035] },
        { center: [counterCenterX, 0.792, 0.48 + 0.2425], size: [0.52, 0.014, 0.035] },
        { center: [counterCenterX - 0.2425, 0.792, 0.48], size: [0.035, 0.014, 0.45] },
        { center: [counterCenterX + 0.2425, 0.792, 0.48], size: [0.035, 0.014, 0.45] },
      ],
      faucetBase: [counterCenterX, 0.802, 0.79],
      faucetStem: [counterCenterX, 0.88, 0.79],
      faucetSpout: [counterCenterX, 0.946, 0.72],
      faucetOutlet: [counterCenterX, 0.91, 0.65],
    },
  };
}

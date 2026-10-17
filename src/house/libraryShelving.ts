import type { Vector3Tuple } from "./rooms";

export interface LibraryBookProp {
  readonly key: string;
  readonly position: Vector3Tuple;
  readonly size: Vector3Tuple;
  readonly color: string;
}

const BOOK_COLORS = ["#a55e48", "#c8a46d", "#6f8272", "#dcc9a8", "#77586c", "#b37a4e"] as const;
const SHELF_BOARD_X_OFFSET = 0.04;
const SHELF_CENTER_X_OFFSET = 0.23;
const SHELF_BOARD_WIDTH = 0.4;
const BOOK_WIDTH = 0.24;
const BOOK_DEPTH = 0.15;
const BOOK_ROWS = [
  { y: 0.46, height: 0.31 },
  { y: 0.88, height: 0.32 },
  { y: 1.285, height: 0.285 },
] as const;

/**
 * Return room-local positions for the volumes on the camera-facing side of the
 * left-wall bookcase. Earlier books were centered inside the opaque backboard,
 * leaving only a few clipped tops visible and making the library look empty.
 */
export function getLibraryBookProps(roomWidth: number): LibraryBookProp[] {
  const shelfBoardCenterX = SHELF_BOARD_X_OFFSET - roomWidth / 2 + SHELF_CENTER_X_OFFSET;
  const shelfFrontX = shelfBoardCenterX + SHELF_BOARD_WIDTH / 2;
  const bookCenterX = shelfFrontX + BOOK_WIDTH / 2 - 0.015;
  return BOOK_ROWS.flatMap((row, rowIndex) =>
    Array.from({ length: 9 }, (_, column) => {
      const index = rowIndex * 9 + column;
      return {
        key: "library-book-" + index,
        position: [bookCenterX, row.y, -1.04 + column * 0.22] as Vector3Tuple,
        size: [BOOK_WIDTH, row.height + (column % 3) * 0.018, BOOK_DEPTH + (column % 3) * 0.008] as Vector3Tuple,
        color: BOOK_COLORS[index % BOOK_COLORS.length],
      };
    }),
  );
}

import { describe, expect, it } from "vitest";
import { getLibraryBookProps } from "./libraryShelving";

describe("library shelf book layout", () => {
  it("places readable book spines on the room-facing side of the shelf backing", () => {
    const width = 2.6;
    const books = getLibraryBookProps(width);
    const shelfBoardCenterX = 0.04 - width / 2 + 0.23;
    const shelfFrontX = shelfBoardCenterX + 0.4 / 2;
    expect(books).toHaveLength(18);

    for (const book of books) {
      const rearEdge = book.position[0] - book.size[0] / 2;
      const frontEdge = book.position[0] + book.size[0] / 2;
      expect(rearEdge).toBeLessThan(shelfFrontX);
      expect(frontEdge).toBeGreaterThan(shelfFrontX + 0.15);
    }
  });

  it("keeps each book between shelf boards and within the usable shelf length", () => {
    const books = getLibraryBookProps(2.6);
    const boardLevels = [0.25, 0.67, 1.09, 1.48];
    const boardHalfHeight = 0.055 / 2;
    const shelfMinZ = -0.15 - 2.26 / 2;
    const shelfMaxZ = -0.15 + 2.26 / 2;

    for (const book of books) {
      const minY = book.position[1] - book.size[1] / 2;
      const maxY = book.position[1] + book.size[1] / 2;
      for (const boardY of boardLevels) {
        const overlap = Math.min(maxY, boardY + boardHalfHeight) -
          Math.max(minY, boardY - boardHalfHeight);
        expect(overlap > 0.001).toBe(false);
      }
      expect(book.position[2] - book.size[2] / 2).toBeGreaterThan(shelfMinZ);
      expect(book.position[2] + book.size[2] / 2).toBeLessThan(shelfMaxZ);
    }
  });
});

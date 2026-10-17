import { describe, expect, it } from "vitest";
import { HOUSE_LAYOUT, getRoomBySlug } from "./rooms";
import { getRoomCeilingBottomLocal } from "./roomDetails";

describe("room ceiling details", () => {
  it("keeps ground-floor ceiling fixtures below the ground-room ceiling", () => {
    const room = getRoomBySlug("family-table");
    expect(room).toBeDefined();
    expect(getRoomCeilingBottomLocal(room!)).toBeCloseTo(
      HOUSE_LAYOUT.floorThickness + HOUSE_LAYOUT.roomWallHeight - 0.08,
    );
  });

  it("aligns upper-room fixtures with the shared roof underside", () => {
    const room = getRoomBySlug("zineb-room");
    expect(room).toBeDefined();
    expect(getRoomCeilingBottomLocal(room!)).toBeCloseTo(
      HOUSE_LAYOUT.roofY - 0.18 - HOUSE_LAYOUT.upperY,
    );
  });

  it("does not confuse the rooftop with enclosed upper-room ceilings", () => {
    const room = getRoomBySlug("rooftop");
    expect(room).toBeDefined();
    expect(getRoomCeilingBottomLocal(room!)).not.toBeCloseTo(HOUSE_LAYOUT.roofY);
  });
});

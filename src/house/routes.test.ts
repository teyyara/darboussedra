import {describe,expect,it} from "vitest";
import {roomFromPath} from "./routes";

describe("room path resolution",()=>{
  it("resolves a known room's direct URL",()=>{
    expect(roomFromPath("/room/entrance")?.slug).toBe("entrance");
    expect(roomFromPath("/room/kitchen")?.name).toBe("Kitchen");
  });
  it("rejects unknown or malformed room URLs safely",()=>{
    expect(roomFromPath("/room/not-a-room")).toBeUndefined();
    expect(roomFromPath("/room/%E0%A4%A")).toBeUndefined();
    expect(roomFromPath("/house/map")).toBeUndefined();
    expect(roomFromPath("/")).toBeUndefined();
  });
});

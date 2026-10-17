import {describe,expect,it} from "vitest";
import {REQUIRED_ROOM_SLUGS,getRoomBySlug,roomRegistryIssues,rooms} from "./rooms";
describe("Dar Boussedra room registry",()=>{
 it("contains each permanent room once",()=>{
  expect(rooms).toHaveLength(13);
  expect([...rooms.map((room)=>room.slug)].sort()).toEqual([...REQUIRED_ROOM_SLUGS].sort());
  expect(new Set(rooms.map((room)=>room.id)).size).toBe(rooms.length);
  expect(new Set(rooms.map((room)=>room.slug)).size).toBe(rooms.length);
 });
 it("has valid camera, footprint, enclosure and connection metadata",()=>expect(roomRegistryIssues()).toEqual([]));
 it("resolves valid rooms and rejects unknown/future-only slugs",()=>{
  expect(getRoomBySlug("entrance")?.name).toBe("Front Door & Entrance");
  expect(getRoomBySlug("unknown-room")).toBeUndefined();
  expect(getRoomBySlug("yahya-remembrance")).toBeUndefined();
 });
});

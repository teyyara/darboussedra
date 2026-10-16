import {getRoomBySlug,type Room} from "./rooms";

/** Resolve a direct room URL without allowing malformed escapes to crash the app. */
export function roomFromPath(pathname:string):Room|undefined {
  if(!pathname.startsWith("/room/")) return undefined;
  try {
    return getRoomBySlug(decodeURIComponent(pathname.slice("/room/".length)));
  } catch {
    return undefined;
  }
}

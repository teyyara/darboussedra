export type RoomKind = "entry" | "interior" | "outdoor" | "private" | "spiritual";
export type RoomLevel = "ground" | "upper" | "outdoor" | "roof";
export type Vector3Tuple = readonly [number,number,number];
export interface Room {
  readonly id:string; readonly slug:string; readonly name:string; readonly kind:RoomKind; readonly level:RoomLevel;
  readonly scenePosition:Vector3Tuple;
  readonly camera:{readonly position:Vector3Tuple;readonly target:Vector3Tuple};
  readonly mapPosition:{readonly x:number;readonly y:number;readonly width:number;readonly height:number};
  readonly footprint?:readonly [number,number]; readonly connectedTo:readonly string[]; readonly futureNote?:string;
}
export const rooms = [
 {id:"entrance",slug:"entrance",name:"Front Door & Entrance",kind:"entry",level:"ground",scenePosition:[0,.04,3.7],camera:{position:[0,3.2,8.7],target:[0,1.1,3.45]},mapPosition:{x:39,y:72,width:22,height:20},footprint:[2,2.4],connectedTo:["living-room","kitchen","family-table","garden"]},
 {id:"living-room",slug:"living-room",name:"Living Room",kind:"interior",level:"ground",scenePosition:[-3.25,.04,2.25],camera:{position:[-3.1,3,6.7],target:[-3.2,.9,2.1]},mapPosition:{x:2,y:43,width:35,height:45},footprint:[4.5,5.5],connectedTo:["entrance","family-table","library"]},
 {id:"kitchen",slug:"kitchen",name:"Kitchen",kind:"interior",level:"ground",scenePosition:[3.25,.04,2.25],camera:{position:[3.1,3,6.7],target:[3.2,.9,2.1]},mapPosition:{x:63,y:43,width:35,height:45},footprint:[4.5,5.5],connectedTo:["entrance","family-table"]},
 {id:"family-table",slug:"family-table",name:"Family Table",kind:"interior",level:"ground",scenePosition:[0,.04,.95],camera:{position:[0,3.1,5.8],target:[0,.9,.9]},mapPosition:{x:39,y:43,width:22,height:25},footprint:[2,2.6],connectedTo:["entrance","living-room","kitchen","library","pets-corner"]},
 {id:"library",slug:"library",name:"Library",kind:"interior",level:"ground",scenePosition:[-3.25,.04,-2.75],camera:{position:[-7,3.2,-.2],target:[-3.2,.9,-2.7]},mapPosition:{x:2,y:2,width:35,height:35},footprint:[4.5,4.5],connectedTo:["living-room","family-table"]},
 {id:"pets-corner",slug:"pets-corner",name:"Pets' Corner",kind:"interior",level:"ground",scenePosition:[1.75,.04,-1.85],camera:{position:[5.3,3.1,1.2],target:[1.75,.9,-1.8]},mapPosition:{x:40,y:17,width:25,height:23},footprint:[3.5,2.6],connectedTo:["family-table","prayer-room"]},
 {id:"prayer-room",slug:"prayer-room",name:"Prayer Room / Musalla",kind:"spiritual",level:"ground",scenePosition:[4.5,.04,-3.95],camera:{position:[7.3,3.1,-1],target:[4.45,.9,-3.9]},mapPosition:{x:70,y:3,width:28,height:32},footprint:[2,2.1],connectedTo:["pets-corner"],futureNote:"A calm, respectful space without sacred content in this milestone."},
 {id:"zakariae-room",slug:"zakariae-room",name:"Zakariae's Private Room",kind:"private",level:"upper",scenePosition:[-4.1,3.1,-2.2],camera:{position:[-4.1,6.5,2.5],target:[-4.1,4.1,-2.2]},mapPosition:{x:2,y:27,width:21,height:48},footprint:[2.5,4.7],connectedTo:["zineb-room"]},
 {id:"zineb-room",slug:"zineb-room",name:"Zineb's Private Room",kind:"private",level:"upper",scenePosition:[-1.4,3.1,-2.2],camera:{position:[-1.4,6.5,2.5],target:[-1.4,4.1,-2.2]},mapPosition:{x:26,y:27,width:21,height:48},footprint:[2.5,4.7],connectedTo:["zakariae-room","meryem-room"]},
 {id:"meryem-room",slug:"meryem-room",name:"Meryem's Private Room",kind:"private",level:"upper",scenePosition:[1.4,3.1,-2.2],camera:{position:[1.4,6.5,2.5],target:[1.4,4.1,-2.2]},mapPosition:{x:51,y:27,width:21,height:48},footprint:[2.5,4.7],connectedTo:["zineb-room","fatiha-room"]},
 {id:"fatiha-room",slug:"fatiha-room",name:"Fatiha's Private Room",kind:"private",level:"upper",scenePosition:[4.1,3.1,-2.2],camera:{position:[4.1,6.5,2.5],target:[4.1,4.1,-2.2]},mapPosition:{x:76,y:27,width:21,height:48},footprint:[2.5,4.7],connectedTo:["meryem-room","rooftop"]},
 {id:"garden",slug:"garden",name:"Garden",kind:"outdoor",level:"outdoor",scenePosition:[0,.04,8.2],camera:{position:[10.5,5.2,13.4],target:[0,.6,8.2]},mapPosition:{x:0,y:0,width:100,height:100},connectedTo:["entrance"]},
 {id:"rooftop",slug:"rooftop",name:"Rooftop Terrace",kind:"outdoor",level:"roof",scenePosition:[0,5.72,0],camera:{position:[8,9,7],target:[0,5.9,0]},mapPosition:{x:0,y:0,width:100,height:100},connectedTo:["fatiha-room"]}
] as const satisfies readonly Room[];
export type RoomSlug=(typeof rooms)[number]["slug"];
export type HouseLocation="exterior"|"map"|RoomSlug;
export const REQUIRED_ROOM_SLUGS=["entrance","living-room","kitchen","family-table","library","garden","rooftop","pets-corner","prayer-room","zakariae-room","zineb-room","meryem-room","fatiha-room"] as const;
export const EXTERIOR_CAMERA={position:[14,10,16] as Vector3Tuple,target:[0,2.1,0] as Vector3Tuple};
export const MAP_CAMERA={position:[0,17,16] as Vector3Tuple,target:[0,1.4,0] as Vector3Tuple};
export function getRoomBySlug(slug:string):Room|undefined{return rooms.find((room)=>room.slug===slug);}
export function roomRegistryIssues():string[]{
 const issues:string[]=[];const ids=rooms.map((room)=>room.id);const slugs=rooms.map((room)=>room.slug);
 if(new Set(ids).size!==ids.length)issues.push("Room IDs must be unique.");
 if(new Set(slugs).size!==slugs.length)issues.push("Room slugs must be unique.");
 for(const slug of REQUIRED_ROOM_SLUGS)if(!slugs.includes(slug))issues.push("Missing required room: "+slug);
 for(const room of rooms){
  if([...room.camera.position,...room.camera.target].some((value)=>!Number.isFinite(value)))issues.push("Invalid camera pose: "+room.slug);
  if(![room.mapPosition.x,room.mapPosition.y,room.mapPosition.width,room.mapPosition.height].every(Number.isFinite)||room.mapPosition.x<0||room.mapPosition.y<0||room.mapPosition.width<=0||room.mapPosition.height<=0)issues.push("Invalid map position: "+room.slug);
  if(room.footprint&&(room.footprint[0]<=0||room.footprint[1]<=0))issues.push("Invalid footprint: "+room.slug);
  for(const neighbor of room.connectedTo)if(!slugs.includes(neighbor))issues.push("Unknown connection "+neighbor+" from "+room.slug);
 }
 return issues;
}

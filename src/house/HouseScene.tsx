import {useEffect,useMemo,useRef} from "react";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {Vector3} from "three";
import {EXTERIOR_CAMERA,MAP_CAMERA,getRoomBySlug,rooms,type HouseLocation,type Room,type RoomSlug,type Vector3Tuple} from "./rooms";

function CameraRig({position,target,reducedMotion}:{position:Vector3Tuple;target:Vector3Tuple;reducedMotion:boolean}) {
 const {camera,invalidate}=useThree();
 const desired=useMemo(()=>new Vector3(position[0],position[1],position[2]),[position]);
 const lookAt=useMemo(()=>new Vector3(target[0],target[1],target[2]),[target]);
 const currentLookAt=useRef(new Vector3(EXTERIOR_CAMERA.target[0],EXTERIOR_CAMERA.target[1],EXTERIOR_CAMERA.target[2]));
 useEffect(()=>{
  if(reducedMotion){
   camera.position.copy(desired);
   currentLookAt.current.copy(lookAt);
   camera.lookAt(lookAt);
   camera.updateProjectionMatrix();
  }
  invalidate();
 },[camera,desired,lookAt,reducedMotion,invalidate]);
 useFrame((_state,delta)=>{
  if(reducedMotion)return;
  const amount=1-Math.exp(-3*delta);
  camera.position.lerp(desired,amount);
  currentLookAt.current.lerp(lookAt,amount);
  camera.lookAt(currentLookAt.current);
  if(camera.position.distanceToSquared(desired)>.002||currentLookAt.current.distanceToSquared(lookAt)>.002)invalidate();
 });
 return null;
}

function RoomArea({room,active,onSelect}:{room:Room;active?:Room;onSelect:(slug:RoomSlug)=>void}) {
 if(!room.footprint)return null;
 const [x,y,z]=room.scenePosition;
 const [width,depth]=room.footprint;
 const wallHeight=0.82;
 const wallThickness=0.075;
 const floorThickness=0.1;
 const doorWidth=Math.min(0.9,width*0.42);
 const sideSegmentWidth=(width-doorWidth)/2;
 const wallY=floorThickness+wallHeight/2;
 const frontZ=depth/2-wallThickness/2;
 const backZ=-depth/2+wallThickness/2;
 const leftX=-width/2+wallThickness/2;
 const rightX=width/2-wallThickness/2;
 const selected=active?.slug===room.slug;
 const floorColor=selected?"#d9b9a4":room.kind==="spiritual"?"#d9d8c7":room.kind==="private"?"#d8c2a9":"#e1d4c0";
 const wallColor=room.kind==="spiritual"?"#e5e1cf":room.kind==="private"?"#e8d6c0":"#eee4d4";
 const trimColor=room.kind==="private"?"#a96d50":"#b18a56";
 const select=()=>onSelect(room.slug as RoomSlug);
 return <group position={[x,y,z]}>
  <mesh position={[0,floorThickness/2,0]} receiveShadow onClick={(event)=>{event.stopPropagation();select();}}
   onPointerOver={()=>{document.body.style.cursor="pointer";}} onPointerOut={()=>{document.body.style.cursor="";}}>
   <boxGeometry args={[width-0.04,floorThickness,depth-0.04]}/>
   <meshStandardMaterial color={floorColor} roughness={0.94}/>
  </mesh>
  <mesh position={[0,wallY,backZ]} castShadow receiveShadow>
   <boxGeometry args={[width,wallHeight,wallThickness]}/><meshStandardMaterial color={wallColor} roughness={0.97}/>
  </mesh>
  <mesh position={[leftX,wallY,0]} castShadow receiveShadow>
   <boxGeometry args={[wallThickness,wallHeight,depth]}/><meshStandardMaterial color={wallColor} roughness={0.97}/>
  </mesh>
  <mesh position={[rightX,wallY,0]} castShadow receiveShadow>
   <boxGeometry args={[wallThickness,wallHeight,depth]}/><meshStandardMaterial color={wallColor} roughness={0.97}/>
  </mesh>
  <mesh position={[-(doorWidth/2+sideSegmentWidth/2),wallY,frontZ]} castShadow receiveShadow>
   <boxGeometry args={[sideSegmentWidth,wallHeight,wallThickness]}/><meshStandardMaterial color={wallColor} roughness={0.97}/>
  </mesh>
  <mesh position={[(doorWidth/2+sideSegmentWidth/2),wallY,frontZ]} castShadow receiveShadow>
   <boxGeometry args={[sideSegmentWidth,wallHeight,wallThickness]}/><meshStandardMaterial color={wallColor} roughness={0.97}/>
  </mesh>
  <mesh position={[0,floorThickness+0.018,depth/2+0.045]}>
   <boxGeometry args={[doorWidth,0.035,0.22]}/><meshStandardMaterial color={trimColor} roughness={0.78}/>
  </mesh>
  <mesh position={[0,wallY+wallHeight/2-0.015,backZ]}>
   <boxGeometry args={[width,0.035,wallThickness+0.02]}/><meshStandardMaterial color={trimColor} roughness={0.82}/>
  </mesh>
  {selected&&<mesh position={[0,floorThickness+0.015,0]} rotation={[-Math.PI/2,0,0]} onClick={(event)=>{event.stopPropagation();select();}}>
   <ringGeometry args={[0.23,0.29,32]}/><meshStandardMaterial color="#94543d" roughness={0.5}/>
  </mesh>}
 </group>;
}

function HouseArchitecture({location,onEnterHouse,onSelectRoom}:{location:HouseLocation;onEnterHouse:()=>void;onSelectRoom:(slug:RoomSlug)=>void}) {
 const currentRoom=location==="exterior"||location==="map"?undefined:getRoomBySlug(location);
 const outside=location==="garden";
 const rooftop=location==="rooftop";
 const exterior=location==="exterior";
 const interior=location==="map"||Boolean(currentRoom&&currentRoom.level!=="outdoor"&&currentRoom.level!=="roof");
 const activeRoom=currentRoom;
 return <>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.2,0]} receiveShadow>
   <planeGeometry args={[48,48]}/><meshStandardMaterial color="#d6d5c0" roughness={1}/>
  </mesh>
  {(exterior||outside||interior)&&<mesh position={[0,-0.12,2.5]} receiveShadow>
   <boxGeometry args={[12,.16,10]}/><meshStandardMaterial color="#c7b79c" roughness={0.96}/>
  </mesh>}

  <group visible={exterior||outside}>
   <mesh position={[0,2.45,0]} castShadow receiveShadow>
    <boxGeometry args={[11,4.9,9]}/><meshStandardMaterial color="#eadcc8" roughness={0.94}/>
   </mesh>
   <mesh position={[0,4.98,0]} castShadow>
    <boxGeometry args={[11.5,.25,9.5]}/><meshStandardMaterial color="#a65f4a" roughness={0.9}/>
   </mesh>
   <mesh position={[0,5.23,4.77]}>
    <boxGeometry args={[11.55,.28,.17]}/><meshStandardMaterial color="#d9c9b2" roughness={1}/>
   </mesh>
   <mesh position={[0,1.15,4.55]} castShadow onClick={(event)=>{event.stopPropagation();onEnterHouse();}}
    onPointerOver={()=>{document.body.style.cursor="pointer";}} onPointerOut={()=>{document.body.style.cursor="";}}>
    <boxGeometry args={[1.4,2.3,.12]}/><meshStandardMaterial color="#705044" roughness={0.86}/>
   </mesh>
   <mesh position={[0.45,1.1,4.65]}>
    <sphereGeometry args={[0.075,12,12]}/><meshStandardMaterial color="#c39a5d" metalness={0.55} roughness={0.4}/>
   </mesh>
   {[-3,3].map((x)=><group key={x}>
    <mesh position={[x,1.9,4.56]}><boxGeometry args={[1.25,1.05,0.1]}/><meshStandardMaterial color="#f0c77a" emissive="#d3a358" emissiveIntensity={0.25}/></mesh>
    <mesh position={[x,4,4.56]}><boxGeometry args={[1.25,0.95,0.1]}/><meshStandardMaterial color="#f0c77a" emissive="#d3a358" emissiveIntensity={0.22}/></mesh>
   </group>)}
  </group>

  <group visible={interior}>
   <mesh position={[0,-0.02,0]} receiveShadow>
    <boxGeometry args={[11.1,0.12,9.5]}/><meshStandardMaterial color="#bba98f" roughness={0.98}/>
   </mesh>
   <mesh position={[0,3.02,0]} receiveShadow>
    <boxGeometry args={[11.1,0.12,9.5]}/><meshStandardMaterial color="#c8b79d" roughness={0.96}/>
   </mesh>
   {rooms.filter((room)=>room.footprint&&(room.level==="ground"||room.level==="upper")).map((room)=>
    <RoomArea key={room.id} room={room} active={activeRoom} onSelect={onSelectRoom}/>
   )}
   {Array.from({length:7},(_unused,index)=><mesh key={index} position={[0,0.18+index*0.4,3.3-index*0.78]} castShadow>
    <boxGeometry args={[1.25,0.18,0.74]}/><meshStandardMaterial color="#ae8b68" roughness={0.95}/>
   </mesh>)}
  </group>

  <group visible={exterior||outside}>
   <mesh position={[0,-0.1,8.2]} receiveShadow>
    <boxGeometry args={[15,0.16,5.2]}/><meshStandardMaterial color="#b7b58f" roughness={1}/>
   </mesh>
   <mesh position={[-1.4,-0.005,7.2]} receiveShadow>
    <boxGeometry args={[3.2,0.08,2.4]}/><meshStandardMaterial color="#c7bba1" roughness={1}/>
   </mesh>
   <mesh position={[1.4,-0.005,7.2]} receiveShadow>
    <boxGeometry args={[3.2,0.08,2.4]}/><meshStandardMaterial color="#c7bba1" roughness={1}/>
   </mesh>
   {[
    {position:[-7.4,-0.05,8.1] as Vector3Tuple,scale:1.05},
    {position:[7.2,-0.05,8.6] as Vector3Tuple,scale:0.9},
    {position:[8.6,-0.05,-3.8] as Vector3Tuple,scale:0.68}
   ].map((tree,index)=><group key={index} position={tree.position} scale={tree.scale}>
    <mesh position={[0,0.65,0]} castShadow><cylinderGeometry args={[0.12,0.18,1.3,7]}/><meshStandardMaterial color="#76563e" roughness={0.95}/></mesh>
    <mesh position={[0,1.65,0]} castShadow><coneGeometry args={[0.9,1.8,7]}/><meshStandardMaterial color="#829071" roughness={1}/></mesh>
    <mesh position={[0.12,2.15,0.08]} castShadow><coneGeometry args={[0.62,1.3,7]}/><meshStandardMaterial color="#a0a780" roughness={1}/></mesh>
   </group>)}
   {[-4.5,-2.7,2.7,4.5].map((x)=><mesh key={x} position={[x,-0.02,6.2]} castShadow>
    <sphereGeometry args={[0.48,10,8]}/><meshStandardMaterial color="#899477" roughness={1}/>
   </mesh>)}
  </group>

  <group visible={rooftop}>
   <mesh position={[0,5.72,0]} receiveShadow castShadow>
    <boxGeometry args={[11.35,0.18,9.7]}/><meshStandardMaterial color="#c6b79f" roughness={0.96}/>
   </mesh>
   {[
    {position:[0,5.98,-4.75] as Vector3Tuple,size:[11.35,0.42,0.14] as Vector3Tuple},
    {position:[-5.55,5.98,0] as Vector3Tuple,size:[0.14,0.42,9.5] as Vector3Tuple},
    {position:[5.55,5.98,0] as Vector3Tuple,size:[0.14,0.42,9.5] as Vector3Tuple},
    {position:[0,5.98,4.75] as Vector3Tuple,size:[11.35,0.42,0.14] as Vector3Tuple}
   ].map((wall,index)=><mesh key={index} position={wall.position} castShadow>
    <boxGeometry args={wall.size}/><meshStandardMaterial color="#e5d8c4" roughness={0.98}/>
   </mesh>)}
   <mesh position={[-4.65,5.88,-3.85]}><boxGeometry args={[0.9,0.1,0.85]}/><meshStandardMaterial color="#b59b79" roughness={0.96}/></mesh>
   <mesh position={[4.65,5.88,-3.85]}><boxGeometry args={[0.9,0.1,0.85]}/><meshStandardMaterial color="#b59b79" roughness={0.96}/></mesh>
  </group>
 </>;
}

export function HouseScene({location,reducedMotion,onEnter,onSelect}:{location:HouseLocation;reducedMotion:boolean;onEnter:()=>void;onSelect:(slug:RoomSlug)=>void}) {
 const room=location==="map"||location==="exterior"?undefined:getRoomBySlug(location);
 const pose=location==="map"?MAP_CAMERA:location==="exterior"?EXTERIOR_CAMERA:room?.camera??EXTERIOR_CAMERA;
 const position:Vector3Tuple=[pose.position[0],pose.position[1],pose.position[2]];
 const target:Vector3Tuple=[pose.target[0],pose.target[1],pose.target[2]];
 return <Canvas camera={{position:EXTERIOR_CAMERA.position,fov:36,near:0.1,far:120}} dpr={reducedMotion?1:([1,1.4] as [number,number])} frameloop="demand" shadows>
  <color attach="background" args={["#eee7da"]}/><fog attach="fog" args={["#eee7da",22,55]}/>
  <ambientLight intensity={1.1}/><hemisphereLight args={["#fff2db","#8c9479",1.1}/>
  <directionalLight position={[8,15,9]} intensity={2.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}/>
  <CameraRig position={position} target={target} reducedMotion={reducedMotion}/>
  <HouseArchitecture location={location} onEnterHouse={onEnter} onSelectRoom={onSelect}/>
 </Canvas>;
}

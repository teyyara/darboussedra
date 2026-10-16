import {useEffect,useMemo,useRef} from "react";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {Vector3} from "three";
import {EXTERIOR_CAMERA,MAP_CAMERA,getRoomBySlug,rooms,type HouseLocation,type Room,type RoomSlug,type Vector3Tuple} from "./rooms";
interface HouseSceneProps{location:HouseLocation;reducedMotion:boolean;onEnterHouse:()=>void;onSelectRoom:(slug:RoomSlug)=>void;}
function CameraRig({location,reducedMotion}:{location:HouseLocation;reducedMotion:boolean}){
 const {camera,invalidate}=useThree();const room=location==="exterior"||location==="map"?undefined:getRoomBySlug(location);
 const pose=location==="map"?MAP_CAMERA:location==="exterior"?EXTERIOR_CAMERA:room?.camera??EXTERIOR_CAMERA;
 const position=useMemo(()=>new Vector3(...pose.position),[pose]),target=useMemo(()=>new Vector3(...pose.target),[pose]),look=useRef(new Vector3(...EXTERIOR_CAMERA.target));
 useEffect(()=>{if(!reducedMotion)return;camera.position.copy(position);look.current.copy(target);camera.lookAt(target);invalidate();},[camera,invalidate,reducedMotion,position,target]);
 useFrame((_state,delta)=>{if(reducedMotion)return;const amount=1-Math.exp(-3*delta);camera.position.lerp(position,amount);look.current.lerp(target,amount);camera.lookAt(look.current);if(camera.position.distanceToSquared(position)>.003||look.current.distanceToSquared(target)>.003)invalidate();});
 return null;
}
function Tree({position,scale=1}:{position:Vector3Tuple;scale?:number}){return <group position={position} scale={scale}><mesh position={[0,.65,0]} castShadow><cylinderGeometry args={[.12,.18,1.3,7]}/><meshStandardMaterial color="#76563e" roughness={.95}/></mesh><mesh position={[0,1.65,0]} castShadow><coneGeometry args={[.9,1.8,7]}/><meshStandardMaterial color="#829071" roughness={1}/></mesh><mesh position={[.12,2.15,.08]} castShadow><coneGeometry args={[.62,1.3,7]}/><meshStandardMaterial color="#a0a780" roughness={1}/></mesh></group>;}
function RoomArea({room,onSelectRoom}:{room:Room;onSelectRoom:(slug:RoomSlug)=>void}){
 if(!room.footprint)return null;const [x,y,z]=room.scenePosition;const [width,depth]=room.footprint;const color=room.kind==="spiritual"?"#d9d7c3":room.kind==="private"?"#d4c0a5":"#ddcfb9";
 return <group><mesh position={[x,y+.055,z]} receiveShadow><boxGeometry args={[width-.08,.11,depth-.08]}/><meshStandardMaterial color={color} roughness={.94}/></mesh>
 <mesh position={[x,y+.34,z-depth/2+.035]} castShadow><boxGeometry args={[width,.62,.07]}/><meshStandardMaterial color="#eee3d0" roughness={.95}/></mesh>
 <mesh position={[x-width/2+.035,y+.34,z]} castShadow><boxGeometry args={[.07,.62,depth]}/><meshStandardMaterial color="#e8dbc7" roughness={.95}/></mesh>
 <mesh position={[x,y+.19,z]} onClick={(event)=>{event.stopPropagation();onSelectRoom(room.slug);}} onPointerOver={()=>{document.body.style.cursor="pointer";}} onPointerOut={()=>{document.body.style.cursor="";}}><cylinderGeometry args={[.16,.16,.08,18]}/><meshStandardMaterial color={room.kind==="private"?"#a96c4f":"#b58a52"} roughness={.75}/></mesh></group>;
}
function HouseArchitecture({location,onEnterHouse,onSelectRoom}:{location:HouseLocation;onEnterHouse:()=>void;onSelectRoom:(slug:RoomSlug)=>void}){
 const exterior=location==="exterior";
 return <><mesh position={[0,-.25,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[48,48]}/><meshStandardMaterial color="#d9d6c2" roughness={1}/></mesh>
 <mesh position={[0,-.17,2.5]} receiveShadow><boxGeometry args={[11.8,.24,10.2]}/><meshStandardMaterial color="#bcae96" roughness={1}/></mesh>
 <group visible={exterior}><mesh position={[0,2.55,0]} castShadow receiveShadow><boxGeometry args={[11.2,5.1,9.5]}/><meshStandardMaterial color="#e7dac6" roughness={.96}/></mesh>
 <mesh position={[0,5.16,0]} castShadow><boxGeometry args={[11.6,.25,9.9]}/><meshStandardMaterial color="#a65f4a" roughness={.9}/></mesh><mesh position={[0,5.47,4.77]}><boxGeometry args={[11.55,.43,.17]}/><meshStandardMaterial color="#d9c9b2" roughness={1}/></mesh>
 <mesh position={[0,1.15,4.79]} castShadow onClick={(event)=>{event.stopPropagation();onEnterHouse();}} onPointerOver={()=>{document.body.style.cursor="pointer";}} onPointerOut={()=>{document.body.style.cursor="";}}><boxGeometry args={[1.3,2.3,.15]}/><meshStandardMaterial color="#705044" roughness={.86}/></mesh>
 <mesh position={[.45,1.1,4.9]}><sphereGeometry args={[.075,12,12]}/><meshStandardMaterial color="#c39a5d" metalness={.55} roughness={.4}/></mesh>
 {[-3.4,3.4].map((x)=><group key={x}><mesh position={[x,1.65,4.79]}><boxGeometry args={[1.22,1.05,.12]}/><meshStandardMaterial color="#f4c978" emissive="#deae5d" emissiveIntensity={.4}/></mesh><mesh position={[x,4.05,4.79]}><boxGeometry args={[1.22,1,.12]}/><meshStandardMaterial color="#f4c978" emissive="#deae5d" emissiveIntensity={.42}/></mesh></group>)}</group>
 <group visible={!exterior}><mesh position={[0,-.02,0]} receiveShadow><boxGeometry args={[11.1,.18,9.5]}/><meshStandardMaterial color="#c9b699" roughness={.98}/></mesh>
 <mesh position={[0,3.02,0]} receiveShadow><boxGeometry args={[11.1,.18,9.5]}/><meshStandardMaterial color="#bba78b" roughness={.96}/></mesh>
 {rooms.filter((room)=>room.level==="ground"||room.level==="upper").map((room)=><RoomArea key={room.id} room={room} onSelectRoom={onSelectRoom}/>)}
 {Array.from({length:7},(_unused,index)=><mesh key={index} position={[0,.18+index*.4,3.3-index*.78]} castShadow><boxGeometry args={[1.25,.18,.74]}/><meshStandardMaterial color="#ae8b68" roughness={.95}/></mesh>)}
 <mesh position={[0,5.74,0]} receiveShadow><boxGeometry args={[11.35,.18,9.7]}/><meshStandardMaterial color="#c6b79f" roughness={.96}/></mesh>
 {[
 {position:[0,5.98,-4.75] as Vector3Tuple,size:[11.35,.42,.14] as Vector3Tuple},
 {position:[-5.55,5.98,0] as Vector3Tuple,size:[.14,.42,9.5] as Vector3Tuple},
 {position:[5.55,5.98,0] as Vector3Tuple,size:[.14,.42,9.5] as Vector3Tuple},
 {position:[0,5.98,4.75] as Vector3Tuple,size:[11.35,.42,.14] as Vector3Tuple}
 ].map((wall,index)=><mesh key={index} position={wall.position} castShadow><boxGeometry args={wall.size}/><meshStandardMaterial color="#e5d8c4" roughness={.98}/></mesh>)}</group>
 <group><mesh position={[0,-.1,8.2]} receiveShadow><boxGeometry args={[15,.16,5.2]}/><meshStandardMaterial color="#b7b58f" roughness={1}/></mesh><Tree position={[-7.4,-.05,8.1]} scale={1.05}/><Tree position={[7.2,-.05,8.6]} scale={.9}/><Tree position={[8.6,-.05,-3.8]} scale={.68}/>{[-4.5,-2.7,2.7,4.5].map((x)=><mesh key={x} position={[x,-.02,6.2]} castShadow><sphereGeometry args={[.48,10,8]}/><meshStandardMaterial color="#899477" roughness={1}/></mesh>)}</group></>;
}
export function HouseScene({location,reducedMotion,onEnterHouse,onSelectRoom}:HouseSceneProps){return <Canvas camera={{position:EXTERIOR_CAMERA.position,fov:36,near:.1,far:120}} dpr={[1,1.45]} shadows frameloop="demand" gl={{antialias:true,alpha:false,powerPreference:"high-performance"}}><color attach="background" args={["#eee7da"]}/><fog attach="fog" args={["#eee7da",22,55]}/><ambientLight intensity={1.1}/><hemisphereLight args={["#fff2db","#8c9479",1.1]}/><directionalLight position={[8,15,9]} intensity={2.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}/><CameraRig location={location} reducedMotion={reducedMotion}/><HouseArchitecture location={location} onEnterHouse={onEnterHouse} onSelectRoom={onSelectRoom}/></Canvas>;}

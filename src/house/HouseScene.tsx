import {useEffect,useMemo} from "react";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {Vector3} from "three";
import {EXTERIOR_CAMERA,mapCamera,getRoomBySlug,rooms,type HouseLocation,type RoomSlug,type Vec3} from "./rooms";

function CameraRig({position,target,reducedMotion}:{position:Vec3;target:Vec3;reducedMotion:boolean}) {
  const {camera} = useThree();
  const desired = useMemo(()=>new Vector3(position[0],position[1],position[2]),[position]);
  const lookAt = useMemo(()=>new Vector3(target[0],target[1],target[2]),[target]);
  useEffect(()=>{
    if (reducedMotion) {
      camera.position.copy(desired);
      camera.lookAt(lookAt);
      camera.updateProjectionMatrix();
    }
  },[camera,desired,lookAt,reducedMotion]);
  useFrame((_state,delta)=>{
    if (reducedMotion) return;
    camera.position.lerp(desired,1-Math.exp(-3*delta));
    camera.lookAt(lookAt);
  });
  return null;
}

function SceneGeometry({location,onEnter,onSelect}:{location:HouseLocation;onEnter:()=>void;onSelect:(slug:RoomSlug)=>void}) {
  const exterior=location==="exterior";
  const active=location==="map"||location==="exterior"?undefined:getRoomBySlug(location);
  return <>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.2,0]} receiveShadow>
      <planeGeometry args={[48,48]}/><meshStandardMaterial color="#d6d5c0"/>
    </mesh>
    <mesh position={[0,-.12,2.5]} receiveShadow>
      <boxGeometry args={[12,.16,10]}/><meshStandardMaterial color="#c7b79c"/>
    </mesh>
    <group visible={exterior}>
      <mesh position={[0,2.5,0]} castShadow receiveShadow><boxGeometry args={[11,5,9]}/><meshStandardMaterial color="#eadcc8" roughness={.94}/></mesh>
      <mesh position={[0,5.1,0]} castShadow><boxGeometry args={[11.5,.25,9.5]}/><meshStandardMaterial color="#a65f4a" roughness={.9}/></mesh>
      <mesh position={[0,1.15,4.55]} castShadow onClick={onEnter} onPointerOver={()=>{document.body.style.cursor="pointer";}} onPointerOut={()=>{document.body.style.cursor="";}}>
        <boxGeometry args={[1.4,2.3,.12]}/><meshStandardMaterial color="#705044" roughness={.86}/>
      </mesh>
      {[-3,3].map(x=><mesh key={x} position={[x,2,4.56]}><boxGeometry args={[1.25,1.1,.1]}/><meshStandardMaterial color="#f0c77a" emissive="#d3a358" emissiveIntensity={.25}/></mesh>)}
    </group>
    <group visible={!exterior}>
      <mesh position={[0,0,0]} receiveShadow><boxGeometry args={[11,.16,9]}/><meshStandardMaterial color="#c7b699"/></mesh>
      {rooms.filter(r=>r.footprint&&r.level!=="outdoor"&&r.level!=="roof").map(r=>
        <group key={r.id} position={[r.camera.target[0],r.level==="upper"?3:0,r.camera.target[2]]}>
          <mesh position={[0,.16,0]} onClick={()=>onSelect(r.slug as RoomSlug)} onPointerOver={()=>{document.body.style.cursor="pointer";}} onPointerOut={()=>{document.body.style.cursor="";}}>
            <boxGeometry args={[.65,.12,.65]}/><meshStandardMaterial color={active?.slug===r.slug?"#9d5c47":"#b58a52"}/>
          </mesh>
          <mesh position={[0,.34,-(r.footprint?.[1]??2)/2]}><boxGeometry args={[r.footprint?.[0]??2,.65,.08]}/><meshStandardMaterial color="#eadfce"/></mesh>
        </group>
      )}
      {Array.from({length:7},(_,i)=><mesh key={i} position={[0,.18+i*.4,3.3-i*.78]} castShadow><boxGeometry args={[1.25,.18,.74]}/><meshStandardMaterial color="#ae8b68"/></mesh>)}
      <mesh position={[0,5.6,0]}><boxGeometry args={[11,.15,9]}/><meshStandardMaterial color="#cbbba2"/></mesh>
    </group>
    <mesh position={[0,-.06,8]} receiveShadow><boxGeometry args={[15,.12,5]}/><meshStandardMaterial color="#b9ba99"/></mesh>
    {[[-6,1,8],[6,1.1,8],[8,.8,-3]].map((p,i)=><mesh key={i} position={p as [number,number,number]} castShadow><coneGeometry args={[1,2,7]}/><meshStandardMaterial color={i===1?"#758467":"#819071"}/></mesh>)}
  </>;
}

export function HouseScene({location,reducedMotion,onEnter,onSelect}:{location:HouseLocation;reducedMotion:boolean;onEnter:()=>void;onSelect:(slug:RoomSlug)=>void}) {
  const room=location==="map"||location==="exterior"?undefined:getRoomBySlug(location);
  const pose=location==="map"?mapCamera:location==="exterior"?EXTERIOR_CAMERA:room?.camera??EXTERIOR_CAMERA;
  const position:Vec3=[pose.position[0],pose.position[1],pose.position[2]];
  const target:Vec3=[pose.target[0],pose.target[1],pose.target[2]];
  return <Canvas camera={{position:EXTERIOR_CAMERA.position,fov:36,near:.1,far:120}} dpr={reducedMotion?1:([1,1.4] as [number,number])} shadows>
    <color attach="background" args={["#eee7da"]}/>
    <ambientLight intensity={1.35}/><hemisphereLight args={["#fff2db","#8c9479",1.0}/>
    <directionalLight position={[8,14,9]} intensity={2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}/>
    <CameraRig position={position} target={target} reducedMotion={reducedMotion}/>
    <SceneGeometry location={location} onEnter={onEnter} onSelect={onSelect}/>
  </Canvas>;
}

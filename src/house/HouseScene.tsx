import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ACESFilmicToneMapping, BackSide, Color, DoubleSide, Float32BufferAttribute, PerspectiveCamera, Quaternion, SphereGeometry, Vector3, type Group } from "three";
import { makeCameraPath, type CameraPose } from "./cameraPath";
import { getCameraZoneForPosition, getHouseSceneVisibility, type CameraZone } from "./sceneVisibility";
import {
  EXTERIOR_CAMERA, HOUSE_LAYOUT, getFrontDoorAction, getRoomBySlug, getRoomPortalOpenings, getRoomWallRuns, roomOwnsPortalFrame, rooms,
  type HouseLocation, type Room, type RoomSlug, type RoomPortalOpening, type Vector3Tuple,
} from "./rooms";

interface AnimatedPose { position: Vector3; rotation: Quaternion; }

function poseRotation(pose: CameraPose): Quaternion {
  const helper = new PerspectiveCamera();
  helper.position.set(...pose.position);
  helper.lookAt(new Vector3(...pose.target));
  return helper.quaternion.clone();
}

const WALK_SPEED = 1.35;
const WALK_ACCELERATION = 3.6;
const WALK_DECELERATION = 3.2;
const TURN_RESPONSE = 7.2;

function poseFor(location: HouseLocation): CameraPose {
  if (location === "exterior" || location === "map") return EXTERIOR_CAMERA;
  return getRoomBySlug(location)?.camera ?? EXTERIOR_CAMERA;
}

/** Persistent, camera-safe daylight environment. The mesh follows the camera horizontally
 * so its far surface never leaves the frustum, while its horizon stays anchored to world height.
 * This remains mounted through every room/level transition so uncovered sightlines never show a blank canvas.
 */
function SkyEnvironment() {
  const skyGroup = useRef<Group>(null);
  const geometry = useMemo(() => {
    const radius = 90;
    const sphere = new SphereGeometry(radius, 64, 40);
    const positions = sphere.getAttribute("position");
    const colors = new Float32Array(positions.count * 3);
    const low = new Color("#c5d5d2");
    const horizon = new Color("#f3dfbd");
    const paleBlue = new Color("#9fd2f1");
    const zenith = new Color("#4a9bd6");
    const smooth = (value: number) => {
      const t = Math.max(0, Math.min(1, value));
      return t * t * (3 - 2 * t);
    };
    const mixed = new Color();
    for (let index = 0; index < positions.count; index += 1) {
      const height = positions.getY(index) / radius;
      if (height < 0) mixed.copy(low).lerp(horizon, smooth((height + 0.2) / 0.2));
      else if (height < 0.44) mixed.copy(horizon).lerp(paleBlue, smooth(height / 0.44));
      else mixed.copy(paleBlue).lerp(zenith, smooth((height - 0.44) / 0.56));
      colors[index * 3] = mixed.r;
      colors[index * 3 + 1] = mixed.g;
      colors[index * 3 + 2] = mixed.b;
    }
    sphere.setAttribute("color", new Float32BufferAttribute(colors, 3));
    return sphere;
  }, []);

  useFrame(({ camera }) => {
    if (skyGroup.current) skyGroup.current.position.set(camera.position.x, 0, camera.position.z);
  });

  return <group ref={skyGroup}>
    <mesh geometry={geometry} renderOrder={-1000} frustumCulled={false}>
      <meshBasicMaterial vertexColors side={BackSide} fog={false} toneMapped={false}
        depthTest={false} depthWrite={false} />
    </mesh>
    {/* Sun and a few restrained cloud forms live far beyond the house, but are rendered
        as part of the sky layer so they can never be accidentally hidden by a room shell. */}
    <mesh position={[-38, 8, -60]} renderOrder={-998} frustumCulled={false}>
      <sphereGeometry args={[2.15, 32, 24]} />
      <meshBasicMaterial color="#fff4d2" toneMapped={false} depthTest={false} depthWrite={false} />
    </mesh>
    <mesh position={[-38, 8, -60]} renderOrder={-999} frustumCulled={false}>
      <sphereGeometry args={[4.5, 32, 24]} />
      <meshBasicMaterial color="#ffe0a1" transparent opacity={0.18} toneMapped={false}
        depthTest={false} depthWrite={false} />
    </mesh>
    <group position={[-18, 17, -72]}>
      {[
        { position: [0, 0, 0] as Vector3Tuple, size: [4.5, 1.25, 0.5] as Vector3Tuple },
        { position: [-2.3, -0.25, 0.05] as Vector3Tuple, size: [2.7, 1.0, 0.45] as Vector3Tuple },
        { position: [2.2, -0.18, -0.08] as Vector3Tuple, size: [2.9, 0.92, 0.45] as Vector3Tuple },
      ].map((cloud, index) => <mesh key={index} position={cloud.position} scale={cloud.size} renderOrder={-997}
        frustumCulled={false}>
        <sphereGeometry args={[1, 18, 12]} />
        <meshBasicMaterial color="#fffaf0" transparent opacity={0.58} toneMapped={false}
          depthTest={false} depthWrite={false} />
      </mesh>)}
    </group>
    <group position={[29, 21, -78]}>
      {[
        { position: [0, 0, 0] as Vector3Tuple, size: [4.2, 1.1, 0.45] as Vector3Tuple },
        { position: [-1.9, -0.18, 0] as Vector3Tuple, size: [2.5, 0.8, 0.4] as Vector3Tuple },
        { position: [2.1, -0.1, 0.04] as Vector3Tuple, size: [2.4, 0.82, 0.42] as Vector3Tuple },
      ].map((cloud, index) => <mesh key={index} position={cloud.position} scale={cloud.size} renderOrder={-997}
        frustumCulled={false}>
        <sphereGeometry args={[1, 18, 12]} />
        <meshBasicMaterial color="#fffaf0" transparent opacity={0.48} toneMapped={false}
          depthTest={false} depthWrite={false} />
      </mesh>)}
    </group>
  </group>;
}

function CameraRig({ location, reducedMotion, onArrive, onTransitionChange, onExteriorShellVisibilityChange, onCameraZoneChange }: {
  location: HouseLocation;
  reducedMotion: boolean;
  onArrive: (location: HouseLocation) => void;
  onTransitionChange: (transitioning: boolean) => void;
  onExteriorShellVisibilityChange: (visible: boolean | undefined) => void;
  onCameraZoneChange: (zone: CameraZone) => void;
}) {
  const { camera, invalidate } = useThree();
  const pose = useMemo(() => poseFor(location), [location]);
  const desired = useMemo(() => ({
    position: new Vector3(...pose.position),
    rotation: poseRotation(pose),
  }), [pose]);
  const lastLocation = useRef<HouseLocation>("exterior");
  const path = useRef<AnimatedPose[]>([]);
  const index = useRef(0);
  const currentWalkSpeed = useRef(0);
  const completedLocation = useRef<HouseLocation | undefined>(undefined);
  const doorTransition = useRef<"entering" | "exiting" | null>(null);
  const doorThresholdCrossed = useRef(false);
  const cameraZone = useRef<CameraZone>("outside");
  const cameraDirection = useRef(new Vector3());

  useEffect(() => {
    const from = lastLocation.current;
    lastLocation.current = location;
    completedLocation.current = undefined;
    const sourceIsOutside = from === "exterior" || getRoomBySlug(from)?.level === "outdoor";
    const destinationIsOutside = location === "exterior" || location === "garden" || location === "map";
    doorTransition.current = !reducedMotion && sourceIsOutside && !destinationIsOutside
      ? "entering"
      : !reducedMotion && !sourceIsOutside && destinationIsOutside ? "exiting" : null;
    doorThresholdCrossed.current = false;
    onExteriorShellVisibilityChange(doorTransition.current === "entering"
      ? true
      : doorTransition.current === "exiting" ? false : undefined);
    if (reducedMotion || from === location) {
      currentWalkSpeed.current = 0;
      camera.position.copy(desired.position);
      camera.quaternion.copy(desired.rotation);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      cameraZone.current = getCameraZoneForPosition(desired.position);
      onCameraZoneChange(cameraZone.current);
      path.current = [];
      index.current = 0;
      completedLocation.current = location;
      onTransitionChange(false);
      onArrive(location);
    } else {
      currentWalkSpeed.current = 0;
      path.current = makeCameraPath(from, location, pose).map((item) => ({
        position: new Vector3(...item.position),
        rotation: poseRotation(item),
      }));
      index.current = 0;
      onTransitionChange(true);
    }
    invalidate();
  }, [camera, desired, invalidate, location, onArrive, onTransitionChange, onExteriorShellVisibilityChange, onCameraZoneChange, pose, reducedMotion]);

  useFrame((state, delta) => {
    const frameDelta = Math.min(delta, 0.2);
    const distanceToTarget = camera.position.distanceTo(desired.position);
    let remainingPathDistance = 0;
    let segmentStart = camera.position;
    for (let waypointIndex = index.current; waypointIndex < path.current.length; waypointIndex += 1) {
      remainingPathDistance += segmentStart.distanceTo(path.current[waypointIndex].position);
      segmentStart = path.current[waypointIndex].position;
    }
    if (index.current >= path.current.length) remainingPathDistance = distanceToTarget;
    const targetSpeed = Math.min(WALK_SPEED, Math.sqrt(2 * WALK_DECELERATION * remainingPathDistance));
    const speedChange = (targetSpeed - currentWalkSpeed.current) *
      (targetSpeed < currentWalkSpeed.current ? WALK_DECELERATION : WALK_ACCELERATION);
    currentWalkSpeed.current += Math.max(-WALK_DECELERATION * frameDelta,
      Math.min(WALK_ACCELERATION * frameDelta, speedChange * frameDelta));
    let travelRemaining = currentWalkSpeed.current * frameDelta;
    let waypoint = path.current[index.current];

    // Carry unused frame distance across waypoint boundaries. The 0.2s cap preserves
    // walking speed on slower devices while preventing a large jump after a suspended tab.
    while (waypoint && travelRemaining > 0) {
      const distance = camera.position.distanceTo(waypoint.position);
      if (distance <= travelRemaining || distance <= 0.025) {
        camera.position.copy(waypoint.position);
        travelRemaining = Math.max(0, travelRemaining - distance);
        index.current += 1;
        waypoint = path.current[index.current];
      } else {
        camera.position.addScaledVector(
          waypoint.position.clone().sub(camera.position),
          travelRemaining / distance,
        );
        travelRemaining = 0;
      }
    }

    const nextRotation = waypoint?.rotation ?? desired.rotation;
    // Quaternion blending avoids lookAt-target crossings that can flip the lens on landings.
    camera.quaternion.slerp(nextRotation, 1 - Math.exp(-TURN_RESPONSE * frameDelta));

    const frontZ = HOUSE_LAYOUT.exterior.depth / 2;
    const nextCameraZone = getCameraZoneForPosition(camera.position);
    if (nextCameraZone !== cameraZone.current) {
      cameraZone.current = nextCameraZone;
      onCameraZoneChange(nextCameraZone);
    }
    if (!doorThresholdCrossed.current && doorTransition.current === "entering" &&
      camera.position.z < frontZ - 0.05 &&
      Math.abs(camera.position.x) < HOUSE_LAYOUT.entrance.doorWidth / 2 + 0.25 &&
      camera.position.y < HOUSE_LAYOUT.entrance.doorHeight) {
      doorThresholdCrossed.current = true;
      onExteriorShellVisibilityChange(false);
    } else if (!doorThresholdCrossed.current && doorTransition.current === "exiting" &&
      camera.position.z > frontZ + HOUSE_LAYOUT.exterior.wallThickness / 2 + 0.1 &&
      Math.abs(camera.position.x) < HOUSE_LAYOUT.entrance.doorWidth / 2 + 0.25 &&
      camera.position.y < HOUSE_LAYOUT.entrance.doorHeight) {
      // Restore the façade only after the camera has cleared the exterior wall.
      doorThresholdCrossed.current = true;
      onExteriorShellVisibilityChange(true);
    }

    // Store diagnostics on the canvas so the browser review can record the exact
    // camera position and visibility zone without adding anything to the visible UI.
    const canvas = state.gl.domElement;
    canvas.dataset.cameraPosition = [camera.position.x, camera.position.y, camera.position.z]
      .map((value) => value.toFixed(3)).join(",");
    canvas.dataset.cameraDirection = camera.getWorldDirection(cameraDirection.current)
      .toArray().map((value) => value.toFixed(3)).join(",");
    canvas.dataset.cameraZone = cameraZone.current;
    canvas.dataset.destination = location;
    canvas.dataset.routeProgress = `${Math.min(index.current, path.current.length)}/${path.current.length}`;

    const stillMoving = index.current < path.current.length ||
      camera.position.distanceToSquared(desired.position) > 0.0016 ||
      camera.quaternion.angleTo(desired.rotation) > 0.018;
    if (stillMoving) invalidate();
    else if (completedLocation.current !== location) {
      completedLocation.current = location;
      currentWalkSpeed.current = 0;
      doorTransition.current = null;
      onExteriorShellVisibilityChange(undefined);
      onTransitionChange(false);
      onArrive(location);
    }
  });
  return null;
}

function ExteriorShell({ location, onDoorActivate, reducedMotion }: { location: HouseLocation; onDoorActivate: (entering: boolean) => void; reducedMotion: boolean }) {
  const door = useRef<Group>(null);
  const [doorHovered, setDoorHovered] = useState(false);
  const { invalidate, camera } = useThree();
  const doorAction = getFrontDoorAction(location);
  const doorWidth = HOUSE_LAYOUT.entrance.doorWidth, doorHeight = HOUSE_LAYOUT.entrance.doorHeight;
  const frontZ = HOUSE_LAYOUT.exterior.depth / 2;
  const wallHeight = HOUSE_LAYOUT.exterior.wallHeight;
  const halfWidth = HOUSE_LAYOUT.exterior.width / 2;
  const wallThickness = HOUSE_LAYOUT.exterior.wallThickness;
  const frontWindowWidth = 1.3;
  const frontWindowInset = 2.55;
  const windowCenterX = halfWidth - frontWindowInset;
  const windowOuterEdge = windowCenterX + frontWindowWidth / 2;
  const windowInnerEdge = windowCenterX - frontWindowWidth / 2;
  const outerPanelWidth = halfWidth - windowOuterEdge;
  const sidePanelWidth = windowInnerEdge - doorWidth / 2;
  const sidePanelCenter = (windowInnerEdge + doorWidth / 2) / 2;
  const panels: { position: Vector3Tuple; size: Vector3Tuple }[] = [
    { position: [-(windowOuterEdge + halfWidth) / 2, wallHeight / 2, frontZ], size: [outerPanelWidth, wallHeight, wallThickness] },
    { position: [-windowCenterX, 0.775, frontZ], size: [frontWindowWidth, 1.55, wallThickness] },
    { position: [-windowCenterX, 3.1, frontZ], size: [frontWindowWidth, 0.8, wallThickness] },
    { position: [-windowCenterX, (4.65 + wallHeight) / 2, frontZ], size: [frontWindowWidth, wallHeight - 4.65, wallThickness] },
    { position: [-sidePanelCenter, wallHeight / 2, frontZ], size: [sidePanelWidth, wallHeight, wallThickness] },
    { position: [0, (doorHeight + wallHeight) / 2, frontZ], size: [doorWidth, wallHeight - doorHeight, wallThickness] },
    { position: [sidePanelCenter, wallHeight / 2, frontZ], size: [sidePanelWidth, wallHeight, wallThickness] },
    { position: [windowCenterX, 0.775, frontZ], size: [frontWindowWidth, 1.55, wallThickness] },
    { position: [windowCenterX, 3.1, frontZ], size: [frontWindowWidth, 0.8, wallThickness] },
    { position: [windowCenterX, (4.65 + wallHeight) / 2, frontZ], size: [frontWindowWidth, wallHeight - 4.65, wallThickness] },
    { position: [(windowOuterEdge + halfWidth) / 2, wallHeight / 2, frontZ], size: [outerPanelWidth, wallHeight, wallThickness] },
  ];
  useEffect(() => { invalidate(); }, [location, invalidate]);
  useFrame((_state, delta) => {
    if (!door.current) return;
    const nearDoorway = Math.abs(camera.position.x) < doorWidth / 2 + 0.35 &&
      Math.abs(camera.position.z - frontZ) < 1.25 && camera.position.y < doorHeight;
    const target = nearDoorway ? Math.PI / 2 : 0;
    if (reducedMotion) door.current.rotation.y = target;
    else {
      door.current.rotation.y += (target - door.current.rotation.y) * (1 - Math.exp(-6 * delta));
      if (Math.abs(target - door.current.rotation.y) > 0.002) invalidate();
    }
  });
  return <group>
    <mesh position={[0, -0.09, 0]} receiveShadow>
      <boxGeometry args={[HOUSE_LAYOUT.exterior.width, 0.18, HOUSE_LAYOUT.exterior.depth]} />
      <meshStandardMaterial color="#b9a68b" roughness={0.97} />
    </mesh>
    <mesh position={[-halfWidth, wallHeight / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[wallThickness, wallHeight, HOUSE_LAYOUT.exterior.depth]} />
      <meshStandardMaterial color="#dfcfb8" roughness={0.95} />
    </mesh>
    <mesh position={[halfWidth, wallHeight / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[wallThickness, wallHeight, HOUSE_LAYOUT.exterior.depth]} />
      <meshStandardMaterial color="#dfcfb8" roughness={0.95} />
    </mesh>
    <mesh position={[0, wallHeight / 2, -frontZ]} castShadow receiveShadow>
      <boxGeometry args={[HOUSE_LAYOUT.exterior.width, wallHeight, wallThickness]} />
      <meshStandardMaterial color="#dfcfb8" roughness={0.95} />
    </mesh>
    <group>
      {/* The house has an accessible flat roof. Match the terrace's deck and parapet so the outside and walkable roof are the same architecture. */}
      <mesh position={[0, HOUSE_LAYOUT.roofY - 0.09, 0]} castShadow receiveShadow>
        <boxGeometry args={[HOUSE_LAYOUT.exterior.width + 0.24, 0.18, HOUSE_LAYOUT.exterior.depth + 0.24]} />
        <meshStandardMaterial color="#c9b99e" roughness={0.97} />
      </mesh>
      {[
        { position: [0, HOUSE_LAYOUT.roofY + 0.19, -4.3] as Vector3Tuple, size: [10.6, 0.38, 0.14] as Vector3Tuple },
        { position: [0, HOUSE_LAYOUT.roofY + 0.19, 4.3] as Vector3Tuple, size: [10.6, 0.38, 0.14] as Vector3Tuple },
        { position: [-5.3, HOUSE_LAYOUT.roofY + 0.19, 0] as Vector3Tuple, size: [0.14, 0.38, 8.6] as Vector3Tuple },
        { position: [5.3, HOUSE_LAYOUT.roofY + 0.19, 0] as Vector3Tuple, size: [0.14, 0.38, 8.6] as Vector3Tuple },
      ].map((wall, index) => <mesh key={index} position={wall.position} castShadow receiveShadow>
        <boxGeometry args={wall.size} />
        <meshStandardMaterial color="#e0d2bc" roughness={0.97} />
      </mesh>)}
      <mesh position={[0, HOUSE_LAYOUT.roofY + 0.04, HOUSE_LAYOUT.exterior.depth / 2 + 0.1]} receiveShadow>
        <boxGeometry args={[HOUSE_LAYOUT.exterior.width + 0.3, 0.12, 0.18]} />
        <meshStandardMaterial color="#a77f5d" roughness={0.93} />
      </mesh>
    </group>
    {panels.map((panel, index) => <mesh key={index} position={panel.position} castShadow receiveShadow>
      <boxGeometry args={panel.size} />
      <meshStandardMaterial color="#eadcc8" roughness={0.94} />
    </mesh>)}
    {[-windowCenterX, windowCenterX].flatMap((x) => [2.1, 4.075].map((y, index) =>
      <group key={x + "-" + index} position={[x, y, frontZ + 0.03]}>
        <mesh>
          <boxGeometry args={[frontWindowWidth - 0.18, 1.0, 0.06]} />
          <meshStandardMaterial color="#e5b973" emissive="#b88745" emissiveIntensity={0.13} roughness={0.32} metalness={0.08} />
        </mesh>
        <mesh><boxGeometry args={[0.055, 1.04, 0.08]} /><meshStandardMaterial color="#947052" roughness={0.7} /></mesh>
        <mesh><boxGeometry args={[frontWindowWidth - 0.14, 0.055, 0.08]} /><meshStandardMaterial color="#947052" roughness={0.7} /></mesh>
      </group>
    ))}
    <mesh position={[0, wallHeight - 0.06, frontZ + 0.015]} receiveShadow>
      <boxGeometry args={[HOUSE_LAYOUT.exterior.width, 0.12, wallThickness + 0.04]} />
      <meshStandardMaterial color="#d4c1a5" roughness={0.92} />
    </mesh>
    <group ref={door} position={[-doorWidth / 2, 0, frontZ + 0.015]}>
      <mesh position={[doorWidth / 2, doorHeight / 2, 0]} castShadow
        onClick={doorAction ? (event) => { event.stopPropagation(); onDoorActivate(doorAction === "enter"); } : undefined}
        onPointerOver={doorAction ? () => { setDoorHovered(true); document.body.style.cursor = "pointer"; } : undefined}
        onPointerOut={doorAction ? () => { setDoorHovered(false); document.body.style.cursor = ""; } : undefined}>
        <boxGeometry args={[doorWidth, doorHeight, 0.1]} />
        <meshStandardMaterial color={doorAction && doorHovered ? "#91664c" : "#76513e"} roughness={0.84} />
      </mesh>
      <mesh position={[doorWidth - 0.18, doorHeight * 0.48, 0.07]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        <meshStandardMaterial color="#c29b5c" metalness={0.5} roughness={0.38} />
      </mesh>
    </group>
    {doorAction && <group position={[0, doorHeight + 0.34, frontZ + wallThickness / 2 + 0.06]}
      onClick={(event) => { event.stopPropagation(); onDoorActivate(doorAction === "enter"); }}
      onPointerOver={(event) => { event.stopPropagation(); setDoorHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(event) => { event.stopPropagation(); setDoorHovered(false); document.body.style.cursor = ""; }}>
      <mesh>
        <ringGeometry args={[0.105, 0.17, 24]} />
        <meshBasicMaterial color={doorHovered ? "#fff0ca" : "#e1b663"} transparent opacity={0.98} side={DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.006]}>
        <circleGeometry args={[0.065, 24]} />
        <meshBasicMaterial color="#fff4de" transparent opacity={0.98} side={DoubleSide} toneMapped={false} />
      </mesh>
    </group>}
    <mesh position={[0, 0.06, frontZ + 0.32]} receiveShadow>
      <boxGeometry args={[2.15, 0.12, 0.64]} /><meshStandardMaterial color="#c5b08e" roughness={0.98} />
    </mesh>
    <mesh position={[0, 0.08, frontZ + 0.92]} receiveShadow>
      <boxGeometry args={[1.8, 0.12, 0.56]} /><meshStandardMaterial color="#d6c5a8" roughness={0.98} />
    </mesh>
  </group>;
}

const REAR_WINDOW_BOTTOM = 0.9;
const REAR_WINDOW_TOP = 1.95;

function roomHasRearWindow(room: Room): boolean {
  return room.scenePosition[2] - room.footprint[1] / 2 <= -3.8;
}

function roomWallSegments(room: Room, side: RoomPortalOpening["side"], openings: readonly RoomPortalOpening[]) {
  const [width, depth] = room.footprint;
  const hasWindow = side === "back" && roomHasRearWindow(room);
  const windowWidth = Math.min(0.9, width * 0.55);
  return getRoomWallRuns(room, side, openings).flatMap((run) => {
    const along = (run.start + run.end) / 2, segmentLength = run.end - run.start;
    if (side === "front" || side === "back") {
      const wallZ = side === "front" ? depth / 2 : -depth / 2;
      if (hasWindow && run.start < -windowWidth / 2 && run.end > windowWidth / 2) {
        const windowLeft = -windowWidth / 2, windowRight = windowWidth / 2;
        const wallTop = HOUSE_LAYOUT.floorThickness + HOUSE_LAYOUT.roomWallHeight;
        const lowerHeight = REAR_WINDOW_BOTTOM - HOUSE_LAYOUT.floorThickness;
        const upperHeight = wallTop - REAR_WINDOW_TOP;
        return [
          ...(windowLeft - run.start > 0.04 ? [{
            position: [(run.start + windowLeft) / 2, HOUSE_LAYOUT.floorThickness + HOUSE_LAYOUT.roomWallHeight / 2, wallZ] as Vector3Tuple,
            size: [windowLeft - run.start, HOUSE_LAYOUT.roomWallHeight, 0.12] as Vector3Tuple,
          }] : []),
          ...(run.end - windowRight > 0.04 ? [{
            position: [(windowRight + run.end) / 2, HOUSE_LAYOUT.floorThickness + HOUSE_LAYOUT.roomWallHeight / 2, wallZ] as Vector3Tuple,
            size: [run.end - windowRight, HOUSE_LAYOUT.roomWallHeight, 0.12] as Vector3Tuple,
          }] : []),
          {
            position: [0, HOUSE_LAYOUT.floorThickness + lowerHeight / 2, wallZ] as Vector3Tuple,
            size: [windowWidth, lowerHeight, 0.12] as Vector3Tuple,
          },
          {
            position: [0, REAR_WINDOW_TOP + upperHeight / 2, wallZ] as Vector3Tuple,
            size: [windowWidth, upperHeight, 0.12] as Vector3Tuple,
          },
        ];
      }
      return [{
        position: [along, HOUSE_LAYOUT.floorThickness + HOUSE_LAYOUT.roomWallHeight / 2, wallZ] as Vector3Tuple,
        size: [segmentLength, HOUSE_LAYOUT.roomWallHeight, 0.12] as Vector3Tuple,
      }];
    }
    return [{
      position: [side === "right" ? width / 2 : -width / 2, HOUSE_LAYOUT.floorThickness + HOUSE_LAYOUT.roomWallHeight / 2, along] as Vector3Tuple,
      size: [0.12, HOUSE_LAYOUT.roomWallHeight, segmentLength] as Vector3Tuple,
    }];
  });
}

function NavigationHotspot({ position, onSelect }: { position: Vector3Tuple; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  return <group position={position}
    onClick={(event) => { event.stopPropagation(); onSelect(); }}
    onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
    onPointerOut={(event) => { event.stopPropagation(); setHovered(false); document.body.style.cursor = ""; }}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.145, 0.205, 28]} />
      <meshBasicMaterial color={hovered ? "#f8e4b4" : "#b26445"} transparent opacity={0.96} depthWrite={false} side={DoubleSide} toneMapped={false} />
    </mesh>
    <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.065, 24]} />
      <meshBasicMaterial color="#fbf0d8" transparent opacity={0.98} depthWrite={false} side={DoubleSide} toneMapped={false} />
    </mesh>
  </group>;
}

function DoorwayFrame({ room, opening, onSelect }: { room: Room; opening: RoomPortalOpening; onSelect: (slug: RoomSlug) => void }) {
  const [width, depth] = room.footprint;
  const height = 2.05, trim = 0.055, baseY = HOUSE_LAYOUT.floorThickness;
  const zSide = opening.side === "front" ? depth / 2 : opening.side === "back" ? -depth / 2 : 0;
  const xSide = opening.side === "right" ? width / 2 : opening.side === "left" ? -width / 2 : 0;
  const frontBack = opening.side === "front" || opening.side === "back";
  const jambs = frontBack
    ? [-1, 1].map((side) => ({ position: [opening.offset + side * opening.width / 2, baseY + height / 2, zSide] as Vector3Tuple, size: [trim, height, 0.085] as Vector3Tuple }))
    : [-1, 1].map((side) => ({ position: [xSide, baseY + height / 2, opening.offset + side * opening.width / 2] as Vector3Tuple, size: [0.085, height, trim] as Vector3Tuple }));
  const lintelPosition: Vector3Tuple = frontBack ? [opening.offset, baseY + height, zSide] : [xSide, baseY + height, opening.offset];
  const lintelSize: Vector3Tuple = frontBack ? [opening.width, trim, 0.085] : [0.085, trim, opening.width];
  const targetPosition: Vector3Tuple = frontBack ? [opening.offset, baseY + height / 2, zSide] : [xSide, baseY + height / 2, opening.offset];
  const targetSize: Vector3Tuple = frontBack ? [opening.width, height, 0.035] : [0.035, height, opening.width];
  return <group>
    {jambs.map((jamb, index) => <mesh key={index} position={jamb.position}>
      <boxGeometry args={jamb.size} /><meshStandardMaterial color="#b18a56" roughness={0.82} />
    </mesh>)}
    <mesh position={lintelPosition}><boxGeometry args={lintelSize} /><meshStandardMaterial color="#b18a56" roughness={0.82} /></mesh>
    {opening.targetSlug && <mesh position={targetPosition} onClick={(event) => { event.stopPropagation(); onSelect(opening.targetSlug as RoomSlug); }}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = ""; }}>
      <boxGeometry args={targetSize} /><meshBasicMaterial color="#955b42" transparent opacity={0.035} depthWrite={false} />
    </mesh>}
  </group>;
}


function PropBox({ position, size, color, roughness = 0.9 }: {
  position: Vector3Tuple; size: Vector3Tuple; color: string; roughness?: number;
}) {
  return <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} roughness={roughness} />
  </mesh>;
}

function DiningChair({ position, rotation = 0 }: { position: Vector3Tuple; rotation?: number }) {
  return <group position={position} rotation={[0, rotation, 0]}>
    <PropBox position={[0, 0.3, 0]} size={[0.46, 0.1, 0.44]} color="#aa8260" />
    <PropBox position={[0, 0.59, -0.18]} size={[0.46, 0.52, 0.075]} color="#8d6347" />
    {[-1, 1].flatMap((x) => [-1, 1].map((z) =>
      <PropBox key={x + ":" + z} position={[x * 0.17, 0.15, z * 0.15]} size={[0.055, 0.3, 0.055]} color="#75513b" />))}
  </group>;
}

/** Quiet, scale-consistent props make each destination read as its intended room. */
function RoomFurnishings({ room }: { room: Room }) {
  const width = room.footprint[0];
  return <group position={[0, HOUSE_LAYOUT.floorThickness, 0]}>
    {room.slug === "family-table" && <group>
      <PropBox position={[0, 0.025, 0]} size={[2.65, 0.035, 2.35]} color="#c7a88b" />
      <PropBox position={[-0.08, 0.66, -0.08]} size={[1.45, 0.1, 0.82]} color="#936643" />
      {[-1, 1].flatMap((x) => [-1, 1].map((z) =>
        <PropBox key={x + ":" + z} position={[-0.08 + x * 0.56, 0.33, -0.08 + z * 0.29]} size={[0.075, 0.62, 0.075]} color="#75513b" />))}
      <PropBox position={[-0.08, 0.73, -0.08]} size={[0.28, 0.035, 0.24]} color="#d9c5a6" />
      <PropBox position={[-1.0, 0, -0.04]} size={[0.46, 0.03, 0.44]} color="#af8968" />
      <DiningChair position={[-1.08, 0, -0.02]} rotation={Math.PI / 2} />
      <DiningChair position={[1.05, 0, -0.02]} rotation={-Math.PI / 2} />
      <DiningChair position={[0, 0, 0.78]} rotation={Math.PI} />
      <DiningChair position={[0, 0, -0.85]} />
    </group>}

    {room.slug === "living-room" && <group>
      <PropBox position={[0, 0.025, 0.05]} size={[2.7, 0.035, 2.4]} color="#cbb89e" />
      <PropBox position={[0, 0.3, -0.84]} size={[2.22, 0.34, 0.74]} color="#97715b" />
      <PropBox position={[0, 0.69, -1.15]} size={[2.22, 0.62, 0.16]} color="#886149" />
      {[-1, 1].map((side) => <PropBox key={side} position={[side * 1.04, 0.55, -0.84]} size={[0.18, 0.56, 0.74]} color="#886149" />)}
      {[-0.62, 0, 0.62].map((x, index) => <PropBox key={x} position={[x, 0.51, -0.55]} size={[0.52, 0.12, 0.45]} color={index === 1 ? "#d4b89b" : "#c49e7e"} />)}
      {[-0.62, 0.62].map((x) => <PropBox key={x} position={[x, 0.78, -1.045]} size={[0.38, 0.28, 0.08]} color="#d9c4a9" />)}
      <PropBox position={[0.15, 0.29, 0.48]} size={[0.95, 0.38, 0.58]} color="#a78260" />
      <PropBox position={[0.15, 0.5, 0.48]} size={[0.98, 0.06, 0.6]} color="#855b40" />
    </group>}

    {room.slug === "kitchen" && <group>
      <PropBox position={[0, 0.02, 0]} size={[2.6, 0.025, 2.2]} color="#d4c4aa" />
      <PropBox position={[width / 2 - 0.48, 0.36, -0.05]} size={[0.72, 0.7, 2.15]} color="#ad967a" />
      <PropBox position={[width / 2 - 0.48, 0.74, -0.05]} size={[0.82, 0.09, 2.2]} color="#eee2cd" />
      {[-0.72, 0, 0.72].map((z) => <PropBox key={z} position={[width / 2 - 0.09, 0.36, z - 0.05]} size={[0.025, 0.49, 0.035]} color="#80624a" />)}
      <PropBox position={[width / 2 - 0.48, 0.81, -0.55]} size={[0.42, 0.025, 0.45]} color="#50524e" roughness={0.45} />
      {/* Tuck the appliance into the rear-left corner so it doesn't block the entry sightline. */}
      <group position={[-width / 2 + 0.35, 0, -1.13]}>
        <PropBox position={[0, 0.82, 0]} size={[0.52, 1.6, 0.49]} color="#aaa9a1" roughness={0.58} />
        <PropBox position={[0, 0.82, 0.252]} size={[0.47, 1.32, 0.018]} color="#d1d0c8" roughness={0.46} />
        <PropBox position={[0, 1.12, 0.265]} size={[0.465, 0.018, 0.022]} color="#85867f" roughness={0.62} />
        <PropBox position={[0.18, 0.87, 0.273]} size={[0.025, 0.43, 0.035]} color="#777970" roughness={0.38} />
        <PropBox position={[0, 1.64, 0]} size={[0.55, 0.045, 0.52]} color="#989a92" roughness={0.62} />
      </group>
    </group>}

    {room.kind === "private" && <group>
      <PropBox position={[0, 0.02, 0]} size={[Math.min(1.65, width - 0.15), 0.025, 2.4]} color="#d5c2a8" />
      <PropBox position={[0, 0.16, -0.22]} size={[Math.min(1.35, width - 0.3), 0.22, 1.98]} color="#8c6d50" />
      <PropBox position={[0, 0.34, -0.22]} size={[Math.min(1.28, width - 0.36), 0.18, 1.9]} color="#f0e4d3" />
      <PropBox position={[0, 0.49, -0.99]} size={[Math.min(1.25, width - 0.38), 0.13, 0.34]} color="#e5d7c4" />
      <PropBox position={[0, 0.49, -1.28]} size={[Math.min(1.05, width - 0.42), 0.48, 0.075]} color="#946d50" />
      <PropBox position={[width / 2 - 0.26, 0.31, 0.9]} size={[0.38, 0.34, 0.42]} color="#a98460" />
      <PropBox position={[width / 2 - 0.26, 0.5, 0.9]} size={[0.4, 0.05, 0.44]} color="#806148" />
    </group>}

    {room.slug === "library" && <group>
      <PropBox position={[0.025 - width / 2 + 0.23, 0.91, -0.15]} size={[0.34, 1.65, 2.25]} color="#7c553b" />
      {[0.25, 0.67, 1.09, 1.48].map((y) =>
        <PropBox key={y} position={[0.04 - width / 2 + 0.23, y, -0.15]} size={[0.4, 0.055, 2.26]} color="#b28a5f" />)}
      {Array.from({ length: 16 }, (_, i) => <PropBox key={i}
        position={[0.02 - width / 2 + 0.23, 0.43 + (i % 4) * 0.42, -1.0 + Math.floor(i / 4) * 0.56]}
        size={[0.24, 0.3 + (i % 3) * 0.025, 0.13]} color={["#a55e48", "#c8a46d", "#6f8272", "#dcc9a8"][i % 4]} />)}
    </group>}

    {room.slug === "pets-corner" && <group>
      <mesh position={[-0.15, 0.16, -0.82]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.12, 24]} />
        <meshStandardMaterial color="#b89b82" roughness={0.96} />
      </mesh>
      <mesh position={[-0.15, 0.23, -0.82]}>
        <cylinderGeometry args={[0.27, 0.28, 0.05, 24]} />
        <meshStandardMaterial color="#ddcbb2" roughness={0.98} />
      </mesh>
      <PropBox position={[0.48, 0.52, -1.15]} size={[0.22, 0.82, 0.22]} color="#ac8965" />
      <mesh position={[0.48, 0.99, -1.15]}>
        <sphereGeometry args={[0.14, 12, 10]} />
        <meshStandardMaterial color="#8e9b80" roughness={1} />
      </mesh>
      <mesh position={[0.36, 0.12, 0.75]}>
        <cylinderGeometry args={[0.12, 0.12, 0.16, 16]} />
        <meshStandardMaterial color="#c49f71" roughness={0.85} />
      </mesh>
    </group>}

    {room.kind === "spiritual" && <group>
      <PropBox position={[0, 0.025, 0]} size={[2.6, 0.03, 2.7]} color="#d4c5a9" />
      <PropBox position={[0.45, 0.05, -0.65]} size={[1.05, 0.045, 1.75]} color="#527064" />
      <PropBox position={[0.45, 0.078, -0.65]} size={[0.91, 0.012, 1.61]} color="#b19a72" />
      <PropBox position={[0.45, 0.086, -0.65]} size={[0.76, 0.012, 1.46]} color="#788b72" />
    </group>}

    {room.slug === "entrance" && <group>
      <PropBox position={[-width / 2 + 0.22, 0.38, -0.35]} size={[0.32, 0.62, 0.85]} color="#9b7352" />
      <PropBox position={[-width / 2 + 0.22, 0.72, -0.35]} size={[0.36, 0.055, 0.89]} color="#c0a17a" />
    </group>}
  </group>;
}

function RoomArea({ room, active, onSelect, shellOnly = false }: { room: Room; active?: Room; onSelect: (slug: RoomSlug) => void; shellOnly?: boolean }) {
  const [x, y, z] = room.scenePosition, [width, depth] = room.footprint;
  const [hovered, setHovered] = useState(false);
  const rearWindow = roomHasRearWindow(room);
  const rearWindowWidth = Math.min(0.9, width * 0.55);
  const rearWindowCenterY = (REAR_WINDOW_BOTTOM + REAR_WINDOW_TOP) / 2;
  const rearWindowHeight = REAR_WINDOW_TOP - REAR_WINDOW_BOTTOM;
  const openings = getRoomPortalOpenings(room);
  const walls = (["front", "back", "left", "right"] as const).flatMap((side) =>
    roomWallSegments(room, side, openings).map((segment, index) => ({ ...segment, key: side + "-" + index })));
  const baseboardColor = room.kind === "spiritual" ? "#b5b29d" : room.kind === "private" ? "#a77e5e" : "#b18a62";
  const baseboards = (["front", "back", "left", "right"] as const).flatMap((side) =>
    getRoomWallRuns(room, side, openings).map((run, index) => {
      const along = (run.start + run.end) / 2;
      const segmentLength = run.end - run.start;
      const frontBack = side === "front" || side === "back";
      const boundary = frontBack ? (side === "front" ? depth / 2 : -depth / 2)
        : (side === "right" ? width / 2 : -width / 2);
      const inward = boundary - Math.sign(boundary) * 0.035;
      return {
        key: side + "-skirting-" + index,
        position: frontBack
          ? [along, HOUSE_LAYOUT.floorThickness + 0.055, inward] as Vector3Tuple
          : [inward, HOUSE_LAYOUT.floorThickness + 0.055, along] as Vector3Tuple,
        size: frontBack
          ? [segmentLength, 0.11, 0.08] as Vector3Tuple
          : [0.08, 0.11, segmentLength] as Vector3Tuple,
      };
    }));
  const selected = !shellOnly && active?.slug === room.slug;
  const hintX = Math.max(-width * 0.32, Math.min(width * 0.32, room.camera.position[0] - x));
  const hintZ = Math.max(-depth * 0.32, Math.min(depth * 0.32, room.camera.position[2] - z));
  const floorColor = selected ? "#d9b9a4" : hovered
    ? room.kind === "spiritual" ? "#e8e5d2" : room.kind === "private" ? "#e7d0b8" : "#ead8c2"
    : room.kind === "spiritual" ? "#d9d8c7" : room.kind === "private" ? "#d8c2a9" : "#e1d4c0";
  const wallColor = room.kind === "spiritual" ? "#e5e1cf" : room.kind === "private" ? "#e8d6c0" : "#eee4d4";
  return <group position={[x, y, z]}>
    <mesh position={[0, HOUSE_LAYOUT.floorThickness / 2, 0]} receiveShadow
      onClick={(event) => { event.stopPropagation(); onSelect(room.slug as RoomSlug); }}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = ""; }}>
      <boxGeometry args={[width, HOUSE_LAYOUT.floorThickness, depth]} /><meshStandardMaterial color={floorColor} roughness={0.94} />
    </mesh>
    {!selected && !shellOnly && <NavigationHotspot position={[hintX, HOUSE_LAYOUT.floorThickness + 0.025, hintZ]}
      onSelect={() => onSelect(room.slug as RoomSlug)} />}
    <mesh position={[0, HOUSE_LAYOUT.floorThickness + HOUSE_LAYOUT.roomWallHeight - 0.04, 0]} receiveShadow>
      <boxGeometry args={[Math.max(0.2, width - 0.05), 0.08, Math.max(0.2, depth - 0.05)]} />
      <meshStandardMaterial color={room.kind === "spiritual" ? "#ede9dc" : "#f2e9dc"} roughness={0.98} />
    </mesh>
    {walls.map((wall) => <mesh key={wall.key} position={wall.position} castShadow receiveShadow>
      <boxGeometry args={wall.size} /><meshStandardMaterial color={wallColor} roughness={0.97} />
    </mesh>)}
    {/* A quiet skirting strip grounds each wall without bridging real door openings. */}
    {baseboards.map((board) => <mesh key={board.key} position={board.position} castShadow receiveShadow>
      <boxGeometry args={board.size} /><meshStandardMaterial color={baseboardColor} roughness={0.86} />
    </mesh>)}
    {!shellOnly && <RoomFurnishings room={room} />}
    {rearWindow && <group position={[0, 0, -depth / 2 + 0.035]}>
      <mesh position={[0, rearWindowCenterY, 0]}>
        <boxGeometry args={[rearWindowWidth - 0.1, rearWindowHeight - 0.1, 0.045]} />
        <meshStandardMaterial color="#b8d0ca" emissive="#657f78" emissiveIntensity={0.12} roughness={0.34} metalness={0.04} />
      </mesh>
      {[-1, 1].map((side) => <mesh key={"jamb-" + side} position={[side * rearWindowWidth / 2, rearWindowCenterY, 0.015]}>
        <boxGeometry args={[0.06, rearWindowHeight + 0.08, 0.09]} />
        <meshStandardMaterial color="#a47752" roughness={0.82} />
      </mesh>)}
      {[REAR_WINDOW_BOTTOM, REAR_WINDOW_TOP].map((height) => <mesh key={height} position={[0, height, 0.015]}>
        <boxGeometry args={[rearWindowWidth + 0.06, 0.06, 0.09]} />
        <meshStandardMaterial color="#a47752" roughness={0.82} />
      </mesh>)}
      <mesh position={[0, rearWindowCenterY, 0.018]}>
        <boxGeometry args={[0.045, rearWindowHeight, 0.095]} />
        <meshStandardMaterial color="#a47752" roughness={0.82} />
      </mesh>
    </group>}
    {openings.filter((opening) => roomOwnsPortalFrame(room, opening)).map((opening, index) => <DoorwayFrame key={(opening.targetSlug ?? opening.zone ?? "portal") + "-" + opening.side + "-" + index}
      room={room} opening={opening} onSelect={onSelect} />)}
    {getRoomWallRuns(room, "back", openings).map((interval, index) => <mesh key={"back-trim-" + index}
      position={[(interval.start + interval.end) / 2, HOUSE_LAYOUT.floorThickness + HOUSE_LAYOUT.roomWallHeight - 0.025, -depth / 2]}>
      <boxGeometry args={[interval.end - interval.start, 0.05, 0.14]} />
      <meshStandardMaterial color={room.kind === "private" ? "#a96d50" : "#b18a56"} roughness={0.82} />
    </mesh>)}
    {selected && <mesh position={[0, HOUSE_LAYOUT.floorThickness + 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.26, 0.32, 32]} /><meshStandardMaterial color="#94543d" roughness={0.5} />
    </mesh>}
  </group>;
}

function StairFlight({ flight, width, onSelectRoof }: {
  flight: { readonly from: Vector3Tuple; readonly to: Vector3Tuple; readonly steps: number }; width: number; onSelectRoof?: () => void;
}) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const runY = flight.to[1] - flight.from[1], runZ = flight.to[2] - flight.from[2];
  const stepY = runY / flight.steps, stepZ = runZ / flight.steps;
  const railLength = Math.hypot(runY, runZ), railRotation = -Math.atan2(runY, runZ);
  const midpoint = [(flight.from[0] + flight.to[0]) / 2, (flight.from[1] + flight.to[1]) / 2 + 0.28, (flight.from[2] + flight.to[2]) / 2] as Vector3Tuple;
  return <group>
    {Array.from({ length: flight.steps }, (_, index) => <mesh key={index}
      position={[flight.from[0], flight.from[1] + stepY * (index + 1) - 0.08, flight.from[2] + stepZ * (index + 0.5)]}
      castShadow receiveShadow onClick={onSelectRoof ? (event) => { event.stopPropagation(); onSelectRoof(); } : undefined}
      onPointerOver={onSelectRoof ? () => { setHoveredStep(index); document.body.style.cursor = "pointer"; } : undefined}
      onPointerOut={onSelectRoof ? () => { setHoveredStep(null); document.body.style.cursor = ""; } : undefined}>
      <boxGeometry args={[width, 0.16, Math.abs(stepZ) + 0.035]} />
      <meshStandardMaterial color={onSelectRoof && hoveredStep === index ? "#c7a17d" : "#b18e6c"} roughness={0.94} />
    </mesh>)}
    {[-1, 1].map((side) => <mesh key={side}
      position={[flight.from[0] + side * (width / 2 + 0.07), midpoint[1], midpoint[2]]}
      rotation={[railRotation, 0, 0]} castShadow>
      <boxGeometry args={[0.055, 0.07, railLength]} /><meshStandardMaterial color="#8b6a4d" roughness={0.84} />
    </mesh>)}
  </group>;
}

function GardenArea({ onSelect }: { onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  const garden = getRoomBySlug("garden");
  if (!garden) return null;
  const [x, , z] = garden.scenePosition, [width, depth] = garden.footprint;
  return <group>
    <mesh position={[x, -0.04, z]} receiveShadow onClick={(event) => { event.stopPropagation(); onSelect(); }}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = ""; }}>
      <boxGeometry args={[width, 0.08, depth]} /><meshStandardMaterial color={hovered ? "#b0b98f" : "#9ba27e"} roughness={1} />
    </mesh>
    <NavigationHotspot position={[x, 0.025, z]} onSelect={onSelect} />
    <mesh position={[x, 0.005, z - 0.1]} receiveShadow>
      <boxGeometry args={[1.55, 0.045, 2.1]} /><meshStandardMaterial color="#c8b89e" roughness={1} />
    </mesh>
    {[-width * 0.44, width * 0.44].map((treeX) => <group key={treeX} position={[treeX, 0, z - 1.25]}>
      <mesh position={[0, 0.62, 0]} castShadow><cylinderGeometry args={[0.11, 0.16, 1.24, 12]} /><meshStandardMaterial color="#76563e" roughness={0.95} /></mesh>
      <mesh position={[0, 1.5, 0]} castShadow><coneGeometry args={[0.82, 1.55, 14]} /><meshStandardMaterial color="#829071" roughness={1} /></mesh>
      <mesh position={[0.12, 2.03, 0.08]} castShadow><coneGeometry args={[0.55, 1.1, 14]} /><meshStandardMaterial color="#a0a780" roughness={1} /></mesh>
    </group>)}
    {[-width * 0.47, -width * 0.39, width * 0.39, width * 0.47].map((bushX) => <mesh key={bushX} position={[bushX, 0.22, z - 1.0]} castShadow>
      <sphereGeometry args={[0.42, 18, 12]} /><meshStandardMaterial color="#899477" roughness={1} />
    </mesh>)}
  </group>;
}

function RoofDeck({ onSelect }: { onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  const rooftop = getRoomBySlug("rooftop");
  if (!rooftop) return null;
  const [width, depth] = rooftop.footprint;
  const halfWidth = width / 2, halfDepth = depth / 2;
  const opening = HOUSE_LAYOUT.stairs.roofOpening;
  const openLeft = opening.centerX - opening.width / 2, openRight = opening.centerX + opening.width / 2;
  const openBack = opening.centerZ - opening.depth / 2, openFront = opening.centerZ + opening.depth / 2;
  const panels = [
    { x: (-halfWidth + openLeft) / 2, z: 0, w: openLeft + halfWidth, d: depth },
    { x: (openRight + halfWidth) / 2, z: 0, w: halfWidth - openRight, d: depth },
    { x: 0, z: (-halfDepth + openBack) / 2, w: opening.width, d: openBack + halfDepth },
    { x: 0, z: (openFront + halfDepth) / 2, w: opening.width, d: halfDepth - openFront },
  ];
  const y = HOUSE_LAYOUT.roofY - 0.09, parapetHeight = 0.38, parapetY = HOUSE_LAYOUT.roofY + parapetHeight / 2;
  return <group>
    {panels.filter((panel) => panel.w > 0.02 && panel.d > 0.02).map((panel, index) => <mesh key={index}
      position={[panel.x, y, panel.z]} receiveShadow onClick={(event) => { event.stopPropagation(); onSelect(); }}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = ""; }}>
      <boxGeometry args={[panel.w, 0.18, panel.d]} />
      <meshStandardMaterial color={hovered ? "#ded0b7" : "#c6b79f"} roughness={0.96} />
    </mesh>)}
    <NavigationHotspot position={[1.1, HOUSE_LAYOUT.roofY + 0.025, 0.35]} onSelect={onSelect} />
    {[
      { position: [0, parapetY, -halfDepth] as Vector3Tuple, size: [width, parapetHeight, 0.14] as Vector3Tuple },
      { position: [-halfWidth, parapetY, 0] as Vector3Tuple, size: [0.14, parapetHeight, depth] as Vector3Tuple },
      { position: [halfWidth, parapetY, 0] as Vector3Tuple, size: [0.14, parapetHeight, depth] as Vector3Tuple },
      { position: [0, parapetY, halfDepth] as Vector3Tuple, size: [width, parapetHeight, 0.14] as Vector3Tuple },
    ].map((wall, index) => <mesh key={index} position={wall.position} castShadow>
      <boxGeometry args={wall.size} /><meshStandardMaterial color="#e5d8c4" roughness={0.98} />
    </mesh>)}
    {/* Usable terrace seating set away from the stair hatch, with planters at the parapet corners. */}
    <group>
      <mesh position={[-3.55, HOUSE_LAYOUT.roofY + 0.28, -1.35]} castShadow receiveShadow>
        <boxGeometry args={[2.05, 0.18, 0.62]} />
        <meshStandardMaterial color="#8b654a" roughness={0.9} />
      </mesh>
      <mesh position={[-3.55, HOUSE_LAYOUT.roofY + 0.68, -1.61]} castShadow receiveShadow>
        <boxGeometry args={[2.05, 0.72, 0.13]} />
        <meshStandardMaterial color="#986f50" roughness={0.92} />
      </mesh>
      {[-4.2, -3.55, -2.9].map((x, index) => <mesh key={x} position={[x, HOUSE_LAYOUT.roofY + 0.4, -1.29]} receiveShadow>
        <boxGeometry args={[0.58, 0.08, 0.48]} />
        <meshStandardMaterial color={index === 1 ? "#d1b594" : "#c7a785"} roughness={0.94} />
      </mesh>)}
      {[
        [-4.45, -3.2], [4.45, -3.2], [4.45, 3.25],
      ].map(([x, z]) => <group key={x + ":" + z} position={[x, HOUSE_LAYOUT.roofY, z]}>
        <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.72, 0.42, 0.72]} />
          <meshStandardMaterial color="#ad8664" roughness={0.96} />
        </mesh>
        <mesh position={[0, 0.52, 0]} castShadow>
          <sphereGeometry args={[0.28, 18, 12]} />
          <meshStandardMaterial color="#829176" roughness={1} />
        </mesh>
        <mesh position={[0.04, 0.66, 0.03]} castShadow>
          <sphereGeometry args={[0.19, 16, 10]} />
          <meshStandardMaterial color="#9aa887" roughness={1} />
        </mesh>
      </group>)}
    </group>
  </group>;
}

function HouseArchitecture({ location, visualLocation, transitioning, exteriorShellOverride, cameraZone, onDoorActivate, onSelectRoom, reducedMotion }: {
  location: HouseLocation;
  visualLocation: HouseLocation;
  transitioning: boolean;
  exteriorShellOverride: boolean | undefined;
  cameraZone: CameraZone;
  onDoorActivate: (entering: boolean) => void;
  onSelectRoom: (slug: RoomSlug) => void;
  reducedMotion: boolean;
}) {
  const active = visualLocation === "exterior" || visualLocation === "map" ? undefined : getRoomBySlug(visualLocation);
  const visibility = getHouseSceneVisibility(location, visualLocation, transitioning, exteriorShellOverride, cameraZone);
  const bridgeSideWidth = Math.max(0.1, (HOUSE_LAYOUT.upperBridge.width - HOUSE_LAYOUT.stairs.openingWidth) / 2);
  const bridgeSideOffset = HOUSE_LAYOUT.stairs.openingWidth / 2 + bridgeSideWidth / 2;
  const bridgeRailX = HOUSE_LAYOUT.upperBridge.centerX + HOUSE_LAYOUT.stairs.openingWidth / 2;
  const bridgePostCount = Math.ceil(HOUSE_LAYOUT.upperBridge.depth / 0.75) + 1;
  const bridgeY = HOUSE_LAYOUT.upperBridge.levelY;
  const upperStairLandingZ = HOUSE_LAYOUT.stairs.groundFlight.to[2] + 0.18;
  return <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.205, 0]} receiveShadow>
      <planeGeometry args={[220, 220]} /><meshStandardMaterial color="#d6d5c0" roughness={1} />
    </mesh>
    {visibility.showExteriorShell && <ExteriorShell location={location} onDoorActivate={onDoorActivate} reducedMotion={reducedMotion} />}
    {!visibility.showExteriorShell && cameraZone !== "outside" && cameraZone !== "roof" && (
      <mesh position={[0, HOUSE_LAYOUT.exterior.wallHeight / 2, -HOUSE_LAYOUT.exterior.depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[HOUSE_LAYOUT.exterior.width, HOUSE_LAYOUT.exterior.wallHeight, HOUSE_LAYOUT.exterior.wallThickness]} />
        <meshStandardMaterial color="#dfcfb8" roughness={0.95} />
      </mesh>
    )}
    {rooms.filter((room) =>
      (room.level === "ground" && visibility.showGroundRooms) ||
      (room.level === "upper" && visibility.showUpperRooms)).map((room) =>
      <RoomArea key={room.id} room={room} active={active} onSelect={onSelectRoom}
        shellOnly={transitioning && (
          (room.level === "ground" && cameraZone !== "ground") ||
          (room.level === "upper" && cameraZone !== "upper")
        )} />)}
    {visibility.showGarden && <GardenArea onSelect={() => onSelectRoom("garden")} />}
    {visibility.showUpperCirculation && <>
      <mesh position={[HOUSE_LAYOUT.upperLanding.centerX, HOUSE_LAYOUT.upperLanding.levelY + HOUSE_LAYOUT.floorThickness / 2, HOUSE_LAYOUT.upperLanding.centerZ]} receiveShadow>
        <boxGeometry args={[HOUSE_LAYOUT.upperLanding.width, HOUSE_LAYOUT.floorThickness, HOUSE_LAYOUT.upperLanding.depth]} />
        <meshStandardMaterial color="#cbb99f" roughness={0.96} />
      </mesh>
      {/* Leave a real stairwell void above the lower flight; the old single slab
          forced the first-person camera through its underside at the upper floor. */}
      {[-1, 1].map((side) => <mesh key={"bridge-side-" + side}
        position={[HOUSE_LAYOUT.upperBridge.centerX + side * bridgeSideOffset, bridgeY + HOUSE_LAYOUT.floorThickness / 2, HOUSE_LAYOUT.upperBridge.centerZ]} receiveShadow>
        <boxGeometry args={[bridgeSideWidth, HOUSE_LAYOUT.floorThickness, HOUSE_LAYOUT.upperBridge.depth]} />
        <meshStandardMaterial color="#cbb99f" roughness={0.96} />
      </mesh>)}
      {/* A short head landing and edge rails make the floor opening read as a stairwell,
          while leaving a usable walking strip alongside it. */}
      <mesh position={[HOUSE_LAYOUT.upperBridge.centerX, bridgeY + HOUSE_LAYOUT.floorThickness / 2, upperStairLandingZ]} receiveShadow>
        <boxGeometry args={[HOUSE_LAYOUT.upperBridge.width, HOUSE_LAYOUT.floorThickness, 0.36]} />
        <meshStandardMaterial color="#cbb99f" roughness={0.96} />
      </mesh>
      {[-1, 1].map((side) => {
        const railX = HOUSE_LAYOUT.upperBridge.centerX + side * bridgeRailX;
        return <group key={"bridge-guard-" + side}>
          <mesh position={[railX, bridgeY + 0.82, HOUSE_LAYOUT.upperBridge.centerZ]}>
            <boxGeometry args={[0.065, 0.075, HOUSE_LAYOUT.upperBridge.depth]} />
            <meshStandardMaterial color="#9a704e" roughness={0.82} />
          </mesh>
          {Array.from({ length: bridgePostCount }, (_, index) => {
            const z = HOUSE_LAYOUT.upperBridge.centerZ - HOUSE_LAYOUT.upperBridge.depth / 2 +
              index * HOUSE_LAYOUT.upperBridge.depth / (bridgePostCount - 1);
            return <mesh key={index} position={[railX, bridgeY + 0.42, z]}>
              <boxGeometry args={[0.06, 0.84, 0.06]} />
              <meshStandardMaterial color="#a47a56" roughness={0.84} />
            </mesh>;
          })}
        </group>;
      })}
    </>}
    {visibility.showGroundStairs && <StairFlight flight={HOUSE_LAYOUT.stairs.groundFlight} width={HOUSE_LAYOUT.stairs.width} />}
    {visibility.showRoofStairs && <StairFlight flight={HOUSE_LAYOUT.stairs.roofFlight} width={HOUSE_LAYOUT.stairs.width} onSelectRoof={() => onSelectRoom("rooftop")} />}
    {visibility.showRoofDeck && <RoofDeck onSelect={() => onSelectRoom("rooftop")} />}
  </>;
}

export function HouseScene({ location, settledLocation, reducedMotion, onArrive, onTransitionChange: onNavigationChange, onDoorActivate, onSelect }: {
  location: HouseLocation;
  settledLocation: HouseLocation;
  reducedMotion: boolean;
  onArrive: (location: HouseLocation) => void;
  onTransitionChange: (transitioning: boolean) => void;
  onDoorActivate: (entering: boolean) => void;
  onSelect: (slug: RoomSlug) => void;
}) {
  const [transitioning, setTransitioning] = useState(false);
  const [cameraZone, setCameraZone] = useState<CameraZone>("outside");
  const [exteriorShellOverride, setExteriorShellOverride] = useState<boolean | undefined>(undefined);
  const handleExteriorShellVisibilityChange = useCallback((visible: boolean | undefined) => {
    setExteriorShellOverride(visible);
  }, []);
  const handleTransitionChange = useCallback((moving: boolean) => {
    setTransitioning(moving);
    onNavigationChange(moving);
  }, [onNavigationChange]);
  const handleCameraZoneChange = useCallback((zone: CameraZone) => {
    setCameraZone(zone);
  }, []);
  const visualTransition = transitioning || settledLocation !== location;
  const sceneFov = location === "exterior" || location === "map" ? 58 : 66;
  return <Canvas camera={{ position: EXTERIOR_CAMERA.position, fov: sceneFov, near: 0.1, far: 120 }}
    gl={{ antialias: true }} dpr={reducedMotion ? 1 : ([1, 1.4] as [number, number])}
    frameloop="demand" shadows
    onCreated={({ gl, scene }) => {
      // Set the clear color explicitly as a final safety net: even if any architecture
      // is temporarily out of view, a camera frame can never fall back to page beige.
      scene.background = new Color("#8fc9ed");
      // Filmic tone mapping protects plaster highlights while keeping wood and terracotta distinct.
      gl.toneMapping = ACESFilmicToneMapping;
      gl.toneMappingExposure = 1;
    }}>
    <color attach="background" args={["#8fc9ed"]} /><fog attach="fog" args={["#e8dfcf", 28, 76]} />
    <SkyEnvironment />
    <ambientLight intensity={0.58} /><hemisphereLight args={["#fff2db", "#8c9479", 0.82]} />
    <directionalLight position={[8, 15, 9]} intensity={2.15} castShadow
      shadow-mapSize-width={2048} shadow-mapSize-height={2048}
      shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14}
      shadow-camera-near={0.1} shadow-camera-far={48}
      shadow-bias={-0.00015} shadow-normalBias={0.02} />
    <CameraRig location={location} reducedMotion={reducedMotion} onArrive={onArrive}
      onTransitionChange={handleTransitionChange} onExteriorShellVisibilityChange={handleExteriorShellVisibilityChange}
      onCameraZoneChange={handleCameraZoneChange} />
    <HouseArchitecture location={location} visualLocation={settledLocation} transitioning={visualTransition}
      exteriorShellOverride={exteriorShellOverride} cameraZone={cameraZone}
      onDoorActivate={onDoorActivate} onSelectRoom={onSelect} reducedMotion={reducedMotion} />
  </Canvas>;
}

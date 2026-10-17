import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  EquirectangularReflectionMapping,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
  type Mesh,
} from "three";

export type SurfaceKind = "plaster" | "wood" | "stone" | "fabric";

export interface SurfaceProfile {
  hue: number;
  saturation: number;
  lightness: number;
  roughness: number;
  metalness: number;
  emissiveIntensity: number;
  width: number;
  height: number;
  depth: number;
}

/** Keep surfaces that need their existing optical response (glass, metals and foliage) untouched. */
export function inferSurfaceKind(profile: SurfaceProfile): SurfaceKind | null {
  if (profile.roughness < 0.44 || profile.metalness > 0.26 || profile.emissiveIntensity > 0.05) return null;
  if (profile.saturation > 0.17 && profile.hue >= 0.18 && profile.hue <= 0.46) return null;
  if (Math.max(profile.width, profile.depth) > 35) return null;

  const warmWood = profile.hue > 0.015 && profile.hue < 0.14 &&
    profile.saturation > 0.13 && profile.lightness < 0.64;
  const wideSoftFurniture = profile.width > 1.35 &&
    profile.height > 0.25 && profile.height < 1.25;
  if (warmWood) return wideSoftFurniture ? "fabric" : "wood";

  const broadHorizontalSurface = profile.height < 0.24 &&
    profile.width > 0.75 && profile.depth > 0.45;
  if (broadHorizontalSurface) return "stone";
  if (profile.lightness > 0.52) return "plaster";
  return "stone";
}

type SurfaceMaps = Record<SurfaceKind, { albedo: CanvasTexture; bump: CanvasTexture }>;

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function makeSurfaceTexture(kind: SurfaceKind, bump: boolean): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is required for procedural house materials");
  const random = seededRandom((kind.length + 1) * (bump ? 7919 : 104729));
  if (bump) {
    const pixels = context.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const index = (y * canvas.width + x) * 4;
        const broadVariation = Math.sin(x * 0.035) * 2 + Math.sin(y * 0.027) * 2;
        const grain = kind === "wood"
          ? Math.sin(y * 0.22 + Math.sin(x * 0.024) * 2.2) * 7
          : kind === "fabric" ? ((x % 6 < 2) !== (y % 6 < 2) ? 7 : -5) : 0;
        const seam = kind === "stone" && (x % 128 < 2 || y % 128 < 2) ? -28 : 0;
        const value = Math.max(78, Math.min(178,
          Math.round(128 + (random() - 0.5) * (kind === "plaster" ? 20 : 13) + broadVariation + grain + seam)));
        pixels.data[index] = value;
        pixels.data[index + 1] = value;
        pixels.data[index + 2] = value;
        pixels.data[index + 3] = 255;
      }
    }
    context.putImageData(pixels, 0, 0);
    if (kind === "wood") {
      context.strokeStyle = "rgba(82, 74, 64, 0.24)";
      context.lineWidth = 1;
      for (let line = 0; line < 26; line += 1) {
        const y = line * 20 + random() * 10;
        context.beginPath();
        context.moveTo(0, y);
        context.bezierCurveTo(145, y - 4 + random() * 8, 330, y + 4 - random() * 8, 512, y - 2 + random() * 4);
        context.stroke();
      }
    }
  } else {
    context.fillStyle = "#f8f5ee";
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (kind === "plaster") {
      for (let i = 0; i < 70; i += 1) {
        context.fillStyle = i % 2 ? "rgba(114, 97, 77, 0.035)" : "rgba(255, 255, 255, 0.10)";
        context.beginPath();
        context.ellipse(random() * 512, random() * 512, 12 + random() * 54, 8 + random() * 30, random() * Math.PI, 0, Math.PI * 2);
        context.fill();
      }
      for (let i = 0; i < 2500; i += 1) {
        context.fillStyle = random() > 0.5 ? "rgba(104, 88, 69, 0.07)" : "rgba(255, 255, 255, 0.22)";
        context.fillRect(random() * 512, random() * 512, 0.5 + random() * 1.4, 0.5 + random() * 1.4);
      }
    } else if (kind === "wood") {
      for (let line = 0; line < 30; line += 1) {
        const y = line * 18 + random() * 10;
        context.strokeStyle = line % 3 === 0 ? "rgba(94, 61, 40, 0.10)" : "rgba(255, 255, 255, 0.17)";
        context.lineWidth = line % 4 === 0 ? 2 : 1;
        context.beginPath();
        context.moveTo(0, y);
        context.bezierCurveTo(130, y - 3 + random() * 6, 340, y + 3 - random() * 6, 512, y - 2 + random() * 4);
        context.stroke();
      }
      for (let i = 0; i < 5; i += 1) {
        const x = 35 + random() * 440, y = 25 + random() * 460;
        context.strokeStyle = "rgba(88, 60, 42, 0.12)";
        context.lineWidth = 1;
        context.beginPath();
        context.ellipse(x, y, 3 + random() * 5, 1.5 + random() * 2, 0, 0, Math.PI * 2);
        context.stroke();
      }
    } else if (kind === "stone") {
      for (let line = 0; line <= 512; line += 128) {
        context.strokeStyle = "rgba(123, 101, 75, 0.18)";
        context.lineWidth = 2;
        context.beginPath(); context.moveTo(line, 0); context.lineTo(line, 512); context.stroke();
        context.beginPath(); context.moveTo(0, line); context.lineTo(512, line); context.stroke();
        context.strokeStyle = "rgba(255, 255, 255, 0.35)";
        context.lineWidth = 1;
        context.beginPath(); context.moveTo(line + 3, 0); context.lineTo(line + 3, 512); context.stroke();
        context.beginPath(); context.moveTo(0, line + 3); context.lineTo(512, line + 3); context.stroke();
      }
      for (let i = 0; i < 3400; i += 1) {
        context.fillStyle = random() > 0.52 ? "rgba(108, 91, 70, 0.045)" : "rgba(255, 255, 255, 0.15)";
        context.fillRect(random() * 512, random() * 512, 0.7 + random() * 2, 0.7 + random() * 2);
      }
    } else {
      context.strokeStyle = "rgba(113, 94, 73, 0.045)";
      context.lineWidth = 1;
      for (let line = 0; line < 512; line += 5) {
        context.beginPath(); context.moveTo(line, 0); context.lineTo(line, 512); context.stroke();
        context.beginPath(); context.moveTo(0, line); context.lineTo(512, line); context.stroke();
      }
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(kind === "stone" ? 2.5 : 3, kind === "stone" ? 2.5 : 3);
  if (!bump) texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** A compact equirectangular sky used for realistic soft reflections on matte surfaces. */
function makeSkyReflection(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is required for the procedural sky");
  const gradient = context.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, "#4f9ed4");
  gradient.addColorStop(0.38, "#9cc9df");
  gradient.addColorStop(0.52, "#f1dfc1");
  gradient.addColorStop(0.72, "#b7bba6");
  gradient.addColorStop(1, "#66755e");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1024, 512);
  const halo = context.createRadialGradient(330, 220, 6, 330, 220, 130);
  halo.addColorStop(0, "rgba(255, 249, 220, 0.92)");
  halo.addColorStop(0.13, "rgba(255, 228, 170, 0.42)");
  halo.addColorStop(1, "rgba(255, 228, 170, 0)");
  context.fillStyle = halo;
  context.fillRect(180, 70, 300, 300);
  context.fillStyle = "rgba(255,255,255,0.23)";
  for (const cloud of [{ x: 620, y: 175, rx: 92, ry: 21 }, { x: 690, y: 169, rx: 68, ry: 18 }, { x: 870, y: 205, rx: 76, ry: 17 }]) {
    context.beginPath();
    context.ellipse(cloud.x, cloud.y, cloud.rx, cloud.ry, 0, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new CanvasTexture(canvas);
  texture.mapping = EquirectangularReflectionMapping;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function dimensionsFor(mesh: Mesh) {
  const parameters = (mesh.geometry as unknown as {
    parameters?: { width?: number; height?: number; depth?: number };
  }).parameters ?? {};
  const scale = mesh.getWorldScale(new Vector3());
  return {
    width: Math.abs((parameters.width ?? 1) * scale.x),
    height: Math.abs((parameters.height ?? 1) * scale.y),
    depth: Math.abs((parameters.depth ?? 1) * scale.z),
  };
}

function applyProceduralMaterials(mesh: Mesh, maps: SurfaceMaps) {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const size = dimensionsFor(mesh);
  for (const candidate of materials) {
    if (!(candidate instanceof MeshStandardMaterial) || candidate.userData.darSurfaceKind) continue;
    const hsl = { h: 0, s: 0, l: 0 };
    candidate.color.getHSL(hsl, SRGBColorSpace);
    const kind = inferSurfaceKind({
      hue: hsl.h,
      saturation: hsl.s,
      lightness: hsl.l,
      roughness: candidate.roughness,
      metalness: candidate.metalness,
      emissiveIntensity: candidate.emissiveIntensity,
      ...size,
    });
    if (!kind) {
      candidate.userData.darSurfaceKind = "untouched";
      continue;
    }
    candidate.map = maps[kind].albedo;
    candidate.bumpMap = maps[kind].bump;
    candidate.bumpScale = kind === "plaster" ? 0.009 : kind === "wood" ? 0.006 : kind === "stone" ? 0.004 : 0.003;
    candidate.roughness = kind === "wood" ? Math.min(candidate.roughness, 0.74)
      : kind === "fabric" ? 0.96 : kind === "stone" ? 0.84 : Math.max(candidate.roughness, 0.9);
    candidate.envMapIntensity = 0.42;
    candidate.userData.darSurfaceKind = kind;
    candidate.needsUpdate = true;
  }
}

/**
 * Adds browser-generated PBR detail without downloads, paid asset libraries or runtime services.
 * revision changes whenever navigation swaps the visible room architecture, so newly-mounted
 * room surfaces receive the same treatment after every transition.
 */
export function RealisticMaterialPass({ revision }: { revision: string }) {
  const { scene } = useThree();
  const maps = useMemo<SurfaceMaps>(() => ({
    plaster: { albedo: makeSurfaceTexture("plaster", false), bump: makeSurfaceTexture("plaster", true) },
    wood: { albedo: makeSurfaceTexture("wood", false), bump: makeSurfaceTexture("wood", true) },
    stone: { albedo: makeSurfaceTexture("stone", false), bump: makeSurfaceTexture("stone", true) },
    fabric: { albedo: makeSurfaceTexture("fabric", false), bump: makeSurfaceTexture("fabric", true) },
  }), []);
  const environment = useMemo(() => makeSkyReflection(), []);

  useEffect(() => {
    const previousEnvironment = scene.environment;
    const previousIntensity = scene.environmentIntensity;
    scene.environment = environment;
    scene.environmentIntensity = 0.32;
    return () => {
      scene.environment = previousEnvironment;
      scene.environmentIntensity = previousIntensity;
      environment.dispose();
      Object.values(maps).forEach((surface) => {
        surface.albedo.dispose();
        surface.bump.dispose();
      });
    };
  }, [scene, environment, maps]);

  useEffect(() => {
    scene.traverse((object) => {
      const mesh = object as Mesh;
      if (mesh.isMesh && mesh.material) applyProceduralMaterials(mesh, maps);
    });
  }, [scene, maps, revision]);

  return null;
}

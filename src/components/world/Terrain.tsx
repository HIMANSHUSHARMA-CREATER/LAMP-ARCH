"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  CAMPUS_RADIUS,
  LAKE,
  TERRAIN_SEGMENTS,
  TREE_LINE,
  WATER_LEVEL,
  WORLD_SIZE,
  createTileableNoiseCanvas,
  distanceToLake,
  fbm,
  getTerrainHeight,
  getTerrainNormal,
  mulberry32,
  noise,
  terrainColor,
  tileableNoise,
} from "@/lib/world/terrain";

function createTerrainGeometry() {
  const geometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i += 1) {
    positions.setY(i, getTerrainHeight(positions.getX(i), positions.getZ(i)));
  }
  geometry.computeVertexNormals();

  const normals = geometry.attributes.normal;
  const colors = new Float32Array(positions.count * 3);
  const color = new THREE.Color();
  for (let i = 0; i < positions.count; i += 1) {
    terrainColor(positions.getX(i), positions.getZ(i), positions.getY(i), normals.getY(i), color);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();
  return geometry;
}

function createDetailTexture() {
  const canvas = createTileableNoiseCanvas(256, (u, v) => {
    const value = 205 + tileableNoise(u, v, 2.2, 5) * 50;
    return [value, value, value];
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(WORLD_SIZE / 7, WORLD_SIZE / 7);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createWaterNormalTexture() {
  const size = 128;
  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      heights[y * size + x] = tileableNoise(x / size, y / size, 3, 4);
    }
  }
  const canvas = createTileableNoiseCanvas(size, (u, v) => {
    const x = Math.round(u * size);
    const y = Math.round(v * size);
    const at = (px: number, py: number) => heights[((py + size) % size) * size + ((px + size) % size)];
    const dx = (at(x + 1, y) - at(x - 1, y)) * 2.5;
    const dy = (at(x, y + 1) - at(x, y - 1)) * 2.5;
    const n = new THREE.Vector3(-dx, -dy, 1).normalize();
    return [(n.x * 0.5 + 0.5) * 255, (n.y * 0.5 + 0.5) * 255, (n.z * 0.5 + 0.5) * 255];
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

function createPineGeometries() {
  const trunk = new THREE.CylinderGeometry(0.11, 0.2, 1.4, 7);
  trunk.translate(0, 0.7, 0);
  const layers = [
    { radius: 1.25, height: 2, y: 1.9 },
    { radius: 0.98, height: 1.7, y: 2.75 },
    { radius: 0.7, height: 1.4, y: 3.5 },
    { radius: 0.4, height: 1.1, y: 4.15 },
  ].map(({ radius, height, y }) => {
    const cone = new THREE.ConeGeometry(radius, height, 9, 1);
    cone.translate(0, y, 0);
    return cone;
  });
  const foliage = mergeGeometries(layers);
  return { trunk, foliage };
}

function createRockGeometry() {
  const geometry = new THREE.IcosahedronGeometry(1, 2);
  const positions = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  for (let i = 0; i < positions.count; i += 1) {
    vertex.fromBufferAttribute(positions, i);
    const n = noise.noise3d(vertex.x * 1.6, vertex.y * 1.6, vertex.z * 1.6);
    vertex.multiplyScalar(1 + n * 0.28);
    vertex.y *= 0.62;
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

type Placement = { matrix: THREE.Matrix4; color: THREE.Color };

function scatterPines(count: number): Placement[] {
  const random = mulberry32(99);
  const placements: Placement[] = [];
  const normal = new THREE.Vector3();
  const dummy = new THREE.Object3D();
  const deep = new THREE.Color("#2c4a28");
  const light = new THREE.Color("#4f7340");
  for (let attempt = 0; attempt < count * 8 && placements.length < count; attempt += 1) {
    const angle = random() * Math.PI * 2;
    const radius = CAMPUS_RADIUS + 5 + Math.sqrt(random()) * 200;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const height = getTerrainHeight(x, z);
    if (height < WATER_LEVEL + 0.9 || distanceToLake(x, z) < LAKE.radius + 1.5) continue;
    if (height > TREE_LINE + fbm(x, z, 2, 0.05) * 6) continue;
    if (getTerrainNormal(x, z, normal).y < 0.8) continue;
    if (fbm(x - 90, z + 40, 3, 0.022) < -0.15) continue;
    const scale = 0.8 + random() * 1.1;
    dummy.position.set(x, height - 0.15, z);
    dummy.rotation.set((random() - 0.5) * 0.08, random() * Math.PI * 2, (random() - 0.5) * 0.08);
    dummy.scale.set(scale, scale * (0.9 + random() * 0.4), scale);
    dummy.updateMatrix();
    placements.push({ matrix: dummy.matrix.clone(), color: deep.clone().lerp(light, random()) });
  }
  return placements;
}

function scatterRocks(count: number): Placement[] {
  const random = mulberry32(7);
  const placements: Placement[] = [];
  const dummy = new THREE.Object3D();
  const normal = new THREE.Vector3();
  const base = new THREE.Color("#7a756f");
  const dark = new THREE.Color("#57524d");
  for (let attempt = 0; attempt < count * 6 && placements.length < count; attempt += 1) {
    const angle = random() * Math.PI * 2;
    const radius = CAMPUS_RADIUS + 2 + Math.sqrt(random()) * 190;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const height = getTerrainHeight(x, z);
    if (height < WATER_LEVEL - 0.5) continue;
    getTerrainNormal(x, z, normal);
    const scale = 0.35 + Math.pow(random(), 2.5) * (radius > 70 ? 4.5 : 1.6);
    dummy.position.set(x, height - scale * 0.2, z);
    dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    dummy.rotateY(random() * Math.PI * 2);
    dummy.scale.set(scale * (0.8 + random() * 0.6), scale, scale * (0.8 + random() * 0.6));
    dummy.updateMatrix();
    placements.push({ matrix: dummy.matrix.clone(), color: base.clone().lerp(dark, random()) });
  }
  return placements;
}

function InstancedScatter({
  geometry,
  material,
  placements,
  castShadow = true,
}: {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  placements: Placement[];
  castShadow?: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    placements.forEach((placement, index) => {
      mesh.setMatrixAt(index, placement.matrix);
      mesh.setColorAt(index, placement.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [placements]);

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, placements.length]}
      castShadow={castShadow}
      receiveShadow
      frustumCulled={false}
    />
  );
}

function Forest() {
  const { trunk, foliage } = useMemo(() => createPineGeometries(), []);
  const pines = useMemo(() => scatterPines(1500), []);
  const trunkMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5b4433", roughness: 1 }), []);
  const foliageMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.92, flatShading: true }),
    [],
  );
  const trunkPlacements = useMemo(
    () => pines.map((pine) => ({ matrix: pine.matrix, color: new THREE.Color("#ffffff") })),
    [pines],
  );
  return (
    <group>
      <InstancedScatter geometry={trunk} material={trunkMaterial} placements={trunkPlacements} castShadow={false} />
      <InstancedScatter geometry={foliage} material={foliageMaterial} placements={pines} />
    </group>
  );
}

function Rocks() {
  const geometry = useMemo(() => createRockGeometry(), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.95, flatShading: true }),
    [],
  );
  const placements = useMemo(() => scatterRocks(420), []);
  return <InstancedScatter geometry={geometry} material={material} placements={placements} />;
}

function Lake() {
  const normalMap = useMemo(() => createWaterNormalTexture(), []);
  const material = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    const map = material.current?.normalMap;
    if (!map) return;
    map.offset.x += delta * 0.012;
    map.offset.y += delta * 0.008;
  });

  return (
    <mesh position={[LAKE.x, WATER_LEVEL, LAKE.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[LAKE.radius + 2, 64]} />
      <meshStandardMaterial
        ref={material}
        color="#2a6a80"
        roughness={0.06}
        metalness={0.35}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.6, 0.6)}
        transparent
        opacity={0.88}
      />
    </mesh>
  );
}

export function Terrain() {
  const geometry = useMemo(() => createTerrainGeometry(), []);
  const detail = useMemo(() => createDetailTexture(), []);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow name="terrain">
        <meshStandardMaterial vertexColors map={detail} roughness={0.96} metalness={0} />
      </mesh>
      <Lake />
      <Forest />
      <Rocks />
    </group>
  );
}

"use client";

import { Billboard, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { WORLD_STATIONS } from "@/content/stations";
import { Atmosphere } from "@/components/world/Atmosphere";
import { CameraRig } from "@/components/world/CameraRig";
import { Crystals } from "@/components/world/Crystals";
import { Player, STATION_OBSTACLES, type Obstacle, type WalkRequest } from "@/components/world/Player";
import { StationPad } from "@/components/world/StationPad";
import { Terrain } from "@/components/world/Terrain";
import { isTypingTarget, playerState } from "@/lib/world/runtime";
import { useGameStore } from "@/stores/game-store";
import type { StationId } from "@/types/game";

const ROAD_LENGTH = 48;
const INTERACT_DISTANCE = 4.5;

const TREE_POSITIONS: [number, number, number][] = [
  [-14, -7, 1.15],
  [13, -11, 0.9],
  [-13, 11, 0.85],
  [14, 8, 1.2],
  [-4, -14, 0.72],
  [5, 14, 1.05],
  [-19, 3, 1.1],
  [20, -4, 0.95],
  [-6, 21, 1.0],
  [7, -21, 1.1],
];

const LAMP_POSTS: [number, number][] = [-21, -13, 13, 21].flatMap((offset) => [
  [2.75, offset],
  [-2.75, offset],
  [offset, 2.75],
  [offset, -2.75],
]) as [number, number][];

function CampusTree({ position, scale }: { position: [number, number, number]; scale: number }) {
  const clusters: [number, number, number, number, string][] = [
    [0, 2.9, 0, 1.25, "#4c7a3d"],
    [0.75, 3.25, 0.25, 0.85, "#5f8c45"],
    [-0.7, 3.1, -0.2, 0.9, "#426d36"],
    [0.1, 3.75, -0.35, 0.8, "#6a9a4c"],
    [-0.25, 3.35, 0.7, 0.75, "#527f3e"],
  ];
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.28, 2.4, 9]} />
        <meshStandardMaterial color="#5e4632" roughness={1} />
      </mesh>
      <mesh position={[0.3, 2.1, 0]} rotation={[0, 0, -0.7]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, 1, 6]} />
        <meshStandardMaterial color="#5e4632" roughness={1} />
      </mesh>
      {clusters.map(([x, y, z, r, color], index) => (
        <mesh key={index} position={[x, y, z]} castShadow receiveShadow>
          <icosahedronGeometry args={[r, 1]} />
          <meshStandardMaterial color={color} roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Road({ rotation }: { rotation: number }) {
  return (
    <group rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.2, ROAD_LENGTH]} />
        <meshStandardMaterial color="#b3aea4" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.8, ROAD_LENGTH]} />
        <meshStandardMaterial color="#3f4447" roughness={0.92} />
      </mesh>
      {[-1.95, 1.95].map((x) => (
        <mesh key={x} position={[x, 0.06, 0]} receiveShadow>
          <boxGeometry args={[0.14, 0.1, ROAD_LENGTH]} />
          <meshStandardMaterial color="#c9c6bf" roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, index) => -22 + index * 4).map((z) => (
        <mesh key={z} position={[0, 0.026, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 2]} />
          <meshStandardMaterial color="#e9dfae" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function LampPost({ position, night }: { position: [number, number]; night: boolean }) {
  return (
    <group position={[position[0], 0, position[1]]}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 3, 8]} />
        <meshStandardMaterial color="#2f3438" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 3.05, 0]}>
        <sphereGeometry args={[0.17, 12, 10]} />
        <meshStandardMaterial color="#fff6d8" emissive="#ffd38a" emissiveIntensity={night ? 3 : 0.15} />
      </mesh>
    </group>
  );
}

function Plaza() {
  return (
    <group>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.4, 64]} />
        <meshStandardMaterial color="#9aa0a2" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.033, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.1, 4.4, 64]} />
        <meshStandardMaterial color="#6e7476" roughness={0.85} />
      </mesh>
    </group>
  );
}

function InteractPrompt({ visible }: { visible: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!group.current) return;
    group.current.position.set(playerState.position.x, playerState.position.y + 2.6, playerState.position.z);
  });
  return (
    <group ref={group} visible={visible}>
      <Billboard>
        <Text fontSize={0.3} color="#fde68a" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#111827">
          Press E to enter
        </Text>
      </Billboard>
    </group>
  );
}

export function Campus() {
  const unlockedStationIds = useGameStore((state) => state.unlockedStationIds);
  const activeStationId = useGameStore((state) => state.activeStationId);
  const panel = useGameStore((state) => state.panel);
  const openStation = useGameStore((state) => state.openStation);
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const [walkRequest, setWalkRequest] = useState<WalkRequest | null>(null);
  const [nearbyStation, setNearbyStation] = useState<StationId | null>(null);
  const nearbyRef = useRef<StationId | null>(null);
  const requestCounter = useRef(0);
  const frozen = panel !== "none";
  const night = timeOfDay === "night";

  const obstacles = useMemo<Obstacle[]>(
    () => [
      ...STATION_OBSTACLES,
      ...TREE_POSITIONS.map(([x, z]) => ({ x, z, radius: 0.6 })),
      ...LAMP_POSTS.map(([x, z]) => ({ x, z, radius: 0.25 })),
    ],
    [],
  );

  const walkTo = useCallback(
    (stationId: StationId) => {
      const station = WORLD_STATIONS.find((candidate) => candidate.id === stationId);
      if (!station || !unlockedStationIds.includes(station.id)) return;
      requestCounter.current += 1;
      setWalkRequest({ id: requestCounter.current, stationId, position: station.position });
    },
    [unlockedStationIds],
  );

  useEffect(() => {
    const handleTravel = (event: Event) => {
      const stationId = (event as CustomEvent<{ stationId?: StationId }>).detail?.stationId;
      if (stationId) walkTo(stationId);
    };
    window.addEventListener("lampquest:travel", handleTravel);
    return () => window.removeEventListener("lampquest:travel", handleTravel);
  }, [walkTo]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyE" || frozen || isTypingTarget(event.target)) return;
      if (nearbyRef.current) walkTo(nearbyRef.current);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [frozen, walkTo]);

  useFrame(() => {
    let closest: StationId | null = null;
    let closestDistance = INTERACT_DISTANCE;
    if (!frozen) {
      for (const station of WORLD_STATIONS) {
        if (!unlockedStationIds.includes(station.id)) continue;
        const distance = Math.hypot(
          playerState.position.x - station.position[0],
          playerState.position.z - station.position[2],
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = station.id;
        }
      }
    }
    if (nearbyRef.current !== closest) {
      nearbyRef.current = closest;
      setNearbyStation(closest);
    }
  });

  return (
    <>
      <Atmosphere timeOfDay={timeOfDay} />
      <Terrain />
      <Road rotation={0} />
      <Road rotation={Math.PI / 2} />
      <Plaza />

      {TREE_POSITIONS.map(([x, z, scale], index) => (
        <CampusTree key={index} position={[x, 0, z]} scale={scale} />
      ))}
      {LAMP_POSTS.map((position, index) => (
        <LampPost key={index} position={position} night={night} />
      ))}

      {WORLD_STATIONS.map((station) => (
        <StationPad
          key={station.id}
          station={station}
          unlocked={unlockedStationIds.includes(station.id)}
          active={activeStationId === station.id}
          night={night}
          onSelect={() => walkTo(station.id)}
        />
      ))}

      <Crystals />
      <InteractPrompt visible={nearbyStation !== null && !frozen} />

      <Player
        request={walkRequest}
        frozen={frozen}
        obstacles={obstacles}
        onArrive={(stationId) => {
          setWalkRequest(null);
          openStation(stationId);
        }}
        onCancelRequest={() => setWalkRequest(null)}
      />
      <CameraRig />
    </>
  );
}

"use client";

import { Grid, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { WORLD_STATIONS } from "@/content/stations";
import { CameraRig } from "@/components/world/CameraRig";
import { Player } from "@/components/world/Player";
import { StationPad } from "@/components/world/StationPad";
import { useGameStore } from "@/stores/game-store";
import type { StationId } from "@/types/game";

const TREE_POSITIONS: [number, number, number, number][] = [
  [-14, 0, -7, 1.15],
  [13, 0, -11, 0.9],
  [-13, 0, 11, 0.85],
  [14, 0, 8, 1.2],
  [-4, 0, -14, 0.72],
  [5, 0, 14, 1.05],
];

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.16, 0]} receiveShadow>
        <cylinderGeometry args={[1.05, 1.25, 0.25, 20]} />
        <meshStandardMaterial color="#786c52" roughness={1} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.27, 2.35, 10]} />
        <meshStandardMaterial color="#65503b" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.65, 0]} castShadow>
        <dodecahedronGeometry args={[1.15, 1]} />
        <meshStandardMaterial color="#55745b" roughness={0.95} />
      </mesh>
      <mesh position={[0.55, 3.05, 0.15]} castShadow>
        <dodecahedronGeometry args={[0.75, 1]} />
        <meshStandardMaterial color="#6f8b66" roughness={0.95} />
      </mesh>
    </group>
  );
}

function Road({ rotation = 0, position = [0, 0.07, 0] }: { rotation?: number; position?: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.8, 46]} />
        <meshStandardMaterial color="#555b5d" roughness={0.94} />
      </mesh>
      <mesh position={[-1.35, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.08, 46]} />
        <meshStandardMaterial color="#b9ae86" roughness={0.9} />
      </mesh>
      <mesh position={[1.35, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.08, 46]} />
        <meshStandardMaterial color="#b9ae86" roughness={0.9} />
      </mesh>
      {[-18, -10, -2, 6, 14, 22].map((z) => (
        <mesh key={z} position={[0, 0.018, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 3.2]} />
          <meshStandardMaterial color="#d8c98e" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Sun() {
  return (
    <group position={[-18, 18, -22]}>
      <mesh>
        <sphereGeometry args={[2.4, 32, 20]} />
        <meshBasicMaterial color="#fff1bd" />
      </mesh>
      <pointLight intensity={8} distance={80} color="#ffe7b0" />
    </group>
  );
}

export function Campus() {
  const unlockedStationIds = useGameStore((state) => state.unlockedStationIds);
  const activeStationId = useGameStore((state) => state.activeStationId);
  const panel = useGameStore((state) => state.panel);
  const openStation = useGameStore((state) => state.openStation);
  const [walkTarget, setWalkTarget] = useState<[number, number, number] | null>(null);
  const [nearbyStation, setNearbyStation] = useState<StationId | null>(null);
  const pendingStation = useRef<StationId | null>(null);
  const playerPos = useRef(new THREE.Vector3(0, 0.45, 6));
  const frozen = panel !== "none";

  useEffect(() => {
    const handleTravel = (event: Event) => {
      const stationId = (event as CustomEvent<{ stationId?: StationId }>).detail?.stationId;
      const station = WORLD_STATIONS.find((candidate) => candidate.id === stationId);
      if (!station || !unlockedStationIds.includes(station.id)) return;
      pendingStation.current = station.id;
      setWalkTarget(station.position);
    };

    window.addEventListener("lampquest:travel", handleTravel);
    return () => window.removeEventListener("lampquest:travel", handleTravel);
  }, [unlockedStationIds]);

  useFrame(({ scene }) => {
    const player = scene.getObjectByName("lamp-player");
    if (player) {
      playerPos.current.copy(player.position);
    }

    if (frozen) return;

    let closestStation: StationId | null = null;
    let closestDistance = Infinity;

    WORLD_STATIONS.forEach((station) => {
      if (!unlockedStationIds.includes(station.id)) return;
      const stationPos = new THREE.Vector3(...station.position);
      const distance = playerPos.current.distanceTo(stationPos);
      if (distance < 4 && distance < closestDistance) {
        closestDistance = distance;
        closestStation = station.id;
      }
    });

    setNearbyStation(closestStation);
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "e" && nearbyStation && !frozen) {
        pendingStation.current = nearbyStation;
        const station = WORLD_STATIONS.find((s) => s.id === nearbyStation);
        if (station) {
          setWalkTarget(station.position);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nearbyStation, frozen]);

  return (
    <>
      <color attach="background" args={["#b8c4c7"]} />
      <fog attach="fog" args={["#b8c4c7", 22, 58]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[-10, 18, 8]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]} />
      <hemisphereLight args={["#dce8ec", "#536066", 1.1]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#c7a15d" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[72, 72]} />
        <meshStandardMaterial color="#d9b873" roughness={1} />
      </mesh>
      <Grid
        infiniteGrid
        fadeDistance={46}
        fadeStrength={0.45}
        cellSize={2}
        sectionSize={10}
        cellColor="#c8a96d"
        sectionColor="#b59255"
        position={[0, 0.018, 0]}
      />
      <Sun />
      <Road rotation={0} position={[0, 0, 0]} />
      <Road rotation={Math.PI / 2} position={[0, 0, 0]} />

      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3.6, 3.6, 0.08, 48]} />
        <meshStandardMaterial color="#8b9698" roughness={0.8} />
      </mesh>

      {TREE_POSITIONS.map(([x, y, z, scale], index) => (
        <Tree key={index} position={[x, y, z]} scale={scale} />
      ))}

      {WORLD_STATIONS.map((station) => (
        <StationPad
          key={station.id}
          station={station}
          unlocked={unlockedStationIds.includes(station.id)}
          active={activeStationId === station.id}
          onSelect={() => {
            pendingStation.current = station.id;
            setWalkTarget(station.position);
          }}
        />
      ))}

      {nearbyStation && !frozen && (
        <Text
          position={[playerPos.current.x, 2, playerPos.current.z]}
          fontSize={0.28}
          color="#f4d58b"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#283033"
        >
          Press E to interact
        </Text>
      )}

      <Player
        target={walkTarget}
        frozen={frozen}
        onArrive={() => {
          if (pendingStation.current) {
            openStation(pendingStation.current);
          }
        }}
      />
      <CameraRig />
    </>
  );
}

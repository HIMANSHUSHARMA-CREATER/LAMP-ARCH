"use client";

import { Grid, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { WORLD_STATIONS } from "@/content/stations";
import { CameraRig } from "@/components/world/CameraRig";
import { Player } from "@/components/world/Player";
import { StationPad } from "@/components/world/StationPad";
import { useGameStore } from "@/stores/game-store";
import type { StationId } from "@/types/game";

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

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#596367" roughness={0.92} />
      </mesh>
      <Grid
        infiniteGrid
        fadeDistance={46}
        fadeStrength={1.4}
        cellSize={2}
        sectionSize={10}
        cellColor="#697579"
        sectionColor="#454f53"
        position={[0, 0.015, 0]}
      />
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3.6, 3.6, 0.08, 48]} />
        <meshStandardMaterial color="#8b9698" roughness={0.8} />
      </mesh>

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
        <Html position={[playerPos.current.x, 2, playerPos.current.z]} center distanceFactor={15}>
          <div className="rounded-lg bg-cyan-400/90 px-4 py-2 text-sm font-semibold text-slate-950 animate-pulse">
            Press E to interact
          </div>
        </Html>
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

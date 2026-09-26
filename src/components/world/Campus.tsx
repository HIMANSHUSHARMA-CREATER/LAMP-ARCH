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
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 18, 48]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[8, 14, 6]} intensity={1.15} castShadow />
      <hemisphereLight args={["#1e3a5f", "#020617", 0.4]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0b1220" />
      </mesh>
      <Grid
        infiniteGrid
        fadeDistance={42}
        fadeStrength={4}
        cellSize={1}
        sectionSize={5}
        cellColor="#1e293b"
        sectionColor="#334155"
        position={[0, 0.01, 0]}
      />
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.55, 48]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.4} />
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

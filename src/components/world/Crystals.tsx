"use client";

import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { CRYSTALS, type CrystalSpot } from "@/content/crystals";
import { playerState } from "@/lib/world/runtime";
import { getTerrainHeight } from "@/lib/world/terrain";
import { useGameStore } from "@/stores/game-store";

const COLLECT_RADIUS = 1.5;

function Crystal({ spot, onCollect }: { spot: CrystalSpot; onCollect: (id: string) => void }) {
  const gem = useRef<THREE.Group>(null);
  const [x, z] = spot.position;
  const baseY = getTerrainHeight(x, z) + 1.1;

  useFrame(({ clock }) => {
    const group = gem.current;
    if (!group) return;
    const t = clock.elapsedTime + x * 0.3;
    group.rotation.y = t * 1.4;
    group.position.y = baseY + Math.sin(t * 2) * 0.18;
    const { position } = playerState;
    if (Math.hypot(position.x - x, position.z - z) < COLLECT_RADIUS && Math.abs(position.y + 1 - baseY) < 2.2) {
      onCollect(spot.id);
    }
  });

  return (
    <group position={[x, 0, z]}>
      <group ref={gem} position={[0, baseY, 0]}>
        <mesh castShadow>
          <octahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial
            color="#7df9ff"
            emissive="#22d3ee"
            emissiveIntensity={1.4}
            metalness={0.3}
            roughness={0.12}
            transparent
            opacity={0.92}
          />
        </mesh>
      </group>
      <Sparkles position={[0, baseY, 0]} count={14} scale={[1.6, 1.8, 1.6]} size={3} speed={0.5} color="#a5f3fc" />
      <mesh position={[0, getTerrainHeight(x, z) + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.75, 32]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function Crystals() {
  const hydrated = useGameStore((state) => state.hydrated);
  const collected = useGameStore((state) => state.collectedCrystalIds);
  const collectCrystal = useGameStore((state) => state.collectCrystal);
  if (!hydrated) return null;

  return (
    <group>
      {CRYSTALS.filter((spot) => !collected.includes(spot.id)).map((spot) => (
        <Crystal key={spot.id} spot={spot} onCollect={collectCrystal} />
      ))}
    </group>
  );
}

"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type PlayerProps = {
  target: [number, number, number] | null;
  frozen: boolean;
  onArrive: () => void;
};

export function Player({ target, frozen, onArrive }: PlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const dest = useRef(new THREE.Vector3());
  const arrived = useRef(true);

  useEffect(() => {
    arrived.current = false;
  }, [target]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group || frozen || !target) return;
    dest.current.set(target[0], 0.45, target[2]);
    const distance = group.position.distanceTo(dest.current);
    if (distance < 0.2) {
      if (!arrived.current) {
        arrived.current = true;
        onArrive();
      }
      return;
    }
    group.position.lerp(dest.current, Math.min(1, delta * 2.6));
    group.lookAt(dest.current.x, group.position.y, dest.current.z);
  });

  return (
    <group ref={groupRef} name="lamp-player" position={[0, 0.45, 6]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.28, 0.7, 4, 8]} />
        <meshStandardMaterial color="#e2e8f0" emissive="#38bdf8" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.55, 0.2]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}

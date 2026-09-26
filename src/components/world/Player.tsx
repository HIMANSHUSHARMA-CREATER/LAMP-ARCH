"use client";

import { useFrame, useThree } from "@react-three/fiber";
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
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const velocity = useRef(new THREE.Vector3());
  const cameraDirection = useRef(new THREE.Vector3());

  const stationPositions = useRef([
    new THREE.Vector3(-8, 0, -8),
    new THREE.Vector3(8, 0, -8),
    new THREE.Vector3(-8, 0, 8),
    new THREE.Vector3(8, 0, 8),
    new THREE.Vector3(0, 0, 0),
  ]);

  useEffect(() => {
    arrived.current = false;
  }, [target]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const checkCollision = (position: THREE.Vector3): boolean => {
    const boundary = 20;
    if (Math.abs(position.x) > boundary || Math.abs(position.z) > boundary) {
      return true;
    }

    for (const stationPos of stationPositions.current) {
      const distance = position.distanceTo(stationPos);
      if (distance < 2.5) {
        return true;
      }
    }

    return false;
  };

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group || frozen) return;

    if (target) {
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
      return;
    }

    const speed = 8;
    const moveVector = new THREE.Vector3();

    if (keys.current.w) moveVector.z -= 1;
    if (keys.current.s) moveVector.z += 1;
    if (keys.current.a) moveVector.x -= 1;
    if (keys.current.d) moveVector.x += 1;

    if (moveVector.length() > 0) {
      moveVector.normalize();
      velocity.current.lerp(moveVector.multiplyScalar(speed * delta), 0.1);

      const newPosition = group.position.clone().add(velocity.current);
      if (!checkCollision(newPosition)) {
        group.position.copy(newPosition);
      }

      if (velocity.current.length() > 0.01) {
        const lookTarget = group.position.clone().add(velocity.current);
        group.lookAt(lookTarget.x, group.position.y, lookTarget.z);
      }
    } else {
      velocity.current.lerp(new THREE.Vector3(), 0.2);
    }
  });

  return (
    <group ref={groupRef} name="lamp-player" position={[0, 0.45, 6]}>
      <group position={[0, 0.05, 0]}>
        <mesh position={[0, 0.82, 0]} castShadow>
          <boxGeometry args={[0.46, 0.72, 0.28]} />
          <meshStandardMaterial color="#31485a" roughness={0.86} />
        </mesh>
        <mesh position={[0, 1.38, 0]} castShadow>
          <sphereGeometry args={[0.24, 20, 16]} />
          <meshStandardMaterial color="#8f6048" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.57, -0.015]} castShadow>
          <sphereGeometry args={[0.245, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          <meshStandardMaterial color="#2f2928" roughness={0.95} />
        </mesh>
        <mesh position={[-0.16, 0.82, 0]} rotation={[0, 0, -0.08]} castShadow>
          <capsuleGeometry args={[0.07, 0.56, 5, 10]} />
          <meshStandardMaterial color="#8f6048" roughness={0.9} />
        </mesh>
        <mesh position={[0.16, 0.82, 0]} rotation={[0, 0, 0.08]} castShadow>
          <capsuleGeometry args={[0.07, 0.56, 5, 10]} />
          <meshStandardMaterial color="#8f6048" roughness={0.9} />
        </mesh>
        <mesh position={[-0.13, 0.25, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.65, 5, 10]} />
          <meshStandardMaterial color="#202b32" roughness={0.9} />
        </mesh>
        <mesh position={[0.13, 0.25, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.65, 5, 10]} />
          <meshStandardMaterial color="#202b32" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

"use client";

import { Billboard, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import type { StationConfig } from "@/types/game";

type StationPadProps = {
  station: StationConfig;
  unlocked: boolean;
  active: boolean;
  night: boolean;
  onSelect: () => void;
};

export function StationPad({ station, unlocked, active, night, onSelect }: StationPadProps) {
  const [hovered, setHovered] = useState(false);
  const beacon = useRef<THREE.Mesh>(null);
  const color = station.themeColor;
  const [x, , z] = station.position;
  const facing = x === 0 && z === 0 ? 0 : Math.atan2(-x, -z);
  const glow = !unlocked ? 0 : night ? 1.6 : active || hovered ? 0.9 : 0.45;
  const wall = unlocked ? "#dcd6cc" : "#73777a";
  const trim = unlocked ? "#3d4246" : "#2b2e30";

  useFrame(({ clock }) => {
    const column = beacon.current;
    if (!column) return;
    const material = column.material as THREE.MeshBasicMaterial;
    material.opacity = (night ? 0.28 : 0.14) + Math.sin(clock.elapsedTime * 2.4 + x) * 0.05 + (active || hovered ? 0.1 : 0);
  });

  return (
    <group position={station.position}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          if (unlocked && event.delta < 8) onSelect();
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          if (unlocked) {
            setHovered(true);
            document.body.style.cursor = "pointer";
          }
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <circleGeometry args={[3.4, 48]} />
        <meshStandardMaterial color={unlocked ? "#a9a49a" : "#6d6c68"} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <ringGeometry args={[3.15, 3.4, 48]} />
        <meshStandardMaterial color={unlocked ? color : "#4b4f52"} emissive={unlocked ? color : "#000000"} emissiveIntensity={glow * 0.6} />
      </mesh>

      <group rotation={[0, facing, 0]}>
        <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.9, 0.24, 3.5]} />
          <meshStandardMaterial color="#8d8a84" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.08, 1.95]} receiveShadow>
          <boxGeometry args={[1.6, 0.14, 0.5]} />
          <meshStandardMaterial color="#9a978f" roughness={0.95} />
        </mesh>
        <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 2.6, 3]} />
          <meshStandardMaterial color={wall} roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.45, 1.51]}>
          <boxGeometry args={[2.7, 1.9, 0.05]} />
          <meshStandardMaterial
            color="#1d3442"
            metalness={0.85}
            roughness={0.12}
            emissive={unlocked ? color : "#000000"}
            emissiveIntensity={unlocked ? (night ? 0.55 : 0.08) : 0}
          />
        </mesh>
        {[-0.9, 0, 0.9].map((mullion) => (
          <mesh key={mullion} position={[mullion, 1.45, 1.54]}>
            <boxGeometry args={[0.05, 1.9, 0.04]} />
            <meshStandardMaterial color={trim} metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 1.45, 1.54]}>
          <boxGeometry args={[2.7, 0.05, 0.04]} />
          <meshStandardMaterial color={trim} metalness={0.6} roughness={0.4} />
        </mesh>
        {[-1.71, 1.71].map((side) => (
          <mesh key={side} position={[side, 1.6, 0]}>
            <boxGeometry args={[0.04, 0.9, 2.2]} />
            <meshStandardMaterial
              color="#22343f"
              metalness={0.8}
              roughness={0.15}
              emissive={unlocked ? "#ffd9a0" : "#000000"}
              emissiveIntensity={unlocked && night ? 0.7 : 0}
            />
          </mesh>
        ))}
        <mesh position={[0, 0.85, 1.53]}>
          <boxGeometry args={[0.9, 1.25, 0.06]} />
          <meshStandardMaterial color="#0e1a22" metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[0, 2.95, 0]} castShadow>
          <boxGeometry args={[3.8, 0.2, 3.4]} />
          <meshStandardMaterial color={trim} roughness={0.7} />
        </mesh>
        <mesh position={[0, 2.82, 1.71]}>
          <boxGeometry args={[3.8, 0.08, 0.02]} />
          <meshStandardMaterial color={unlocked ? color : "#444"} emissive={unlocked ? color : "#000000"} emissiveIntensity={glow} />
        </mesh>
        <mesh position={[0, 1.62, 2.05]} castShadow>
          <boxGeometry args={[1.7, 0.07, 0.95]} />
          <meshStandardMaterial color={trim} roughness={0.6} metalness={0.3} />
        </mesh>
        {[-0.78, 0.78].map((post) => (
          <mesh key={post} position={[post, 0.9, 2.45]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.45, 8]} />
            <meshStandardMaterial color={trim} metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
        <Text
          position={[0, 2.58, 1.56]}
          fontSize={0.26}
          color={unlocked ? color : "#9aa4a8"}
          anchorX="center"
          anchorY="middle"
          maxWidth={3.2}
        >
          {station.title.toUpperCase()}
        </Text>
        <mesh position={[1.1, 3.4, -0.8]} castShadow>
          <boxGeometry args={[0.9, 0.7, 0.9]} />
          <meshStandardMaterial color="#9ca3a8" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[-1.1, 3.75, -0.9]}>
          <cylinderGeometry args={[0.03, 0.03, 1.4, 6]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-1.1, 4.5, -0.9]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial color={unlocked ? color : "#555"} emissive={unlocked ? color : "#000000"} emissiveIntensity={unlocked ? 2 : 0} />
        </mesh>
      </group>

      {unlocked ? (
        <mesh ref={beacon} position={[0, 14, 0]}>
          <cylinderGeometry args={[0.35, 1.1, 24, 24, 1, true]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.15}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            fog={false}
          />
        </mesh>
      ) : null}
      {unlocked && night ? <pointLight position={[0, 2.2, 0]} color={color} intensity={14} distance={11} decay={2} /> : null}

      <Billboard position={[0, 5.3, 0]}>
        <Text
          fontSize={0.42}
          color={unlocked ? "#ffffff" : "#b4bcc0"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#111827"
        >
          {station.title}
        </Text>
        <Text
          position={[0, -0.42, 0]}
          fontSize={0.22}
          color={unlocked ? color : "#9aa4a8"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.025}
          outlineColor="#111827"
        >
          {unlocked ? station.subtitle : "Locked · complete earlier stations"}
        </Text>
      </Billboard>
    </group>
  );
}

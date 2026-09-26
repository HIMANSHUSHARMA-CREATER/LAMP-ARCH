"use client";

import { Text } from "@react-three/drei";
import { useState } from "react";
import type { StationConfig } from "@/types/game";

type StationPadProps = {
  station: StationConfig;
  unlocked: boolean;
  active: boolean;
  onSelect: () => void;
};

export function StationPad({ station, unlocked, active, onSelect }: StationPadProps) {
  const [hovered, setHovered] = useState(false);
  const color = station.themeColor;
  const emissiveIntensity = !unlocked ? 0 : active || hovered ? 0.12 : 0.04;

  return (
    <group position={station.position}>
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.65, 32]} />
        <meshStandardMaterial color="#b89456" roughness={1} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        onClick={(event) => {
          event.stopPropagation();
          if (unlocked) onSelect();
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
        <circleGeometry args={[2.2, 32]} />
        <meshStandardMaterial
          color={unlocked ? "#7d898b" : "#4d5659"}
          emissive={unlocked ? color : "#000000"}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={unlocked ? 0.72 : 0.5}
          roughness={0.82}
        />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[1.4, 2.2, 1.4]} />
        <meshStandardMaterial
          color={unlocked ? "#3f4a4c" : "#252b2d"}
          emissive={unlocked ? color : "#000000"}
          emissiveIntensity={unlocked ? 0.05 : 0}
          metalness={0.28}
          roughness={0.62}
        />
      </mesh>
      <Text
        position={[0, 2.6, 0]}
        fontSize={0.24}
        color={unlocked ? "#ffffff" : "#9aa4a8"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.025}
        outlineColor="#263033"
        maxWidth={3.8}
      >
        {station.title}{!unlocked ? " · locked" : ""}
      </Text>
    </group>
  );
}

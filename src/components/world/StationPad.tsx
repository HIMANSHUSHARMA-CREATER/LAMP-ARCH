"use client";

import { Html } from "@react-three/drei";
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
      <Html position={[0, 2.6, 0]} center distanceFactor={18}>
        <div
          className={`rounded-md border px-2 py-1 text-center text-xs font-semibold tracking-wide whitespace-nowrap ${
            unlocked
              ? "border-white/20 bg-slate-950/80 text-white"
              : "border-white/10 bg-slate-900/70 text-slate-400"
          }`}
        >
          {station.title}
          {!unlocked ? " · locked" : ""}
        </div>
      </Html>
    </group>
  );
}

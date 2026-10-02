"use client";

import { Sky, Stars } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mulberry32 } from "@/lib/world/terrain";
import { playerState } from "@/lib/world/runtime";
import type { TimeOfDay } from "@/stores/game-store";

type AtmospherePreset = {
  sun: [number, number, number];
  light: [number, number, number];
  lightColor: string;
  lightIntensity: number;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  ambient: number;
  fog: string;
  fogNear: number;
  fogFar: number;
  turbidity: number;
  rayleigh: number;
  cloudColor: string;
  cloudOpacity: number;
  stars: boolean;
};

export const ATMOSPHERE: Record<TimeOfDay, AtmospherePreset> = {
  day: {
    sun: [-0.45, 0.72, -0.52],
    light: [-0.45, 0.72, -0.52],
    lightColor: "#fff3df",
    lightIntensity: 2.8,
    hemiSky: "#cfe4ff",
    hemiGround: "#4f5d3d",
    hemiIntensity: 0.95,
    ambient: 0.2,
    fog: "#b7cfdf",
    fogNear: 70,
    fogFar: 360,
    turbidity: 5.5,
    rayleigh: 1.1,
    cloudColor: "#ffffff",
    cloudOpacity: 0.85,
    stars: false,
  },
  sunset: {
    sun: [-0.82, 0.07, -0.56],
    light: [-0.8, 0.22, -0.55],
    lightColor: "#ffad6b",
    lightIntensity: 2.1,
    hemiSky: "#ffc59c",
    hemiGround: "#3a3442",
    hemiIntensity: 0.55,
    ambient: 0.15,
    fog: "#d99c7d",
    fogNear: 55,
    fogFar: 320,
    turbidity: 9,
    rayleigh: 3,
    cloudColor: "#ffc6a3",
    cloudOpacity: 0.8,
    stars: false,
  },
  night: {
    sun: [0.3, -0.25, -0.6],
    light: [0.45, 0.75, 0.3],
    lightColor: "#a9bcff",
    lightIntensity: 0.55,
    hemiSky: "#2c3d6b",
    hemiGround: "#0b0e16",
    hemiIntensity: 0.4,
    ambient: 0.08,
    fog: "#0e1729",
    fogNear: 40,
    fogFar: 260,
    turbidity: 2,
    rayleigh: 0.4,
    cloudColor: "#56607a",
    cloudOpacity: 0.45,
    stars: true,
  },
};

function createCloudTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.45, "rgba(255,255,255,0.65)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

type Puff = { position: [number, number, number]; scale: number };

function createCloudBanks(): Puff[][] {
  const random = mulberry32(512);
  return Array.from({ length: 16 }, () => {
    const angle = random() * Math.PI * 2;
    const radius = 90 + random() * 220;
    const cx = Math.cos(angle) * radius;
    const cz = Math.sin(angle) * radius;
    const cy = 95 + random() * 45;
    return Array.from({ length: 6 + Math.floor(random() * 6) }, () => ({
      position: [cx + (random() - 0.5) * 50, cy + (random() - 0.5) * 8, cz + (random() - 0.5) * 22] as [number, number, number],
      scale: 22 + random() * 26,
    }));
  });
}

function Clouds({ color, opacity }: { color: string; opacity: number }) {
  const texture = useMemo(() => createCloudTexture(), []);
  const banks = useMemo(() => createCloudBanks(), []);
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const clouds = group.current;
    if (!clouds) return;
    clouds.children.forEach((bank) => {
      bank.position.x += delta * 1.6;
      if (bank.position.x > 320) bank.position.x -= 640;
    });
  });

  return (
    <group ref={group}>
      {banks.map((puffs, index) => (
        <group key={index}>
          {puffs.map((puff, puffIndex) => (
            <sprite key={puffIndex} position={puff.position} scale={[puff.scale, puff.scale * 0.5, 1]}>
              <spriteMaterial map={texture} color={color} transparent opacity={opacity} depthWrite={false} fog={false} />
            </sprite>
          ))}
        </group>
      ))}
    </group>
  );
}

export function Atmosphere({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  const preset = ATMOSPHERE[timeOfDay];
  const light = useRef<THREE.DirectionalLight>(null);
  const { scene } = useThree();
  const lightDirection = useMemo(() => new THREE.Vector3(...preset.light).normalize(), [preset]);
  const sunPosition = useMemo(
    () => new THREE.Vector3(...preset.sun).normalize().multiplyScalar(1000),
    [preset],
  );

  useEffect(() => {
    const target = light.current?.target;
    if (!target) return;
    scene.add(target);
    return () => {
      scene.remove(target);
    };
  }, [scene]);

  useFrame(() => {
    const sun = light.current;
    if (!sun) return;
    const { position } = playerState;
    sun.position.copy(position).addScaledVector(lightDirection, 80);
    sun.target.position.copy(position);
  });

  return (
    <>
      <color attach="background" args={[preset.fog]} />
      <fog attach="fog" args={[preset.fog, preset.fogNear, preset.fogFar]} />
      <Sky
        distance={1000}
        sunPosition={sunPosition}
        turbidity={preset.turbidity}
        rayleigh={preset.rayleigh}
        mieCoefficient={0.005}
        mieDirectionalG={0.85}
      />
      {preset.stars ? <Stars radius={600} depth={80} count={6000} factor={6} saturation={0} fade speed={0.6} /> : null}
      <Clouds color={preset.cloudColor} opacity={preset.cloudOpacity} />
      <ambientLight intensity={preset.ambient} />
      <hemisphereLight args={[preset.hemiSky, preset.hemiGround, preset.hemiIntensity]} />
      <directionalLight
        ref={light}
        color={preset.lightColor}
        intensity={preset.lightIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-near={1}
        shadow-camera-far={200}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
    </>
  );
}

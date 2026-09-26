"use client";

import { Canvas } from "@react-three/fiber";
import { Campus } from "@/components/world/Campus";

export default function WorldCanvas() {
  return (
    <Canvas
      className="h-full w-full"
      shadows
      camera={{ position: [0, 9, 17], fov: 50 }}
    >
      <Campus />
    </Canvas>
  );
}

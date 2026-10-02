"use client";

import { Canvas } from "@react-three/fiber";
import { Campus } from "@/components/world/Campus";

export default function WorldCanvas() {
  return (
    <Canvas
      className="h-full w-full touch-none"
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 7, 18], fov: 55, near: 0.1, far: 2000 }}
    >
      <Campus />
    </Canvas>
  );
}

"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export function CameraRig() {
  const { camera, scene } = useThree();
  const goal = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());

  useFrame(() => {
    const player = scene.getObjectByName("lamp-player");
    const x = player?.position.x ?? 0;
    const z = player?.position.z ?? 6;
    goal.current.set(x, 9, z + 11);
    camera.position.lerp(goal.current, 0.06);
    look.current.set(x, 0.8, z);
    camera.lookAt(look.current);
  });

  return null;
}

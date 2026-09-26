"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export function CameraRig() {
  const { camera, scene, gl } = useThree();
  const goal = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  const cameraAngle = useRef(0);
  const cameraDistance = useRef(14);
  const cameraHeight = useRef(8);
  const isPointerLocked = useRef(false);

  useEffect(() => {
    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement !== null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return;
      cameraAngle.current -= e.movementX * 0.002;
    };

    const handleClick = () => {
      if (!isPointerLocked.current) {
        gl.domElement.requestPointerLock();
      }
    };

    document.addEventListener("pointerlockchange", handlePointerLockChange);
    document.addEventListener("mousemove", handleMouseMove);
    gl.domElement.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      document.removeEventListener("mousemove", handleMouseMove);
      gl.domElement.removeEventListener("click", handleClick);
    };
  }, [gl]);

  useFrame(() => {
    const player = scene.getObjectByName("lamp-player");
    const x = player?.position.x ?? 0;
    const z = player?.position.z ?? 6;

    const offsetX = Math.sin(cameraAngle.current) * cameraDistance.current;
    const offsetZ = Math.cos(cameraAngle.current) * cameraDistance.current;

    goal.current.set(x + offsetX, cameraHeight.current, z + offsetZ);
    camera.position.lerp(goal.current, 0.08);
    look.current.set(x, 0.8, z);
    camera.lookAt(look.current);
  });

  return null;
}

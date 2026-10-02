"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { WORLD_STATIONS } from "@/content/stations";
import { cameraState, isTypingTarget, playerState } from "@/lib/world/runtime";
import { PLAY_RADIUS, WATER_LEVEL, getTerrainHeight } from "@/lib/world/terrain";
import type { StationId } from "@/types/game";

export type WalkRequest = {
  id: number;
  stationId: StationId;
  position: [number, number, number];
};

export type Obstacle = { x: number; z: number; radius: number };

type PlayerProps = {
  request: WalkRequest | null;
  frozen: boolean;
  obstacles: Obstacle[];
  onArrive: (stationId: StationId) => void;
  onCancelRequest: () => void;
};

const WALK_SPEED = 4.6;
const RUN_SPEED = 9.5;
const JUMP_VELOCITY = 7;
const GRAVITY = 20;
const ARRIVE_DISTANCE = 3.3;
const MAX_CLIMB = 1.1;

type Keys = Record<"forward" | "back" | "left" | "right" | "sprint" | "jump", boolean>;

const KEY_BINDINGS: Record<string, keyof Keys> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  ShiftLeft: "sprint",
  ShiftRight: "sprint",
  Space: "jump",
};

function shortestAngle(from: number, to: number) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

export function Player({ request, frozen, obstacles, onArrive, onCancelRequest }: PlayerProps) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const keys = useRef<Keys>({ forward: false, back: false, left: false, right: false, sprint: false, jump: false });
  const velocity = useRef(new THREE.Vector3());
  const verticalVelocity = useRef(0);
  const stridePhase = useRef(0);
  const exhausted = useRef(false);
  const arrivedRequest = useRef<number | null>(null);

  useEffect(() => {
    const handle = (pressed: boolean) => (event: KeyboardEvent) => {
      const action = KEY_BINDINGS[event.code];
      if (!action) return;
      if (pressed && isTypingTarget(event.target)) return;
      if (action === "jump" && pressed) event.preventDefault();
      keys.current[action] = pressed;
    };
    const down = handle(true);
    const up = handle(false);
    const reset = () => {
      Object.keys(keys.current).forEach((key) => {
        keys.current[key as keyof Keys] = false;
      });
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", reset);
    };
  }, []);

  useFrame((_, rawDelta) => {
    const group = root.current;
    if (!group) return;
    const delta = Math.min(rawDelta, 0.05);
    const position = group.position;
    const input = keys.current;

    const inputX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const inputY = (input.forward ? 1 : 0) - (input.back ? 1 : 0);
    const hasInput = !frozen && (inputX !== 0 || inputY !== 0);

    const desired = new THREE.Vector3();
    let targetSpeed = 0;
    let autoWalking = false;

    if (hasInput) {
      if (request) onCancelRequest();
      const yaw = cameraState.yaw;
      const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
      const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
      desired.addScaledVector(forward, inputY).addScaledVector(right, inputX).normalize();
      const wantsSprint = input.sprint && !exhausted.current && playerState.stamina > 0;
      targetSpeed = wantsSprint ? RUN_SPEED : WALK_SPEED;
      playerState.sprinting = wantsSprint;
    } else if (!frozen && request) {
      const dx = request.position[0] - position.x;
      const dz = request.position[2] - position.z;
      const distance = Math.hypot(dx, dz);
      playerState.sprinting = false;
      if (distance <= ARRIVE_DISTANCE) {
        if (arrivedRequest.current !== request.id) {
          arrivedRequest.current = request.id;
          onArrive(request.stationId);
        }
      } else {
        autoWalking = true;
        desired.set(dx / distance, 0, dz / distance);
        for (const obstacle of obstacles) {
          if (obstacle.x === request.position[0] && obstacle.z === request.position[2]) continue;
          const ox = position.x - obstacle.x;
          const oz = position.z - obstacle.z;
          const od = Math.hypot(ox, oz);
          const reach = obstacle.radius + 2.2;
          if (od < reach && od > 0.001) {
            const push = (reach - od) / reach;
            const side = Math.sign(desired.x * oz - desired.z * ox) || 1;
            desired.x += (ox / od) * push * 1.5 + (-oz / od) * side * push * 1.2;
            desired.z += (oz / od) * push * 1.5 + (ox / od) * side * push * 1.2;
          }
        }
        desired.normalize();
        targetSpeed = WALK_SPEED * 1.35;
      }
    } else {
      playerState.sprinting = false;
    }

    const moving = targetSpeed > 0;
    if (playerState.sprinting && moving) {
      playerState.stamina = Math.max(0, playerState.stamina - delta * 0.22);
      if (playerState.stamina === 0) exhausted.current = true;
    } else {
      playerState.stamina = Math.min(1, playerState.stamina + delta * 0.16);
      if (exhausted.current && playerState.stamina > 0.3) exhausted.current = false;
    }

    const blend = 1 - Math.exp(-delta * (moving ? 10 : 14));
    velocity.current.lerp(desired.multiplyScalar(targetSpeed), blend);

    const groundHere = getTerrainHeight(position.x, position.z);
    const blocked = (x: number, z: number) => {
      if (Math.hypot(x, z) > PLAY_RADIUS) return true;
      const ground = getTerrainHeight(x, z);
      if (ground < WATER_LEVEL + 0.15) return true;
      const step = Math.hypot(x - position.x, z - position.z);
      if (step > 0 && ground - groundHere > MAX_CLIMB * step && playerState.grounded) return true;
      if (autoWalking) return false;
      return obstacles.some((obstacle) => Math.hypot(x - obstacle.x, z - obstacle.z) < obstacle.radius);
    };

    const stepX = velocity.current.x * delta;
    const stepZ = velocity.current.z * delta;
    if (!blocked(position.x + stepX, position.z + stepZ)) {
      position.x += stepX;
      position.z += stepZ;
    } else if (!blocked(position.x + stepX, position.z)) {
      position.x += stepX;
      velocity.current.z = 0;
    } else if (!blocked(position.x, position.z + stepZ)) {
      position.z += stepZ;
      velocity.current.x = 0;
    } else {
      velocity.current.set(0, 0, 0);
    }

    const ground = getTerrainHeight(position.x, position.z);
    if (playerState.grounded && input.jump && !frozen) {
      verticalVelocity.current = JUMP_VELOCITY;
      playerState.grounded = false;
      input.jump = false;
    }
    if (!playerState.grounded) {
      verticalVelocity.current -= GRAVITY * delta;
      position.y += verticalVelocity.current * delta;
      if (position.y <= ground) {
        position.y = ground;
        verticalVelocity.current = 0;
        playerState.grounded = true;
      }
    } else if (position.y - ground > 0.6) {
      playerState.grounded = false;
    } else {
      position.y = ground;
    }

    const speed = Math.hypot(velocity.current.x, velocity.current.z);
    if (speed > 0.3) {
      const heading = Math.atan2(velocity.current.x, velocity.current.z);
      group.rotation.y += shortestAngle(group.rotation.y, heading) * Math.min(1, delta * 12);
    }

    const speedFactor = Math.min(1, speed / RUN_SPEED);
    stridePhase.current += delta * (4 + speed * 1.15) * (speed > 0.2 ? 1 : 0);
    const swing = Math.sin(stridePhase.current) * (0.25 + speedFactor * 0.7) * Math.min(1, speed / 1.5);
    const airborne = !playerState.grounded;
    if (leftLeg.current && rightLeg.current && leftArm.current && rightArm.current && body.current) {
      leftLeg.current.rotation.x = airborne ? -0.6 : swing;
      rightLeg.current.rotation.x = airborne ? 0.3 : -swing;
      leftArm.current.rotation.x = airborne ? -1.1 : -swing * 0.9;
      rightArm.current.rotation.x = airborne ? -1.1 : swing * 0.9;
      body.current.position.y = airborne ? 0 : Math.abs(Math.cos(stridePhase.current)) * 0.06 * Math.min(1, speed / 2);
      body.current.rotation.x = speedFactor * 0.18;
    }

    playerState.position.copy(position);
    playerState.heading = group.rotation.y;
    playerState.speed = speed;
  });

  const skin = "#c58c68";
  const jacket = "#1f4e6e";
  const accent = "#22d3ee";

  return (
    <group ref={root} name="lamp-player" position={[0, 0, 6]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <group ref={body}>
        <group ref={leftLeg} position={[-0.13, 0.86, 0]}>
          <mesh position={[0, -0.4, 0]} castShadow>
            <capsuleGeometry args={[0.095, 0.62, 6, 12]} />
            <meshStandardMaterial color="#26303a" roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.82, 0.07]} castShadow>
            <boxGeometry args={[0.17, 0.11, 0.32]} />
            <meshStandardMaterial color="#e8e4dc" roughness={0.7} />
          </mesh>
        </group>
        <group ref={rightLeg} position={[0.13, 0.86, 0]}>
          <mesh position={[0, -0.4, 0]} castShadow>
            <capsuleGeometry args={[0.095, 0.62, 6, 12]} />
            <meshStandardMaterial color="#26303a" roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.82, 0.07]} castShadow>
            <boxGeometry args={[0.17, 0.11, 0.32]} />
            <meshStandardMaterial color="#e8e4dc" roughness={0.7} />
          </mesh>
        </group>
        <mesh position={[0, 1.2, 0]} castShadow>
          <capsuleGeometry args={[0.24, 0.42, 8, 16]} />
          <meshStandardMaterial color={jacket} roughness={0.75} />
        </mesh>
        <mesh position={[0, 1.18, 0.235]}>
          <boxGeometry args={[0.04, 0.5, 0.02]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0, 1.22, -0.27]} castShadow>
          <boxGeometry args={[0.36, 0.46, 0.18]} />
          <meshStandardMaterial color="#3b3f45" roughness={0.85} />
        </mesh>
        <group ref={leftArm} position={[-0.32, 1.5, 0]}>
          <mesh position={[0, -0.3, 0]} rotation={[0, 0, 0.06]} castShadow>
            <capsuleGeometry args={[0.075, 0.5, 6, 12]} />
            <meshStandardMaterial color={jacket} roughness={0.75} />
          </mesh>
          <mesh position={[0.02, -0.64, 0]} castShadow>
            <sphereGeometry args={[0.075, 12, 10]} />
            <meshStandardMaterial color={skin} roughness={0.8} />
          </mesh>
        </group>
        <group ref={rightArm} position={[0.32, 1.5, 0]}>
          <mesh position={[0, -0.3, 0]} rotation={[0, 0, -0.06]} castShadow>
            <capsuleGeometry args={[0.075, 0.5, 6, 12]} />
            <meshStandardMaterial color={jacket} roughness={0.75} />
          </mesh>
          <mesh position={[-0.02, -0.64, 0]} castShadow>
            <sphereGeometry args={[0.075, 12, 10]} />
            <meshStandardMaterial color={skin} roughness={0.8} />
          </mesh>
        </group>
        <mesh position={[0, 1.62, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, 0.12, 12]} />
          <meshStandardMaterial color={skin} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.84, 0]} castShadow>
          <sphereGeometry args={[0.2, 24, 18]} />
          <meshStandardMaterial color={skin} roughness={0.75} />
        </mesh>
        <mesh position={[0, 1.93, -0.02]} castShadow>
          <sphereGeometry args={[0.212, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#2a211d" roughness={0.95} />
        </mesh>
        <mesh position={[0, 1.86, 0.17]}>
          <boxGeometry args={[0.26, 0.06, 0.06]} />
          <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.2} emissive={accent} emissiveIntensity={0.25} />
        </mesh>
      </group>
    </group>
  );
}

export const STATION_OBSTACLES: Obstacle[] = WORLD_STATIONS.map((station) => ({
  x: station.position[0],
  z: station.position[2],
  radius: 2.4,
}));

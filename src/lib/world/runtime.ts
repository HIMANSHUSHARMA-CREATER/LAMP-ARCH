import * as THREE from "three";

export const playerState = {
  position: new THREE.Vector3(0, 0, 6),
  heading: Math.PI,
  speed: 0,
  stamina: 1,
  sprinting: false,
  grounded: true,
};

export const cameraState = {
  yaw: 0,
  pitch: 0.42,
  distance: 12,
};

export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

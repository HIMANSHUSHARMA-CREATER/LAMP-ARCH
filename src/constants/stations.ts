import type { LearningMode, StationId } from "@/types/game";

export const STATION_ORDER: StationId[] = [
  "linux",
  "apache",
  "php",
  "mysql",
  "lamp",
  "aws",
];

export const XP_PER_LEVEL = 100;

export const MODE_ORDER: LearningMode[] = ["learn", "practice", "diy"];

export function missionIdFor(stationId: StationId, mode: LearningMode) {
  return `${stationId}-${mode}`;
}

export function levelFromXp(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpIntoLevel(xp: number) {
  return xp % XP_PER_LEVEL;
}

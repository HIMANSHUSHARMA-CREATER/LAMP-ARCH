import { apacheMissions } from "@/content/missions/apache";
import { awsMissions } from "@/content/missions/aws";
import { lampMissions } from "@/content/missions/lamp";
import { linuxMissions } from "@/content/missions/linux";
import { mysqlMissions } from "@/content/missions/mysql";
import { phpMissions } from "@/content/missions/php";
import type { LearningMode, Mission, StationId } from "@/types/game";

export const MISSIONS: Mission[] = [
  ...linuxMissions,
  ...apacheMissions,
  ...phpMissions,
  ...mysqlMissions,
  ...lampMissions,
  ...awsMissions,
];

export function getMission(id: string) {
  return MISSIONS.find((mission) => mission.id === id);
}

export function getMissionFor(stationId: StationId, mode: LearningMode) {
  return MISSIONS.find(
    (mission) => mission.stationId === stationId && mission.mode === mode,
  );
}

export function getMissionsForStation(stationId: StationId) {
  return MISSIONS.filter((mission) => mission.stationId === stationId);
}

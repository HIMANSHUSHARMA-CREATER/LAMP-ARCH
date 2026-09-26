import { MODE_ORDER, STATION_ORDER, missionIdFor } from "@/constants/stations";
import type { LearningMode, Progress, StationId } from "@/types/game";

const emptyModes = (): Record<StationId, LearningMode[]> => ({
  linux: [],
  apache: [],
  php: [],
  mysql: [],
  lamp: [],
  aws: [],
});

export function createInitialProgress(): Progress {
  return {
    xp: 0,
    completedMissionIds: [],
    ...deriveUnlocks([]),
  };
}

export function deriveUnlocks(completedMissionIds: string[]): Pick<
  Progress,
  "unlockedStationIds" | "unlockedModes"
> {
  const completed = new Set(completedMissionIds);
  const unlockedModes = emptyModes();
  const unlockedStationIds: StationId[] = ["linux"];
  unlockedModes.linux = ["learn"];

  const fourLayerDiys = (["linux", "apache", "php", "mysql"] as StationId[]).every(
    (station) => completed.has(missionIdFor(station, "diy")),
  );

  for (const station of STATION_ORDER) {
    if (station === "lamp" && fourLayerDiys && !unlockedStationIds.includes("lamp")) {
      unlockedStationIds.push("lamp");
      unlockedModes.lamp = ["learn"];
    }

    if (!unlockedStationIds.includes(station)) {
      continue;
    }

    if (!unlockedModes[station].includes("learn")) {
      unlockedModes[station] = ["learn"];
    }

    if (completed.has(missionIdFor(station, "learn"))) {
      addMode(unlockedModes[station], "practice");
    }
    if (completed.has(missionIdFor(station, "practice"))) {
      addMode(unlockedModes[station], "diy");
    }

    if (completed.has(missionIdFor(station, "diy"))) {
      const next = STATION_ORDER[STATION_ORDER.indexOf(station) + 1];
      if (next && !unlockedStationIds.includes(next)) {
        if (next === "lamp" && !fourLayerDiys) {
          continue;
        }
        unlockedStationIds.push(next);
        unlockedModes[next] = ["learn"];
      }
    }
  }

  return { unlockedStationIds, unlockedModes };
}

export function isModeUnlocked(
  progress: Progress,
  stationId: StationId,
  mode: LearningMode,
) {
  return progress.unlockedModes[stationId]?.includes(mode) ?? false;
}

export function isStationUnlocked(progress: Progress, stationId: StationId) {
  return progress.unlockedStationIds.includes(stationId);
}

function addMode(modes: LearningMode[], mode: LearningMode) {
  if (!modes.includes(mode)) {
    modes.push(mode);
    modes.sort((a, b) => MODE_ORDER.indexOf(a) - MODE_ORDER.indexOf(b));
  }
}

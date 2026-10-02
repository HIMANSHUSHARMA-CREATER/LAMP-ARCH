import { createInitialProgress } from "@/lib/progress/unlocks";
import type { Progress } from "@/types/game";

export const PROGRESS_STORAGE_KEY = "lamp-quest-progress";

type PersistedProgress = Pick<Progress, "xp" | "completedMissionIds"> & {
  collectedCrystalIds: string[];
};

function initialPersisted(): PersistedProgress {
  const initial = createInitialProgress();
  return { xp: initial.xp, completedMissionIds: initial.completedMissionIds, collectedCrystalIds: [] };
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
}

export function loadProgress(): PersistedProgress {
  if (typeof window === "undefined") {
    return initialPersisted();
  }

  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return initialPersisted();
    }
    const parsed = JSON.parse(raw) as Partial<PersistedProgress>;
    return {
      xp: typeof parsed.xp === "number" ? parsed.xp : 0,
      completedMissionIds: stringList(parsed.completedMissionIds),
      collectedCrystalIds: stringList(parsed.collectedCrystalIds),
    };
  } catch {
    return initialPersisted();
  }
}

export function saveProgress(progress: PersistedProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify({
      xp: progress.xp,
      completedMissionIds: progress.completedMissionIds,
      collectedCrystalIds: progress.collectedCrystalIds,
    }),
  );
}

export function clearProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
}

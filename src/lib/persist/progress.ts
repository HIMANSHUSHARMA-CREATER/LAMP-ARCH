import { createInitialProgress } from "@/lib/progress/unlocks";
import type { Progress } from "@/types/game";

export const PROGRESS_STORAGE_KEY = "lamp-quest-progress";

type PersistedProgress = Pick<Progress, "xp" | "completedMissionIds">;

export function loadProgress(): PersistedProgress {
  if (typeof window === "undefined") {
    const initial = createInitialProgress();
    return { xp: initial.xp, completedMissionIds: initial.completedMissionIds };
  }

  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      const initial = createInitialProgress();
      return { xp: initial.xp, completedMissionIds: initial.completedMissionIds };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedProgress>;
    return {
      xp: typeof parsed.xp === "number" ? parsed.xp : 0,
      completedMissionIds: Array.isArray(parsed.completedMissionIds)
        ? parsed.completedMissionIds.filter((id): id is string => typeof id === "string")
        : [],
    };
  } catch {
    const initial = createInitialProgress();
    return { xp: initial.xp, completedMissionIds: initial.completedMissionIds };
  }
}

export function saveProgress(progress: PersistedProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify({
      xp: progress.xp,
      completedMissionIds: progress.completedMissionIds,
    }),
  );
}

export function clearProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
}

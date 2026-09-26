import { MISSIONS, getMission } from "@/content/missions";
import type { Mission, Progress, StepPayload } from "@/types/game";

function normalizeCommand(command: string) {
  return command.trim().replace(/;+$/, "").replace(/\s+/g, " ").toLowerCase();
}

export function getAvailableMissions(progress: Progress) {
  const completed = new Set(progress.completedMissionIds);
  return MISSIONS.filter((mission) => {
    if (completed.has(mission.id)) return true;
    const stationReady = progress.unlockedStationIds.includes(mission.stationId);
    const modeReady = progress.unlockedModes[mission.stationId]?.includes(mission.mode);
    const requiresMet = mission.requires.every((id) => completed.has(id));
    return stationReady && modeReady && requiresMet;
  });
}

export function submitStep(
  mission: Mission,
  stepIndex: number,
  payload: StepPayload,
): { ok: boolean; hint?: string } {
  const step = mission.steps[stepIndex];
  if (!step) {
    return { ok: false, hint: "No step at that index." };
  }

  if (step.type === "read") {
    return payload.type === "continue" ? { ok: true } : { ok: false };
  }

  if (step.type === "command") {
    if (payload.type !== "command") {
      return { ok: false, hint: step.hint };
    }
    const command = normalizeCommand(payload.command);
    const expected = step.expect.value.toLowerCase();
    const ok =
      step.expect.kind === "exact"
        ? command === expected
        : step.expect.kind === "includes"
          ? command.includes(expected)
          : new RegExp(step.expect.value, "i").test(payload.command);
    return ok ? { ok: true } : { ok: false, hint: step.hint };
  }

  if (step.type === "quiz") {
    if (payload.type !== "quiz") {
      return { ok: false, hint: step.hint };
    }
    return payload.choice === step.answer
      ? { ok: true }
      : { ok: false, hint: step.hint };
  }

  if (step.type === "checklist") {
    if (payload.type !== "checklist") {
      return { ok: false, hint: step.hint };
    }
    const allChecked =
      payload.checked.length === step.items.length &&
      payload.checked.every(Boolean);
    return allChecked ? { ok: true } : { ok: false, hint: step.hint };
  }

  return { ok: false };
}

export function isMissionComplete(missionId: string, completedMissionIds: string[]) {
  return completedMissionIds.includes(missionId);
}

export function getMissionOrThrow(id: string) {
  const mission = getMission(id);
  if (!mission) {
    throw new Error(`Unknown mission: ${id}`);
  }
  return mission;
}

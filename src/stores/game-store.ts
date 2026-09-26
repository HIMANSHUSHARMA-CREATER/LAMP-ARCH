"use client";

import { getLesson } from "@/content/lessons";
import { getMission, getMissionFor } from "@/content/missions";
import { submitStep } from "@/lib/missions/engine";
import { clearProgress, loadProgress, saveProgress } from "@/lib/persist/progress";
import { createInitialProgress, deriveUnlocks } from "@/lib/progress/unlocks";
import { createShellState, runCommand, type ShellState } from "@/lib/terminal/simulator";
import { httpTutor } from "@/lib/tutor/http-tutor";
import type {
  LearningMode,
  MissionStep,
  PanelId,
  Progress,
  StationId,
  TutorMessage,
} from "@/types/game";
import { create } from "zustand";

type GameStore = Progress & {
  hydrated: boolean;
  activeStationId: StationId | null;
  activeMode: LearningMode | null;
  activeMissionId: string | null;
  currentStepIndex: number;
  panel: PanelId;
  tutorMessages: TutorMessage[];
  isTutorThinking: boolean;
  lastCommand?: string;
  lastOutput?: string;
  hydrate: () => void;
  openStation: (id: StationId) => void;
  closePanel: () => void;
  setMode: (mode: LearningMode) => void;
  setPanel: (panel: PanelId) => void;
  completeReadStep: () => { ok: boolean; hint?: string };
  submitCommand: (command: string, output: string) => { ok: boolean; hint?: string };
  submitQuiz: (choice: number) => { ok: boolean; hint?: string };
  submitChecklist: (checked: boolean[]) => { ok: boolean; hint?: string };
  runShell: (command: string) => string;
  askTutor: (message: string) => Promise<void>;
  resetProgress: () => void;
};

function persistSlice(state: Progress) {
  saveProgress({
    xp: state.xp,
    completedMissionIds: state.completedMissionIds,
  });
}

function withUnlocks(xp: number, completedMissionIds: string[]): Progress {
  return {
    xp,
    completedMissionIds,
    ...deriveUnlocks(completedMissionIds),
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialProgress(),
  hydrated: false,
  activeStationId: null,
  activeMode: null,
  activeMissionId: null,
  currentStepIndex: 0,
  panel: "none",
  tutorMessages: [
    {
      id: "welcome",
      role: "tutor",
      text: "Welcome to LAMP Quest. Click a glowing station, then Learn, Practice, or DIY. Ask me if a step is unclear.",
    },
  ],
  isTutorThinking: false,
  lastCommand: undefined,
  lastOutput: undefined,

  hydrate: () => {
    const loaded = loadProgress();
    set({ ...withUnlocks(loaded.xp, loaded.completedMissionIds), hydrated: true });
  },

  openStation: (id) => {
    const { unlockedStationIds } = get();
    if (!unlockedStationIds.includes(id)) return;
    const modes = get().unlockedModes[id] ?? [];
    const mode = modes.includes("learn") ? "learn" : modes[0];
    if (!mode) return;
    const mission = getMissionFor(id, mode);
    set({
      activeStationId: id,
      activeMode: mode,
      activeMissionId: mission?.id ?? null,
      currentStepIndex: 0,
      panel: mode,
    });
  },

  closePanel: () => {
    set({
      panel: "none",
      activeStationId: null,
      activeMode: null,
      activeMissionId: null,
      currentStepIndex: 0,
    });
  },

  setMode: (mode) => {
    const stationId = get().activeStationId;
    if (!stationId) return;
    if (!get().unlockedModes[stationId]?.includes(mode)) return;
    const mission = getMissionFor(stationId, mode);
    set({
      activeMode: mode,
      activeMissionId: mission?.id ?? null,
      currentStepIndex: 0,
      panel: mode,
    });
  },

  setPanel: (panel) => set({ panel }),

  completeReadStep: () => applyPayload(get, set, { type: "continue" }),

  submitCommand: (command, output) => {
    set({ lastCommand: command, lastOutput: output });
    return applyPayload(get, set, { type: "command", command });
  },

  submitQuiz: (choice) => applyPayload(get, set, { type: "quiz", choice }),

  submitChecklist: (checked) =>
    applyPayload(get, set, { type: "checklist", checked }),

  runShell: (command) => {
    const step = currentStep(get());
    const shell = step && step.type === "command" ? step.shell : "bash";
    const result = runCommand(shell, command, shellSnapshot);
    shellSnapshot = result.state;
    return result.output;
  },

  askTutor: async (message) => {
    const state = get();
    const student: TutorMessage = {
      id: `s-${Date.now()}`,
      role: "student",
      text: message,
    };
    set({
      tutorMessages: [...state.tutorMessages, student],
      isTutorThinking: true,
      panel: state.panel === "none" ? "tutor" : state.panel,
    });
    const step = currentStep(state);
    const lessonTitle = (() => {
      if (!step || step.type !== "read") return [];
      const lesson = getLesson(step.lessonId);
      return lesson ? [lesson.title] : [];
    })();
    const reply = await httpTutor.ask({
      message,
      context: {
        stationId: state.activeStationId,
        mode: state.activeMode,
        missionId: state.activeMissionId,
        stepId: step?.id ?? null,
        lastCommand: state.lastCommand,
        lastOutput: state.lastOutput,
        completedLessonTitles: lessonTitle,
      },
    });
    set((prev) => ({
      isTutorThinking: false,
      tutorMessages: [
        ...prev.tutorMessages,
        { id: `t-${Date.now()}`, role: "tutor", text: reply.text },
      ],
    }));
  },

  resetProgress: () => {
    clearProgress();
    shellSnapshot = createShellSnapshot();
    set({
      ...createInitialProgress(),
      hydrated: true,
      activeStationId: null,
      activeMode: null,
      activeMissionId: null,
      currentStepIndex: 0,
      panel: "none",
      lastCommand: undefined,
      lastOutput: undefined,
    });
  },
}));

let shellSnapshot: ShellState = createShellState();

function createShellSnapshot() {
  return createShellState();
}

function currentStep(state: Pick<GameStore, "activeMissionId" | "currentStepIndex">) {
  if (!state.activeMissionId) return undefined;
  const mission = getMission(state.activeMissionId);
  return mission?.steps[state.currentStepIndex] as MissionStep | undefined;
}

function applyPayload(
  get: () => GameStore,
  set: (partial: Partial<GameStore>) => void,
  payload: Parameters<typeof submitStep>[2],
): { ok: boolean; hint?: string } {
  const state = get();
  if (!state.activeMissionId) return { ok: false, hint: "No active mission." };
  const mission = getMission(state.activeMissionId);
  if (!mission) return { ok: false, hint: "Unknown mission." };
  const result = submitStep(mission, state.currentStepIndex, payload);
  if (!result.ok) return result;

  const nextIndex = state.currentStepIndex + 1;
  if (nextIndex >= mission.steps.length) {
    if (!state.completedMissionIds.includes(mission.id)) {
      const completedMissionIds = [...state.completedMissionIds, mission.id];
      const next = withUnlocks(state.xp + mission.xp, completedMissionIds);
      persistSlice(next);
      set({
        ...next,
        currentStepIndex: nextIndex,
      });
    } else {
      set({ currentStepIndex: nextIndex });
    }
    return { ok: true };
  }

  set({ currentStepIndex: nextIndex });
  return { ok: true };
}

export function selectLevel(xp: number) {
  return Math.floor(xp / 100) + 1;
}

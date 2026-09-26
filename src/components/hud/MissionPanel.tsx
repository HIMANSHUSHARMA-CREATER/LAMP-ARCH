"use client";

import { useEffect, useState } from "react";
import { LearningPanel } from "@/components/hud/LearningPanel";
import { ModeTabs, StationChip } from "@/components/hud/HudChrome";
import { getMission } from "@/content/missions";
import { TerminalPanel } from "@/features/terminal/TerminalPanel";
import { useGameStore } from "@/stores/game-store";

export function MissionPanel() {
  const activeMissionId = useGameStore((state) => state.activeMissionId);
  const currentStepIndex = useGameStore((state) => state.currentStepIndex);
  const closePanel = useGameStore((state) => state.closePanel);
  const submitCommand = useGameStore((state) => state.submitCommand);
  const submitQuiz = useGameStore((state) => state.submitQuiz);
  const submitChecklist = useGameStore((state) => state.submitChecklist);
  const askTutor = useGameStore((state) => state.askTutor);
  const [feedback, setFeedback] = useState<string | null>(null);

  const mission = activeMissionId ? getMission(activeMissionId) : undefined;
  const step = mission?.steps[currentStepIndex];
  const complete = Boolean(mission && currentStepIndex >= mission.steps.length);

  useEffect(() => {
    setFeedback(null);
  }, [activeMissionId, currentStepIndex]);

  if (!mission) return null;

  return (
    <div className="pointer-events-auto flex max-h-[min(72vh,640px)] w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/90 p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <StationChip />
          <h2 className="mt-1 text-lg font-semibold text-white">{mission.title}</h2>
          <p className="text-sm text-slate-400">{mission.summary}</p>
        </div>
        <button
          type="button"
          onClick={closePanel}
          className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-300"
        >
          Close
        </button>
      </div>
      <ModeTabs />

      {complete ? (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
          <p className="font-semibold text-emerald-200">Mission complete</p>
          <p className="mt-1 text-sm text-emerald-100/80">
            You earned {mission.xp} XP. Open the next tab when it unlocks, or walk to a newly lit station.
          </p>
        </div>
      ) : step?.type === "read" ? (
        <LearningPanel key={step.id} step={step} />
      ) : step?.type === "command" ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-200">{step.prompt}</p>
          <TerminalPanel
            key={step.id}
            shell={step.shell}
            onSubmit={(command, output) => {
              const result = submitCommand(command, output);
              setFeedback(result.ok ? "Correct — next step unlocked." : result.hint ?? "Try again.");
            }}
          />
        </div>
      ) : step?.type === "quiz" ? (
        <QuizStep
          key={step.id}
          question={step.question}
          choices={step.choices}
          onChoose={(choice) => {
            const result = submitQuiz(choice);
            setFeedback(result.ok ? "Correct." : result.hint ?? "Not quite.");
          }}
        />
      ) : step?.type === "checklist" ? (
        <ChecklistStep
          key={step.id}
          items={step.items}
          onSubmit={(values) => {
            const result = submitChecklist(values);
            setFeedback(result.ok ? "Checklist complete." : result.hint ?? "Check every box.");
          }}
        />
      ) : null}

      {feedback && !complete ? (
        <p className="text-sm text-amber-200">{feedback}</p>
      ) : null}

      {!complete && step ? (
        <button
          type="button"
          className="self-start text-xs text-violet-300 underline"
          onClick={() => void askTutor("I am stuck on this step. Give me a hint.")}
        >
          Ask tutor for a hint
        </button>
      ) : null}
    </div>
  );
}

function ChecklistStep({
  items,
  onSubmit,
}: {
  items: string[];
  onSubmit: (checked: boolean[]) => void;
}) {
  const [checked, setChecked] = useState(() => items.map(() => false));

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-300">Check every item when you can explain it.</p>
      {items.map((item, index) => (
        <label key={item} className="flex items-start gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            className="mt-1"
            checked={checked[index] ?? false}
            onChange={(event) => {
              const next = [...checked];
              next[index] = event.target.checked;
              setChecked(next);
            }}
          />
          {item}
        </label>
      ))}
      <button
        type="button"
        className="rounded-lg bg-cyan-400 px-3 py-1.5 text-sm font-semibold text-slate-950"
        onClick={() => onSubmit(checked)}
      >
        Submit checklist
      </button>
    </div>
  );
}

function QuizStep({
  question,
  choices,
  onChoose,
}: {
  question: string;
  choices: string[];
  onChoose: (choice: number) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-white">{question}</p>
      <div className="grid gap-2">
        {choices.map((choice, index) => (
          <button
            key={choice}
            type="button"
            onClick={() => onChoose(index)}
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-left text-sm text-slate-200 hover:border-cyan-400/40"
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}

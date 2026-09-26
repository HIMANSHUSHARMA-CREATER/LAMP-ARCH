"use client";

import { getLesson } from "@/content/lessons";
import { useState } from "react";
import { useGameStore } from "@/stores/game-store";
import type { MissionStep } from "@/types/game";

export function LearningPanel({ step }: { step: Extract<MissionStep, { type: "read" }> }) {
  const lesson = getLesson(step.lessonId);
  const completeReadStep = useGameStore((state) => state.completeReadStep);
  const [page, setPage] = useState(0);

  if (!lesson) {
    return <p className="text-sm text-red-300">Lesson not found.</p>;
  }

  const current = lesson.pages[page];
  const last = page >= lesson.pages.length - 1;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-400/80">{lesson.title}</p>
      <h3 className="text-xl font-semibold text-white">{current.heading}</h3>
      <p className="text-sm leading-7 text-slate-300">{current.body}</p>
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500">
          {page + 1} / {lesson.pages.length}
        </p>
        <div className="flex gap-2">
          {page > 0 ? (
            <button
              type="button"
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-200"
              onClick={() => setPage((value) => value - 1)}
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            className="rounded-lg bg-cyan-400 px-3 py-1.5 text-sm font-semibold text-slate-950"
            onClick={() => {
              if (last) {
                completeReadStep();
              } else {
                setPage((value) => value + 1);
              }
            }}
          >
            {last ? "Finish lesson" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

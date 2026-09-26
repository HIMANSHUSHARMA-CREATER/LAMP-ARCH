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
  const progress = ((page + 1) / lesson.pages.length) * 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold">{lesson.title}</p>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {page + 1} / {lesson.pages.length}
          </span>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-lg blur-md"></div>
        <div className="relative bg-slate-900/50 rounded-lg p-4 border border-cyan-400/20">
          <h3 className="text-xl font-bold text-white mb-3">{current.heading}</h3>
          <p className="text-sm leading-7 text-slate-300">{current.body}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          {page > 0 ? (
            <button
              type="button"
              className="rounded-lg bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-all duration-300"
              onClick={() => setPage((value) => value - 1)}
            >
              ← Back
            </button>
          ) : null}
        </div>
        <button
          type="button"
          className={`rounded-lg px-6 py-2 text-sm font-bold transition-all duration-300 ${
            last
              ? "bg-gradient-to-r from-cyan-400 to-blue-400 text-white shadow-lg shadow-cyan-400/30 hover:shadow-cyan-400/50 hover:scale-105"
              : "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
          }`}
          onClick={() => {
            if (last) {
              completeReadStep();
            } else {
              setPage((value) => value + 1);
            }
          }}
        >
          {last ? "✓ Complete Lesson" : "Continue →"}
        </button>
      </div>
    </div>
  );
}

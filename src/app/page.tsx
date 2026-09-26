"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useGameStore } from "@/stores/game-store";

export default function Home() {
  const hydrate = useGameStore((state) => state.hydrate);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const xp = useGameStore((state) => state.xp);
  const completedMissionIds = useGameStore((state) => state.completedMissionIds);
  const hydrated = useGameStore((state) => state.hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const hasProgress = xp > 0;
  const level = Math.floor(xp / 100) + 1;

  const techBadges = [
    { name: "Linux", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    { name: "Apache", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    { name: "PHP", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
    { name: "MySQL", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
    { name: "AWS", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  ];

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-950 px-6 text-slate-100">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        <div className="space-y-2">
          <p className="text-xs font-bold tracking-[0.4em] text-cyan-400 animate-pulse">
            EDUCATIONAL LAB
          </p>
          <h1 className="text-6xl font-semibold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
            LAMP Quest
          </h1>
        </div>

        <p className="text-lg leading-8 text-slate-400 max-w-lg">
          Explore a 3D campus and master Linux, Apache, MySQL, and PHP through interactive
          Learn, Practice, and DIY missions.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          {techBadges.map((badge) => (
            <span
              key={badge.name}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${badge.color}`}
            >
              {badge.name}
            </span>
          ))}
        </div>

        {hasProgress && hydrated && (
          <div className="w-full max-w-md rounded-xl border border-cyan-400/20 bg-slate-900/50 p-4 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-cyan-300">Your Progress</span>
              <span className="text-xs text-slate-400">Level {level}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 transition-all"
                style={{ width: `${(xp % 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>{xp} XP</span>
              <span>{completedMissionIds.length} missions completed</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/play"
            className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 px-8 py-3.5 text-sm font-semibold text-slate-950 hover:from-cyan-300 hover:to-blue-300 transition-all shadow-lg shadow-cyan-400/20"
          >
            {hasProgress ? "Continue Quest" : "Start Quest"}
          </Link>
          {hasProgress && (
            <button
              type="button"
              onClick={() => resetProgress()}
              className="rounded-full border border-white/15 px-6 py-3.5 text-sm text-slate-300 hover:bg-slate-800 transition-all"
            >
              Reset Progress
            </button>
          )}
        </div>

        <div className="grid w-full max-w-sm gap-3 text-left text-sm text-slate-400">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-400 text-xs font-bold">
              1
            </div>
            <div>
              <p className="font-medium text-slate-300">Learn</p>
              <p className="text-xs">Read interactive lessons at each station</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-400 text-xs font-bold">
              2
            </div>
            <div>
              <p className="font-medium text-slate-300">Practice</p>
              <p className="text-xs">Run guided terminal and quiz steps</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-400 text-xs font-bold">
              3
            </div>
            <div>
              <p className="font-medium text-slate-300">DIY</p>
              <p className="text-xs">Prove you can explain and operate the layer</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

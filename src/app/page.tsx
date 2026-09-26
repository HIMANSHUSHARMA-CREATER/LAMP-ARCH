"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useGameStore } from "@/stores/game-store";

export default function Home() {
  const hydrate = useGameStore((state) => state.hydrate);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const xp = useGameStore((state) => state.xp);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-950 px-6 text-slate-100">
      <main className="flex w-full max-w-xl flex-col items-center gap-8 text-center">
        <p className="text-xs font-bold tracking-[0.4em] text-cyan-400">EDUCATIONAL LAB</p>
        <h1 className="text-5xl font-semibold tracking-tight">LAMP Quest</h1>
        <p className="text-lg leading-8 text-slate-400">
          Explore a 3D campus and learn Linux, Apache, MySQL, and PHP through Learn,
          Practice, and DIY missions.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/play"
            className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950"
          >
            Enter campus
          </Link>
          <button
            type="button"
            onClick={() => resetProgress()}
            className="rounded-full border border-white/15 px-6 py-3 text-sm text-slate-300"
          >
            Reset progress {xp > 0 ? `(${xp} XP)` : ""}
          </button>
        </div>
        <ol className="grid w-full gap-2 text-left text-sm text-slate-400">
          <li>1. Learn — read the station lesson</li>
          <li>2. Practice — run guided terminal and quiz steps</li>
          <li>3. DIY — prove you can explain and operate the layer</li>
        </ol>
      </main>
    </div>
  );
}

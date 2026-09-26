"use client";

import { MODE_ORDER } from "@/constants/stations";
import { STATIONS, getStation } from "@/content/stations";
import { useGameStore } from "@/stores/game-store";
import type { LearningMode } from "@/types/game";

const MODE_LABEL: Record<LearningMode, string> = {
  learn: "Learn",
  practice: "Practice",
  diy: "DIY",
};

export function XpBar() {
  const xp = useGameStore((state) => state.xp);
  const level = Math.floor(xp / 100) + 1;
  const into = xp % 100;

  return (
    <div className="pointer-events-auto flex min-w-[220px] items-center gap-3 rounded-xl border border-cyan-400/20 bg-slate-950/80 px-3 py-2 backdrop-blur">
      <div className="text-xs font-bold tracking-widest text-cyan-300">LV {level}</div>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-cyan-400 transition-all"
          style={{ width: `${into}%` }}
        />
      </div>
      <div className="text-xs text-slate-300">{xp} XP</div>
    </div>
  );
}

export function ModeTabs() {
  const activeStationId = useGameStore((state) => state.activeStationId);
  const activeMode = useGameStore((state) => state.activeMode);
  const unlockedModes = useGameStore((state) => state.unlockedModes);
  const setMode = useGameStore((state) => state.setMode);
  if (!activeStationId) return null;
  const modes = unlockedModes[activeStationId] ?? [];

  return (
    <div className="flex gap-2">
      {MODE_ORDER.map((mode) => {
        const unlocked = modes.includes(mode);
        const active = activeMode === mode;
        return (
          <button
            key={mode}
            type="button"
            disabled={!unlocked}
            onClick={() => setMode(mode)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
              active
                ? "bg-cyan-400 text-slate-950"
                : unlocked
                  ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  : "cursor-not-allowed bg-slate-900 text-slate-600"
            }`}
          >
            {MODE_LABEL[mode]}
            {!unlocked ? " 🔒" : ""}
          </button>
        );
      })}
    </div>
  );
}

export function StationChip() {
  const activeStationId = useGameStore((state) => state.activeStationId);
  if (!activeStationId) return null;
  const station = getStation(activeStationId);
  return (
    <div className="text-sm font-semibold" style={{ color: station.themeColor }}>
      {station.title} Station
    </div>
  );
}

export function MapStrip() {
  const unlockedStationIds = useGameStore((state) => state.unlockedStationIds);
  const openStation = useGameStore((state) => state.openStation);
  const panel = useGameStore((state) => state.panel);
  const setPanel = useGameStore((state) => state.setPanel);

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-slate-950/80 p-2 backdrop-blur">
      {STATIONS.map((station) => {
        const unlocked = unlockedStationIds.includes(station.id);
        return (
          <button
            key={station.id}
            type="button"
            disabled={!unlocked}
            onClick={() => openStation(station.id)}
            className="rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide disabled:opacity-40"
            style={{
              background: unlocked ? `${station.themeColor}33` : "#0f172a",
              color: unlocked ? station.themeColor : "#64748b",
            }}
          >
            {station.title}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => setPanel(panel === "tutor" ? "none" : "tutor")}
        className="rounded-md bg-violet-500/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-200"
      >
        Tutor
      </button>
    </div>
  );
}

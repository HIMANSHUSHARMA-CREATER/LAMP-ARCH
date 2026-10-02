"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { MapStrip, XpBar } from "@/components/hud/HudChrome";
import { MissionPanel } from "@/components/hud/MissionPanel";
import { ControlsHint, WorldOverlay, WorldStatus } from "@/components/hud/WorldHud";
import { TutorPanel } from "@/features/tutor/TutorPanel";
import { useGameStore } from "@/stores/game-store";

const WorldCanvas = dynamic(() => import("@/components/world/WorldCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-slate-950 text-sm text-slate-400">
      Generating mountain valley…
    </div>
  ),
});

export function GameShell() {
  const hydrate = useGameStore((state) => state.hydrate);
  const hydrated = useGameStore((state) => state.hydrated);
  const panel = useGameStore((state) => state.panel);
  const setPanel = useGameStore((state) => state.setPanel);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const stationOpen =
    panel === "learn" || panel === "practice" || panel === "diy";

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-950">
      <WorldCanvas />
      <WorldOverlay />
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="pointer-events-auto">
            <p className="mb-2 text-xs font-bold tracking-[0.3em] text-cyan-300/80">
              LAMP QUEST
            </p>
            <XpBar />
            <WorldStatus />
          </div>
          <MapStrip />
        </div>
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-end">
          {hydrated && stationOpen ? (
            <MissionPanel />
          ) : (
            <div className="flex flex-1">
              <ControlsHint />
            </div>
          )}
          {panel === "tutor" || stationOpen ? (
            <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-violet-400/20 bg-slate-950/90 p-4 backdrop-blur-md">
              <TutorPanel />
              {panel === "tutor" && !stationOpen ? (
                <button
                  type="button"
                  className="mt-2 text-xs text-slate-400 underline"
                  onClick={() => setPanel("none")}
                >
                  Hide tutor
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/game-store";

export function TutorPanel() {
  const messages = useGameStore((state) => state.tutorMessages);
  const isThinking = useGameStore((state) => state.isTutorThinking);
  const askTutor = useGameStore((state) => state.askTutor);
  const [draft, setDraft] = useState("");

  return (
    <div className="flex h-full min-h-[240px] flex-col">
      <h3 className="mb-2 text-sm font-semibold text-violet-200">AI Tutor</h3>
      <div className="flex-1 space-y-2 overflow-y-auto rounded-lg bg-slate-950/70 p-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
              message.role === "student"
                ? "ml-auto bg-cyan-500/20 text-cyan-50"
                : "bg-violet-500/15 text-violet-100"
            }`}
          >
            {message.text}
          </div>
        ))}
        {isThinking ? (
          <p className="text-xs text-slate-500">Tutor is thinking…</p>
        ) : null}
      </div>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const text = draft.trim();
          if (!text) return;
          void askTutor(text);
          setDraft("");
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about this LAMP step…"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-violet-400 px-3 py-2 text-sm font-semibold text-slate-950"
        >
          Send
        </button>
      </form>
    </div>
  );
}

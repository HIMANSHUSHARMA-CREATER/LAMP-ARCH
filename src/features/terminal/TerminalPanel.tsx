"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/stores/game-store";
import type { ShellFlavor } from "@/types/game";

const PROMPT: Record<ShellFlavor, string> = {
  bash: "student@linux:~$",
  apache: "root@apache#",
  php: "php>",
  mysql: "mysql>",
  lamp: "lamp>",
};

const SHELL_COLORS: Record<ShellFlavor, { border: string; text: string; prompt: string; bg: string }> = {
  bash: { border: "border-emerald-500/30", text: "text-emerald-300", prompt: "text-emerald-500", bg: "bg-emerald-500" },
  apache: { border: "border-red-500/30", text: "text-red-300", prompt: "text-red-500", bg: "bg-red-500" },
  php: { border: "border-indigo-500/30", text: "text-indigo-300", prompt: "text-indigo-500", bg: "bg-indigo-500" },
  mysql: { border: "border-sky-500/30", text: "text-sky-300", prompt: "text-sky-500", bg: "bg-sky-500" },
  lamp: { border: "border-green-500/30", text: "text-green-300", prompt: "text-green-500", bg: "bg-green-500" },
};

export function TerminalPanel({
  shell,
  onSubmit,
}: {
  shell: ShellFlavor;
  onSubmit: (command: string, output: string) => void;
}) {
  const runShell = useGameStore((state) => state.runShell);
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<string[]>([
    `${PROMPT[shell]} type help for commands`,
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const colors = SHELL_COLORS[shell];

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-lg blur-md"></div>
      <div className={`relative overflow-hidden rounded-lg border ${colors.border} bg-slate-950 font-mono text-sm ${colors.text} shadow-lg`}>
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: colors.prompt.replace("text-", "") }}></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{shell} Terminal</span>
          </div>
          <div className="text-[10px] text-slate-500">Simulated Environment</div>
        </div>
        <div className="max-h-48 overflow-y-auto px-3 py-2 bg-black/50">
          {lines.map((line, index) => (
            <pre key={`${index}-${line}`} className="whitespace-pre-wrap">
              {line}
            </pre>
          ))}
          <div ref={endRef} />
        </div>
        <form
          className={`flex border-t ${colors.border} bg-slate-900/50`}
          onSubmit={(event) => {
            event.preventDefault();
            const command = input;
            if (!command.trim()) return;
            const output = runShell(command);
            setLines((current) => [
              ...current,
              `${PROMPT[shell]} ${command}`,
              ...(output ? output.split("\n") : []),
            ]);
            setInput("");
            onSubmit(command, output);
          }}
        >
          <span className={`px-3 py-2 ${colors.prompt} font-semibold`}>{PROMPT[shell]}</span>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-w-0 flex-1 bg-transparent py-2 pr-3 outline-none text-white placeholder-slate-600"
            placeholder="Enter command..."
            autoComplete="off"
            spellCheck={false}
            aria-label="Terminal command"
          />
        </form>
      </div>
    </div>
  );
}

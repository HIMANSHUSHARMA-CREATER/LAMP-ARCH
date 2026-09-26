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

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  return (
    <div className="overflow-hidden rounded-lg border border-emerald-500/30 bg-black font-mono text-sm text-emerald-300">
      <div className="max-h-48 overflow-y-auto px-3 py-2">
        {lines.map((line, index) => (
          <pre key={`${index}-${line}`} className="whitespace-pre-wrap">
            {line}
          </pre>
        ))}
        <div ref={endRef} />
      </div>
      <form
        className="flex border-t border-emerald-500/20"
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
        <span className="px-3 py-2 text-emerald-500">{PROMPT[shell]}</span>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="min-w-0 flex-1 bg-transparent py-2 pr-3 outline-none"
          autoComplete="off"
          spellCheck={false}
          aria-label="Terminal command"
        />
      </form>
    </div>
  );
}

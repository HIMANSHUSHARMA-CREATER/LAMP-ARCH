import type { ShellFlavor } from "@/types/game";

export type ShellState = {
  cwd: string;
  user: string;
  files: string[];
  apacheRunning: boolean;
  mysqlDatabase: string | null;
};

export function createShellState(): ShellState {
  return {
    cwd: "/home/student",
    user: "student",
    files: ["notes.txt", "readme.md"],
    apacheRunning: false,
    mysqlDatabase: null,
  };
}

export function runCommand(
  shell: ShellFlavor,
  input: string,
  state: ShellState,
): { output: string; state: ShellState } {
  const raw = input.trim();
  const command = raw.replace(/;+$/, "").replace(/\s+/g, " ");
  const lower = command.toLowerCase();

  if (!command) {
    return { output: "", state };
  }

  if (shell === "bash") {
    return runBash(lower, command, state);
  }
  if (shell === "apache") {
    return runApache(lower, state);
  }
  if (shell === "php") {
    return runPhp(lower, command, state);
  }
  if (shell === "mysql") {
    return runMysql(lower, state);
  }
  return runLamp(lower, state);
}

function runBash(lower: string, command: string, state: ShellState) {
  if (lower === "pwd") {
    return { output: state.cwd, state };
  }
  if (lower === "ls") {
    return { output: state.files.join("  "), state };
  }
  if (lower === "whoami") {
    return { output: state.user, state };
  }
  if (lower.startsWith("mkdir ")) {
    const name = command.split(" ")[1];
    if (!name) {
      return { output: "mkdir: missing folder name", state };
    }
    if (state.files.includes(name)) {
      return { output: `mkdir: ${name} already exists`, state };
    }
    return {
      output: `created directory '${name}'`,
      state: { ...state, files: [...state.files, name] },
    };
  }
  if (lower.startsWith("cd ")) {
    const name = command.split(" ")[1] ?? "";
    return {
      output: "",
      state: { ...state, cwd: name.startsWith("/") ? name : `${state.cwd}/${name}` },
    };
  }
  if (lower === "help") {
    return { output: "pwd  ls  whoami  mkdir  cd  help", state };
  }
  return { output: `command not found: ${command}`, state };
}

function runApache(lower: string, state: ShellState) {
  if (lower.includes("status")) {
    return {
      output: state.apacheRunning
        ? "Apache is running (pid 4242)"
        : "Apache is stopped",
      state,
    };
  }
  if (lower.includes("start")) {
    return {
      output: "Starting Apache httpd: OK",
      state: { ...state, apacheRunning: true },
    };
  }
  if (lower.includes("stop")) {
    return {
      output: "Stopping Apache httpd: OK",
      state: { ...state, apacheRunning: false },
    };
  }
  if (lower.includes("documentroot")) {
    return { output: "DocumentRoot /var/www/html", state };
  }
  if (lower === "help") {
    return { output: "apachectl status | start | stop | documentroot", state };
  }
  return { output: `apachectl: unknown command '${lower}'`, state };
}

function runPhp(lower: string, command: string, state: ShellState) {
  if (lower.includes("php -v") || lower === "php -v") {
    return { output: "PHP 8.3.0 (cli) (built: lamp-quest simulator)", state };
  }
  if (lower.includes("echo")) {
    return { output: "LAMP", state };
  }
  if (lower.includes("phpinfo")) {
    return {
      output: "phpinfo()\nPHP Version => 8.3.0\nServer API => Apache 2.0 Handler",
      state,
    };
  }
  if (lower === "help") {
    return { output: "php -v | php -r 'echo \"LAMP\";' | phpinfo", state };
  }
  return { output: `php: unable to run '${command}' in the simulator`, state };
}

function runMysql(lower: string, state: ShellState) {
  if (lower.includes("show databases")) {
    return { output: "information_schema\nlamp\nmysql", state };
  }
  if (lower.includes("use lamp")) {
    return { output: "Database changed", state: { ...state, mysqlDatabase: "lamp" } };
  }
  if (lower.includes("select * from students")) {
    if (state.mysqlDatabase !== "lamp") {
      return { output: "ERROR: No database selected. USE lamp;", state };
    }
    return { output: "id | name\n1  | Ada\n2  | Linus", state };
  }
  if (lower === "help") {
    return { output: "SHOW DATABASES;  USE lamp;  SELECT * FROM students;", state };
  }
  return { output: `ERROR: unknown statement near '${lower}'`, state };
}

function runLamp(lower: string, state: ShellState) {
  if (lower.includes("lamp")) {
    return {
      output: "Stack: Linux + Apache + MySQL + PHP\nPath: Browser → Apache → PHP → MySQL → HTML",
      state,
    };
  }
  if (lower.includes("health")) {
    return {
      output: [
        "linux   OK  kernel ready",
        "apache  OK  listening :80",
        "php     OK  module loaded",
        "mysql   OK  accepting connections",
      ].join("\n"),
      state,
    };
  }
  if (lower === "help") {
    return { output: "lamp  |  health", state };
  }
  return { output: "Unknown stack command. Try help.", state };
}

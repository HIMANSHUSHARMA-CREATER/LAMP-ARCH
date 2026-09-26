import type { ShellFlavor } from "@/types/game";

export type ShellState = {
  cwd: string;
  user: string;
  files: string[];
  fileContents: Record<string, string>;
  apacheRunning: boolean;
  apacheInstalled: boolean;
  mysqlDatabase: string | null;
  phpInstalled: boolean;
  packages: string[];
};

export function createShellState(): ShellState {
  return {
    cwd: "/home/student",
    user: "student",
    files: ["notes.txt", "readme.md"],
    fileContents: {
      "notes.txt": "TODO: Learn LAMP stack",
      "readme.md": "# LAMP Quest\nLearn Linux, Apache, MySQL, and PHP",
    },
    apacheRunning: false,
    apacheInstalled: false,
    mysqlDatabase: null,
    phpInstalled: false,
    packages: [],
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
    const name = command.split(" ").slice(1).join(" ");
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
    const name = command.split(" ").slice(1).join(" ") ?? "";
    return {
      output: "",
      state: { ...state, cwd: name.startsWith("/") ? name : `${state.cwd}/${name}` },
    };
  }
  if (lower.startsWith("cat ")) {
    const name = command.split(" ").slice(1).join(" ");
    if (!name) {
      return { output: "cat: missing file name", state };
    }
    if (!state.files.includes(name)) {
      return { output: `cat: ${name}: No such file or directory`, state };
    }
    return { output: state.fileContents[name] || "(empty file)", state };
  }
  if (lower.startsWith("touch ")) {
    const name = command.split(" ").slice(1).join(" ");
    if (!name) {
      return { output: "touch: missing file name", state };
    }
    if (state.files.includes(name)) {
      return { output: "", state };
    }
    return {
      output: "",
      state: {
        ...state,
        files: [...state.files, name],
        fileContents: { ...state.fileContents, [name]: "" },
      },
    };
  }
  if (lower.startsWith("cp ")) {
    const parts = command.split(" ").slice(1);
    if (parts.length < 2) {
      return { output: "cp: missing destination file", state };
    }
    const [src, dest] = parts;
    if (!state.files.includes(src)) {
      return { output: `cp: ${src}: No such file or directory`, state };
    }
    if (state.files.includes(dest)) {
      return { output: `cp: ${dest} already exists`, state };
    }
    return {
      output: "",
      state: {
        ...state,
        files: [...state.files, dest],
        fileContents: { ...state.fileContents, [dest]: state.fileContents[src] },
      },
    };
  }
  if (lower.startsWith("mv ")) {
    const parts = command.split(" ").slice(1);
    if (parts.length < 2) {
      return { output: "mv: missing destination file", state };
    }
    const [src, dest] = parts;
    if (!state.files.includes(src)) {
      return { output: `mv: ${src}: No such file or directory`, state };
    }
    const newFiles = state.files.filter((f) => f !== src);
    const newContents = { ...state.fileContents };
    delete newContents[src];
    newContents[dest] = state.fileContents[src];
    return {
      output: "",
      state: {
        ...state,
        files: [...newFiles, dest],
        fileContents: newContents,
      },
    };
  }
  if (lower.startsWith("rm ")) {
    const name = command.split(" ").slice(1).join(" ");
    if (!name) {
      return { output: "rm: missing file name", state };
    }
    if (!state.files.includes(name)) {
      return { output: `rm: ${name}: No such file or directory`, state };
    }
    const newFiles = state.files.filter((f) => f !== name);
    const newContents = { ...state.fileContents };
    delete newContents[name];
    return {
      output: "",
      state: {
        ...state,
        files: newFiles,
        fileContents: newContents,
      },
    };
  }
  if (lower.startsWith("chmod ")) {
    const parts = command.split(" ").slice(1);
    if (parts.length < 2) {
      return { output: "chmod: missing operand", state };
    }
    return { output: "chmod: mode changed (simulated)", state };
  }
  if (lower === "ps") {
    return {
      output: "PID TTY          TIME CMD\n1   ?        00:00:00 systemd\n4242 ?        00:00:05 apache2\n5000 ?        00:00:01 mysqld",
      state,
    };
  }
  if (lower === "top") {
    return {
      output: "top - 00:00:00 up 1 day, 0:00, 1 user\nTasks: 3 total, 1 running, 2 sleeping\n%Cpu(s): 2.3 us, 1.0 sy, 96.7 id\nMiB Mem: 1024.0 total, 512.0 free, 256.0 used\nPID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n4242 www-data  20   0   512M   128M    64M S   2.3  12.5   0:05.00 apache2",
      state,
    };
  }
  if (lower.includes("systemctl")) {
    if (lower.includes("status apache2")) {
      if (!state.apacheInstalled) {
        return { output: "Unit apache2.service could not be found.", state };
      }
      return {
        output: state.apacheRunning
          ? "apache2.service - Apache HTTP Server\n   Loaded: loaded (/lib/systemd/system/apache2.service; enabled)\n   Active: active (running) since ... "
          : "apache2.service - Apache HTTP Server\n   Loaded: loaded (/lib/systemd/system/apache2.service; enabled)\n   Active: inactive (dead)",
        state,
      };
    }
    if (lower.includes("start apache2")) {
      if (!state.apacheInstalled) {
        return { output: "Failed to start apache2.service: Unit not found.", state };
      }
      return {
        output: "Starting apache2.service: OK",
        state: { ...state, apacheRunning: true },
      };
    }
    if (lower.includes("stop apache2")) {
      return {
        output: "Stopping apache2.service: OK",
        state: { ...state, apacheRunning: false },
      };
    }
    return { output: "systemctl: command simulated. Try: systemctl status apache2", state };
  }
  if (lower.includes("apt")) {
    if (lower.includes("update")) {
      return {
        output: "Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease\nGet:2 http://security.ubuntu.com/ubuntu jammy-security InRelease [110 kB]\nReading package lists... Done",
        state,
      };
    }
    if (lower.includes("install apache2")) {
      if (state.packages.includes("apache2")) {
        return { output: "apache2 is already the newest version.", state };
      }
      return {
        output: "Reading package lists... Done\nBuilding dependency tree... Done\nThe following NEW packages will be installed:\n  apache2\n0 upgraded, 1 newly installed, 0 to remove.\nSetting up apache2 (2.4.52)...",
        state: {
          ...state,
          apacheInstalled: true,
          packages: [...state.packages, "apache2"],
        },
      };
    }
    if (lower.includes("install php")) {
      if (state.packages.includes("php")) {
        return { output: "php is already the newest version.", state };
      }
      return {
        output: "Reading package lists... Done\nBuilding dependency tree... Done\nThe following NEW packages will be installed:\n  php libapache2-mod-php php-mysql\n0 upgraded, 3 newly installed, 0 to remove.\nSetting up php (8.3.0)...",
        state: {
          ...state,
          phpInstalled: true,
          packages: [...state.packages, "php", "libapache2-mod-php", "php-mysql"],
        },
      };
    }
    if (lower.includes("install mysql-server")) {
      if (state.packages.includes("mysql-server")) {
        return { output: "mysql-server is already the newest version.", state };
      }
      return {
        output: "Reading package lists... Done\nBuilding dependency tree... Done\nThe following NEW packages will be installed:\n  mysql-server\n0 upgraded, 1 newly installed, 0 to remove.\nSetting up mysql-server (8.0.33)...",
        state: {
          ...state,
          packages: [...state.packages, "mysql-server"],
        },
      };
    }
    return { output: "apt: command simulated. Try: apt update or apt install <package>", state };
  }
  if (lower.startsWith("ssh ")) {
    const parts = command.split(" ").slice(1);
    if (parts.length < 1) {
      return { output: "ssh: missing hostname", state };
    }
    return {
      output: `ssh: connecting to ${parts[0]}... (simulated connection)\nWelcome to Ubuntu 22.04 LTS\nLast login: ${new Date().toISOString()}`,
      state,
    };
  }
  if (lower === "help") {
    return {
      output: "Available commands: pwd ls whoami mkdir cd cat touch cp mv rm chmod ps top systemctl apt ssh help",
      state,
    };
  }
  return { output: `command not found: ${command}`, state };
}

function runApache(lower: string, state: ShellState) {
  if (!state.apacheInstalled) {
    return { output: "Apache is not installed. Run: sudo apt install apache2", state };
  }
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
  if (!state.phpInstalled) {
    return { output: "PHP is not installed. Run: sudo apt install php", state };
  }
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
        `apache  ${state.apacheInstalled ? (state.apacheRunning ? "OK  listening :80" : "WARN service stopped") : "WARN not installed"}`,
        `php     ${state.phpInstalled ? "OK  module loaded" : "WARN not installed"}`,
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

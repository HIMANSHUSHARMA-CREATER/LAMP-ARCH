import type { Mission } from "@/types/game";

export const apacheMissions: Mission[] = [
  {
    id: "apache-learn",
    stationId: "apache",
    mode: "learn",
    title: "Meet Apache",
    summary: "Learn how the web server answers browser requests.",
    xp: 50,
    requires: ["linux-diy"],
    steps: [{ id: "apache-learn-1", type: "read", lessonId: "apache-httpd" }],
  },
  {
    id: "apache-practice",
    stationId: "apache",
    mode: "practice",
    title: "Control the web server",
    summary: "Use the simulated apachectl interface.",
    xp: 75,
    requires: ["apache-learn"],
    steps: [
      {
        id: "apache-practice-status",
        type: "command",
        shell: "apache",
        prompt: "Check whether Apache is running.",
        expect: { kind: "includes", value: "status" },
        hint: "Try apachectl status",
      },
      {
        id: "apache-practice-start",
        type: "command",
        shell: "apache",
        prompt: "Start the Apache service.",
        expect: { kind: "includes", value: "start" },
        hint: "Try apachectl start",
      },
      {
        id: "apache-practice-quiz",
        type: "quiz",
        question: "What is the folder Apache uses as the website root called?",
        choices: ["Home directory", "Document root", "Swap file", "Kernel"],
        answer: 1,
        hint: "Browsers map URLs onto files in this folder.",
      },
    ],
  },
  {
    id: "apache-diy",
    stationId: "apache",
    mode: "diy",
    title: "Serve a site",
    summary: "Confirm Apache is up and point it at a document root.",
    xp: 100,
    requires: ["apache-practice"],
    steps: [
      {
        id: "apache-diy-root",
        type: "command",
        shell: "apache",
        prompt: "Show the configured document root.",
        expect: { kind: "includes", value: "documentroot" },
        hint: "Try documentroot (one word, like a config directive).",
      },
      {
        id: "apache-diy-checklist",
        type: "checklist",
        items: [
          "Apache listens for HTTP requests on Linux.",
          "PHP files are handed off from Apache, not executed by Apache alone.",
        ],
        hint: "Both statements are true for a classic LAMP box.",
      },
    ],
  },
];

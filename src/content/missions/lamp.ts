import type { Mission } from "@/types/game";

export const lampMissions: Mission[] = [
  {
    id: "lamp-learn",
    stationId: "lamp",
    mode: "learn",
    title: "Trace one request",
    summary: "See Linux, Apache, MySQL, and PHP in a single path.",
    xp: 50,
    requires: ["linux-diy", "apache-diy", "php-diy", "mysql-diy"],
    steps: [{ id: "lamp-learn-1", type: "read", lessonId: "lamp-together" }],
  },
  {
    id: "lamp-practice",
    stationId: "lamp",
    mode: "practice",
    title: "Name each hop",
    summary: "Identify which component handles which job.",
    xp: 75,
    requires: ["lamp-learn"],
    steps: [
      {
        id: "lamp-practice-trace",
        type: "command",
        shell: "lamp",
        prompt: "Type the request path acronym in order (hint: start with L).",
        expect: { kind: "includes", value: "lamp" },
        hint: "Linux, Apache, MySQL, PHP — but the path is often Linux → Apache → PHP → MySQL. Type lamp to confirm the stack name.",
      },
      {
        id: "lamp-practice-quiz",
        type: "quiz",
        question: "A browser requests /index.php. What runs the PHP file?",
        choices: [
          "MySQL executes it as SQL",
          "Apache hands it to PHP, then returns HTML",
          "Linux compiles it to a kernel module",
          "The browser's JavaScript engine",
        ],
        answer: 1,
        hint: "Apache is the front door; PHP is the worker.",
      },
    ],
  },
  {
    id: "lamp-diy",
    stationId: "lamp",
    mode: "diy",
    title: "Stack health check",
    summary: "Confirm you can explain a full LAMP round trip.",
    xp: 100,
    requires: ["lamp-practice"],
    steps: [
      {
        id: "lamp-diy-health",
        type: "command",
        shell: "lamp",
        prompt: "Run the stack health check.",
        expect: { kind: "includes", value: "health" },
        hint: "Type health",
      },
      {
        id: "lamp-diy-checklist",
        type: "checklist",
        items: [
          "I can explain Linux → Apache → PHP → MySQL → HTML response.",
          "I am ready to think about deploying this stack on a cloud VM.",
        ],
        hint: "This unlocks the AWS preview station.",
      },
    ],
  },
];

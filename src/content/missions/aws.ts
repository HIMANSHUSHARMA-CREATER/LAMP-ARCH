import type { Mission } from "@/types/game";

export const awsMissions: Mission[] = [
  {
    id: "aws-learn",
    stationId: "aws",
    mode: "learn",
    title: "LAMP on a cloud VM",
    summary: "Preview how the same stack maps onto AWS.",
    xp: 50,
    requires: ["lamp-diy"],
    steps: [{ id: "aws-learn-1", type: "read", lessonId: "aws-preview" }],
  },
  {
    id: "aws-practice",
    stationId: "aws",
    mode: "practice",
    title: "Security group sketch",
    summary: "A stub challenge for opening HTTP on a simulated instance.",
    xp: 75,
    requires: ["aws-learn"],
    steps: [
      {
        id: "aws-practice-quiz",
        type: "quiz",
        question: "Which AWS idea is closest to 'a Linux box you SSH into'?",
        choices: ["S3 bucket", "EC2 instance", "CloudFront", "Route 53 only"],
        answer: 1,
        hint: "Think virtual machines.",
      },
    ],
  },
  {
    id: "aws-diy",
    stationId: "aws",
    mode: "diy",
    title: "Deploy checklist (stub)",
    summary: "Placeholder for a future mock AWS console.",
    xp: 100,
    requires: ["aws-practice"],
    steps: [
      {
        id: "aws-diy-checklist",
        type: "checklist",
        items: [
          "Security group allows 22 (SSH) and 80 (HTTP) from my lab IP.",
          "Apache is running on the instance and serves a PHP page.",
        ],
        hint: "This is a classroom stub — no real AWS account is required.",
      },
    ],
  },
];

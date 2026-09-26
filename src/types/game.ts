export type StationId = "linux" | "apache" | "php" | "mysql" | "lamp" | "aws";

export type LearningMode = "learn" | "practice" | "diy";

export type PanelId = "none" | "learn" | "practice" | "diy" | "tutor" | "map";

export type ShellFlavor = "bash" | "apache" | "php" | "mysql" | "lamp";

export type CommandExpect = {
  kind: "exact" | "includes" | "regex";
  value: string;
};

export type MissionStep =
  | { id: string; type: "read"; lessonId: string }
  | {
      id: string;
      type: "command";
      prompt: string;
      shell: ShellFlavor;
      expect: CommandExpect;
      hint: string;
    }
  | {
      id: string;
      type: "quiz";
      question: string;
      choices: string[];
      answer: number;
      hint: string;
    }
  | { id: string; type: "checklist"; items: string[]; hint: string };

export type Mission = {
  id: string;
  stationId: StationId;
  mode: LearningMode;
  title: string;
  summary: string;
  steps: MissionStep[];
  xp: number;
  requires: string[];
};

export type LessonPage = {
  heading: string;
  body: string;
};

export type Lesson = {
  id: string;
  stationId: StationId;
  title: string;
  pages: LessonPage[];
};

export type StationConfig = {
  id: StationId;
  title: string;
  subtitle: string;
  position: [number, number, number];
  themeColor: string;
  inWorld: boolean;
};

export type Progress = {
  xp: number;
  completedMissionIds: string[];
  unlockedStationIds: StationId[];
  unlockedModes: Record<StationId, LearningMode[]>;
};

export type TutorContext = {
  stationId: StationId | null;
  mode: LearningMode | null;
  missionId: string | null;
  stepId: string | null;
  lastCommand?: string;
  lastOutput?: string;
  completedLessonTitles: string[];
};

export type TutorMessage = {
  id: string;
  role: "student" | "tutor";
  text: string;
};

export type TutorReply = {
  text: string;
};

export type StepPayload =
  | { type: "continue" }
  | { type: "command"; command: string }
  | { type: "quiz"; choice: number }
  | { type: "checklist"; checked: boolean[] };

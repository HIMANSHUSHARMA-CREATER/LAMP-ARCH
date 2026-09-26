import type { Lesson } from "@/types/game";

export const lampLesson: Lesson = {
  id: "lamp-together",
  stationId: "lamp",
  title: "How LAMP fits together",
  pages: [
    {
      heading: "One request",
      body: "Browser → Apache (Linux process) → PHP script → MySQL query → PHP builds HTML → Apache responds. Each letter in LAMP has a job in that chain.",
    },
    {
      heading: "Failure isolation",
      body: "If MySQL is down, PHP still runs but cannot load data. If Apache is down, PHP never starts. Integration means checking every hop.",
    },
    {
      heading: "Ready for cloud",
      body: "Once the stack works locally, you can package the same four roles on a virtual machine in the cloud. That is the AWS chapter waiting ahead.",
    },
  ],
};

import type { Lesson } from "@/types/game";

export const linuxLesson: Lesson = {
  id: "linux-os",
  stationId: "linux",
  title: "What Linux does in LAMP",
  pages: [
    {
      heading: "The foundation",
      body: "Linux is the operating system that runs the rest of the stack. It manages files, users, processes, and networking so Apache, PHP, and MySQL have a place to live.",
    },
    {
      heading: "The shell",
      body: "You talk to Linux through a shell. Commands like pwd, ls, and mkdir let you inspect and change the filesystem — the same skills you will use on a real server.",
    },
    {
      heading: "Why it matters",
      body: "If Linux is misconfigured, the web server cannot start and the database cannot store files. Every LAMP deployment begins with a healthy Linux box.",
    },
  ],
};

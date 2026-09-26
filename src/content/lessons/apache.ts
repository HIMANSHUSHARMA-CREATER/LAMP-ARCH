import type { Lesson } from "@/types/game";

export const apacheLesson: Lesson = {
  id: "apache-httpd",
  stationId: "apache",
  title: "What Apache does in LAMP",
  pages: [
    {
      heading: "The front door",
      body: "Apache HTTP Server listens on port 80 (and 443 for HTTPS). When a browser requests a page, Apache decides which file or PHP script should answer.",
    },
    {
      heading: "Document root",
      body: "The document root is the folder Apache treats as the website. A request to /index.php maps to a file inside that folder.",
    },
    {
      heading: "PHP module",
      body: "Apache does not execute PHP by itself. It hands .php files to the PHP module (or PHP-FPM), then sends the HTML result back to the browser.",
    },
  ],
};

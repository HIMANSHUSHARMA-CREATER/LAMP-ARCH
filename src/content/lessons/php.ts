import type { Lesson } from "@/types/game";

export const phpLesson: Lesson = {
  id: "php-language",
  stationId: "php",
  title: "What PHP does in LAMP",
  pages: [
    {
      heading: "Server-side code",
      body: "PHP runs on the server, not in the browser. It can read form data, talk to MySQL, and build HTML before the page ever reaches the student.",
    },
    {
      heading: "A tiny script",
      body: "A file like index.php can mix HTML and PHP. The PHP engine replaces <?php ... ?> blocks with output, then Apache ships the finished page.",
    },
    {
      heading: "Talking to MySQL",
      body: "PHP uses extensions such as PDO or mysqli to connect, query, and close database connections safely.",
    },
  ],
};

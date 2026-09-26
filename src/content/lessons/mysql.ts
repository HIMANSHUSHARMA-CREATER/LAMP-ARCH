import type { Lesson } from "@/types/game";

export const mysqlLesson: Lesson = {
  id: "mysql-db",
  stationId: "mysql",
  title: "What MySQL does in LAMP",
  pages: [
    {
      heading: "Structured storage",
      body: "MySQL stores data in tables made of rows and columns. User accounts, blog posts, and scores live here — not in PHP files.",
    },
    {
      heading: "SQL",
      body: "You talk to MySQL with SQL: CREATE DATABASE, SHOW TABLES, SELECT, INSERT. PHP sends those statements over a connection.",
    },
    {
      heading: "Why it is separate",
      body: "Keeping data in MySQL means Apache can restart and PHP can be updated without losing student records.",
    },
  ],
};

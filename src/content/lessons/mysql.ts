import type { Lesson } from "@/types/game";

export const mysqlLesson: Lesson = {
  id: "mysql-db",
  stationId: "mysql",
  title: "What MySQL does in LAMP",
  pages: [
    {
      heading: "Structured storage",
      body: "MySQL stores data in tables made of rows and columns. User accounts, blog posts, and scores live here — not in PHP files. Each row is a record, each column is a field.",
    },
    {
      heading: "Databases and tables",
      body: "A MySQL server can hold multiple databases. Each database contains tables. Tables have a defined structure (schema) with data types. Example: a users table might have id, username, email, and created_at columns.",
    },
    {
      heading: "Primary keys",
      body: "Every table should have a primary key — a unique identifier for each row. Usually an auto-incrementing integer. This lets you uniquely reference any record: SELECT * FROM users WHERE id = 5.",
    },
    {
      heading: "Relationships",
      body: "Tables relate to each other through foreign keys. A posts table might have a user_id column that references the users table. This relational model is powerful and flexible, enabling complex queries.",
    },
    {
      heading: "SQL basics",
      body: "SQL (Structured Query Language) talks to databases. CREATE DATABASE makes a new database. CREATE TABLE defines structure. INSERT adds rows. SELECT retrieves data. UPDATE modifies existing data. DELETE removes rows.",
    },
    {
      heading: "SELECT queries",
      body: "SELECT retrieves data: SELECT * FROM users gets all columns. SELECT username, email FROM users gets specific columns. WHERE filters: SELECT * FROM users WHERE id = 5. ORDER BY sorts. LIMIT restricts results.",
    },
    {
      heading: "INSERT and UPDATE",
      body: "INSERT adds new records: INSERT INTO users (username, email) VALUES ('john', 'john@example.com'). UPDATE changes existing data: UPDATE users SET email = 'new@example.com' WHERE id = 5. Always use WHERE with UPDATE!",
    },
    {
      heading: "DELETE with caution",
      body: "DELETE removes rows: DELETE FROM users WHERE id = 5. Without WHERE, it deletes everything! Many developers use soft deletes (adding a deleted_at column) instead of permanently removing data.",
    },
    {
      heading: "PHP-MySQL connection",
      body: "PHP connects to MySQL using PDO or mysqli. You need a host (usually localhost), username, password, and database name. The connection should be opened once per request and closed automatically when the script ends.",
    },
    {
      heading: "Why it is separate",
      body: "Keeping data in MySQL means Apache can restart and PHP can be updated without losing user records. The database persists independently of the web server. This separation is fundamental to web architecture.",
    },
  ],
};

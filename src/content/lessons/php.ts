import type { Lesson } from "@/types/game";

export const phpLesson: Lesson = {
  id: "php-language",
  stationId: "php",
  title: "What PHP does in LAMP",
  pages: [
    {
      heading: "Server-side code",
      body: "PHP runs on the server, not in the browser. It can read form data, talk to MySQL, and build HTML before the page ever reaches the user. The browser only sees the final HTML output.",
    },
    {
      heading: "PHP request lifecycle",
      body: "Browser requests a .php file → Apache receives it → Apache hands it to PHP → PHP executes the code → PHP generates HTML → Apache sends HTML to browser. The user never sees your PHP source code.",
    },
    {
      heading: "Mixing HTML and PHP",
      body: "A file like index.php can mix HTML and PHP. The PHP engine replaces <?php ... ?> blocks with output, then Apache ships the finished page. Example: <h1>Hello, <?php echo $name; ?></h1>",
    },
    {
      heading: "Variables and data types",
      body: "PHP variables start with $: $name, $age, $items. PHP is loosely typed (variables can hold any type). Common types: strings, integers, floats, booleans, arrays, and objects.",
    },
    {
      heading: "Conditions and loops",
      body: "PHP uses if/else for logic: if ($user) { echo 'Welcome'; }. Loops iterate over data: foreach ($users as $user) { echo $user['name']; }. This lets you dynamically generate HTML.",
    },
    {
      heading: "Functions",
      body: "Functions organize reusable code: function greet($name) { return 'Hello, ' . $name; }. You can define your own functions or use built-in ones like strlen(), array_push(), and date().",
    },
    {
      heading: "Forms and $_POST",
      body: "When users submit forms, PHP receives data in $_POST or $_GET. You access form fields: $email = $_POST['email'];. Always validate and sanitize input to prevent security issues.",
    },
    {
      heading: "Database connection",
      body: "PHP uses PDO (PHP Data Objects) or mysqli to connect to MySQL. You create a connection, prepare statements, execute queries, and fetch results. PDO is preferred for its security features and database-agnostic interface.",
    },
    {
      heading: "Error handling",
      body: "PHP can show errors or hide them. In production, you hide errors and log them instead. Use try/catch blocks for database operations. Proper error handling prevents exposing sensitive information.",
    },
    {
      heading: "Security basics",
      body: "PHP has built-in functions for security: htmlspecialchars() prevents XSS, password_hash() and password_verify() handle passwords securely, and prepared statements prevent SQL injection. Security is critical in web development.",
    },
  ],
};

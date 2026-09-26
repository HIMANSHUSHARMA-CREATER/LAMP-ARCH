import type { Lesson } from "@/types/game";

export const lampLesson: Lesson = {
  id: "lamp-together",
  stationId: "lamp",
  title: "How LAMP fits together",
  pages: [
    {
      heading: "One request",
      body: "Browser → Apache (Linux process) → PHP script → MySQL query → PHP builds HTML → Apache responds. Each letter in LAMP has a job in that chain. Understanding this flow is key to debugging.",
    },
    {
      heading: "Detailed request flow",
      body: "1. User clicks a link → 2. Browser makes HTTP request to server IP → 3. Linux receives the packet → 4. Apache (listening on port 80) accepts → 5. Apache routes to the correct virtual host → 6. Apache finds the PHP file → 7. PHP engine executes the code → 8. PHP connects to MySQL → 9. MySQL returns data → 10. PHP generates HTML → 11. Apache sends HTTP response → 12. Browser renders page.",
    },
    {
      heading: "Linux's role",
      body: "Linux provides the foundation: the operating system, filesystem, networking stack, process management. Apache, PHP, and MySQL all run as Linux processes. Linux handles hardware resources and security.",
    },
    {
      heading: "Apache's role",
      body: "Apache is the web server: it listens for HTTP requests, serves static files (CSS, JS, images), routes requests to the correct document root, and hands dynamic content to PHP. It's the public face of your application.",
    },
    {
      heading: "PHP's role",
      body: "PHP is the application logic: it processes form data, connects to databases, performs calculations, generates dynamic HTML, and handles session management. PHP bridges the gap between the web server and the database.",
    },
    {
      heading: "MySQL's role",
      body: "MySQL is the data store: it persists user data, content, and application state. It provides structured storage with relationships, enabling complex queries and data integrity. Without MySQL, your data disappears when the request ends.",
    },
    {
      heading: "Failure isolation",
      body: "If MySQL is down, PHP still runs but cannot load data — users see errors. If Apache is down, PHP never starts — users see connection refused. If Linux fails, everything stops. Understanding dependencies helps you troubleshoot systematically.",
    },
    {
      heading: "Configuration integration",
      body: "The stack requires coordinated configuration: Apache must know where PHP is (mod_php or PHP-FPM), PHP must have MySQL extensions enabled, MySQL must accept connections from the web server user, and Linux firewall must allow port 80/443.",
    },
    {
      heading: "Performance considerations",
      body: "Each layer affects performance: Apache's MPM settings, PHP's opcode cache (OPcache), MySQL's query cache and indexing, Linux's resource limits. Tuning the stack requires understanding how they interact.",
    },
    {
      heading: "Ready for cloud",
      body: "Once the stack works locally, you can package the same four roles on a virtual machine in the cloud. AWS EC2, DigitalOcean Droplets, and similar services are just Linux boxes where you install the same stack. The skills transfer directly.",
    },
  ],
};

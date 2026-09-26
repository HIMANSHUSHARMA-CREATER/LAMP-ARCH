import type { Lesson } from "@/types/game";

export const apacheLesson: Lesson = {
  id: "apache-httpd",
  stationId: "apache",
  title: "What Apache does in LAMP",
  pages: [
    {
      heading: "The front door",
      body: "Apache HTTP Server listens on port 80 (and 443 for HTTPS). When a browser requests a page, Apache decides which file or PHP script should answer. It's the entry point for all web traffic.",
    },
    {
      heading: "HTTP request/response",
      body: "Apache handles the HTTP protocol. It receives requests (GET, POST, etc.), parses headers, finds the right file or script, and sends back responses with proper status codes (200 OK, 404 Not Found, 500 Server Error).",
    },
    {
      heading: "Ports and listening",
      body: "Port 80 is the standard HTTP port. Port 443 is for HTTPS. Apache binds to these ports and waits for connections. Only one process can bind to a port at a time.",
    },
    {
      heading: "Document root",
      body: "The document root is the folder Apache treats as the website. A request to /index.php maps to a file inside that folder. Typically /var/www/html on Ubuntu. Files outside this folder are not directly accessible.",
    },
    {
      heading: "Virtual hosts",
      body: "Virtual hosts let one Apache server serve multiple websites. Each site has its own configuration and document root. You might have example.com and blog.com on the same server.",
    },
    {
      heading: "Configuration",
      body: "Apache configuration lives in /etc/apache2/. Key files include apache2.conf (main config), sites-available (virtual host configs), and mods-available (module configs). You'll enable sites with a2ensite and modules with a2enmod.",
    },
    {
      heading: "Apache process",
      body: "Apache runs as a background process (daemon). It spawns worker processes/threads to handle multiple connections simultaneously. The mpm_prefork, mpm_worker, and mpm_event modules control this behavior.",
    },
    {
      heading: "Apache service",
      body: "You control Apache with systemctl: systemctl start apache2, systemctl stop apache2, systemctl restart apache2, and systemctl status apache2. The service must be running for your site to be accessible.",
    },
    {
      heading: "Logs",
      body: "Apache logs access and errors. /var/log/apache2/access.log records every request (useful for analytics and debugging). /var/log/apache2/error.log records problems. Reading logs is essential for troubleshooting.",
    },
    {
      heading: "PHP module",
      body: "Apache does not execute PHP by itself. It hands .php files to the PHP module (mod_php) or PHP-FPM (FastCGI Process Manager), then sends the HTML result back to the browser. This separation makes Apache lightweight and flexible.",
    },
  ],
};

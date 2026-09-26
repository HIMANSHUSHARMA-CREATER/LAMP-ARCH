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
      heading: "The filesystem",
      body: "Linux organizes everything as files in a tree structure starting at the root (/). Important directories include /home (user files), /var (variable data like logs), /etc (configuration), and /usr (programs). Your web files typically live in /var/www/html.",
    },
    {
      heading: "Users and permissions",
      body: "Linux is multi-user. Each user has a home directory and permissions control who can read, write, or execute files. The root user has unlimited power. Apache usually runs as www-data, and you'll need to manage file ownership carefully.",
    },
    {
      heading: "Processes and services",
      body: "Apache, PHP, and MySQL run as background processes. systemd manages these services on modern Linux. You'll use commands like systemctl start, stop, and status to control them. If Apache dies, your site goes down.",
    },
    {
      heading: "Package managers",
      body: "apt (on Debian/Ubuntu) or yum (on CentOS/RHEL) lets you install software. sudo apt install apache2 installs the web server. Keeping packages updated is crucial for security.",
    },
    {
      heading: "Networking basics",
      body: "Linux handles network connections. Apache listens on port 80 (HTTP) and 443 (HTTPS). You'll use tools like netstat or ss to check which ports are open. Firewalls like ufw control access.",
    },
    {
      heading: "SSH access",
      body: "SSH (Secure Shell) lets you remotely control a server. You'll SSH into cloud instances to deploy and manage your LAMP stack. SSH keys are more secure than passwords.",
    },
    {
      heading: "The shell",
      body: "You talk to Linux through a shell (bash). Commands like pwd, ls, mkdir, cat, and chmod let you inspect and change the filesystem. Mastering the shell is essential for server administration.",
    },
    {
      heading: "Why it matters",
      body: "If Linux is misconfigured, the web server cannot start and the database cannot store files. Every LAMP deployment begins with a healthy Linux box. Understanding Linux makes you a better full-stack developer.",
    },
  ],
};

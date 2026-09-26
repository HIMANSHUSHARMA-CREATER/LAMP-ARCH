import type { TutorContext, TutorReply } from "@/types/game";

export type TutorAskInput = {
  message: string;
  context: TutorContext;
};

export type TutorPort = {
  ask: (input: TutorAskInput) => Promise<TutorReply>;
};

const STEP_HINTS: Record<string, string> = {
  "linux-practice-pwd": "Type pwd and press Enter. It prints where you are in the filesystem.",
  "linux-practice-ls": "ls lists files. That is all this step needs.",
  "linux-practice-whoami": "whoami prints the account name, here student.",
  "linux-practice-cat": "cat readme.md displays the file contents.",
  "linux-practice-touch": "touch index.html creates an empty file.",
  "linux-diy-mkdir": "mkdir www creates a folder named www.",
  "apache-practice-install": "Use apt to install: sudo apt install apache2",
  "apache-practice-status": "Use systemctl to check: systemctl status apache2",
  "apache-practice-start": "Use systemctl to start: systemctl start apache2",
  "php-practice-install": "Use apt to install: sudo apt install php",
  "php-practice-version": "php -v is the CLI version switch.",
  "php-practice-echo": "php -r 'echo \"LAMP\";' runs a one-liner.",
  "mysql-practice-install": "Use apt to install: sudo apt install mysql-server",
  "mysql-practice-show": "SHOW DATABASES; lists schemas, including lamp.",
  "mysql-practice-use": "USE lamp; selects the schema PHP would connect to.",
  "mysql-diy-select": "SELECT * FROM students; reads every row — after USE lamp.",
  "lamp-practice-trace": "Type lamp to name the stack in order.",
  "lamp-diy-health": "Type health to ping every layer.",
  "aws-practice-ssh": "Simulate SSH: ssh ubuntu@your-instance-ip",
  "aws-practice-deploy": "Update packages: sudo apt update",
  "aws-diy-install": "Install Apache: sudo apt install apache2",
  "aws-diy-start": "Start Apache: sudo systemctl start apache2",
  "lamp-final-update": "Update packages: sudo apt update",
  "lamp-final-apache": "Install Apache: sudo apt install apache2",
  "lamp-final-apache-start": "Start Apache: sudo systemctl start apache2",
  "lamp-final-php": "Install PHP: sudo apt install php libapache2-mod-php",
  "lamp-final-mysql": "Install MySQL: sudo apt install mysql-server",
  "lamp-final-check": "Check stack health: health",
};

export class MockTutor implements TutorPort {
  async ask(input: TutorAskInput): Promise<TutorReply> {
    const { message, context } = input;
    const stepHint = context.stepId ? STEP_HINTS[context.stepId] : undefined;
    const station = context.stationId ?? "the campus";

    if (/help|hint|stuck|why/i.test(message) && stepHint) {
      return { text: `On this step at ${station}: ${stepHint}` };
    }

    if (stepHint) {
      return {
        text: `We are at the ${station} station${context.mode ? ` in ${context.mode} mode` : ""}. ${stepHint} Ask another question if you want the idea, not just the command.`,
      };
    }

    if (context.lastOutput) {
      return {
        text: `The simulator last said: “${context.lastOutput.slice(0, 180)}”. Compare that with what the mission prompt asked for.`,
      };
    }

    return {
      text: `I am your LAMP tutor. Stay on Linux, Apache, MySQL, PHP, or how they connect. ${message ? "Tell me which line of the lesson is confusing." : "Open a station and I can hint at the current step."}`,
    };
  }
}

export const mockTutor = new MockTutor();

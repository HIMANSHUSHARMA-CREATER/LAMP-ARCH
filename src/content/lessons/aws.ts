import type { Lesson } from "@/types/game";

export const awsLesson: Lesson = {
  id: "aws-preview",
  stationId: "aws",
  title: "LAMP on AWS (preview)",
  pages: [
    {
      heading: "Same stack, new home",
      body: "An EC2 virtual machine is still Linux. You still install Apache, PHP, and MySQL — or use managed services that play those roles. The concepts you learned apply directly to cloud deployment.",
    },
    {
      heading: "AWS Regions",
      body: "AWS has data centers around the world grouped into regions (us-east-1, eu-west-1, etc.). Choose a region close to your users for better performance. Each region is isolated from others.",
    },
    {
      heading: "EC2 Instances",
      body: "EC2 (Elastic Compute Cloud) provides virtual machines. You choose an AMI (Amazon Machine Image) which is a template with an OS pre-installed. Ubuntu, Amazon Linux, and other Linux distributions are common choices for LAMP.",
    },
    {
      heading: "Instance Types",
      body: "Instance types determine CPU, memory, and storage. t2.micro and t3.micro are small instances good for learning. Larger types (m5, c5) offer more power for production. You pay per hour of usage.",
    },
    {
      heading: "Key Pairs",
      body: "AWS uses key pairs for SSH access. You create a key pair, download the private key (.pem file), and use it to SSH into your instance. Never share your private key. It's your password to the server.",
    },
    {
      heading: "Security Groups",
      body: "Security groups are virtual firewalls. They control which ports are open. For a web server, you need port 22 (SSH) for your IP, and port 80 (HTTP) for everyone. You can also allow port 443 (HTTPS).",
    },
    {
      heading: "Public IP and DNS",
      body: "Your instance gets a public IP address. You can also assign an Elastic IP (static) or set up a domain name with Route 53. Users access your site through this IP or domain.",
    },
    {
      heading: "Deployment process",
      body: "1. Launch EC2 instance with Ubuntu AMI → 2. Configure security group (ports 22, 80) → 3. SSH in using your key pair → 4. Update packages: sudo apt update → 5. Install Apache: sudo apt install apache2 → 6. Install PHP: sudo apt install php libapache2-mod-php → 7. Install MySQL: sudo apt install mysql-server → 8. Configure and start services → 9. Deploy your code → 10. Test from browser.",
    },
    {
      heading: "Managed alternatives",
      body: "AWS also offers managed services: RDS for MySQL (managed database), Elastic Beanstalk (platform as a service), and Lightsail (simplified VPS). These abstract away some management but cost more. Understanding EC2 gives you foundational knowledge.",
    },
    {
      heading: "Cost considerations",
      body: "AWS charges per hour for instances, plus storage, data transfer, and other services. Always stop instances when not learning to avoid surprise bills. Use the AWS Free Tier for 12 months to experiment at low cost.",
    },
  ],
};

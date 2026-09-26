import type { Lesson } from "@/types/game";

export const awsLesson: Lesson = {
  id: "aws-preview",
  stationId: "aws",
  title: "LAMP on AWS (preview)",
  pages: [
    {
      heading: "Same stack, new home",
      body: "An EC2 virtual machine is still Linux. You still install Apache, PHP, and MySQL — or use managed services that play those roles.",
    },
    {
      heading: "Coming next",
      body: "This station unlocks after LAMP DIY. Practice missions will simulate security groups, SSH, and putting a site on a public IP.",
    },
  ],
};

import { apacheLesson } from "@/content/lessons/apache";
import { awsLesson } from "@/content/lessons/aws";
import { lampLesson } from "@/content/lessons/lamp";
import { linuxLesson } from "@/content/lessons/linux";
import { mysqlLesson } from "@/content/lessons/mysql";
import { phpLesson } from "@/content/lessons/php";
import type { Lesson } from "@/types/game";

export const LESSONS: Lesson[] = [
  linuxLesson,
  apacheLesson,
  phpLesson,
  mysqlLesson,
  lampLesson,
  awsLesson,
];

export function getLesson(id: string) {
  return LESSONS.find((lesson) => lesson.id === id);
}

export function getLessonForStation(stationId: Lesson["stationId"]) {
  return LESSONS.find((lesson) => lesson.stationId === stationId);
}

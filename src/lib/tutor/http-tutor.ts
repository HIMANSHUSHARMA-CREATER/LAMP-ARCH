import { mockTutor, type TutorAskInput, type TutorPort } from "@/lib/tutor/mock-tutor";
import type { TutorReply } from "@/types/game";

export class HttpTutor implements TutorPort {
  async ask(input: TutorAskInput): Promise<TutorReply> {
    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        return mockTutor.ask(input);
      }
      const data = (await response.json()) as TutorReply;
      if (!data?.text) {
        return mockTutor.ask(input);
      }
      return data;
    } catch {
      return mockTutor.ask(input);
    }
  }
}

export const httpTutor = new HttpTutor();

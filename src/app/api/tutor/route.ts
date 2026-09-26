import { mockTutor } from "@/lib/tutor/mock-tutor";
import type { TutorContext } from "@/types/game";

type TutorRequest = {
  message?: string;
  context?: TutorContext;
};

export async function POST(request: Request) {
  const body = (await request.json()) as TutorRequest;
  const input = {
    message: body.message ?? "",
    context: body.context ?? {
      stationId: null,
      mode: null,
      missionId: null,
      stepId: null,
      completedLessonTitles: [],
    },
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const reply = await mockTutor.ask(input);
    return Response.json(reply);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "You are the LAMP Quest tutor. Teach Linux, Apache, MySQL, PHP, their integration, and beginner AWS mapping. Never award XP or unlocks. Refuse unrelated topics. Keep answers short and classroom-safe.",
          },
          {
            role: "user",
            content: JSON.stringify({
              question: input.message,
              context: input.context,
            }),
          },
        ],
      }),
    });
    if (!response.ok) {
      const reply = await mockTutor.ask(input);
      return Response.json(reply);
    }
    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      const reply = await mockTutor.ask(input);
      return Response.json(reply);
    }
    return Response.json({ text });
  } catch {
    const reply = await mockTutor.ask(input);
    return Response.json(reply);
  }
}

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { GoogleGenAI, Type } from "@google/genai";

import db from "@/db/drizzle";
import { units, challengeProgress } from "@/db/schema";
import { getLessonContent } from "@/lib/lesson-content";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

const presentQuizDeclaration = {
  name: "present_quiz",
  description: "Present a quiz question to the student. Call this when you want the student to answer a multiple-choice question.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      challengeId: {
        type: Type.NUMBER,
        description: "The challenge ID from the question bank to present",
      },
    },
    required: ["challengeId"],
  },
};

function buildSystemPrompt(
  unitTitle: string,
  courseTitle: string,
  markdown: string,
  challengeSummaries: string
) {
  return `You are a friendly, knowledgeable tax tutor helping an Indian Chartered Accountant (CA) learn changes in income tax law under the Income Tax Act 2025 (replacing the 1961 Act).

## Your Teaching Style
- Conversational and encouraging, like a senior CA mentoring a junior
- Use simple language — explain complex provisions with practical examples
- Keep each teaching block to 3-5 sentences
- Use bold for key terms and section numbers

## Topic: ${courseTitle} > ${unitTitle}

## Teaching Material
${markdown}

## Question Bank (present these using the present_quiz tool)
${challengeSummaries}

## CRITICAL FLOW:
Step 1: TEACH FIRST — greet and explain the first concept (3-5 sentences). NO quiz yet.
Step 2: After teaching, call present_quiz with the relevant question.
Step 3: Wait for the answer. Give feedback, then teach the next concept.
Step 4: Repeat TEACH → QUIZ → FEEDBACK until all questions done.
Step 5: Congratulate and summarize.

## RULES:
- Your first response MUST be purely teaching. NEVER call present_quiz on the first turn.
- ALWAYS teach before quizzing. Never two questions in a row.
- NEVER reveal or hint at correct answers before the student responds.`;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { unitId, history, message, turnCount } = await req.json();
  if (!unitId || !message) {
    return Response.json({ error: "Missing unitId or message" }, { status: 400 });
  }

  // Always provide the tool — the system prompt enforces teaching first
  const isFirstTurn = false;

  // Load unit with all lessons and challenges
  const unit = await db.query.units.findFirst({
    where: eq(units.id, unitId),
    with: {
      course: true,
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          challenges: {
            orderBy: (challenges, { asc }) => [asc(challenges.order)],
          },
        },
      },
    },
  });

  if (!unit) {
    return Response.json({ error: "Unit not found" }, { status: 404 });
  }

  // Load markdown content for the unit (uses first lesson to resolve content)
  const firstLessonId = unit.lessons[0]?.id;
  const content = firstLessonId ? await getLessonContent(firstLessonId) : null;

  // Build challenge summaries across ALL lessons in the unit
  const challengeSummaries = unit.lessons
    .flatMap((lesson) =>
      lesson.challenges.map(
        (c) => `- Challenge ${c.id} (${lesson.title}): "${c.question}"${c.newSection ? ` (${c.newSection})` : ""}`
      )
    )
    .join("\n");

  const systemPrompt = buildSystemPrompt(
    unit.title,
    unit.course.title,
    content?.markdown || "No teaching material available.",
    challengeSummaries
  );

  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: systemPrompt,
      ...(isFirstTurn ? {} : { tools: [{ functionDeclarations: [presentQuizDeclaration] }] }),
    },
    history: history || [],
  });

  const stream = await chat.sendMessageStream({ message });

  const encoder = new TextEncoder();
  const toolCalls: number[] = [];

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.text) {
            controller.enqueue(encoder.encode(chunk.text));
          }
          if (chunk.functionCalls && chunk.functionCalls.length > 0) {
            for (const fc of chunk.functionCalls) {
              if (fc.name === "present_quiz" && fc.args?.challengeId) {
                toolCalls.push(fc.args.challengeId as number);
              }
            }
          }
        }
        for (const id of toolCalls) {
          controller.enqueue(encoder.encode(`\n__QUIZ__${id}`));
        }
      } catch (error) {
        console.error("[lesson-chat] Stream error:", error);
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

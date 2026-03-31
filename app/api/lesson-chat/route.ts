import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { GoogleGenAI, Type } from "@google/genai";

import db from "@/db/drizzle";
import { challengeProgress, lessons } from "@/db/schema";
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
  content: { markdown: string; unitTitle: string; courseTitle: string; lessonTitle: string },
  challengeSummaries: string
) {
  return `You are a friendly, knowledgeable tax tutor helping an Indian Chartered Accountant (CA) learn changes in income tax law under the Income Tax Act 2025 (replacing the 1961 Act).

## Your Teaching Style
- Conversational and encouraging, like a senior CA mentoring a junior
- Use simple language — explain complex provisions with practical examples
- Keep each teaching block to 3-5 sentences
- Use bold for key terms and section numbers

## Topic: ${content.courseTitle} > ${content.unitTitle} > ${content.lessonTitle}

## Teaching Material
${content.markdown}

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

  const { lessonId, history, message, turnCount } = await req.json();
  if (!lessonId || !message) {
    return Response.json({ error: "Missing lessonId or message" }, { status: 400 });
  }

  const isFirstTurn = (turnCount ?? 0) <= 1;

  // Load lesson with challenges
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
        with: {
          challengeOptions: true,
          challengeProgress: { where: eq(challengeProgress.userId, userId) },
        },
      },
    },
  });

  if (!lesson) {
    return Response.json({ error: "Lesson not found" }, { status: 404 });
  }

  const content = await getLessonContent(lessonId);
  const challengeSummaries = lesson.challenges
    .map((c) => `- Challenge ${c.id}: "${c.question}"${c.newSection ? ` (${c.newSection})` : ""}`)
    .join("\n");

  const systemPrompt = buildSystemPrompt(
    content || { markdown: "No teaching material available.", unitTitle: lesson.title, courseTitle: "", lessonTitle: lesson.title },
    challengeSummaries
  );

  // Create chat with history
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: systemPrompt,
      // Only provide the tool after the first turn
      ...(isFirstTurn ? {} : { tools: [{ functionDeclarations: [presentQuizDeclaration] }] }),
    },
    history: history || [],
  });

  const stream = await chat.sendMessageStream({ message });

  // Stream plain text, append tool calls as __QUIZ__<id> markers at the end
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
        // Append quiz markers at the end of the stream
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

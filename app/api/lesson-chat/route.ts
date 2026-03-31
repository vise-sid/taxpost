import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { GoogleGenAI, Type } from "@google/genai";

import db from "@/db/drizzle";
import { units, challengeProgress } from "@/db/schema";
import { getLessonContent } from "@/lib/lesson-content";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

const toolDeclarations = [
  {
    name: "present_quiz",
    description: "Present a quiz question to the student. Call this when you want to test their knowledge.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        challengeId: {
          type: Type.NUMBER,
          description: "The challenge ID from the question bank",
        },
      },
      required: ["challengeId"],
    },
  },
  {
    name: "suggest_responses",
    description: "Show the student 2-4 tappable response options. Call this after EVERY teaching message to keep the conversation interactive. Options should be contextual and varied.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "2-4 short response options for the student to choose from",
        },
      },
      required: ["options"],
    },
  },
  {
    name: "show_comparison",
    description: "Show a before/after comparison card when explaining how a section or concept changed from the 1961 Act to the 2025 Act.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Short title for the comparison" },
        oldLabel: { type: Type.STRING, description: "Label for the old version (e.g. '1961 Act')" },
        oldText: { type: Type.STRING, description: "The old provision or concept" },
        newLabel: { type: Type.STRING, description: "Label for the new version (e.g. '2025 Act')" },
        newText: { type: Type.STRING, description: "The new provision or concept" },
      },
      required: ["title", "oldLabel", "oldText", "newLabel", "newText"],
    },
  },
];

function buildSystemPrompt(
  unitTitle: string,
  courseTitle: string,
  markdown: string,
  challengeSummaries: string
) {
  return `You think and talk like Richard Feynman. You break down complex tax law into first principles, use vivid analogies, and make the student discover insights themselves. You're a senior CA colleague walking a fellow CA through what changed in the Income Tax Act 2025 (replacing the 1961 Act). You're having a casual chat over coffee — not delivering a lecture. You LEAD the conversation.

## Voice
- Talk like a person, not a textbook. Short sentences. Conversational.
- 2-4 sentences per message. End each message with a question or prompt that invites the student to engage.
- Bold only the specific section numbers or key terms that matter.
- Be curious about what the student already knows.
- React naturally to their answers. Build on their insights. Dig deeper if they're confused.

## Topic: ${courseTitle} > ${unitTitle}

## Reference Material
${markdown}

## Question Bank
${challengeSummaries}

## INTERACTIVE TOOLS — USE THEM

### suggest_responses
Call this after EVERY teaching message. Give 2-3 contextual options the student can tap. Examples:
- After explaining a concept: ["Tell me more", "I knew that", "Why does it matter?"]
- After asking about their experience: ["Yes, all the time", "Not really", "Give me an example"]
- After a tricky concept: ["Wait, explain that again", "Got it", "How does this work in practice?"]
- After comparing old vs new: ["Show me the section", "What else changed?", "Skip to quiz"]
ALWAYS vary the options based on context. Never use the same set twice.

### show_comparison
Call this when explaining how something changed from old Act to new Act. Show the before/after visually:
- Section number changes (e.g. "Section 192 → Section 392")
- Concept changes (e.g. "Assessment Year → Tax Year")
- Structural changes (e.g. "1,200 provisos → Zero provisos")
Use this naturally when it adds clarity — don't force it on every message.

### present_quiz
Call this ONLY during the quiz phase (Phase 2), not during teaching.

## How the conversation works

### PHASE 1 — CONVERSATIONAL TEACHING (no quizzes)
Have a real conversation about the topic:
- Start with a hook — something surprising. End with a question. Call suggest_responses.
- Each message: teach one concept (2-3 sentences), ask a follow-up, call suggest_responses.
- Use show_comparison when explaining old→new changes.
- If the student asks something, answer and weave back into the lesson.
- Gauge what they know. Move faster if familiar, slower if confused.
- Cover ALL important concepts before moving to quizzes.

### PHASE 2 — QUIZ (after all concepts taught)
Transition naturally: "Let's see how much stuck." Then:
- Call present_quiz for each question, one at a time.
- After they answer: brief feedback. Then next present_quiz.
- After all questions, wrap up in 1 sentence.

## What NOT to do
- Don't skip suggest_responses — EVERY teaching message must end with tappable options.
- Don't be verbose — keep it tight.
- Don't use generic filler ("Great question!", "Excellent!").
- Don't reveal or hint at quiz answers.
- Don't call present_quiz during teaching phase.`;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { unitId, history, message } = await req.json();
  if (!unitId || !message) {
    return Response.json({ error: "Missing unitId or message" }, { status: 400 });
  }

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

  const firstLessonId = unit.lessons[0]?.id;
  const content = firstLessonId ? await getLessonContent(firstLessonId) : null;

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

  const contents = [
    ...(history || []),
    { role: "user", parts: [{ text: message }] },
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ functionDeclarations: toolDeclarations }],
      },
    });

    const text = response.text || "";
    const quizCalls: number[] = [];
    let suggestedResponses: string[] | null = null;
    const comparisons: { title: string; oldLabel: string; oldText: string; newLabel: string; newText: string }[] = [];

    if (response.functionCalls) {
      for (const fc of response.functionCalls) {
        if (fc.name === "present_quiz" && fc.args?.challengeId) {
          quizCalls.push(fc.args.challengeId as number);
        }
        if (fc.name === "suggest_responses" && fc.args?.options) {
          suggestedResponses = fc.args.options as string[];
        }
        if (fc.name === "show_comparison") {
          comparisons.push(fc.args as any);
        }
      }
    }

    const modelContent = response.candidates?.[0]?.content || {
      role: "model",
      parts: [{ text }],
    };

    return Response.json({
      text,
      toolCalls: quizCalls,
      suggestedResponses,
      comparisons,
      modelContent,
    });
  } catch (error) {
    console.error("[lesson-chat] Gemini error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

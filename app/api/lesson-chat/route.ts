import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { GoogleGenAI, Type } from "@google/genai";

import db from "@/db/drizzle";
import { chatSessions, units, lessonCompletions } from "@/db/schema";
import { getLessonContent } from "@/lib/lesson-content";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

const toolDeclarations = [
  {
    name: "ask_question",
    description: "Ask the student an informal knowledge-check question you create yourself. Use this during teaching to keep them engaged. You invent the question and options — these are NOT from the question bank.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING, description: "The question to ask" },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "2-4 answer options",
        },
      },
      required: ["question", "options"],
    },
  },
  {
    name: "suggest_responses",
    description: "Show tappable response options after a teaching message.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "2-3 short response options",
        },
      },
      required: ["options"],
    },
  },
  {
    name: "show_comparison",
    description: "Show a before/after comparison card for old Act vs new Act changes.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        oldLabel: { type: Type.STRING },
        oldText: { type: Type.STRING },
        newLabel: { type: Type.STRING },
        newText: { type: Type.STRING },
      },
      required: ["title", "oldLabel", "oldText", "newLabel", "newText"],
    },
  },
  {
    name: "show_test_card",
    description: "Show a navigation card to start/resume the formal quiz or go to the next unit. Call this when teaching is complete.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: {
          type: Type.STRING,
          description: "Card type: start_test, resume_test, practice_again, or next_unit",
        },
      },
      required: ["type"],
    },
  },
];

function buildSystemPrompt(
  unitTitle: string,
  courseTitle: string,
  markdown: string,
  status: string,
  scoreContext: string
) {
  return `You are a senior CA explaining the Income Tax Act 2025 changes to a fellow practitioner. Calm, clear, methodical. You follow the structure of the content note below exactly — same headings, same order, same logical flow. You explain it conversationally but stick to the material.

## Tone
- Professional. Warm but not excitable. No drama, no showmanship.
- State facts, explain why they matter to a practitioner, move on.
- Use analogies sparingly and only when they genuinely help.
- 2-3 sentences per message. Concise.

## Topic: ${courseTitle} > ${unitTitle}

## Content Note (your teaching script — follow this structure exactly)
${markdown}

## Session Status: ${status}
${scoreContext}

## HOW TO TEACH — FOLLOW THE CONTENT NOTE

The content note above is your script. It has ## headings, ### subheadings, tables, and numbered points. You MUST follow this structure in order.

### Your first message:
Just introduce the unit topic in 1-2 sentences. What is this unit about and why does it matter. Nothing else. Call suggest_responses with contextual options.

### Then, for each ## section in the content note:
1. **Announce the section topic** in 1 sentence. ("Let's look at Section 5 — Scope of Total Income.")
2. **Cover each ### sub-point** within it. One message per sub-point. 2-3 sentences max.
3. **If a sub-point has a comparison table** where old differs from new, use show_comparison. If old and new are the same, DON'T use show_comparison — just say "no change here."
4. **If there's a numbered list**, cover 2-3 items per message.
5. **After completing ALL sub-points of a ## section**, use ask_question to check understanding.
6. **Call suggest_responses after EVERY message** — contextual options, not generic. Include the section topic in the options.

### When you reach Key Takeaways:
Summarize in 2-3 sentences, then call show_test_card(type: "start_test").

### CRITICAL: One concept per message. Never combine multiple sub-points in one message.

## TOOLS

### suggest_responses
Call after EVERY message. 2-3 options: one to continue ("Next"), one to dig deeper ("Explain more"), one contextual.

### ask_question
Use after completing each ## section. You write the question + 2-4 options based on what you just covered.

### show_comparison
Use ONLY when old and new are genuinely DIFFERENT. Don't show a comparison where both sides are the same — just say "no substantive change here." Good uses: section number mappings, structural reorganizations, eliminated provisions.

### show_test_card
Call once at the end: show_test_card(type: "start_test").

## STATUS-BASED BEHAVIOR

### teaching:
Follow the content note structure as described above.

### testing:
Say "You have a test in progress." Call show_test_card(type: "resume_test").

### completed:
Acknowledge the score. If low, briefly re-explain weak areas. Call show_test_card(type: "practice_again") and show_test_card(type: "next_unit").

## RULES
- Follow the content note structure exactly. Same order, same sections.
- 2-3 sentences per message max.
- Always call suggest_responses.
- Don't copy the content note text verbatim — paraphrase in your own words.
- Don't reveal formal quiz answers.
- Don't be dramatic. Be clear and steady.`;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { unitId, message } = await req.json();
  if (!unitId || !message) {
    return Response.json({ error: "Missing unitId or message" }, { status: 400 });
  }

  // Load or create chat session from DB
  let session = await db.query.chatSessions.findFirst({
    where: and(
      eq(chatSessions.userId, userId),
      eq(chatSessions.unitId, unitId)
    ),
  });

  if (!session) {
    const [created] = await db
      .insert(chatSessions)
      .values({ userId, unitId, history: [], messages: [], status: "teaching" })
      .returning();
    session = created;
  }

  const history = (session.history as any[]) || [];
  const savedMessages = (session.messages as any[]) || [];
  const status = session.status || "teaching";

  // Load unit data
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

  // Build score context if completed
  let scoreContext = "";
  if (status === "completed" || status === "testing") {
    const lessonIds = unit.lessons.map((l) => l.id);
    const completions = await db.query.lessonCompletions.findMany({
      where: and(
        eq(lessonCompletions.userId, userId),
      ),
    });
    const unitCompletions = completions.filter((c) => lessonIds.includes(c.lessonId));
    if (unitCompletions.length > 0) {
      const totalScore = unitCompletions.reduce((sum, c) => sum + (c.score ?? 0), 0);
      const totalQuestions = unitCompletions.reduce((sum, c) => sum + (c.totalQuestions ?? 0), 0);
      scoreContext = `User's test results: ${totalScore}/${totalQuestions} correct (${Math.round((totalScore / totalQuestions) * 100)}%).`;
    }
  }

  // Load teaching content
  const firstLessonId = unit.lessons[0]?.id;
  const content = firstLessonId ? await getLessonContent(firstLessonId) : null;

  const systemPrompt = buildSystemPrompt(
    unit.title,
    unit.course.title,
    content?.markdown || "No teaching material available.",
    status,
    scoreContext
  );

  // Build contents: history + new user message
  const contents = [
    ...history,
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

    let text = "";
    try { text = response.text || ""; } catch { text = ""; }
    if (!text) {
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.text) text += part.text;
      }
    }

    // Extract tool calls
    let suggestedResponses: string[] | null = null;
    const comparisons: any[] = [];
    const inlineQuestions: any[] = [];
    const actionCards: any[] = [];
    let newStatus = status;

    if (response.functionCalls) {
      for (const fc of response.functionCalls) {
        if (fc.name === "suggest_responses" && fc.args?.options) {
          suggestedResponses = fc.args.options as string[];
        }
        if (fc.name === "show_comparison") {
          comparisons.push(fc.args);
        }
        if (fc.name === "ask_question" && fc.args?.question) {
          inlineQuestions.push({
            question: fc.args.question as string,
            options: fc.args.options as string[],
          });
        }
        if (fc.name === "show_test_card" && fc.args?.type) {
          const cardType = fc.args.type as string;
          // Determine the right lesson/unit IDs for navigation
          const firstLesson = unit.lessons[0];
          const nextUnitId = unitId + 1; // simplified — could query for actual next unit

          actionCards.push({
            type: cardType,
            unitId,
            lessonId: firstLesson?.id,
            unitTitle: unit.title,
            lessonCount: unit.lessons.length,
            questionCount: unit.lessons.reduce((s, l) => s + l.challenges.length, 0),
            nextUnitId,
          });

          if (cardType === "start_test" || cardType === "resume_test" || cardType === "practice_again") {
            newStatus = "testing";
          }
        }
      }
    }

    // Get raw model content for history (preserves thought signatures)
    const modelContent = response.candidates?.[0]?.content || {
      role: "model",
      parts: [{ text }],
    };

    // Update history in DB
    const updatedHistory = [
      ...history,
      { role: "user", parts: [{ text: message }] },
      modelContent,
    ];

    // Build new UI messages to append
    const newMessages: any[] = [];
    if (text) {
      newMessages.push({ id: crypto.randomUUID(), role: "agent", content: text });
    }
    for (const comp of comparisons) {
      newMessages.push({ id: crypto.randomUUID(), role: "agent", content: "", comparisonData: comp });
    }
    for (const q of inlineQuestions) {
      newMessages.push({ id: crypto.randomUUID(), role: "agent", content: "", questionData: q });
    }
    for (const card of actionCards) {
      newMessages.push({ id: crypto.randomUUID(), role: "agent", content: "", actionData: card });
    }

    // Save to DB
    const updatedMessages = [...savedMessages, ...newMessages];
    await db
      .update(chatSessions)
      .set({
        history: updatedHistory,
        messages: updatedMessages,
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(chatSessions.userId, userId),
          eq(chatSessions.unitId, unitId)
        )
      );

    return Response.json({
      text,
      suggestedResponses,
      comparisons,
      inlineQuestions,
      actionCards,
      status: newStatus,
      modelContent,
    });
  } catch (error) {
    console.error("[lesson-chat] Gemini error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

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
  return `You teach like David Malan from Harvard's CS50 — one of the most engaging lecturers alive. You bring that same energy, passion, and showmanship to Indian tax law. You're a senior CA who genuinely LOVES this stuff.

## Your Personality
- Build suspense: "Now here's the thing..." / "But wait—" / "And THIS is where it gets interesting."
- Ask questions constantly to make the student think before you reveal answers.
- Use vivid real-world analogies. Make abstract tax law concrete.
- Show excitement about clever design choices: "I love what they did here—"
- Empathize with practitioner pain: "If you've ever spent an hour untangling provisos..."
- SHORT punchy sentences. 2-3 sentences per message MAX.

## Topic: ${courseTitle} > ${unitTitle}

## Reference Material
${markdown}

## Session Status: ${status}
${scoreContext}

## TOOLS

### ask_question — informal knowledge checks during teaching
Create your OWN questions to check understanding mid-teaching. You invent the question and 2-4 options.
- No stakes — just engagement. The student picks an option and you react naturally.
- Vary when you use these — not every turn. Mix with teach-only and comparison turns.

### suggest_responses — EVERY teaching message
2-3 tappable options after every message. Make them contextual, never generic.

### show_comparison — old vs new changes
Show visual diff cards when contrasting old Act vs new Act. Use frequently.

### show_test_card — navigation to formal quiz
- Call show_test_card(type: "start_test") when you've finished teaching all concepts.
- Only call this ONCE, at the end of teaching.

## FLOW BASED ON STATUS

### If status is "teaching":
Teach the unit concepts interactively:
1. Hook opening — something surprising. Call suggest_responses.
2. Teach concept by concept (2-3 sentences each). Vary the rhythm:
   - Some turns: teach + ask_question
   - Some turns: teach + show_comparison
   - Some turns: just teach + suggest_responses
   - NEVER the same pattern twice in a row
3. When ALL key concepts are covered, call show_test_card(type: "start_test").

### If status is "testing":
The student is mid-quiz on the formal test page. Say something brief like "You're in the middle of your test — go finish it!" and call show_test_card(type: "resume_test").

### If status is "completed":
The student finished the quiz. You have their score in the context.
1. React to their score — celebrate if good, encourage if not.
2. If they got questions wrong, briefly re-explain those concepts.
3. Call show_test_card(type: "practice_again") AND show_test_card(type: "next_unit").

## ABSOLUTE RULES
- MAX 2-3 sentences of text per turn.
- EVERY teaching message → suggest_responses.
- VARY the pattern. Never same structure twice in a row.
- NEVER reveal formal quiz answers.`;
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
      const totalScore = unitCompletions.reduce((sum, c) => sum + c.score, 0);
      const totalQuestions = unitCompletions.reduce((sum, c) => sum + c.totalQuestions, 0);
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

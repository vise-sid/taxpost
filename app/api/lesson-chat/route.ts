import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

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
    name: "show_section_map",
    description: "Show a formatted table of old section → new section mappings. Use this whenever listing how sections were renumbered or reorganized. Much better than writing a markdown table.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Table title (e.g. 'PGBP Section Mapping')" },
        mappings: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              oldSection: { type: Type.STRING, description: "Old section number" },
              newSection: { type: Type.STRING, description: "New section number" },
              subject: { type: Type.STRING, description: "What the section covers" },
              changeType: { type: Type.STRING, description: "e.g. Renumbered, Restructured, New, Eliminated" },
            },
            required: ["oldSection", "newSection", "subject"],
          },
          description: "Array of section mappings",
        },
      },
      required: ["title", "mappings"],
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
Use for high-level before/after comparisons (e.g. "819 sections → 536 sections"). NOT for section number tables — use show_section_map for those.

### show_section_map
Use whenever you need to show how old sections map to new sections. ALWAYS use this instead of writing markdown tables. Provide title and an array of mappings with oldSection, newSection, subject, and changeType.

### show_test_card
Call once at the end: show_test_card(type: "start_test").

## STATUS-BASED BEHAVIOR

### teaching:
If score context mentions the user just finished a lesson quiz:
1. Give brief feedback on their score (1 sentence — "8/10, solid." or "5/10 — let's review a couple things.")
2. If score was below 70%, briefly mention what they likely missed (1-2 sentences max).
3. Then immediately call show_test_card(type: "start_test") to send them to the next lesson quiz.
4. Don't re-teach the whole unit. The quizzes are the learning reinforcement.

If no score context (fresh start):
Follow the content note structure as described above.

If all lessons are done:
Acknowledge completion. Call show_test_card(type: "practice_again") and show_test_card(type: "next_unit").

### testing:
Say "You have a test in progress." Call show_test_card(type: "resume_test").

### completed:
All lessons done. Acknowledge overall score. Call show_test_card(type: "practice_again") and show_test_card(type: "next_unit").

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

  // Build per-lesson completion tracking
  const lessonIds = unit.lessons.map((l) => l.id);
  const completions = await db.query.lessonCompletions.findMany({
    where: eq(lessonCompletions.userId, userId),
  });
  const unitCompletions = completions.filter((c) => lessonIds.includes(c.lessonId));
  const completedLessonIds = new Set(unitCompletions.map((c) => c.lessonId));

  // Find next uncompleted lesson
  const nextLesson = unit.lessons.find((l) => !completedLessonIds.has(l.id));
  const allLessonsDone = unit.lessons.every((l) => completedLessonIds.has(l.id));
  const lastCompletion = unitCompletions.sort((a, b) =>
    new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime()
  )[0];

  // Build score context
  let scoreContext = "";

  // If user was "testing" and has new completions, they just came back from a quiz
  if (status === "testing" && lastCompletion) {
    const lastLessonTitle = unit.lessons.find((l) => l.id === lastCompletion.lessonId)?.title || "the quiz";
    scoreContext = `The user just finished "${lastLessonTitle}": ${lastCompletion.score ?? 0}/${lastCompletion.totalQuestions ?? 0} correct.`;
    scoreContext += `\n${completedLessonIds.size} of ${unit.lessons.length} lessons completed in this unit.`;
    if (nextLesson) {
      scoreContext += `\nNext lesson to quiz: "${nextLesson.title}" (lesson ID ${nextLesson.id}).`;
      scoreContext += `\nGive brief feedback on their score, then call show_test_card(type: "start_test") to start the next quiz.`;
    } else {
      scoreContext += `\nAll lessons in this unit are complete! Congratulate them and offer practice_again and next_unit.`;
    }
  } else if (allLessonsDone) {
    const totalScore = unitCompletions.reduce((sum, c) => sum + (c.score ?? 0), 0);
    const totalQuestions = unitCompletions.reduce((sum, c) => sum + (c.totalQuestions ?? 0), 0);
    scoreContext = `All ${unit.lessons.length} lessons completed. Overall: ${totalScore}/${totalQuestions} (${Math.round((totalScore / totalQuestions) * 100)}%).`;
    scoreContext += `\nOffer practice_again and next_unit.`;
  }

  // Determine effective status
  let effectiveStatus = status;
  if (status === "testing" && lastCompletion) {
    // User returned from quiz — switch to teaching/feedback mode
    effectiveStatus = allLessonsDone ? "completed" : "teaching";
    // Update DB status
    await db.update(chatSessions).set({ status: effectiveStatus, updatedAt: new Date() })
      .where(and(eq(chatSessions.userId, userId), eq(chatSessions.unitId, unitId)));
  }

  // Load teaching content
  const firstLessonId = unit.lessons[0]?.id;
  const content = firstLessonId ? await getLessonContent(firstLessonId) : null;

  const systemPrompt = buildSystemPrompt(
    unit.title,
    unit.course.title,
    content?.markdown || "No teaching material available.",
    effectiveStatus,
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
        tools: [{ functionDeclarations: toolDeclarations as unknown as FunctionDeclaration[] }],
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
    const sectionMaps: any[] = [];
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
        if (fc.name === "show_section_map" && fc.args?.title) {
          sectionMaps.push({
            title: fc.args.title as string,
            mappings: fc.args.mappings as any[],
          });
        }
        if (fc.name === "show_test_card" && fc.args?.type) {
          const cardType = fc.args.type as string;
          // Link to the next uncompleted lesson, or first lesson for practice
          const targetLesson = cardType === "practice_again"
            ? unit.lessons[0]
            : (nextLesson || unit.lessons[0]);

          // Find actual next unit
          const allUnits = await db.query.units.findMany({
            where: eq(units.courseId, unit.courseId),
            orderBy: (u, { asc }) => [asc(u.order)],
            columns: { id: true, order: true },
          });
          const currentIdx = allUnits.findIndex((u) => u.id === unitId);
          const actualNextUnit = allUnits[currentIdx + 1];

          actionCards.push({
            type: cardType,
            unitId,
            lessonId: targetLesson?.id,
            unitTitle: unit.title,
            lessonTitle: targetLesson?.title,
            lessonCount: unit.lessons.length,
            completedCount: completedLessonIds.size,
            questionCount: targetLesson?.challenges?.length || 0,
            nextUnitId: actualNextUnit?.id,
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
    for (const sm of sectionMaps) {
      newMessages.push({ id: crypto.randomUUID(), role: "agent", content: "", sectionMapData: sm });
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
      sectionMaps,
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

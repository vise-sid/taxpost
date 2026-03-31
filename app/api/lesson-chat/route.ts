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
  return `You teach like David Malan from Harvard's CS50 — one of the most engaging lecturers alive. You bring that same energy, passion, and showmanship to Indian tax law. You're a senior CA who genuinely LOVES this stuff and makes even section renumbering feel like a revelation.

## Your Personality (BE David Malan teaching tax law)

**Energy & Suspense:**
- Build anticipation before key reveals: "Now here's the thing..." / "But wait—" / "And THIS is where it gets really interesting."
- Use dramatic pauses (short sentences before big facts): "819 sections. 1,200 provisos. 5.12 lakh words. That was the 1961 Act."
- Show genuine excitement: "I love what they did here—" / "This is actually brilliant—" / "Here's my favorite part—"

**Constant Questions:**
- Ask questions BEFORE revealing answers. Make them think first: "So quick — take a guess. How many sections did the old Act have by the end?"
- Connect to their practice: "Have you ever had a client call about this?" / "When was the last time you looked up Section 10?"
- Challenge their assumptions: "You'd think they'd just renumber everything, right? But that's NOT what happened."

**Vivid Analogies:**
- Tax law is abstract — make it concrete every time: "It's like having a phone with 819 apps and no folders." / "Imagine a recipe book where every dish has 4 footnotes that contradict each other." / "The old Act was like a house where someone added a room every year for 63 years — eventually you can't find the bathroom."

**Empathy for Practitioners:**
- Acknowledge the pain: "If you've ever spent 45 minutes untangling provisos to answer a simple question..." / "We've all been there — client on the phone, you KNOW the answer is in Section 10 somewhere, but which sub-clause?"
- Make it practical: "So next time a client asks about X, here's exactly what you tell them—"

**BREVITY IS EVERYTHING:**
- MAX 2 sentences of teaching per message. That's it. Not 3, not 4. TWO.
- Then either a question, a quiz, or a comparison card. Nothing else.
- Use bold ONLY for section numbers and key terms.
- You have 5-10 minutes to cover the ENTIRE unit including all quiz questions. Move fast.

## Topic: ${courseTitle} > ${unitTitle}

## Reference Material
${markdown}

## Question Bank
${challengeSummaries}

## TOOLS

### suggest_responses — EVERY MESSAGE
2-3 short options. Always include one that moves forward fast ("Next" / "Got it" / "Quiz me").

### show_comparison
Use when contrasting old→new. Don't describe the change AND show it — just show it with 1 sentence of context.

### present_quiz
Interleave throughout — NOT saved for the end. Teach a concept → immediately quiz it → move on.

## THE FLOW — VARIED RHYTHM, FAST-PACED

You are running a 5-10 minute session. Quiz questions are interleaved with teaching, NOT saved for the end. But the rhythm must VARY — don't do the same pattern every turn.

**Mix these turn types naturally:**
- TEACH ONLY: 1-2 sentences explaining a concept + a conversational question. No quiz, no comparison. Just build curiosity.
- TEACH + COMPARE: 1 sentence of context + show_comparison card. Let the visual do the work.
- TEACH + QUIZ: 1 sentence of context + immediately present_quiz. Fast.
- QUIZ ONLY: After the student responds to teaching, just drop a quiz. No preamble.
- REACT + TEACH: Respond to what the student said (1 sentence), then teach the next thing.
- COMPARE + QUIZ: Show a comparison, then quiz on it. No extra teaching text needed.

**DO NOT repeat the same pattern twice in a row.** If last turn was teach+compare+quiz, next turn should be just teach, or react+quiz, or compare only.

**Pacing rules:**
- Open with a hook (1 message, no quiz yet).
- Space quiz questions across the conversation — roughly every 2-3 turns.
- After they answer a quiz: 1 sentence of feedback, then continue. Don't dwell.
- If they get it right → move fast. If wrong → one extra sentence, then keep going.
- Cover all questions across 8-15 exchanges. Wrap up in 1 sentence.

## ABSOLUTE RULES
- MAX 2 sentences of text per turn. Period.
- EVERY message → suggest_responses.
- VARY the pattern. Never the same structure twice in a row.
- NEVER reveal quiz answers before the student responds.
- No filler. No "let me know when you're ready." No "shall we continue." Just GO.`;
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

    // response.text can throw if response only contains function calls
    let text = "";
    try { text = response.text || ""; } catch { text = ""; }

    // Also extract text from parts directly as fallback
    if (!text) {
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.text) text += part.text;
      }
    }
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

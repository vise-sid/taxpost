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

**Short & Punchy:**
- 2-4 sentences per message MAX. One idea at a time. Break things up.
- Use bold ONLY for section numbers and key terms.

## Topic: ${courseTitle} > ${unitTitle}

## Reference Material
${markdown}

## Question Bank
${challengeSummaries}

## TOOLS — USE ALL OF THEM

### suggest_responses — MANDATORY. EVERY. SINGLE. MESSAGE.
Call this after EVERY teaching message. No exceptions. 2-3 options that are:
- Specific to what you just said
- Include one that digs deeper + one that moves forward
- Never generic, never repeated
Examples: ["Wait, why 536 and not 298?", "Makes sense, what's next?", "How does this affect my TDS clients?"]

### show_comparison — USE THIS FREQUENTLY
WHENEVER you mention how something changed from old Act to new Act, call show_comparison to show it visually. Examples:
- "819 sections → 536 sections" → call show_comparison
- "Assessment Year → Tax Year" → call show_comparison
- "Section 10 with 140 clauses → clean table format" → call show_comparison
- "Section 80C/80CCC/80CCD → consolidated under new section" → call show_comparison
If you're contrasting old vs new, SHOW it, don't just say it. Aim for 3-5 comparisons across the conversation.

### present_quiz
ONLY in quiz phase. One at a time.

## THE FLOW

### PHASE 1 — INTERACTIVE TEACHING
This is a DIALOGUE, not a lecture. You ask, they respond, you build on it:

1. **Hook** — Open with something that grabs them. A surprising number, a practitioner pain point, a "did you know." Ask a question. Call suggest_responses.

2. **Teach one concept at a time** (2-3 sentences). Then ALWAYS do ONE of these:
   - Ask a mini knowledge check: "Quick — what do you think the new section number is?"
   - Ask about their experience: "Have you dealt with this in practice?"
   - Build suspense: "Now here's where it gets interesting..."
   - Challenge them: "So what would you tell a client who asks about this?"
   Then call suggest_responses.

3. **Use show_comparison** EVERY TIME you contrast old vs new — visual anchors help retention. If you say "X changed to Y", SHOW it with the tool.

4. **Adapt:** If they pick "I knew that" → speed up. If they ask questions → slow down and explore. If they want examples → give a real client scenario.

5. **Cover ALL key concepts** before Phase 2.

### PHASE 2 — QUIZ
Transition with energy: "Alright — let's put it to the test!"
- present_quiz one at a time.
- Correct: Brief, specific — "That's it." / "Nailed it — Section 16 it is."
- Wrong: Quick 1-2 sentence explanation, move on.
- End with one energetic wrap-up line.

## ABSOLUTE RULES
- EVERY teaching message → suggest_responses. NO EXCEPTIONS.
- Keep messages SHORT. If you're writing more than 4 sentences, split into two messages.
- NEVER reveal quiz answers during teaching.
- Make this the most engaging tax conversation they've ever had.`;
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

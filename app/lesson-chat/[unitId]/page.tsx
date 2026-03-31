import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

import db from "@/db/drizzle";
import { units, chatSessions, lessonCompletions } from "@/db/schema";
import { getUserProgress } from "@/db/queries";

import { ChatLesson } from "../chat-lesson";

const LearnAiUnitPage = async ({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) => {
  const { unitId: unitIdParam } = await params;
  const unitId = Number(unitIdParam);
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const [unit, userProgress, session] = await Promise.all([
    db.query.units.findFirst({
      where: eq(units.id, unitId),
      with: { course: true, lessons: { orderBy: (l, { asc }) => [asc(l.order)] } },
    }),
    getUserProgress(),
    db.query.chatSessions.findFirst({
      where: and(
        eq(chatSessions.userId, userId),
        eq(chatSessions.unitId, unitId)
      ),
    }),
  ]);

  if (!unit || !userProgress) redirect("/learn-ai");

  // Compute lesson completion progress
  const completions = await db.query.lessonCompletions.findMany({
    where: eq(lessonCompletions.userId, userId),
  });
  const lessonIds = new Set(unit.lessons.map((l) => l.id));
  const completedCount = completions.filter((c) => lessonIds.has(c.lessonId)).length;
  const totalLessons = unit.lessons.length;
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const initialMessages = (session?.messages as any[]) || [];
  const initialStatus = session?.status || "teaching";

  return (
    <ChatLesson
      unitId={unit.id}
      unitTitle={unit.title}
      initialMessages={initialMessages}
      initialStatus={initialStatus}
      initialHearts={userProgress.hearts}
      progress={progress}
    />
  );
};

export default LearnAiUnitPage;

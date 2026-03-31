import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

import db from "@/db/drizzle";
import { units, chatSessions } from "@/db/schema";
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

  const initialMessages = (session?.messages as any[]) || [];
  const initialStatus = session?.status || "teaching";
  const firstLessonId = unit.lessons[0]?.id;

  return (
    <ChatLesson
      unitId={unit.id}
      unitTitle={unit.title}
      initialMessages={initialMessages}
      initialStatus={initialStatus}
      initialHearts={userProgress.hearts}
      firstLessonId={firstLessonId}
    />
  );
};

export default LearnAiUnitPage;

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

import db from "@/db/drizzle";
import { units, challengeProgress } from "@/db/schema";
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

  const [unit, userProgress] = await Promise.all([
    db.query.units.findFirst({
      where: eq(units.id, unitId),
      with: {
        course: true,
        lessons: {
          orderBy: (lessons, { asc }) => [asc(lessons.order)],
          with: {
            challenges: {
              orderBy: (challenges, { asc }) => [asc(challenges.order)],
              with: {
                challengeOptions: true,
                challengeProgress: {
                  where: eq(challengeProgress.userId, userId),
                },
              },
            },
          },
        },
      },
    }),
    getUserProgress(),
  ]);

  if (!unit || !userProgress) redirect("/learn-ai");

  const allChallenges = unit.lessons.flatMap((lesson) =>
    lesson.challenges.map((c) => ({
      id: c.id,
      lessonId: lesson.id,
      question: c.question,
      explanation: c.explanation,
      explanationWrong: c.explanationWrong,
      options: c.challengeOptions.map((o) => ({
        id: o.id,
        text: o.text,
        correct: o.correct,
      })),
      completed:
        c.challengeProgress &&
        c.challengeProgress.length > 0 &&
        c.challengeProgress.every((p) => p.completed),
    }))
  );

  const lessonMap = unit.lessons.map((l) => ({
    id: l.id,
    title: l.title,
    challengeIds: l.challenges.map((c) => c.id),
  }));

  return (
    <ChatLesson
      unitId={unit.id}
      unitTitle={unit.title}
      challenges={allChallenges}
      lessons={lessonMap}
      initialHearts={userProgress.hearts}
    />
  );
};

export default LearnAiUnitPage;

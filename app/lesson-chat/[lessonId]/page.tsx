import { redirect } from "next/navigation";

import { getLesson, getUserProgress } from "@/db/queries";

import { ChatLesson } from "../chat-lesson";

const LearnAiLessonPage = async ({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) => {
  const { lessonId } = await params;

  const [lesson, userProgress] = await Promise.all([
    getLesson(Number(lessonId)),
    getUserProgress(),
  ]);

  if (!lesson || !userProgress) redirect("/learn-ai");

  return (
    <ChatLesson
      lessonId={lesson.id}
      lessonTitle={lesson.title}
      challenges={lesson.challenges.map((c) => ({
        id: c.id,
        question: c.question,
        explanation: c.explanation,
        explanationWrong: c.explanationWrong,
        options: c.challengeOptions.map((o) => ({
          id: o.id,
          text: o.text,
          correct: o.correct,
        })),
        completed: c.completed,
      }))}
      initialHearts={userProgress.hearts}
    />
  );
};

export default LearnAiLessonPage;

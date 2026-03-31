import Link from "next/link";
import { Bot } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { courses, challengeProgress } from "@/db/schema";

const LearnAiPage = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Load ALL courses with units, lessons, challenges
  const allCourses = await db.query.courses.findMany({
    orderBy: (courses, { asc }) => [asc(courses.id)],
    with: {
      units: {
        orderBy: (units, { asc }) => [asc(units.order)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)],
            with: {
              challenges: {
                with: {
                  challengeProgress: {
                    where: eq(challengeProgress.userId, userId),
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return (
    <div className="mx-auto h-full max-w-[600px] px-6 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Bot className="h-8 w-8 text-brand-navy" />
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">
            Learn with AI
          </h1>
          <p className="text-sm text-muted-foreground">
            Pick a unit — your AI tutor will teach all concepts and quiz you.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {allCourses.map((course) => {
          if (course.units.length === 0) return null;

          return (
            <div key={course.id}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-navy">
                {course.title}
              </h2>
              <div className="space-y-2">
                {course.units.map((unit) => {
                  const totalChallenges = unit.lessons.reduce(
                    (sum, l) => sum + l.challenges.length,
                    0
                  );
                  const completedChallenges = unit.lessons.reduce(
                    (sum, l) =>
                      sum +
                      l.challenges.filter(
                        (c) =>
                          c.challengeProgress?.length > 0 &&
                          c.challengeProgress.every((p) => p.completed)
                      ).length,
                    0
                  );
                  const allDone =
                    totalChallenges > 0 && completedChallenges === totalChallenges;
                  const hasContent = totalChallenges > 0;

                  return (
                    <Link
                      key={unit.id}
                      href={hasContent ? `/lesson-chat/${unit.id}` : "#"}
                      className={`flex items-center justify-between rounded-xl border-2 p-4 transition-colors ${
                        hasContent
                          ? "hover:border-brand-navy/30 hover:bg-brand-navy/5"
                          : "opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-navy/10">
                          <Bot className="h-5 w-5 text-brand-navy" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-neutral-700">
                            {unit.title}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {unit.lessons.length} lessons · {totalChallenges} questions
                          </p>
                        </div>
                      </div>
                      {allDone && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-600">
                          Done
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearnAiPage;

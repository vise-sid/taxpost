import { redirect } from "next/navigation";
import Link from "next/link";
import { Bot } from "lucide-react";

import { getUnits, getUserProgress } from "@/db/queries";

const LearnAiPage = async () => {
  const [units, userProgress] = await Promise.all([
    getUnits(),
    getUserProgress(),
  ]);

  if (!userProgress || !userProgress.activeCourse) redirect("/courses");

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

      <div className="space-y-3">
        {units.map((unit) => {
          const totalLessons = unit.lessons.length;
          const completedLessons = unit.lessons.filter((l) => l.completed).length;
          const allDone = totalLessons > 0 && completedLessons === totalLessons;

          return (
            <Link
              key={unit.id}
              href={`/lesson-chat/${unit.id}`}
              className="flex items-center justify-between rounded-xl border-2 p-4 transition-colors hover:border-brand-navy/30 hover:bg-brand-navy/5"
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
                    {totalLessons} lessons · {unit.lessons.reduce((sum, l) => sum + l.challenges.length, 0)} questions
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
};

export default LearnAiPage;

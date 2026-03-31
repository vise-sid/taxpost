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
            Pick a lesson — your AI tutor will teach concepts before quizzing
            you.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {units.map((unit) => (
          <div key={unit.id}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-navy/60">
              {unit.title}
            </h2>
            <div className="space-y-2">
              {unit.lessons.map((lesson) => {
                const isCompleted = lesson.completed;
                return (
                  <Link
                    key={lesson.id}
                    href={`/lesson-chat/${lesson.id}`}
                    className="flex items-center justify-between rounded-xl border-2 p-4 transition-colors hover:border-brand-navy/30 hover:bg-brand-navy/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-navy/10">
                        <Bot className="h-4 w-4 text-brand-navy" />
                      </div>
                      <span className="text-sm font-semibold text-neutral-700">
                        {lesson.title}
                      </span>
                    </div>
                    {isCompleted && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-600">
                        Done
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearnAiPage;

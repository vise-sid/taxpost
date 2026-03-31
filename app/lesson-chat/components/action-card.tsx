"use client";

import Link from "next/link";
import { BookOpen, RotateCcw, ArrowRight } from "lucide-react";

type ActionCardProps = {
  type: string;
  unitTitle: string;
  lessonId?: number;
  lessonTitle?: string;
  lessonCount?: number;
  completedCount?: number;
  questionCount?: number;
  nextUnitId?: number;
};

export const ActionCard = ({
  type,
  unitTitle,
  lessonId,
  lessonTitle,
  lessonCount,
  completedCount,
  questionCount,
  nextUnitId,
}: ActionCardProps) => {
  if (type === "start_test" || type === "resume_test") {
    const href = lessonId ? `/lesson/${lessonId}` : "/learn";
    const progressText = lessonCount && completedCount !== undefined
      ? `Lesson ${completedCount + 1} of ${lessonCount}`
      : "";

    return (
      <Link
        href={href}
        className="block rounded-xl border-2 border-brand-navy/20 bg-brand-navy/5 p-4 transition-colors hover:border-brand-navy/40 hover:bg-brand-navy/10"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-brand-navy" />
          <div className="flex-1">
            <p className="text-sm font-bold text-brand-navy">
              {type === "resume_test" ? "Resume Quiz" : "Start Quiz"}{lessonTitle ? `: ${lessonTitle}` : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {questionCount ? `${questionCount} questions` : ""}{progressText ? ` · ${progressText}` : ""}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-brand-navy" />
        </div>
      </Link>
    );
  }

  if (type === "practice_again") {
    const href = lessonId ? `/lesson/${lessonId}` : "/learn";
    return (
      <Link
        href={href}
        className="block rounded-xl border-2 border-amber-300/50 bg-amber-50 p-4 transition-colors hover:border-amber-400 hover:bg-amber-100"
      >
        <div className="flex items-center gap-3">
          <RotateCcw className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-700">Practice Again</p>
            <p className="text-xs text-amber-600/70">Retake quizzes to improve your score</p>
          </div>
        </div>
      </Link>
    );
  }

  if (type === "next_unit") {
    const href = nextUnitId ? `/lesson-chat/${nextUnitId}` : "/learn-ai";
    return (
      <Link
        href={href}
        className="block rounded-xl border-2 border-green-300/50 bg-green-50 p-4 transition-colors hover:border-green-400 hover:bg-green-100"
      >
        <div className="flex items-center gap-3">
          <ArrowRight className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-bold text-green-700">Next Unit</p>
            <p className="text-xs text-green-600/70">Continue learning</p>
          </div>
        </div>
      </Link>
    );
  }

  return null;
};

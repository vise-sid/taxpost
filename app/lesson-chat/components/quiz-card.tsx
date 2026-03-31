"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type QuizCardProps = {
  messageId: string;
  question: string;
  options: { id: number; text: string; correct: boolean }[];
  explanation: string | null;
  explanationWrong: string | null;
  answered: boolean;
  correct?: boolean;
  selectedOptionId?: number;
  onAnswer: (messageId: string, optionId: number) => void;
};

export const QuizCard = ({
  messageId,
  question,
  options,
  explanation,
  explanationWrong,
  answered,
  correct,
  selectedOptionId,
  onAnswer,
}: QuizCardProps) => {
  return (
    <div className="flex gap-3">
      <div className="w-8 shrink-0" /> {/* spacer to align with agent messages */}
      <div className="w-full max-w-[85%] overflow-hidden rounded-2xl border-2 border-brand-navy/20 bg-white shadow-sm">
        {/* Question */}
        <div className="bg-brand-navy/5 px-4 py-3">
          <p className="text-sm font-semibold text-neutral-800">{question}</p>
        </div>

        {/* Options */}
        <div className="space-y-2 p-3">
          {options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const showCorrect = answered && option.correct;
            const showWrong = answered && isSelected && !option.correct;

            return (
              <button
                key={option.id}
                onClick={() => !answered && onAnswer(messageId, option.id)}
                disabled={answered}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition-all",
                  !answered &&
                    "border-neutral-200 hover:border-brand-navy/40 hover:bg-brand-navy/5 active:scale-[0.98]",
                  showCorrect &&
                    "border-green-400 bg-green-50 text-green-800",
                  showWrong &&
                    "border-red-400 bg-red-50 text-red-800",
                  answered &&
                    !showCorrect &&
                    !showWrong &&
                    "border-neutral-100 text-neutral-400"
                )}
              >
                <span className="flex-1 font-medium">{option.text}</span>
                {showCorrect && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                )}
                {showWrong && (
                  <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div
            className={cn(
              "px-4 py-3 text-sm",
              correct ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            )}
          >
            {correct
              ? explanation || "Correct!"
              : explanationWrong || explanation || "That's not right."}
          </div>
        )}
      </div>
    </div>
  );
};

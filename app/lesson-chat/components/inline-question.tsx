"use client";

type InlineQuestionProps = {
  messageId: string;
  question: string;
  options: string[];
  answered: boolean;
  selectedOption?: string;
  onAnswer: (messageId: string, option: string) => void;
};

export const InlineQuestion = ({
  messageId,
  question,
  options,
  answered,
  selectedOption,
  onAnswer,
}: InlineQuestionProps) => {
  return (
    <div className="rounded-xl border-2 border-dashed border-brand-navy/20 bg-brand-navy/5 p-4">
      <p className="mb-3 text-sm font-medium text-neutral-700">{question}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => !answered && onAnswer(messageId, option)}
            disabled={answered}
            className={`rounded-lg border px-3 py-2 text-sm transition-all ${
              answered && selectedOption === option
                ? "border-brand-navy bg-brand-navy/10 font-bold text-brand-navy"
                : answered
                  ? "border-neutral-200 text-neutral-400"
                  : "border-neutral-200 hover:border-brand-navy/40 hover:bg-brand-navy/5 active:scale-95"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

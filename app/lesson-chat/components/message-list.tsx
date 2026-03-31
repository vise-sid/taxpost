"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { ChatMessage } from "../chat-lesson";
import { QuizCard } from "./quiz-card";
import { ComparisonCard } from "./comparison-card";
import { ResponseChips } from "./response-chips";

type MessageListProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  onQuizAnswer: (messageId: string, optionId: number) => void;
  suggestedResponses: string[];
  onChipSelect: (text: string) => void;
};

export const MessageList = ({
  messages,
  isLoading,
  onQuizAnswer,
  suggestedResponses,
  onChipSelect,
}: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, suggestedResponses]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-[600px] space-y-4">
        {messages.map((msg) => {
          if (msg.quizData) {
            return (
              <QuizCard
                key={msg.id}
                messageId={msg.id}
                question={msg.quizData.question}
                options={msg.quizData.options}
                explanation={msg.quizData.explanation}
                explanationWrong={msg.quizData.explanationWrong}
                answered={!!msg.quizAnswered}
                correct={msg.quizCorrect}
                selectedOptionId={msg.selectedOptionId}
                onAnswer={onQuizAnswer}
              />
            );
          }

          if (msg.comparisonData) {
            return (
              <ComparisonCard
                key={msg.id}
                title={msg.comparisonData.title}
                oldLabel={msg.comparisonData.oldLabel}
                oldText={msg.comparisonData.oldText}
                newLabel={msg.comparisonData.newLabel}
                newText={msg.comparisonData.newText}
              />
            );
          }

          if (msg.role === "agent" && msg.content) {
            return (
              <div key={msg.id} className="text-sm leading-relaxed text-neutral-700 prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            );
          }

          if (msg.role === "user") {
            return (
              <div key={msg.id} className="text-sm text-neutral-500 italic">
                {msg.content}
              </div>
            );
          }

          return null;
        })}

        {/* Response chips — show after the last message */}
        {suggestedResponses.length > 0 && !isLoading && (
          <ResponseChips
            options={suggestedResponses}
            onSelect={onChipSelect}
            disabled={isLoading}
          />
        )}

        {isLoading && (
          <div className="text-sm text-neutral-400">Thinking...</div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

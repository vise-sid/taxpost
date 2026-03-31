"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { upsertChallengeProgress } from "@/actions/challenge-progress";
import { reduceHearts } from "@/actions/user-progress";
import { updateRepetition } from "@/actions/spaced-repetition";
import { recordLessonCompletion } from "@/actions/lesson-complete";
import { useHeartsModal } from "@/store/use-hearts-modal";

import { MessageList } from "./components/message-list";
import { ChatInput } from "./components/chat-input";
import { ChatHeader } from "./components/chat-header";

type Challenge = {
  id: number;
  question: string;
  explanation: string | null;
  explanationWrong: string | null;
  options: { id: number; text: string; correct: boolean }[];
  completed: boolean;
};

export type ChatMessage = {
  id: string;
  role: "agent" | "user";
  content: string;
  quizData?: {
    challengeId: number;
    question: string;
    options: { id: number; text: string; correct: boolean }[];
    explanation: string | null;
    explanationWrong: string | null;
  };
  quizAnswered?: boolean;
  quizCorrect?: boolean;
  selectedOptionId?: number;
};

type ChatLessonProps = {
  lessonId: number;
  lessonTitle: string;
  challenges: Challenge[];
  initialHearts: number;
};

export const ChatLesson = ({
  lessonId,
  lessonTitle,
  challenges,
  initialHearts,
}: ChatLessonProps) => {
  const router = useRouter();
  const { open: openHeartsModal } = useHeartsModal();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hearts, setHearts] = useState(initialHearts);
  const [answeredIds, setAnsweredIds] = useState<Set<number>>(new Set());
  const [correctCount, setCorrectCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lessonDone, setLessonDone] = useState(false);
  const [pendingQuiz, setPendingQuiz] = useState(false);

  const [, startTransition] = useTransition();
  const turnCountRef = useRef(0);
  // Gemini history: { role, parts: [{ text }] }
  const historyRef = useRef<{ role: string; parts: { text: string }[] }[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const startedRef = useRef(false);
  const challengeMap = useRef(new Map(challenges.map((c) => [c.id, c]))).current;

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const sendMessage = useCallback(
    async (text: string, isSystem = false) => {
      if (!isSystem) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "user", content: text },
        ]);
      }

      turnCountRef.current += 1;
      setIsLoading(true);

      try {
        const res = await fetch("/api/lesson-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            history: historyRef.current,
            message: text,
            turnCount: turnCountRef.current,
          }),
        });

        if (!res.ok) throw new Error("Request failed");

        // Stream plain text (same pattern that worked in the test)
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        const agentMsgId = crypto.randomUUID();
        let messageAdded = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });

          const displayText = fullText.replace(/\n__QUIZ__\d+/g, "").trim();
          if (displayText && !messageAdded) {
            // Add agent message only when we have actual text
            setMessages((prev) => [
              ...prev,
              { id: agentMsgId, role: "agent", content: displayText },
            ]);
            messageAdded = true;
          } else if (displayText && messageAdded) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === agentMsgId ? { ...m, content: displayText } : m
              )
            );
          }
        }

        // After stream ends, extract quiz markers
        const quizMatches = fullText.matchAll(/__QUIZ__(\d+)/g);
        const agentText = fullText.replace(/\n__QUIZ__\d+/g, "").trim();

        // Final text update
        setMessages((prev) =>
          prev.map((m) =>
            m.id === agentMsgId ? { ...m, content: agentText } : m
          )
        );

        // Add quiz cards for each marker
        for (const match of quizMatches) {
          const challengeId = Number(match[1]);
          const challenge = challengeMap.get(challengeId);
          if (challenge && !answeredIds.has(challengeId)) {
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "agent",
                content: "",
                quizData: {
                  challengeId: challenge.id,
                  question: challenge.question,
                  options: challenge.options,
                  explanation: challenge.explanation,
                  explanationWrong: challenge.explanationWrong,
                },
              },
            ]);
            setPendingQuiz(true);
          }
        }

        // Update Gemini history
        historyRef.current.push(
          { role: "user", parts: [{ text }] },
          { role: "model", parts: [{ text: agentText || "OK" }] }
        );

        // Remove empty agent message if no text
        if (!agentText) {
          setMessages((prev) => prev.filter((m) => m.id !== agentMsgId));
        }
      } catch {
        toast.error("Failed to get a response. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [lessonId, challengeMap, answeredIds]
  );

  // Auto-start
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      sendMessage("I'm ready to learn. Please begin the lesson.", true);
    }
  }, [sendMessage]);

  // Handle quiz answer
  const handleQuizAnswer = useCallback(
    (messageId: string, optionId: number) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg?.quizData || msg.quizAnswered) return;

      const selectedOption = msg.quizData.options.find((o) => o.id === optionId);
      if (!selectedOption) return;

      const isCorrect = selectedOption.correct;
      const challengeId = msg.quizData.challengeId;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, quizAnswered: true, quizCorrect: isCorrect, selectedOptionId: optionId }
            : m
        )
      );

      setAnsweredIds((prev) => new Set([...prev, challengeId]));
      setPendingQuiz(false);

      if (isCorrect) {
        setCorrectCount((c) => c + 1);
        startTransition(() => {
          upsertChallengeProgress(challengeId).catch(() => {});
          updateRepetition(challengeId, true).catch(() => {});
        });
      } else {
        setHearts((h) => Math.max(h - 1, 0));
        startTransition(() => {
          reduceHearts(challengeId).catch(() => {});
          updateRepetition(challengeId, false).catch(() => {});
        });
        if (hearts <= 1) openHeartsModal();
      }

      const answerText = `I selected: "${selectedOption.text}" (${isCorrect ? "correct" : "incorrect"})`;
      sendMessage(answerText, true);
    },
    [messages, hearts, openHeartsModal, sendMessage]
  );

  // Lesson completion
  useEffect(() => {
    if (lessonDone) return;
    if (challenges.every((c) => answeredIds.has(c.id)) && answeredIds.size > 0) {
      setLessonDone(true);
      clearInterval(timerRef.current);
      startTransition(() => {
        recordLessonCompletion({
          lessonId,
          timeTakenSeconds: elapsedSeconds,
          score: correctCount,
          totalQuestions: challenges.length,
        }).catch(() => {});
      });
    }
  }, [answeredIds, challenges, lessonId, elapsedSeconds, correctCount, lessonDone]);

  const progress = challenges.length > 0 ? Math.round((answeredIds.size / challenges.length) * 100) : 0;

  return (
    <div className="flex h-full flex-col">
      <ChatHeader title={lessonTitle} hearts={hearts} progress={progress} onExit={() => router.push("/learn-ai")} />
      <MessageList messages={messages} isLoading={isLoading} onQuizAnswer={handleQuizAnswer} />
      {lessonDone ? (
        <div className="border-t bg-green-50 px-4 py-6 text-center">
          <p className="text-lg font-bold text-green-700">Lesson Complete!</p>
          <p className="text-sm text-green-600">
            {correctCount}/{challenges.length} correct in {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
          </p>
          <button onClick={() => router.push("/learn-ai")} className="mt-4 rounded-xl bg-brand-navy px-6 py-2.5 text-sm font-bold text-white">
            Back to Lessons
          </button>
        </div>
      ) : (
        <ChatInput
          onSend={(text) => sendMessage(text)}
          disabled={isLoading || pendingQuiz}
          placeholder={pendingQuiz ? "Answer the question above first..." : "Ask a question or type a message..."}
        />
      )}
    </div>
  );
};

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
  comparisonData?: {
    title: string;
    oldLabel: string;
    oldText: string;
    newLabel: string;
    newText: string;
  };
};

type Lesson = {
  id: number;
  title: string;
  challengeIds: number[];
};

type ChatLessonProps = {
  unitId: number;
  unitTitle: string;
  challenges: (Challenge & { lessonId: number })[];
  lessons: Lesson[];
  initialHearts: number;
};

export const ChatLesson = ({
  unitId,
  unitTitle,
  challenges,
  lessons,
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
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>([]);

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
      setSuggestedResponses([]);

      try {
        const res = await fetch("/api/lesson-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unitId,
            history: historyRef.current,
            message: text,
            turnCount: turnCountRef.current,
          }),
        });

        if (!res.ok) throw new Error("Request failed");

        const data = await res.json();

        // Add agent text message
        if (data.text) {
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "agent", content: data.text },
          ]);
        }

        // Add comparison cards
        if (data.comparisons) {
          for (const comp of data.comparisons) {
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "agent",
                content: "",
                comparisonData: comp,
              },
            ]);
          }
        }

        // Add quiz cards
        if (data.toolCalls) {
          for (const challengeId of data.toolCalls) {
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
        }

        // Set suggested responses — always show chips (fallback if agent didn't provide)
        if (data.suggestedResponses?.length) {
          setSuggestedResponses(data.suggestedResponses);
        } else if (!data.toolCalls?.length) {
          // Fallback chips when agent forgets to suggest
          setSuggestedResponses(["Tell me more", "Got it, next", "I have a question"]);
        }

        // Update history with raw model content (preserves thought signatures)
        historyRef.current.push(
          { role: "user", parts: [{ text }] },
          data.modelContent
        );
      } catch {
        toast.error("Failed to get a response. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [unitId, challengeMap, answeredIds]
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

  // Track per-lesson completion as challenges get answered
  const completedLessonsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    for (const lesson of lessons) {
      if (completedLessonsRef.current.has(lesson.id)) continue;
      const allAnswered = lesson.challengeIds.every((cid) => answeredIds.has(cid));
      if (allAnswered && lesson.challengeIds.length > 0) {
        completedLessonsRef.current.add(lesson.id);
        const lessonCorrect = lesson.challengeIds.filter((cid) => {
          const msg = messages.find((m) => m.quizData?.challengeId === cid);
          return msg?.quizCorrect;
        }).length;
        startTransition(() => {
          recordLessonCompletion({
            lessonId: lesson.id,
            timeTakenSeconds: elapsedSeconds,
            score: lessonCorrect,
            totalQuestions: lesson.challengeIds.length,
          }).catch(() => {});
        });
      }
    }
  }, [answeredIds, lessons, messages, elapsedSeconds]);

  // Unit complete when all challenges answered
  useEffect(() => {
    if (lessonDone) return;
    if (challenges.every((c) => answeredIds.has(c.id)) && answeredIds.size > 0) {
      setLessonDone(true);
      clearInterval(timerRef.current);
    }
  }, [answeredIds, challenges, lessonDone]);

  const progress = challenges.length > 0 ? Math.round((answeredIds.size / challenges.length) * 100) : 0;

  return (
    <div className="flex h-full flex-col">
      <ChatHeader title={unitTitle} hearts={hearts} progress={progress} onExit={() => router.push("/learn-ai")} />
      <MessageList
        messages={messages}
        isLoading={isLoading}
        onQuizAnswer={handleQuizAnswer}
        suggestedResponses={suggestedResponses}
        onChipSelect={(text) => { setSuggestedResponses([]); sendMessage(text); }}
      />
      {lessonDone ? (
        <div className="border-t bg-green-50 px-4 py-6 text-center">
          <p className="text-lg font-bold text-green-700">Unit Complete!</p>
          <p className="text-sm text-green-600">
            {correctCount}/{challenges.length} correct in {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
          </p>
          <button onClick={() => router.push("/learn-ai")} className="mt-4 rounded-xl bg-brand-navy px-6 py-2.5 text-sm font-bold text-white">
            Back to Units
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

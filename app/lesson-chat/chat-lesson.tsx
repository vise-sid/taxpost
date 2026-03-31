"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { MessageList } from "./components/message-list";
import { ChatInput } from "./components/chat-input";
import { ChatHeader } from "./components/chat-header";

export type ChatMessage = {
  id: string;
  role: "agent" | "user";
  content: string;
  comparisonData?: {
    title: string;
    oldLabel: string;
    oldText: string;
    newLabel: string;
    newText: string;
  };
  questionData?: {
    question: string;
    options: string[];
  };
  questionAnswered?: boolean;
  questionSelected?: string;
  sectionMapData?: {
    title: string;
    mappings: { oldSection: string; newSection: string; subject: string; changeType?: string }[];
  };
  actionData?: {
    type: string;
    unitId: number;
    lessonId?: number;
    lessonTitle?: string;
    unitTitle: string;
    lessonCount?: number;
    completedCount?: number;
    questionCount?: number;
    nextUnitId?: number;
  };
};

type ChatLessonProps = {
  unitId: number;
  unitTitle: string;
  initialMessages: ChatMessage[];
  initialStatus: string;
  initialHearts: number;
  firstLessonId?: number;
};

export const ChatLesson = ({
  unitId,
  unitTitle,
  initialMessages,
  initialStatus,
  initialHearts,
}: ChatLessonProps) => {
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState(false);
  const [hearts] = useState(initialHearts);
  const startedRef = useRef(false);

  const sendMessage = useCallback(
    async (text: string, isSystem = false) => {
      if (!isSystem) {
        const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
        setMessages((prev) => [...prev, userMsg]);
      }

      setSuggestedResponses([]);
      setIsLoading(true);

      try {
        const res = await fetch("/api/lesson-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ unitId, message: text }),
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
        if (data.comparisons?.length) {
          for (const comp of data.comparisons) {
            setMessages((prev) => [
              ...prev,
              { id: crypto.randomUUID(), role: "agent", content: "", comparisonData: comp },
            ]);
          }
        }

        // Add section maps
        if (data.sectionMaps?.length) {
          for (const sm of data.sectionMaps) {
            setMessages((prev) => [
              ...prev,
              { id: crypto.randomUUID(), role: "agent", content: "", sectionMapData: sm },
            ]);
          }
        }

        // Add inline questions
        if (data.inlineQuestions?.length) {
          for (const q of data.inlineQuestions) {
            setMessages((prev) => [
              ...prev,
              { id: crypto.randomUUID(), role: "agent", content: "", questionData: q },
            ]);
          }
          setPendingQuestion(true);
        }

        // Add action cards
        if (data.actionCards?.length) {
          for (const card of data.actionCards) {
            setMessages((prev) => [
              ...prev,
              { id: crypto.randomUUID(), role: "agent", content: "", actionData: card },
            ]);
          }
        }

        // Set suggested responses
        if (data.suggestedResponses?.length) {
          setSuggestedResponses(data.suggestedResponses);
        } else if (!data.inlineQuestions?.length && !data.actionCards?.length) {
          setSuggestedResponses(["Tell me more", "Got it, next", "I have a question"]);
        }
      } catch {
        toast.error("Failed to get a response. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [unitId]
  );

  // Auto-start on mount (only if no existing messages)
  useEffect(() => {
    if (!startedRef.current && initialMessages.length === 0) {
      startedRef.current = true;
      sendMessage("I'm ready to learn. Please begin the lesson.", true);
    }
  }, [sendMessage, initialMessages.length]);

  // Handle inline question answer
  const handleQuestionAnswer = useCallback(
    (messageId: string, option: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, questionAnswered: true, questionSelected: option }
            : m
        )
      );
      setPendingQuestion(false);
      sendMessage(`I think: "${option}"`, true);
    },
    [sendMessage]
  );

  const progress = 0; // Progress tracked by quiz page now, not here

  return (
    <div className="flex h-full flex-col">
      <ChatHeader
        title={unitTitle}
        hearts={hearts}
        progress={progress}
        onExit={() => router.push("/learn-ai")}
      />
      <MessageList
        messages={messages}
        isLoading={isLoading}
        suggestedResponses={suggestedResponses}
        onChipSelect={(text) => { setSuggestedResponses([]); sendMessage(text); }}
        onQuestionAnswer={handleQuestionAnswer}
      />
      <ChatInput
        onSend={(text) => sendMessage(text)}
        disabled={isLoading || pendingQuestion}
        placeholder={
          pendingQuestion
            ? "Pick an answer above..."
            : "Ask a question or type a message..."
        }
      />
    </div>
  );
};

"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { useAudio, useWindowSize, useMount } from "react-use";
import { toast } from "sonner";

import { ShareScore } from "@/components/share-score";
import { upsertChallengeProgress } from "@/actions/challenge-progress";
import { recordLessonCompletion } from "@/actions/lesson-complete";
import { updateRepetition } from "@/actions/spaced-repetition";
import { reduceHearts } from "@/actions/user-progress";
import { MAX_HEARTS } from "@/constants";
import { challengeOptions, challenges } from "@/db/schema";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { usePracticeModal } from "@/store/use-practice-modal";

import { Challenge } from "./challenge";
import { Footer } from "./footer";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { ResultCard } from "./result-card";

type QuizProps = {
  initialPercentage: number;
  initialHearts: number;
  initialLessonId: number;
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean;
    challengeOptions: (typeof challengeOptions.$inferSelect)[];
  })[];
};

export const Quiz = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialLessonChallenges,
}: QuizProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [correctAudio, _c, correctControls] = useAudio({ src: "/correct.wav" });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [incorrectAudio, _i, incorrectControls] = useAudio({
    src: "/incorrect.wav",
  });
  const [finishAudio] = useAudio({
    src: "/finish.mp3",
    autoPlay: true,
  });
  const { width, height } = useWindowSize();

  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { open: openHeartsModal } = useHeartsModal();
  const { open: openPracticeModal } = usePracticeModal();

  useMount(() => {
    if (initialPercentage === 100) openPracticeModal();
  });

  const [lessonId] = useState(initialLessonId);
  const [hearts, setHearts] = useState(initialHearts);
  const [percentage, setPercentage] = useState(() => {
    return initialPercentage === 100 ? 0 : initialPercentage;
  });
  const [challengesList] = useState(initialLessonChallenges);
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challengesList.findIndex(
      (challenge) => !challenge.completed
    );
    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
  });

  const [selectedOption, setSelectedOption] = useState<number>();
  const [status, setStatus] = useState<"none" | "wrong" | "correct">("none");

  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Score tracking
  const [correctCount, setCorrectCount] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [completionData, setCompletionData] = useState<{
    timeTakenSeconds: number;
    score: number;
    totalQuestions: number;
    streak?: { currentStreak: number; isNewStreak: boolean };
  } | null>(null);

  // Start timer on mount
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const challenge = challengesList[activeIndex];
  const options = challenge?.challengeOptions ?? [];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const onNext = () => {
    setActiveIndex((current) => current + 1);
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;
    setSelectedOption(id);
  };

  const onContinue = () => {
    if (!selectedOption) return;

    if (status === "wrong") {
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    const correctOption = options.find((option) => option.correct);
    if (!correctOption) return;

    if (correctOption.id === selectedOption) {
      startTransition(() => {
        upsertChallengeProgress(challenge.id)
          .then((response) => {
            if (response?.error === "hearts") {
              openHeartsModal();
              return;
            }
            void correctControls.play();
            setStatus("correct");
            setCorrectCount((prev) => prev + 1);
            updateRepetition(challenge.id, true).catch(() => {});
            setPercentage((prev) => prev + 100 / challengesList.length);
            if (initialPercentage === 100) {
              setHearts((prev) => Math.min(prev + 1, MAX_HEARTS));
            }
          })
          .catch(() => toast.error("Something went wrong. Please try again."));
      });
    } else {
      startTransition(() => {
        reduceHearts(challenge.id)
          .then((response) => {
            if (response?.error === "hearts") {
              openHeartsModal();
              return;
            }
            void incorrectControls.play();
            setStatus("wrong");
            updateRepetition(challenge.id, false).catch(() => {});
            if (!response?.error) setHearts((prev) => Math.max(prev - 1, 0));
          })
          .catch(() => toast.error("Something went wrong. Please try again."));
      });
    }
  };

  // Lesson completion screen
  if (!challenge && !lessonCompleted) {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Record completion
    setLessonCompleted(true);
    recordLessonCompletion(
      lessonId,
      elapsedSeconds,
      correctCount,
      challengesList.length
    )
      .then((data) => setCompletionData(data))
      .catch(() => {});
  }

  if (!challenge) {
    return (
      <>
        {finishAudio}
        <Confetti
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10_000}
          width={width}
          height={height}
        />
        <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-y-4 text-center lg:gap-y-8">
          <Image
            src="/finish.svg"
            alt="Finish"
            className="hidden lg:block"
            height={100}
            width={100}
          />
          <Image
            src="/finish.svg"
            alt="Finish"
            className="block lg:hidden"
            height={100}
            width={100}
          />
          <h1 className="text-lg font-bold text-neutral-700 lg:text-3xl">
            Great job! <br /> You&apos;ve completed the lesson.
          </h1>

          <div className="flex w-full items-center gap-x-4">
            <ResultCard variant="points" value={challengesList.length * 10} />
            <ResultCard variant="hearts" value={hearts} />
          </div>

          {/* Time and score info */}
          <div className="flex w-full items-center justify-center gap-x-6 text-muted-foreground">
            <div className="flex items-center gap-x-2">
              <span className="text-sm">Time:</span>
              <span className="font-bold text-[#1a237e]">
                {formatTime(elapsedSeconds)}
              </span>
            </div>
            <div className="flex items-center gap-x-2">
              <span className="text-sm">Score:</span>
              <span className="font-bold text-[#1a237e]">
                {correctCount}/{challengesList.length}
              </span>
            </div>
            {completionData?.streak && completionData.streak.isNewStreak && (
              <div className="flex items-center gap-x-2">
                <span className="text-sm">Streak:</span>
                <span className="font-bold text-[#ff6d00]">
                  {completionData.streak.currentStreak} days
                </span>
              </div>
            )}
          </div>

          <ShareScore
            score={correctCount}
            total={challengesList.length}
            streak={completionData?.streak?.currentStreak}
          />
        </div>

        <Footer
          lessonId={lessonId}
          status="completed"
          onCheck={() => router.push("/learn")}
        />
      </>
    );
  }

  const title =
    challenge.type === "ASSIST"
      ? "Select the correct meaning"
      : challenge.question;

  return (
    <>
      {incorrectAudio}
      {correctAudio}
      <Header hearts={hearts} percentage={percentage} timerText={formatTime(elapsedSeconds)} />

      <div className="flex-1">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-y-12 px-6 lg:min-h-[350px] lg:w-[600px] lg:px-0">
            <h1 className="text-center text-lg font-bold text-neutral-700 lg:text-start lg:text-3xl">
              {title}
            </h1>

            <div>
              {challenge.type === "ASSIST" && (
                <QuestionBubble question={challenge.question} />
              )}
              <Challenge
                options={options}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOption}
                disabled={pending}
                type={challenge.type}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer
        disabled={pending || !selectedOption}
        status={status}
        onCheck={onContinue}
        explanation={
          status !== "none" ? (challenge.explanation ?? undefined) : undefined
        }
        oldSection={
          status !== "none" ? (challenge.oldSection ?? undefined) : undefined
        }
        newSection={
          status !== "none" ? (challenge.newSection ?? undefined) : undefined
        }
      />
    </>
  );
};

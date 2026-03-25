"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { lessonCompletions } from "@/db/schema";

import { updateStreak } from "./streak";

export const recordLessonCompletion = async (
  lessonId: number,
  timeTakenSeconds: number,
  score: number,
  totalQuestions: number
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  // Record completion
  await db.insert(lessonCompletions).values({
    userId,
    lessonId,
    timeTakenSeconds,
    score,
    totalQuestions,
  });

  // Update streak
  const streakResult = await updateStreak();

  revalidatePath("/learn");
  revalidatePath("/leaderboard");

  return {
    timeTakenSeconds,
    score,
    totalQuestions,
    streak: streakResult,
  };
};

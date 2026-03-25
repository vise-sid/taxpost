"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { challengeRepetition } from "@/db/schema";

// Box intervals in days
const BOX_INTERVALS: Record<number, number> = {
  1: 0,  // Every session
  2: 1,  // After 1 day
  3: 3,  // After 3 days
  4: 7,  // After 7 days
  5: 14, // After 14 days (mastered)
};

function getNextReviewDate(boxNumber: number): Date {
  const now = new Date();
  const days = BOX_INTERVALS[boxNumber] ?? 0;
  now.setDate(now.getDate() + days);
  return now;
}

export const updateRepetition = async (
  challengeId: number,
  isCorrect: boolean
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const existing = await db.query.challengeRepetition.findFirst({
    where: and(
      eq(challengeRepetition.userId, userId),
      eq(challengeRepetition.challengeId, challengeId)
    ),
  });

  if (!existing) {
    // First time seeing this question
    const newBox = isCorrect ? 2 : 1;
    await db.insert(challengeRepetition).values({
      userId,
      challengeId,
      boxNumber: newBox,
      timesCorrect: isCorrect ? 1 : 0,
      timesWrong: isCorrect ? 0 : 1,
      lastReviewed: new Date(),
      nextReview: getNextReviewDate(newBox),
    });
    return { boxNumber: newBox };
  }

  let newBox: number;
  if (isCorrect) {
    // Move up a box (max 5)
    newBox = Math.min(existing.boxNumber + 1, 5);
  } else {
    // Wrong answer: back to box 1
    newBox = 1;
  }

  await db
    .update(challengeRepetition)
    .set({
      boxNumber: newBox,
      timesCorrect: isCorrect
        ? existing.timesCorrect + 1
        : existing.timesCorrect,
      timesWrong: isCorrect ? existing.timesWrong : existing.timesWrong + 1,
      lastReviewed: new Date(),
      nextReview: getNextReviewDate(newBox),
    })
    .where(eq(challengeRepetition.id, existing.id));

  return { boxNumber: newBox };
};

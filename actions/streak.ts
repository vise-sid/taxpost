"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { userStreaks } from "@/db/schema";

export const updateStreak = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const existingStreak = await db.query.userStreaks.findFirst({
    where: eq(userStreaks.userId, userId),
  });

  if (!existingStreak) {
    // First ever lesson completion
    await db.insert(userStreaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastCompletedDate: today,
    });
    revalidatePath("/learn");
    return { currentStreak: 1, isNewStreak: true };
  }

  const lastDate = existingStreak.lastCompletedDate;

  // Already completed today
  if (lastDate === today) {
    return { currentStreak: existingStreak.currentStreak, isNewStreak: false };
  }

  // Check if yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak: number;
  if (lastDate === yesterdayStr) {
    // Continue streak
    newStreak = existingStreak.currentStreak + 1;
  } else {
    // Streak broken, start fresh
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, existingStreak.longestStreak);

  await db
    .update(userStreaks)
    .set({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastCompletedDate: today,
      updatedAt: new Date(),
    })
    .where(eq(userStreaks.userId, userId));

  revalidatePath("/learn");
  return { currentStreak: newStreak, isNewStreak: true };
};

export const useStreakFreeze = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const streak = await db.query.userStreaks.findFirst({
    where: eq(userStreaks.userId, userId),
  });

  if (!streak || !streak.streakFreezeAvailable) {
    return { error: "No streak freeze available." };
  }

  const today = new Date().toISOString().split("T")[0];

  await db
    .update(userStreaks)
    .set({
      lastCompletedDate: today,
      streakFreezeAvailable: false,
      updatedAt: new Date(),
    })
    .where(eq(userStreaks.userId, userId));

  revalidatePath("/learn");
  return { success: true };
};

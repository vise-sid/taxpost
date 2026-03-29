"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";

import db from "@/db/drizzle";
import { lessons, units, unitTierProgress } from "@/db/schema";

/**
 * Ensure ALL tiers (1, 2, 3) of ALL units in a course are unlocked for the user.
 * No locking — everything is accessible from the start.
 */
export const ensureDefaultTierUnlocks = async (courseId: number) => {
  const { userId } = await auth();
  if (!userId) return;

  const allUnits = await db.query.units.findMany({
    where: eq(units.courseId, courseId),
  });

  if (allUnits.length === 0) return;

  // Get all existing tier progress for this user
  const existingProgress = await db.query.unitTierProgress.findMany({
    where: eq(unitTierProgress.userId, userId),
  });

  const existingSet = new Set(
    existingProgress.map((p) => `${p.unitId}:${p.tier}`)
  );

  // Unlock all 3 tiers for every unit
  const toInsert: { userId: string; unitId: number; tier: number; unlockedAt: Date }[] = [];

  for (const unit of allUnits) {
    for (const tier of [1, 2, 3]) {
      if (!existingSet.has(`${unit.id}:${tier}`)) {
        toInsert.push({
          userId,
          unitId: unit.id,
          tier,
          unlockedAt: new Date(),
        });
      }
    }
  }

  if (toInsert.length > 0) {
    await db.insert(unitTierProgress).values(toInsert);
  }
};

/**
 * Update tier progress after a lesson is completed.
 * Tracks completion stats — no locking/unlocking needed since everything is open.
 */
export const updateTierProgress = async (
  lessonId: number,
  score: number,
  totalQuestions: number
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: { unit: true },
  });

  if (!lesson) throw new Error("Lesson not found.");

  const { unitId, tier } = lesson;

  // Upsert tier progress
  const existing = await db.query.unitTierProgress.findFirst({
    where: and(
      eq(unitTierProgress.userId, userId),
      eq(unitTierProgress.unitId, unitId),
      eq(unitTierProgress.tier, tier)
    ),
  });

  if (existing) {
    await db
      .update(unitTierProgress)
      .set({
        lessonsCompleted: sql`${unitTierProgress.lessonsCompleted} + 1`,
        totalCorrect: sql`${unitTierProgress.totalCorrect} + ${score}`,
        totalQuestions: sql`${unitTierProgress.totalQuestions} + ${totalQuestions}`,
      })
      .where(eq(unitTierProgress.id, existing.id));
  } else {
    await db.insert(unitTierProgress).values({
      userId,
      unitId,
      tier,
      lessonsCompleted: 1,
      totalCorrect: score,
      totalQuestions,
      unlockedAt: new Date(),
    });
  }

  // Re-fetch updated progress
  const progress = await db.query.unitTierProgress.findFirst({
    where: and(
      eq(unitTierProgress.userId, userId),
      eq(unitTierProgress.unitId, unitId),
      eq(unitTierProgress.tier, tier)
    ),
  });

  if (!progress) return null;

  // Count total lessons in this unit+tier
  const tierLessons = await db.query.lessons.findMany({
    where: and(eq(lessons.unitId, unitId), eq(lessons.tier, tier)),
  });
  const totalLessonsInTier = tierLessons.length;

  const accuracy =
    progress.totalQuestions > 0
      ? Math.round((progress.totalCorrect / progress.totalQuestions) * 100)
      : 0;

  // Mark tier as completed if all lessons done (no accuracy gating)
  let tierJustCompleted = false;
  let unitMastered = false;

  if (
    progress.lessonsCompleted >= totalLessonsInTier &&
    !progress.completedAt
  ) {
    await db
      .update(unitTierProgress)
      .set({ completedAt: new Date() })
      .where(eq(unitTierProgress.id, progress.id));

    tierJustCompleted = true;

    if (tier === 3) {
      unitMastered = true;
    }
  }

  return {
    tier,
    lessonsCompleted: progress.lessonsCompleted,
    totalLessonsInTier,
    accuracy,
    tierJustUnlocked: null, // No locking — everything is always unlocked
    unitMastered,
  };
};

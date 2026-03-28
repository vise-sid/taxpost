"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";

import db from "@/db/drizzle";
import { lessons, units, unitTierProgress } from "@/db/schema";
import { TIER_ACCURACY_THRESHOLDS } from "@/constants";

/**
 * Ensure Tier 1 of the first unit in a course is unlocked for the user.
 * Called when a user selects a course or loads the learn page.
 */
export const ensureDefaultTierUnlocks = async (courseId: number) => {
  const { userId } = await auth();
  if (!userId) return;

  // Get the first unit (by order) in this course
  const firstUnit = await db.query.units.findFirst({
    where: eq(units.courseId, courseId),
    orderBy: (units, { asc }) => [asc(units.order)],
  });

  if (!firstUnit) return;

  // Check if tier 1 progress already exists
  const existing = await db.query.unitTierProgress.findFirst({
    where: and(
      eq(unitTierProgress.userId, userId),
      eq(unitTierProgress.unitId, firstUnit.id),
      eq(unitTierProgress.tier, 1)
    ),
  });

  if (!existing) {
    await db.insert(unitTierProgress).values({
      userId,
      unitId: firstUnit.id,
      tier: 1,
      unlockedAt: new Date(),
    });
  }
};

/**
 * Update tier progress after a lesson is completed.
 * Handles tier unlock logic:
 * - Tier 1 complete (≥80%) → unlock Tier 2 of same unit + Tier 1 of next unit
 * - Tier 2 complete (≥75%) → unlock Tier 3
 * - Tier 3 complete (≥70%) → mastery
 */
export const updateTierProgress = async (
  lessonId: number,
  score: number,
  totalQuestions: number
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  // Get the lesson's unit and tier
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

  // Calculate accuracy
  const accuracy =
    progress.totalQuestions > 0
      ? Math.round((progress.totalCorrect / progress.totalQuestions) * 100)
      : 0;

  let tierJustUnlocked: number | null = null;
  let unitMastered = false;

  // Check if tier is complete (all lessons done + accuracy threshold met)
  if (
    progress.lessonsCompleted >= totalLessonsInTier &&
    !progress.completedAt
  ) {
    const threshold = TIER_ACCURACY_THRESHOLDS[tier] ?? 70;

    if (accuracy >= threshold) {
      // Mark tier as completed
      await db
        .update(unitTierProgress)
        .set({ completedAt: new Date() })
        .where(eq(unitTierProgress.id, progress.id));

      if (tier < 3) {
        // Unlock next tier of same unit
        const nextTier = tier + 1;
        const existingNext = await db.query.unitTierProgress.findFirst({
          where: and(
            eq(unitTierProgress.userId, userId),
            eq(unitTierProgress.unitId, unitId),
            eq(unitTierProgress.tier, nextTier)
          ),
        });

        if (!existingNext) {
          await db.insert(unitTierProgress).values({
            userId,
            unitId,
            tier: nextTier,
            unlockedAt: new Date(),
          });
          tierJustUnlocked = nextTier;
        }
      }

      if (tier === 1) {
        // Also unlock Tier 1 of the next unit (by order in same course)
        const currentUnit = lesson.unit;
        const nextUnit = await db.query.units.findFirst({
          where: and(
            eq(units.courseId, currentUnit.courseId),
            sql`${units.order} > ${currentUnit.order}`
          ),
          orderBy: (units, { asc }) => [asc(units.order)],
        });

        if (nextUnit) {
          const existingNextUnit = await db.query.unitTierProgress.findFirst({
            where: and(
              eq(unitTierProgress.userId, userId),
              eq(unitTierProgress.unitId, nextUnit.id),
              eq(unitTierProgress.tier, 1)
            ),
          });

          if (!existingNextUnit) {
            await db.insert(unitTierProgress).values({
              userId,
              unitId: nextUnit.id,
              tier: 1,
              unlockedAt: new Date(),
            });
          }
        }
      }

      if (tier === 3) {
        unitMastered = true;
      }
    }
  }

  return {
    tier,
    lessonsCompleted: progress.lessonsCompleted,
    totalLessonsInTier,
    accuracy,
    tierJustUnlocked,
    unitMastered,
  };
};

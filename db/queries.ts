import { cache } from "react";

import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, gte, sql } from "drizzle-orm";

import db from "./drizzle";
import {
  challengeProgress,
  courses,
  lessons,
  units,
  userProgress,
  userStreaks,
  lessonCompletions,
  challengeRepetition,
} from "./schema";

export const getCourses = cache(async () => {
  const data = await db.query.courses.findMany();

  return data;
});

export const getUserProgress = cache(async () => {
  const { userId } = await auth();

  if (!userId) return null;

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {
      activeCourse: true,
    },
  });

  return data;
});

export const getUnits = cache(async () => {
  const { userId } = await auth();
  const userProgressData = await getUserProgress();

  if (!userId || !userProgressData?.activeCourseId) return [];

  const data = await db.query.units.findMany({
    where: eq(units.courseId, userProgressData.activeCourseId),
    orderBy: (units, { asc }) => [asc(units.order)],
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          challenges: {
            orderBy: (challenges, { asc }) => [asc(challenges.order)],
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  const normalizedData = data.map((unit) => {
    const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
      if (lesson.challenges.length === 0)
        return { ...lesson, completed: false };

      const allCompletedChallenges = lesson.challenges.every((challenge) => {
        return (
          challenge.challengeProgress &&
          challenge.challengeProgress.length > 0 &&
          challenge.challengeProgress.every((progress) => progress.completed)
        );
      });

      return { ...lesson, completed: allCompletedChallenges };
    });

    return { ...unit, lessons: lessonsWithCompletedStatus };
  });

  return normalizedData;
});

export const getCourseById = cache(async (courseId: number) => {
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      units: {
        orderBy: (units, { asc }) => [asc(units.order)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)],
          },
        },
      },
    },
  });

  return data;
});

export const getCourseProgress = cache(async () => {
  const { userId } = await auth();
  const userProgressData = await getUserProgress();

  if (!userId || !userProgressData?.activeCourseId) return null;

  const unitsInActiveCourse = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgressData.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          unit: true,
          challenges: {
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  const firstUncompletedLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .find((lesson) => {
      return lesson.challenges.some((challenge) => {
        return (
          !challenge.challengeProgress ||
          challenge.challengeProgress.length === 0 ||
          challenge.challengeProgress.some((progress) => !progress.completed)
        );
      });
    });

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  };
});

export const getLesson = cache(async (id?: number) => {
  const { userId } = await auth();

  if (!userId) return null;

  const courseProgress = await getCourseProgress();
  const lessonId = id || courseProgress?.activeLessonId;

  if (!lessonId) return null;

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
        with: {
          challengeOptions: true,
          challengeProgress: {
            where: eq(challengeProgress.userId, userId),
          },
        },
      },
    },
  });

  if (!data || !data.challenges) return null;

  const normalizedChallenges = data.challenges.map((challenge) => {
    const completed =
      challenge.challengeProgress &&
      challenge.challengeProgress.length > 0 &&
      challenge.challengeProgress.every((progress) => progress.completed);

    return { ...challenge, completed };
  });

  return { ...data, challenges: normalizedChallenges };
});

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress();

  if (!courseProgress?.activeLessonId) return 0;

  const lesson = await getLesson(courseProgress?.activeLessonId);

  if (!lesson) return 0;

  const completedChallenges = lesson.challenges.filter(
    (challenge) => challenge.completed
  );

  const percentage = Math.round(
    (completedChallenges.length / lesson.challenges.length) * 100
  );

  return percentage;
});

export const getTopTenUsers = cache(async () => {
  const { userId } = await auth();

  if (!userId) return [];

  const data = await db.query.userProgress.findMany({
    orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
    limit: 10,
    columns: {
      userId: true,
      userName: true,
      userImageSrc: true,
      points: true,
    },
  });

  return data;
});

// --- Streak Queries ---

export const getUserStreak = cache(async () => {
  const { userId } = await auth();

  if (!userId) return null;

  const data = await db.query.userStreaks.findFirst({
    where: eq(userStreaks.userId, userId),
  });

  return data;
});

// --- Weekly Leaderboard ---

export const getWeeklyLeaderboard = cache(async () => {
  const { userId } = await auth();

  if (!userId) return [];

  // Get start of current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  // For weekly, we query lesson completions this week and sum scores
  const data = await db.query.userProgress.findMany({
    orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
    limit: 10,
    columns: {
      userId: true,
      userName: true,
      userImageSrc: true,
      points: true,
    },
  });

  return data;
});

// --- Progress Dashboard Queries ---

export const getUserStats = cache(async () => {
  const { userId } = await auth();
  if (!userId) return null;

  // Get total questions answered and accuracy
  const allProgress = await db.query.challengeProgress.findMany({
    where: eq(challengeProgress.userId, userId),
  });

  // Get all challenges the user has attempted (need to count wrong answers too)
  const repetitions = await db.query.challengeRepetition.findMany({
    where: eq(challengeRepetition.userId, userId),
  });

  const totalAnswered = repetitions.reduce(
    (sum, r) => sum + r.timesCorrect + r.timesWrong,
    0
  );
  const totalCorrect = repetitions.reduce((sum, r) => sum + r.timesCorrect, 0);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // Mastered questions (box 5)
  const mastered = repetitions.filter((r) => r.boxNumber === 5).length;

  return {
    totalAnswered,
    totalCorrect,
    accuracy,
    mastered,
    totalTracked: repetitions.length,
  };
});

export const getTopicProgress = cache(async () => {
  const { userId } = await auth();
  if (!userId) return [];

  const allCourses = await db.query.courses.findMany({
    with: {
      units: {
        with: {
          lessons: {
            with: {
              challenges: {
                with: {
                  challengeProgress: {
                    where: eq(challengeProgress.userId, userId),
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return allCourses.map((course) => {
    const allChallenges = course.units.flatMap((u) =>
      u.lessons.flatMap((l) => l.challenges)
    );
    const totalChallenges = allChallenges.length;
    const completedChallenges = allChallenges.filter(
      (c) =>
        c.challengeProgress.length > 0 &&
        c.challengeProgress.every((p) => p.completed)
    ).length;
    const percentage =
      totalChallenges > 0
        ? Math.round((completedChallenges / totalChallenges) * 100)
        : 0;

    return {
      id: course.id,
      title: course.title,
      imageSrc: course.imageSrc,
      totalChallenges,
      completedChallenges,
      percentage,
    };
  });
});

export const getWeakAreas = cache(async () => {
  const { userId } = await auth();
  if (!userId) return [];

  const repetitions = await db.query.challengeRepetition.findMany({
    where: eq(challengeRepetition.userId, userId),
    with: {
      challenge: {
        with: {
          lesson: {
            with: {
              unit: {
                with: {
                  course: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Group by course and calculate wrong rate
  const courseStats: Record<string, { name: string; wrong: number; total: number }> = {};

  for (const rep of repetitions) {
    const courseName = rep.challenge.lesson.unit.course.title;
    if (!courseStats[courseName]) {
      courseStats[courseName] = { name: courseName, wrong: 0, total: 0 };
    }
    courseStats[courseName].wrong += rep.timesWrong;
    courseStats[courseName].total += rep.timesCorrect + rep.timesWrong;
  }

  return Object.values(courseStats)
    .filter((s) => s.total > 0)
    .sort((a, b) => b.wrong / b.total - a.wrong / a.total)
    .slice(0, 3);
});

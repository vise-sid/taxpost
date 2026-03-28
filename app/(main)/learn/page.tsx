import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import {
  getCourseProgress,
  getLessonPercentage,
  getUnits,
  getUnitTierProgress,
  getUserProgress,
  getUserStreak,
} from "@/db/queries";
import { ensureDefaultTierUnlocks } from "@/actions/tier-progress";

import { StickyUnitHeader } from "./sticky-unit-header";
import { Unit } from "./unit";

const LearnPage = async () => {
  const userProgressData = getUserProgress();
  const courseProgressData = getCourseProgress();
  const lessonPercentageData = getLessonPercentage();
  const unitsData = getUnits();
  const streakData = getUserStreak();
  const tierProgressData = getUnitTierProgress();

  const [userProgress, units, courseProgress, lessonPercentage, streak, tierProgress] =
    await Promise.all([
      userProgressData,
      unitsData,
      courseProgressData,
      lessonPercentageData,
      streakData,
      tierProgressData,
    ]);

  if (!courseProgress || !userProgress || !userProgress.activeCourse)
    redirect("/courses");

  // Ensure first unit's Tier 1 is unlocked
  await ensureDefaultTierUnlocks(userProgress.activeCourse.id);

  // Build a lookup: unitId -> tier progress array
  const tierProgressByUnit = new Map<number, typeof tierProgress>();
  for (const tp of tierProgress) {
    const existing = tierProgressByUnit.get(tp.unitId) ?? [];
    existing.push(tp);
    tierProgressByUnit.set(tp.unitId, existing);
  }

  const unitInfos = units.map((u) => ({
    id: u.id,
    order: u.order,
    title: u.title,
    description: u.description,
  }));

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6 lg:px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          streak={streak?.currentStreak ?? 0}
        />
        <Quests points={userProgress.points} />
      </StickyWrapper>
      <FeedWrapper>
        <StickyUnitHeader units={unitInfos} courseName={userProgress.activeCourse.title} />
        {units.map((unit, index) => (
          <div key={unit.id} data-unit-id={unit.id} className="mb-2">
            <Unit
              id={unit.id}
              order={unit.order}
              description={unit.description}
              title={unit.title}
              isFirst={index === 0}
              lessons={unit.lessons}
              activeLesson={courseProgress.activeLesson}
              activeLessonPercentage={lessonPercentage}
              tierProgress={tierProgressByUnit.get(unit.id) ?? []}
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  );
};

export default LearnPage;

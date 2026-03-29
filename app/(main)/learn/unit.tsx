import { lessons, units, unitTierProgress } from "@/db/schema";
import { TIER_LABELS } from "@/constants";

import { LessonButton } from "./lesson-button";
import { TierBadge } from "./tier-badge";
import { UnitBanner } from "./unit-banner";

type UnitProps = {
  id: number;
  order: number;
  title: string;
  description: string;
  isFirst?: boolean;
  lessons: (typeof lessons.$inferSelect & {
    completed: boolean;
  })[];
  activeLesson:
    | (typeof lessons.$inferSelect & {
        unit: typeof units.$inferSelect;
      })
    | undefined;
  activeLessonPercentage: number;
  tierProgress: (typeof unitTierProgress.$inferSelect)[];
};

export const Unit = ({
  title,
  description,
  isFirst,
  lessons: allLessons,
  activeLesson,
  activeLessonPercentage,
  tierProgress,
}: UnitProps) => {
  // Group lessons by tier
  const lessonsByTier = new Map<number, typeof allLessons>();
  for (const lesson of allLessons) {
    const tier = lesson.tier ?? 1;
    const existing = lessonsByTier.get(tier) ?? [];
    existing.push(lesson);
    lessonsByTier.set(tier, existing);
  }

  // Build tier progress lookup
  const tierProgressMap = new Map<number, (typeof tierProgress)[0]>();
  for (const tp of tierProgress) {
    tierProgressMap.set(tp.tier, tp);
  }

  // Build a flat ordered list of all lessons to determine sequential locking
  const allLessonsFlat = allLessons.sort((a, b) => {
    const tierDiff = (a.tier ?? 1) - (b.tier ?? 1);
    if (tierDiff !== 0) return tierDiff;
    return a.order - b.order;
  });

  // Find the first uncompleted lesson — that's the "active" one.
  // Everything before it (completed) is unlocked. The active one is unlocked.
  // Everything after it is locked.
  const activeIndex = allLessonsFlat.findIndex(
    (l) => l.id === activeLesson?.id
  );
  const unlockedIds = new Set<number>();
  for (let i = 0; i < allLessonsFlat.length; i++) {
    const lesson = allLessonsFlat[i];
    if (lesson.completed || i === activeIndex || activeIndex === -1) {
      // Completed lessons and the current active lesson are unlocked.
      // If no active lesson in this unit (activeIndex === -1), check if
      // all lessons are completed or if this unit is entirely ahead.
      if (lesson.completed) {
        unlockedIds.add(lesson.id);
      } else if (i === activeIndex) {
        unlockedIds.add(lesson.id);
      }
    }
  }
  // If all lessons are completed, unlock everything
  if (allLessonsFlat.every((l) => l.completed)) {
    for (const l of allLessonsFlat) unlockedIds.add(l.id);
  }

  const tiers = [1, 2, 3] as const;

  return (
    <>
      <UnitBanner title={title} description={description} isFirst={isFirst} />

      {tiers.map((tier) => {
        const tierLessons = lessonsByTier.get(tier) ?? [];
        if (tierLessons.length === 0) return null;

        const tp = tierProgressMap.get(tier);
        const isCompleted = !!tp?.completedAt;
        const label = TIER_LABELS[tier] ?? `Tier ${tier}`;

        // Calculate completion percentage for this tier
        const completedCount = tierLessons.filter((l) => l.completed).length;
        const totalCount = tierLessons.length;
        const percentage =
          totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return (
          <div key={tier}>
            <TierBadge
              tier={tier}
              label={label}
              isUnlocked={true}
              isCompleted={isCompleted}
              percentage={percentage}
              completedCount={completedCount}
              totalCount={totalCount}
            />

            <div className="relative flex flex-col items-center">
              {tierLessons.map((lesson, i) => {
                const isCurrent = lesson.id === activeLesson?.id;
                const isLocked = !unlockedIds.has(lesson.id);

                return (
                  <LessonButton
                    key={lesson.id}
                    id={lesson.id}
                    index={i}
                    totalCount={tierLessons.length - 1}
                    current={isCurrent}
                    locked={isLocked}
                    completed={lesson.completed}
                    percentage={activeLessonPercentage}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
};

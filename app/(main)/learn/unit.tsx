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

                return (
                  <LessonButton
                    key={lesson.id}
                    id={lesson.id}
                    index={i}
                    totalCount={tierLessons.length - 1}
                    current={isCurrent}
                    locked={false}
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

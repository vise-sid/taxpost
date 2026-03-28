import { Lock } from "lucide-react";

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

  // Determine if this unit has any unlocked tiers
  const hasAnyUnlockedTier = tierProgress.some((tp) => tp.unlockedAt);

  const tiers = [1, 2, 3] as const;

  return (
    <>
      <UnitBanner title={title} description={description} />

      {tiers.map((tier) => {
        const tierLessons = lessonsByTier.get(tier) ?? [];
        if (tierLessons.length === 0 && !hasAnyUnlockedTier) return null;

        const tp = tierProgressMap.get(tier);
        const isUnlocked = !!tp?.unlockedAt;
        const isCompleted = !!tp?.completedAt;
        const label = TIER_LABELS[tier] ?? `Tier ${tier}`;

        // Calculate completion percentage for this tier
        const completedCount = tierLessons.filter((l) => l.completed).length;
        const totalCount = tierLessons.length;
        const percentage =
          totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        // If tier has no lessons seeded yet, show as coming soon
        if (tierLessons.length === 0) {
          return (
            <div key={tier} className="mt-4">
              <TierBadge
                tier={tier}
                label={label}
                isUnlocked={false}
                isCompleted={false}
                percentage={0}
                completedCount={0}
                totalCount={0}
              />
            </div>
          );
        }

        // Locked tier
        if (!isUnlocked) {
          return (
            <div key={tier} className="mt-4">
              <TierBadge
                tier={tier}
                label={label}
                isUnlocked={false}
                isCompleted={false}
                percentage={0}
                completedCount={0}
                totalCount={totalCount}
              />
            </div>
          );
        }

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

            {/* Show lesson buttons for unlocked tiers */}
            <div className="relative flex flex-col items-center">
              {tierLessons.map((lesson, i) => {
                const isCurrent = lesson.id === activeLesson?.id;
                const isLocked = !lesson.completed && !isCurrent;

                return (
                  <LessonButton
                    key={lesson.id}
                    id={lesson.id}
                    index={i}
                    totalCount={tierLessons.length - 1}
                    current={isCurrent}
                    locked={isLocked}
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

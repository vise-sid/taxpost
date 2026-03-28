import { Check, Lock, Star, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";

type TierBadgeProps = {
  tier: number;
  label: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  percentage: number;
  completedCount: number;
  totalCount: number;
};

const tierColors: Record<number, { bg: string; border: string; text: string; bar: string }> = {
  1: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    bar: "bg-blue-500",
  },
  2: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    bar: "bg-amber-500",
  },
  3: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    bar: "bg-emerald-500",
  },
};

export const TierBadge = ({
  tier,
  label,
  isUnlocked,
  isCompleted,
  percentage,
  completedCount,
  totalCount,
}: TierBadgeProps) => {
  const colors = tierColors[tier] ?? tierColors[1];

  if (!isUnlocked) {
    return (
      <div className="mt-6 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <Lock className="h-5 w-5 text-gray-400" />
        <div>
          <p className="text-sm font-semibold text-gray-400">
            Tier {tier}: {label}
          </p>
          {totalCount > 0 && (
            <p className="text-xs text-gray-400">
              Complete the previous tier to unlock
            </p>
          )}
          {totalCount === 0 && (
            <p className="text-xs text-gray-400">Coming soon</p>
          )}
        </div>
      </div>
    );
  }

  const Icon = isCompleted ? Check : tier === 3 ? Trophy : Star;

  return (
    <div
      className={cn(
        "mt-6 rounded-lg border px-4 py-3",
        isCompleted ? "border-green-200 bg-green-50" : `${colors.border} ${colors.bg}`
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              "h-5 w-5",
              isCompleted ? "text-green-600" : colors.text
            )}
          />
          <span
            className={cn(
              "text-sm font-semibold",
              isCompleted ? "text-green-700" : colors.text
            )}
          >
            {label}
          </span>
          {isCompleted && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Complete
            </span>
          )}
        </div>
        {totalCount > 0 && (
          <span
            className={cn(
              "text-xs font-medium",
              isCompleted ? "text-green-600" : "text-gray-500"
            )}
          >
            {completedCount}/{totalCount}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {!isCompleted && totalCount > 0 && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={cn("h-full rounded-full transition-all", colors.bar)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
};

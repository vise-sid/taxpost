import { Check, Lightbulb, Brain, Zap, Lock } from "lucide-react";

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

const tierConfig: Record<number, { icon: typeof Lightbulb; color: string; lineColor: string }> = {
  1: { icon: Lightbulb, color: "text-blue-500", lineColor: "bg-blue-200" },
  2: { icon: Brain, color: "text-amber-500", lineColor: "bg-amber-200" },
  3: { icon: Zap, color: "text-emerald-500", lineColor: "bg-emerald-200" },
};

export const TierBadge = ({
  tier,
  label,
  isUnlocked,
  isCompleted,
  completedCount,
  totalCount,
}: TierBadgeProps) => {
  const config = tierConfig[tier] ?? tierConfig[1];

  // Locked tier
  if (!isUnlocked) {
    return (
      <div className="flex items-center gap-3 py-4">
        <div className="h-[1px] flex-1 bg-gray-200" />
        <Lock className="h-4 w-4 text-gray-300" />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
          {label}
        </span>
        {totalCount === 0 && (
          <span className="text-[10px] text-gray-300">Coming soon</span>
        )}
        <div className="h-[1px] flex-1 bg-gray-200" />
      </div>
    );
  }

  // Completed tier
  if (isCompleted) {
    return (
      <div className="flex items-center gap-3 py-4">
        <div className="h-[1px] flex-1 bg-green-200" />
        <Check className="h-4 w-4 text-green-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-green-500">
          {label}
        </span>
        <span className="text-[10px] font-medium text-green-400">
          {completedCount}/{totalCount}
        </span>
        <div className="h-[1px] flex-1 bg-green-200" />
      </div>
    );
  }

  // Unlocked (active) tier
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 py-4">
      <div className={cn("h-[1px] flex-1", config.lineColor)} />
      <Icon className={cn("h-4 w-4", config.color)} />
      <span className={cn("text-xs font-semibold uppercase tracking-wider", config.color)}>
        {label}
      </span>
      {totalCount > 0 && (
        <span className="text-[10px] font-medium text-gray-400">
          {completedCount}/{totalCount}
        </span>
      )}
      <div className={cn("h-[1px] flex-1", config.lineColor)} />
    </div>
  );
};

import { Flame } from "lucide-react";

import { cn } from "@/lib/utils";

type StreakCounterProps = {
  streak: number;
  className?: string;
};

export const StreakCounter = ({ streak, className }: StreakCounterProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-x-2 rounded-xl border-2 p-3",
        streak > 0 ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-gray-50",
        className
      )}
    >
      <Flame
        className={cn(
          "h-7 w-7",
          streak > 0 ? "text-[#ff6d00] fill-[#ff6d00]" : "text-gray-400"
        )}
      />
      <div className="flex flex-col">
        <span
          className={cn(
            "text-lg font-bold leading-tight",
            streak > 0 ? "text-[#ff6d00]" : "text-gray-400"
          )}
        >
          {streak}
        </span>
        <span className="text-xs text-muted-foreground">
          {streak === 1 ? "day streak" : "day streak"}
        </span>
      </div>
    </div>
  );
};

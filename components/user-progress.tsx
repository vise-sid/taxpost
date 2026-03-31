import { Flame } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { courses } from "@/db/schema";

type UserProgressProps = {
  activeCourse: typeof courses.$inferSelect;
  hearts: number;
  points: number;
  streak?: number;
};

export const UserProgress = ({
  activeCourse,
  hearts,
  points,
  streak = 0,
}: UserProgressProps) => {
  const hasStreak = streak > 0;

  return (
    <div className="flex w-full items-center justify-between gap-x-2">
      <Link href="/courses">
        <Button variant="ghost" className="gap-1">
          <Flame
            className={cn(
              "h-6 w-6",
              hasStreak
                ? "text-brand-orange fill-brand-orange animate-flame-flicker"
                : "text-gray-400"
            )}
          />
          <span
            className={cn(
              "text-sm font-bold",
              hasStreak ? "text-brand-orange" : "text-gray-400"
            )}
          >
            {streak}
          </span>
        </Button>
      </Link>

      <Link href="/settings">
        <Button variant="ghost" className="text-orange-500">
          <Image
            src="/points.svg"
            height={28}
            width={28}
            alt="Points"
            className="mr-2"
          />
          {points}
        </Button>
      </Link>

      <Link href="/settings">
        <Button variant="ghost" className="text-rose-500">
          <Image
            src="/heart.svg"
            height={22}
            width={22}
            alt="Hearts"
            className="mr-2"
          />
          {hearts}
        </Button>
      </Link>
    </div>
  );
};

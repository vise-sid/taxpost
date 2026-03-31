import { Flame } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { getUserProgress, getUserStreak } from "@/db/queries";

export const MobileHeader = async () => {
  const [userProgress, streak] = await Promise.all([
    getUserProgress(),
    getUserStreak(),
  ]);

  const hearts = userProgress?.hearts ?? 0;
  const points = userProgress?.points ?? 0;
  const streakCount = streak?.currentStreak ?? 0;
  const hasStreak = streakCount > 0;

  return (
    <nav className="fixed top-0 z-50 flex h-[50px] w-full items-center justify-between bg-white px-6 shadow-sm lg:hidden">
      <Link href="/courses" className="flex items-center gap-1.5">
        <Flame
          className={cn(
            "h-6 w-6",
            hasStreak
              ? "fill-brand-orange text-brand-orange"
              : "text-gray-300"
          )}
        />
        <span
          className={cn(
            "text-sm font-bold",
            hasStreak ? "text-brand-orange" : "text-gray-300"
          )}
        >
          {streakCount}
        </span>
      </Link>

      <Link href="/settings" className="flex items-center gap-1.5">
        <Image src="/points.svg" height={24} width={24} alt="Points" />
        <span className="text-sm font-bold text-brand-navy">{points}</span>
      </Link>

      <Link href="/settings" className="flex items-center gap-1.5">
        <Image src="/heart.svg" height={20} width={20} alt="Hearts" />
        <span className="text-sm font-bold text-rose-500">{hearts}</span>
      </Link>
    </nav>
  );
};

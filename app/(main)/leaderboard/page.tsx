import Image from "next/image";
import Link from "next/link";

import { getTopTenUsers, getUserProgress, getUserStreak } from "@/db/queries";

import { LeaderboardTabs } from "./tabs";

const LeaderboardPage = async () => {
  const [userProgress, leaderboard] = await Promise.all([
    getUserProgress(),
    getTopTenUsers(),
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
        <Image src="/leaderboard.svg" alt="Leaderboard" height={90} width={90} />
        <h1 className="text-2xl font-bold text-neutral-800">Leaderboard</h1>
        <p className="text-center text-muted-foreground">
          Select a course first to see how you rank.
        </p>
        <Link
          href="/courses"
          className="rounded-2xl bg-brand-navy px-8 py-3 font-bold uppercase tracking-wide text-white shadow-[0_4px_0_0] shadow-brand-navy/40 transition-all hover:brightness-110 active:translate-y-[2px] active:shadow-none"
        >
          Choose a Course
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6">
      <div className="mx-auto flex w-full max-w-[600px] flex-col items-center">
        <Image
          src="/leaderboard.svg"
          alt="Leaderboard"
          height={90}
          width={90}
        />
        <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">
          Leaderboard
        </h1>
        <p className="mb-6 text-center text-lg text-muted-foreground">
          See where you stand among fellow CAs.
        </p>

        <LeaderboardTabs
          leaderboard={leaderboard}
          currentUserId={userProgress.userId}
        />
      </div>
    </div>
  );
};

export default LeaderboardPage;

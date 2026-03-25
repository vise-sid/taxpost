import Image from "next/image";
import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { Quests } from "@/components/quests";
import { StreakCounter } from "@/components/streak-counter";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { getTopTenUsers, getUserProgress, getUserStreak } from "@/db/queries";

import { LeaderboardTabs } from "./tabs";

const LeaderboardPage = async () => {
  const userProgressData = getUserProgress();
  const leaderboardData = getTopTenUsers();
  const streakData = getUserStreak();
  const [userProgress, leaderboard, streak] = await Promise.all([
    userProgressData,
    leaderboardData,
    streakData,
  ]);

  if (!userProgress || !userProgress.activeCourse) redirect("/courses");

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
        />
        <StreakCounter streak={streak?.currentStreak ?? 0} />
        <Quests points={userProgress.points} />
      </StickyWrapper>

      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
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
      </FeedWrapper>
    </div>
  );
};

export default LeaderboardPage;

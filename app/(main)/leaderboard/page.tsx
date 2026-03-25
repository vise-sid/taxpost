import Image from "next/image";
import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { Quests } from "@/components/quests";
import { StreakCounter } from "@/components/streak-counter";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { UserProgress } from "@/components/user-progress";
import { getTopTenUsers, getUserProgress, getUserStreak } from "@/db/queries";

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

          <Separator className="mb-4 h-0.5 rounded-full" />
          {leaderboard.map((user, i) => {
            const isCurrentUser = user.userId === userProgress.userId;
            return (
              <div
                key={user.userId}
                className={`flex w-full items-center rounded-xl p-2 px-4 ${
                  isCurrentUser
                    ? "bg-[#1a237e]/5 border border-[#1a237e]/20"
                    : "hover:bg-gray-200/50"
                }`}
              >
                <p
                  className={`mr-4 font-bold ${
                    i === 0
                      ? "text-yellow-500 text-xl"
                      : i === 1
                        ? "text-gray-400 text-lg"
                        : i === 2
                          ? "text-amber-700 text-lg"
                          : "text-[#1a237e]"
                  }`}
                >
                  {i + 1}
                </p>
                <Avatar className="ml-3 mr-6 h-12 w-12 border bg-[#1a237e]">
                  <AvatarImage
                    src={user.userImageSrc}
                    className="object-cover"
                  />
                </Avatar>
                <p className="flex-1 font-bold text-neutral-800">
                  {user.userName}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (you)
                    </span>
                  )}
                </p>
                <p className="text-muted-foreground">{user.points} XP</p>
              </div>
            );
          })}
        </div>
      </FeedWrapper>
    </div>
  );
};

export default LeaderboardPage;

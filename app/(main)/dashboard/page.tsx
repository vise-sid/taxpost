import { Flame, Target, Trophy, Zap } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StreakCounter } from "@/components/streak-counter";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { UserProgress } from "@/components/user-progress";
import {
  getTopicProgress,
  getUserProgress,
  getUserStats,
  getUserStreak,
  getWeakAreas,
} from "@/db/queries";

const DashboardPage = async () => {
  const userProgressData = getUserProgress();
  const streakData = getUserStreak();
  const statsData = getUserStats();
  const topicProgressData = getTopicProgress();
  const weakAreasData = getWeakAreas();

  const [userProgress, streak, stats, topicProgress, weakAreas] =
    await Promise.all([
      userProgressData,
      streakData,
      statsData,
      topicProgressData,
      weakAreasData,
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
      </StickyWrapper>

      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
          <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">
            Your Progress
          </h1>

          {/* Stats Grid */}
          <div className="mb-8 grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="flex flex-col items-center rounded-xl border-2 p-4">
              <Zap className="mb-2 h-8 w-8 text-[#ff6d00]" />
              <span className="text-2xl font-bold text-[#1a237e]">
                {userProgress.points}
              </span>
              <span className="text-xs text-muted-foreground">Total XP</span>
            </div>

            <div className="flex flex-col items-center rounded-xl border-2 p-4">
              <Flame className="mb-2 h-8 w-8 text-[#ff6d00]" />
              <span className="text-2xl font-bold text-[#1a237e]">
                {streak?.currentStreak ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">Day Streak</span>
            </div>

            <div className="flex flex-col items-center rounded-xl border-2 p-4">
              <Target className="mb-2 h-8 w-8 text-[#2e7d32]" />
              <span className="text-2xl font-bold text-[#1a237e]">
                {stats?.accuracy ?? 0}%
              </span>
              <span className="text-xs text-muted-foreground">Accuracy</span>
            </div>

            <div className="flex flex-col items-center rounded-xl border-2 p-4">
              <Trophy className="mb-2 h-8 w-8 text-yellow-500" />
              <span className="text-2xl font-bold text-[#1a237e]">
                {stats?.mastered ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">Mastered</span>
            </div>
          </div>

          {/* Longest streak */}
          {streak && streak.longestStreak > 0 && (
            <p className="mb-6 text-sm text-muted-foreground">
              Longest streak: <span className="font-bold text-[#ff6d00]">{streak.longestStreak} days</span>
            </p>
          )}

          <Separator className="mb-6 h-0.5 rounded-full" />

          {/* Topic Progress */}
          <h2 className="mb-4 w-full text-lg font-bold text-neutral-700">
            Topic Progress
          </h2>

          <div className="mb-8 flex w-full flex-col gap-y-4">
            {topicProgress.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center gap-x-4 rounded-xl border-2 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a237e]/10">
                  <span className="text-sm font-bold text-[#1a237e]">
                    {topic.title.charAt(0)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-neutral-700">
                      {topic.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {topic.completedChallenges}/{topic.totalChallenges}
                    </p>
                  </div>
                  <Progress value={topic.percentage} className="h-2" />
                </div>
                <span className="text-sm font-bold text-[#1a237e]">
                  {topic.percentage}%
                </span>
              </div>
            ))}
          </div>

          {/* Weak Areas */}
          {weakAreas.length > 0 && (
            <>
              <Separator className="mb-6 h-0.5 rounded-full" />
              <h2 className="mb-4 w-full text-lg font-bold text-neutral-700">
                Weak Areas
              </h2>
              <p className="mb-4 w-full text-sm text-muted-foreground">
                Topics where you get the most wrong answers. Focus here!
              </p>

              <div className="mb-8 flex w-full flex-col gap-y-3">
                {weakAreas.map((area) => {
                  const wrongRate =
                    area.total > 0
                      ? Math.round((area.wrong / area.total) * 100)
                      : 0;
                  return (
                    <div
                      key={area.name}
                      className="flex items-center justify-between rounded-xl border-2 border-rose-200 bg-rose-50 p-4"
                    >
                      <p className="font-medium text-rose-700">{area.name}</p>
                      <p className="text-sm text-rose-500">
                        {wrongRate}% wrong ({area.wrong}/{area.total})
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </FeedWrapper>
    </div>
  );
};

export default DashboardPage;

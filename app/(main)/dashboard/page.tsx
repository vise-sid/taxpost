import { Flame, Target, Trophy, Zap } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
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
          streak={streak?.currentStreak ?? 0}
        />
      </StickyWrapper>

      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
          <h1 className="my-6 text-center text-2xl font-bold text-brand-navy">
            Your Progress
          </h1>

          {/* Stats Grid */}
          <div className="mb-8 grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
            <div
              className="animate-fade-in flex flex-col items-center rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              style={{ animationDelay: "0s" }}
            >
              <Zap className="mb-2 h-8 w-8 text-brand-orange" />
              <span className="text-2xl font-bold text-brand-navy">
                {userProgress.points}
              </span>
              <span className="text-xs text-muted-foreground">Total XP</span>
            </div>

            <div
              className="animate-fade-in flex flex-col items-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              style={{ animationDelay: "0.1s" }}
            >
              <Flame className="mb-2 h-8 w-8 text-brand-orange" />
              <span className="text-2xl font-bold text-brand-navy">
                {streak?.currentStreak ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">Day Streak</span>
            </div>

            <div
              className="animate-fade-in flex flex-col items-center rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              style={{ animationDelay: "0.2s" }}
            >
              <Target className="mb-2 h-8 w-8 text-emerald-500" />
              <span className="text-2xl font-bold text-brand-navy">
                {stats?.accuracy ?? 0}%
              </span>
              <span className="text-xs text-muted-foreground">Accuracy</span>
            </div>

            <div
              className="animate-fade-in flex flex-col items-center rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              style={{ animationDelay: "0.3s" }}
            >
              <Trophy className="mb-2 h-8 w-8 text-yellow-500" />
              <span className="text-2xl font-bold text-brand-navy">
                {stats?.mastered ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">Mastered</span>
            </div>
          </div>

          {/* Longest streak */}
          {streak && streak.longestStreak > 0 && (
            <p className="mb-6 text-sm text-muted-foreground">
              Longest streak:{" "}
              <span className="font-bold text-brand-orange">
                {streak.longestStreak} days
              </span>
            </p>
          )}

          <Separator className="mb-6 h-0.5 rounded-full" />

          {/* Topic Progress */}
          <h2 className="mb-4 w-full text-lg font-bold text-brand-navy">
            Topic Progress
          </h2>

          <div className="mb-8 flex w-full flex-col gap-y-4">
            {topicProgress.map((topic, index) => (
              <div
                key={topic.id}
                className="animate-fade-in flex items-center gap-x-4 rounded-xl border-2 p-4"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-navy/10">
                  <span className="text-sm font-bold text-brand-navy">
                    {topic.title.charAt(0)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-brand-navy">
                      {topic.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {topic.completedChallenges}/{topic.totalChallenges}
                    </p>
                  </div>
                  <Progress value={topic.percentage} className="h-2" />
                </div>
                <span className="text-sm font-bold text-brand-navy">
                  {topic.percentage}%
                </span>
              </div>
            ))}
          </div>

          {/* Weak Areas */}
          {weakAreas.length > 0 && (
            <>
              <Separator className="mb-6 h-0.5 rounded-full" />
              <h2 className="mb-4 w-full text-lg font-bold text-brand-navy">
                Weak Areas
              </h2>
              <p className="mb-4 w-full text-sm text-muted-foreground">
                Topics where you get the most wrong answers. Focus here!
              </p>

              <div className="mb-8 flex w-full flex-col gap-y-3">
                {weakAreas.map((area, index) => {
                  const wrongRate =
                    area.total > 0
                      ? Math.round((area.wrong / area.total) * 100)
                      : 0;
                  return (
                    <div
                      key={area.name}
                      className="animate-fade-in flex items-center justify-between rounded-xl border-2 border-rose-200 bg-rose-50 p-4"
                      style={{ animationDelay: `${0.05 * index}s` }}
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

import { Flame, Target, Trophy, Zap } from "lucide-react";
import Link from "next/link";

import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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

  if (!userProgress || !userProgress.activeCourse) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
        <Target className="h-20 w-20 text-brand-navy/20" />
        <h1 className="text-2xl font-bold text-neutral-800">Your Progress</h1>
        <p className="text-center text-muted-foreground">
          Select a course first to start tracking your progress.
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

          <div className="mb-8 flex w-full flex-col gap-y-2">
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
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-bold text-brand-navy">
                      {topic.title}
                    </p>
                    <span className="ml-2 shrink-0 text-sm font-bold text-brand-navy">
                      {topic.percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {topic.completedChallenges}/{topic.totalChallenges} challenges
                  </p>
                  <Progress value={topic.percentage} className="mt-1 h-2" />
                </div>
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
    </div>
  );
};

export default DashboardPage;

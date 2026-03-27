"use client";

import { useState } from "react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type LeaderboardUser = {
  userId: string;
  userName: string;
  userImageSrc: string;
  points: number;
};

type LeaderboardTabsProps = {
  leaderboard: LeaderboardUser[];
  currentUserId: string;
};

export const LeaderboardTabs = ({
  leaderboard,
  currentUserId,
}: LeaderboardTabsProps) => {
  const [activeTab, setActiveTab] = useState<"all" | "weekly">("all");

  const topThree = leaderboard.length >= 3 ? leaderboard.slice(0, 3) : null;
  const restUsers = topThree ? leaderboard.slice(3) : leaderboard;

  return (
    <div className="w-full">
      {/* Tab buttons */}
      <div className="mb-4 flex w-full overflow-hidden rounded-xl border-2">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "flex-1 py-3 text-center text-sm font-bold transition-colors",
            activeTab === "all"
              ? "bg-brand-navy text-white"
              : "bg-white text-neutral-500 hover:bg-gray-50"
          )}
        >
          All Time
        </button>
        <button
          onClick={() => setActiveTab("weekly")}
          className={cn(
            "flex-1 py-3 text-center text-sm font-bold transition-colors",
            activeTab === "weekly"
              ? "bg-brand-navy text-white"
              : "bg-white text-neutral-500 hover:bg-gray-50"
          )}
        >
          This Week
        </button>
      </div>

      {activeTab === "weekly" && (
        <p className="mb-3 text-center text-xs text-muted-foreground">
          Resets every Monday
        </p>
      )}

      <Separator className="mb-4 h-0.5 rounded-full" />

      {/* Podium for top 3 */}
      {topThree && (
        <div className="mb-6 flex items-end justify-center gap-4">
          {/* 2nd place - left */}
          <div
            className="flex animate-slide-up flex-col items-center gap-1"
            style={{ animationDelay: "150ms", animationFillMode: "backwards" }}
          >
            <span className="text-2xl">🥈</span>
            <Avatar className="h-14 w-14 border-2 bg-brand-navy ring-4 ring-gray-100">
              <AvatarImage
                src={topThree[1].userImageSrc}
                className="object-cover"
              />
            </Avatar>
            <p className="mt-1 max-w-[80px] truncate text-center text-xs font-bold text-neutral-800">
              {topThree[1].userName}
              {topThree[1].userId === currentUserId && (
                <span className="ml-1 text-muted-foreground">(you)</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {topThree[1].points} XP
            </p>
          </div>

          {/* 1st place - center, taller */}
          <div
            className="flex animate-slide-up flex-col items-center gap-1 pb-4"
            style={{ animationFillMode: "backwards" }}
          >
            <span className="text-3xl">🥇</span>
            <Avatar className="h-16 w-16 border-2 bg-brand-navy ring-4 ring-yellow-100">
              <AvatarImage
                src={topThree[0].userImageSrc}
                className="object-cover"
              />
            </Avatar>
            <p className="mt-1 max-w-[90px] truncate text-center text-sm font-bold text-neutral-800">
              {topThree[0].userName}
              {topThree[0].userId === currentUserId && (
                <span className="ml-1 text-xs text-muted-foreground">
                  (you)
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {topThree[0].points} XP
            </p>
          </div>

          {/* 3rd place - right */}
          <div
            className="flex animate-slide-up flex-col items-center gap-1"
            style={{ animationDelay: "150ms", animationFillMode: "backwards" }}
          >
            <span className="text-2xl">🥉</span>
            <Avatar className="h-14 w-14 border-2 bg-brand-navy ring-4 ring-amber-100">
              <AvatarImage
                src={topThree[2].userImageSrc}
                className="object-cover"
              />
            </Avatar>
            <p className="mt-1 max-w-[80px] truncate text-center text-xs font-bold text-neutral-800">
              {topThree[2].userName}
              {topThree[2].userId === currentUserId && (
                <span className="ml-1 text-muted-foreground">(you)</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {topThree[2].points} XP
            </p>
          </div>
        </div>
      )}

      {/* Remaining users (#4+) or full list if < 3 users */}
      {restUsers.map((user, i) => {
        const rank = topThree ? i + 4 : i + 1;
        const isCurrentUser = user.userId === currentUserId;
        return (
          <div
            key={user.userId}
            className={cn(
              "flex w-full animate-fade-in items-center rounded-xl p-2 px-4",
              isCurrentUser
                ? "border border-brand-navy/20 bg-brand-navy/5"
                : "hover:bg-gray-200/50"
            )}
            style={{
              animationDelay: `${i * 75}ms`,
              animationFillMode: "backwards",
            }}
          >
            <p className="mr-4 font-bold text-brand-navy">{rank}</p>
            <Avatar className="ml-3 mr-6 h-12 w-12 border bg-brand-navy">
              <AvatarImage src={user.userImageSrc} className="object-cover" />
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

      {leaderboard.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No users yet. Be the first to earn XP!
        </p>
      )}
    </div>
  );
};

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

  return (
    <div className="w-full">
      {/* Tab buttons */}
      <div className="mb-4 flex w-full overflow-hidden rounded-xl border-2">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "flex-1 py-3 text-center text-sm font-bold transition-colors",
            activeTab === "all"
              ? "bg-[#1a237e] text-white"
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
              ? "bg-[#1a237e] text-white"
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

      {/* Leaderboard list */}
      {leaderboard.map((user, i) => {
        const isCurrentUser = user.userId === currentUserId;
        return (
          <div
            key={user.userId}
            className={cn(
              "flex w-full items-center rounded-xl p-2 px-4",
              isCurrentUser
                ? "border border-[#1a237e]/20 bg-[#1a237e]/5"
                : "hover:bg-gray-200/50"
            )}
          >
            <p
              className={cn(
                "mr-4 font-bold",
                i === 0
                  ? "text-xl text-yellow-500"
                  : i === 1
                    ? "text-lg text-gray-400"
                    : i === 2
                      ? "text-lg text-amber-700"
                      : "text-[#1a237e]"
              )}
            >
              {i + 1}
            </p>
            <Avatar className="ml-3 mr-6 h-12 w-12 border bg-[#1a237e]">
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

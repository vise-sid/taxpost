"use client";

import { BookOpen, Bot, Settings, Swords, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/learn", icon: BookOpen, label: "Learn" },
  { href: "/dashboard", icon: Target, label: "Progress" },
  { href: "/leaderboard", icon: Trophy, label: "Board" },
  { href: "/quests", icon: Swords, label: "Quests" },
  { href: "/learn-ai", icon: Bot, label: "AI" },
  { href: "/settings", icon: Settings, label: "More" },
];

export const MobileNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 z-50 flex w-full items-center justify-around border-t bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-2",
              isActive ? "text-brand-navy" : "text-gray-400"
            )}
          >
            <Icon className={cn("h-6 w-6", isActive && "fill-brand-navy/10")} />
            <span className="text-[10px] font-bold">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

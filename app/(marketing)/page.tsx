import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  SignUpButton,
  Show,
} from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function MarketingPage() {
  return (
    <div className="mx-auto flex w-full max-w-[988px] flex-1 flex-col items-center justify-center gap-2 p-4 lg:flex-row">
      <div className="relative mb-8 flex h-[240px] w-[240px] items-center justify-center lg:mb-0 lg:h-[424px] lg:w-[424px]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#1a237e] lg:h-40 lg:w-40">
            <span className="text-5xl font-bold text-white lg:text-7xl">T</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ff6d00] animate-pulse" />
            <span className="text-sm font-medium text-[#ff6d00]">
              April 1, 2026 — New Act goes live
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-y-8">
        <h1 className="max-w-[480px] text-center text-xl font-bold text-neutral-600 lg:text-3xl">
          Master India&apos;s new Income Tax Act 2025, one lesson a day.
        </h1>
        <p className="max-w-[400px] text-center text-sm text-muted-foreground lg:text-base">
          Stay posted on tax. Free gamified learning for Chartered Accountants —
          bite-sized lessons, streaks, leaderboards, and spaced repetition.
        </p>

        <div className="flex w-full max-w-[330px] flex-col items-center gap-y-3">
          <ClerkLoading>
            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
          </ClerkLoading>

          <ClerkLoaded>
            <Show when="signed-in">
              <Button size="lg" variant="secondary" className="w-full" asChild>
                <Link href="/learn">Continue Learning</Link>
              </Button>
            </Show>

            <Show when="signed-out">
              <SignUpButton mode="modal">
                <Button size="lg" variant="secondary" className="w-full">
                  Get Started — It&apos;s Free
                </Button>
              </SignUpButton>

              <SignInButton mode="modal">
                <Button size="lg" variant="primaryOutline" className="w-full">
                  I already have an account
                </Button>
              </SignInButton>
            </Show>
          </ClerkLoaded>
        </div>
      </div>
    </div>
  );
}

import {
  ClerkLoaded,
  ClerkLoading,
  Show,
} from "@clerk/nextjs";
import { Brain, Clock, Flame, Loader, Trophy } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function MarketingPage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center bg-gradient-to-b from-brand-navy/5 to-white px-6 pb-20 pt-16 lg:pt-24">
        <div className="animate-fade-in flex flex-col items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-navy shadow-lg lg:h-28 lg:w-28">
            <span className="text-4xl font-bold text-white lg:text-6xl">
              T
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-brand-orange/20 bg-brand-orange/5 px-4 py-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-orange" />
            </span>
            <span className="text-sm font-medium text-brand-orange">
              Act effective April 1, 2026
            </span>
          </div>

          <h1 className="max-w-[640px] text-center text-3xl font-extrabold leading-tight tracking-tight text-brand-navy lg:text-5xl">
            Master India&apos;s new Income Tax Act 2025, one lesson a day.
          </h1>

          <p className="max-w-[480px] text-center text-base leading-relaxed text-neutral-500 lg:text-lg">
            Free gamified learning for Chartered Accountants — bite-sized
            lessons, streaks, leaderboards, and spaced repetition to get you
            ready.
          </p>

          <div className="flex w-full max-w-[340px] flex-col items-center gap-y-3 pt-2">
            <ClerkLoading>
              <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
            </ClerkLoading>

            <ClerkLoaded>
              <Show when="signed-in">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  asChild
                >
                  <Link href="/learn">Continue Learning</Link>
                </Button>
              </Show>

              <Show when="signed-out">
                <Button size="lg" variant="secondary" className="w-full" asChild>
                  <Link href="/sign-up">Get Started — It&apos;s Free</Link>
                </Button>

                <Button size="lg" variant="primaryOutline" className="w-full" asChild>
                  <Link href="/sign-in">I already have an account</Link>
                </Button>
              </Show>
            </ClerkLoaded>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-neutral-100 bg-white py-8">
        <div className="mx-auto flex max-w-[640px] flex-col items-center justify-center gap-6 px-6 sm:flex-row sm:gap-0 sm:divide-x sm:divide-neutral-200">
          <div className="flex flex-col items-center px-8">
            <span className="text-2xl font-bold text-brand-navy">500+</span>
            <span className="text-sm text-neutral-500">CAs learning</span>
          </div>
          <div className="flex flex-col items-center px-8">
            <span className="text-2xl font-bold text-brand-navy">2,000+</span>
            <span className="text-sm text-neutral-500">Questions</span>
          </div>
          <div className="flex flex-col items-center px-8">
            <span className="text-2xl font-bold text-brand-navy">100%</span>
            <span className="text-sm text-neutral-500">Free</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-white px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-[800px]">
          <h2 className="mb-12 text-center text-2xl font-bold text-brand-navy lg:text-3xl">
            Everything you need to stay ahead
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div
              className="animate-fade-in rounded-2xl border border-neutral-100 bg-neutral-50/50 p-6"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy/10">
                <Clock className="h-6 w-6 text-brand-navy" />
              </div>
              <h3 className="mb-1.5 text-lg font-semibold text-brand-navy">
                3-Minute Lessons
              </h3>
              <p className="text-sm leading-relaxed text-neutral-500">
                Bite-sized daily practice that fits your schedule between client
                calls and filings.
              </p>
            </div>

            <div
              className="animate-fade-in rounded-2xl border border-neutral-100 bg-neutral-50/50 p-6"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy/10">
                <Brain className="h-6 w-6 text-brand-navy" />
              </div>
              <h3 className="mb-1.5 text-lg font-semibold text-brand-navy">
                Spaced Repetition
              </h3>
              <p className="text-sm leading-relaxed text-neutral-500">
                Wrong answers come back until you master them. Science-backed
                retention.
              </p>
            </div>

            <div
              className="animate-fade-in rounded-2xl border border-neutral-100 bg-neutral-50/50 p-6"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/10">
                <Flame className="h-6 w-6 text-brand-orange" />
              </div>
              <h3 className="mb-1.5 text-lg font-semibold text-brand-navy">
                Streak System
              </h3>
              <p className="text-sm leading-relaxed text-neutral-500">
                Build a daily habit through loss aversion. Don&apos;t break the
                chain.
              </p>
            </div>

            <div
              className="animate-fade-in rounded-2xl border border-neutral-100 bg-neutral-50/50 p-6"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/10">
                <Trophy className="h-6 w-6 text-brand-orange" />
              </div>
              <h3 className="mb-1.5 text-lg font-semibold text-brand-navy">
                Leaderboard
              </h3>
              <p className="text-sm leading-relaxed text-neutral-500">
                Compete with fellow CAs nationwide. See where you stand each
                week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility */}
      <section className="border-t border-neutral-100 bg-brand-navy/[0.02] px-6 py-16">
        <div className="mx-auto max-w-[600px] text-center">
          <h2 className="mb-4 text-2xl font-bold text-brand-navy lg:text-3xl">
            Built for CAs, by a CA
          </h2>
          <p className="text-base leading-relaxed text-neutral-500 lg:text-lg">
            We understand the challenge of transitioning to an entirely new Act
            while running a practice. Taxpost is designed to make that
            transition painless — a few minutes a day is all it takes.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-neutral-100 bg-white px-6 py-16 lg:py-20">
        <div className="mx-auto flex max-w-[480px] flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-bold text-brand-navy lg:text-3xl">
            Ready to master the new Act?
          </h2>
          <p className="text-neutral-500">
            Join hundreds of CAs preparing for the transition. Start today — it
            only takes 3 minutes.
          </p>

          <div className="flex w-full max-w-[320px] flex-col gap-3">
            <ClerkLoading>
              <Loader className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
            </ClerkLoading>

            <ClerkLoaded>
              <Show when="signed-in">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  asChild
                >
                  <Link href="/learn">Continue Learning</Link>
                </Button>
              </Show>

              <Show when="signed-out">
                <Button size="lg" variant="secondary" className="w-full" asChild>
                  <Link href="/sign-up">Get Started — It&apos;s Free</Link>
                </Button>
              </Show>
            </ClerkLoaded>
          </div>
        </div>
      </section>
    </div>
  );
}

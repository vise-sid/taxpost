"use client";

import {
  ClerkLoaded,
  ClerkLoading,
  Show,
} from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";

export const Header = () => {
  return (
    <header className="h-20 w-full border-b-2 border-slate-200 px-4">
      <div className="mx-auto flex h-full items-center justify-between lg:max-w-screen-lg">
        <Link href="/" className="flex items-center gap-x-3 pb-7 pl-4 pt-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-navy">
            <span className="text-lg font-bold text-white">T</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-wide text-brand-navy">
            Taxpost
          </h1>
        </Link>

        <div className="flex gap-x-3">
          <ClerkLoading>
            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
          </ClerkLoading>
          <ClerkLoaded>
            <Show when="signed-in">
              <UserMenu />
            </Show>

            <Show when="signed-out">
              <Button size="lg" variant="ghost" asChild>
                <Link href="/sign-in">Login</Link>
              </Button>
            </Show>
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
};

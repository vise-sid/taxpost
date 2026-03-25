"use client";
import { useState } from "react";

import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import { Github, Loader } from "lucide-react";
import Link from "next/link";

import Banner from "@/components/banner";
import { Button } from "@/components/ui/button";
import { links } from "@/config";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [hideBanner, setHideBanner] = useState(true);

  return (
    <>
      <Banner hide={hideBanner} setHide={setHideBanner} />

      <header
        className={cn(
          "h-20 w-full border-b-2 border-slate-200 px-4",
          !hideBanner ? "mt-20 sm:mt-16 lg:mt-10" : "mt-0"
        )}
      >
        <div className="mx-auto flex h-full items-center justify-between lg:max-w-screen-lg">
          <Link href="/" className="flex items-center gap-x-3 pb-7 pl-4 pt-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a237e]">
              <span className="text-lg font-bold text-white">T</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-wide text-[#1a237e]">
              Taxpost
            </h1>
          </Link>

          <div className="flex gap-x-3">
            <ClerkLoading>
              <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
            </ClerkLoading>
            <ClerkLoaded>
              <Show when="signed-in">
                <UserButton />
              </Show>

              <Show when="signed-out">
                <SignInButton mode="modal">
                  <Button size="lg" variant="ghost">
                    Login
                  </Button>
                </SignInButton>
              </Show>

              <Link
                href={links.sourceCode}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center pt-1.5"
              >
                <Github className="h-5 w-5 text-slate-500" />
              </Link>
            </ClerkLoaded>
          </div>
        </div>
      </header>
    </>
  );
};

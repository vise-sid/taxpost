"use client";

import { ArrowRight, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { upsertUserProgress } from "@/actions/user-progress";

type NextModuleCardProps = {
  courseId: number;
  courseTitle: string;
};

export const NextModuleCard = ({
  courseId,
  courseTitle,
}: NextModuleCardProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleJump = () => {
    startTransition(async () => {
      await upsertUserProgress(courseId);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto my-10 w-full max-w-[500px]">
      <div className="rounded-2xl border-2 border-neutral-200 p-8 text-center">
        <span className="mb-3 inline-block rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-neutral-500">
          Up next
        </span>

        <h3 className="mb-2 text-xl font-bold text-neutral-800">
          {courseTitle}
        </h3>

        <button
          onClick={handleJump}
          disabled={pending}
          className="mt-4 w-full rounded-2xl border-2 border-neutral-200 py-3.5 text-sm font-bold uppercase tracking-wide text-sky-500 transition-colors hover:bg-neutral-50 disabled:opacity-50"
        >
          {pending ? "Loading..." : "Jump here?"}
        </button>
      </div>
    </div>
  );
};

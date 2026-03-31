import { Bot, Clock, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Progress } from "@/components/ui/progress";
import { useExitModal } from "@/store/use-exit-modal";

type HeaderProps = {
  hearts: number;
  percentage: number;
  timerText?: string;
  chatUnitId?: number;
};

export const Header = ({ hearts, percentage, timerText, chatUnitId }: HeaderProps) => {
  const { open } = useExitModal();

  return (
    <header className="mx-auto flex w-full max-w-[1140px] items-center justify-between gap-x-7 px-10 pt-[20px] lg:pt-[50px]">
      <div className="flex items-center gap-2">
        <X
          onClick={open}
          className="cursor-pointer text-slate-500 transition hover:opacity-75"
        />
        {chatUnitId && (
          <Link
            href={`/lesson-chat/${chatUnitId}`}
            className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium text-brand-navy transition-colors hover:bg-brand-navy/5"
          >
            <Bot className="h-3.5 w-3.5" />
            Chat
          </Link>
        )}
      </div>

      <Progress value={percentage} />

      {timerText && (
        <div className="flex items-center gap-x-1 font-mono text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {timerText}
        </div>
      )}

      <div className="flex items-center font-bold text-rose-500">
        <Image
          src="/heart.svg"
          height={28}
          width={28}
          alt="Heart"
          className="mr-2"
        />
        {hearts}
      </div>
    </header>
  );
};

import { useCallback } from "react";

import Image from "next/image";
import { useAudio, useKey } from "react-use";

import { challenges } from "@/db/schema";
import { cn } from "@/lib/utils";

type CardProps = {
  id: number;
  text: string;
  imageSrc: string | null;
  audioSrc: string | null;
  shortcut: string;
  selected?: boolean;
  onClick: () => void;
  status?: "correct" | "wrong" | "none";
  disabled?: boolean;
  type: (typeof challenges.$inferSelect)["type"];
};

export const Card = ({
  text,
  imageSrc,
  audioSrc,
  shortcut,
  selected,
  onClick,
  status,
  disabled,
  type,
}: CardProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // Use a silent data URI when no audio source to avoid empty string warning
  const silentAudio = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
  const [audio, _, controls] = useAudio({ src: audioSrc || silentAudio });

  const handleClick = useCallback(() => {
    if (disabled) return;

    void controls.play();
    onClick();
  }, [disabled, onClick, controls]);

  useKey(shortcut, handleClick, {}, [handleClick]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "h-full cursor-pointer rounded-xl border-2 border-b-4 p-4 hover:bg-black/5 active:border-b-2 lg:p-6 transition-all duration-200",
        !disabled && !selected && "hover:-translate-y-0.5 hover:shadow-md",
        selected && "border-brand-navy/40 bg-brand-navy/5 hover:bg-brand-navy/5",
        selected &&
          status === "correct" &&
          "border-green-300 bg-green-100 hover:bg-green-100 animate-pop ring-2 ring-green-400/50",
        selected &&
          status === "wrong" &&
          "border-rose-300 bg-rose-100 hover:bg-rose-100 animate-shake ring-2 ring-rose-400/50",
        disabled && "pointer-events-none hover:bg-white",
        type === "ASSIST" && "w-full lg:p-3"
      )}
    >
      {audio}
      {imageSrc && (
        <div className="relative mb-4 aspect-square max-h-[80px] w-full lg:max-h-[150px]">
          <Image src={imageSrc} fill alt={text} />
        </div>
      )}

      <div
        className={cn(
          "flex items-start gap-3",
          type === "ASSIST" && "flex-row-reverse"
        )}
      >
        {/* Shortcut badge */}
        <span
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xs font-bold text-neutral-500",
            selected && "bg-brand-navy/10 text-brand-navy",
            selected && status === "correct" && "bg-green-100 text-green-600",
            selected && status === "wrong" && "bg-rose-100 text-rose-600"
          )}
        >
          {shortcut}
        </span>

        <p
          className={cn(
            "flex-1 text-sm text-neutral-600 lg:text-base",
            selected && "text-brand-navy font-medium",
            selected && status === "correct" && "text-green-600",
            selected && status === "wrong" && "text-rose-600"
          )}
        >
          {text}
        </p>
      </div>
    </div>
  );
};

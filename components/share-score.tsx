"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type ShareScoreProps = {
  score: number;
  total: number;
  streak?: number;
  topic?: string;
};

export const ShareScore = ({ score, total, streak, topic }: ShareScoreProps) => {
  const [showOptions, setShowOptions] = useState(false);

  const ogParams = new URLSearchParams({
    score: String(score),
    total: String(total),
    ...(streak ? { streak: String(streak) } : {}),
    ...(topic ? { topic } : {}),
  });

  const shareUrl = `https://taxpost.in?${ogParams.toString()}`;

  const text = `I scored ${score}/${total}${topic ? ` on ${topic}` : ""} on Taxpost! ${streak ? `\u{1F525} ${streak}-day streak!` : ""}\n\nMaster India's new Income Tax Act 2025:\n${shareUrl}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowOptions(!showOptions)}
        className="text-muted-foreground"
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share Score
      </Button>

      {showOptions && (
        <div className="absolute bottom-full left-0 mb-2 flex gap-2 rounded-lg border bg-white p-2 shadow-lg">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy/90"
          >
            WhatsApp
          </a>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Twitter/X
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(text).catch(() => {});
              setShowOptions(false);
            }}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
};

import { Heart, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type ChatHeaderProps = {
  title: string;
  hearts: number;
  progress: number;
  onExit: () => void;
};

export const ChatHeader = ({ title, hearts, progress, onExit }: ChatHeaderProps) => {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-3">
      <button
        onClick={onExit}
        className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
      >
        <X className="h-5 w-5" />
      </button>

      <Progress value={progress} className="h-2.5 flex-1" />

      <div className="flex items-center gap-1 text-rose-500">
        <Heart className="h-5 w-5 fill-rose-500" />
        <span className="text-sm font-bold">{hearts}</span>
      </div>
    </div>
  );
};

import { BookOpen, CheckCircle, XCircle } from "lucide-react";
import { useKey, useMedia } from "react-use";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FooterProps = {
  onCheck: () => void;
  status: "correct" | "wrong" | "none" | "completed";
  disabled?: boolean;
  lessonId?: number;
  explanation?: string;
  oldSection?: string;
  newSection?: string;
};

export const Footer = ({
  onCheck,
  status,
  disabled,
  lessonId,
  explanation,
  oldSection,
  newSection,
}: FooterProps) => {
  useKey("Enter", onCheck, {}, [onCheck]);
  const isMobile = useMedia("(max-width: 1024px)");

  return (
    <footer
      className={cn(
        "border-t-2",
        status === "correct" && "border-transparent bg-green-100",
        status === "wrong" && "border-transparent bg-rose-100"
      )}
    >
      {/* Explanation panel */}
      {(status === "correct" || status === "wrong") && explanation && (
        <div
          className={cn(
            "mx-auto max-w-[1140px] px-6 pt-4 lg:px-10",
          )}
        >
          <div className="flex items-start gap-x-3">
            <BookOpen
              className={cn(
                "mt-0.5 h-5 w-5 shrink-0",
                status === "correct" ? "text-green-600" : "text-rose-600"
              )}
            />
            <div className="flex flex-col gap-y-1">
              {oldSection && newSection && (
                <p className="text-xs font-semibold text-muted-foreground">
                  Section {oldSection} (old) → Section {newSection} (new)
                </p>
              )}
              <p
                className={cn(
                  "text-sm",
                  status === "correct" ? "text-green-700" : "text-rose-700"
                )}
              >
                {explanation}
              </p>
              {status === "wrong" && (
                <p className="mt-1 text-xs font-medium text-rose-500 italic">
                  This question will come back for review.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mx-auto flex h-[100px] max-w-[1140px] items-center justify-between px-6 lg:h-[100px] lg:px-10">
        {status === "correct" && (
          <div className="flex items-center text-base font-bold text-green-500 lg:text-2xl">
            <CheckCircle className="mr-4 h-6 w-6 lg:h-10 lg:w-10" />
            Nicely done!
          </div>
        )}

        {status === "wrong" && (
          <div className="flex items-center text-base font-bold text-rose-500 lg:text-2xl">
            <XCircle className="mr-4 h-6 w-6 lg:h-10 lg:w-10" />
            Try again.
          </div>
        )}

        {status === "completed" && (
          <Button
            variant="default"
            size={isMobile ? "sm" : "lg"}
            onClick={() => (window.location.href = `/lesson/${lessonId}`)}
          >
            Practice again
          </Button>
        )}

        <Button
          disabled={disabled}
          aria-disabled={disabled}
          className="ml-auto"
          onClick={onCheck}
          size={isMobile ? "sm" : "lg"}
          variant={status === "wrong" ? "danger" : "secondary"}
        >
          {status === "none" && "Check"}
          {status === "correct" && "Next"}
          {status === "wrong" && "Retry"}
          {status === "completed" && "Continue"}
        </Button>
      </div>
    </footer>
  );
};

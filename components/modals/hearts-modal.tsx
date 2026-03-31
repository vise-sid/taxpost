"use client";

import { useEffect, useState, useTransition } from "react";

import Image from "next/image";
import { toast } from "sonner";

import { refillHearts } from "@/actions/user-progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { POINTS_TO_REFILL } from "@/constants";
import { useHeartsModal } from "@/store/use-hearts-modal";

export const HeartsModal = () => {
  const [isClient, setIsClient] = useState(false);
  const [pending, startTransition] = useTransition();
  const { isOpen, close } = useHeartsModal();

  useEffect(() => setIsClient(true), []);

  const onRefill = () => {
    startTransition(() => {
      refillHearts()
        .then(() => {
          toast.success("Hearts refilled!");
          close();
        })
        .catch(() => toast.error("Not enough points to refill."));
    });
  };

  if (!isClient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-5 flex w-full items-center justify-center">
            <Image
              src="/mascot_bad.svg"
              alt="Mascot Bad"
              height={80}
              width={80}
            />
          </div>

          <DialogTitle className="text-center text-2xl font-bold">
            You ran out of hearts!
          </DialogTitle>

          <DialogDescription className="text-center text-base">
            Spend {POINTS_TO_REFILL} points to refill your hearts, or try again
            later.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mb-4">
          <div className="flex w-full flex-col gap-y-4">
            <Button
              variant="primary"
              className="w-full"
              size="lg"
              onClick={onRefill}
              disabled={pending}
            >
              {pending ? (
                "Refilling..."
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src="/heart.svg"
                    alt="Heart"
                    height={20}
                    width={20}
                  />
                  Refill hearts
                  <span className="ml-1 flex items-center gap-1 rounded-lg bg-white/20 px-2 py-0.5 text-xs">
                    <Image
                      src="/points.svg"
                      alt="Points"
                      height={14}
                      width={14}
                    />
                    {POINTS_TO_REFILL}
                  </span>
                </div>
              )}
            </Button>

            <Button
              variant="primaryOutline"
              className="w-full"
              size="lg"
              onClick={close}
            >
              No thanks
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

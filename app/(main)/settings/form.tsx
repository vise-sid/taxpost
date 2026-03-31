"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { Flame, Heart, LogOut, Trash2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { upsertReminderPrefs } from "@/actions/reminder-prefs";
import { refillHearts } from "@/actions/user-progress";
import { Button } from "@/components/ui/button";
import { MAX_HEARTS, POINTS_TO_REFILL } from "@/constants";

type SettingsFormProps = {
  hearts: number;
  points: number;
  streak: number;
  initialEnabled: boolean;
  initialTime: string;
};

export const SettingsForm = ({
  hearts,
  points,
  streak,
  initialEnabled,
  initialTime,
}: SettingsFormProps) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [enabled, setEnabled] = useState(initialEnabled);
  const [time, setTime] = useState(initialTime);
  const [pending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : "";
  const userEmail = user?.emailAddresses[0]?.emailAddress ?? "";

  const onSave = () => {
    startTransition(() => {
      upsertReminderPrefs({
        reminderEnabled: enabled,
        preferredTime: time,
      })
        .then(() => toast.success("Settings saved!"))
        .catch(() => toast.error("Something went wrong."));
    });
  };

  const onRefillHearts = () => {
    if (pending || hearts === MAX_HEARTS || points < POINTS_TO_REFILL) return;
    startTransition(() => {
      refillHearts()
        .then(() => toast.success("Hearts refilled!"))
        .catch(() => toast.error("Not enough points to refill."));
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await user.delete();
      router.push("/");
    } catch {
      toast.error("Failed to delete account. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Profile section */}
      <div className="rounded-2xl border-2 border-neutral-200 p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-neutral-400">
          Account
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-navy">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={fullName || "User"}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-white">
                {(fullName[0] || userEmail[0] || "U").toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {fullName && (
              <p className="truncate text-base font-bold text-neutral-800">
                {fullName}
              </p>
            )}
            <p className="truncate text-sm text-neutral-500">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center rounded-xl border-2 border-neutral-200 py-3">
          <Flame className={`h-6 w-6 ${streak > 0 ? "fill-brand-orange text-brand-orange" : "text-gray-300"}`} />
          <span className="mt-1 text-lg font-bold text-neutral-800">{streak}</span>
          <span className="text-xs text-muted-foreground">Streak</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border-2 border-neutral-200 py-3">
          <Zap className="h-6 w-6 text-brand-orange" />
          <span className="mt-1 text-lg font-bold text-neutral-800">{points}</span>
          <span className="text-xs text-muted-foreground">XP</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border-2 border-neutral-200 py-3">
          <Heart className="h-6 w-6 fill-rose-500 text-rose-500" />
          <span className="mt-1 text-lg font-bold text-neutral-800">{hearts}</span>
          <span className="text-xs text-muted-foreground">Hearts</span>
        </div>
      </div>

      {/* Hearts section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">
          Hearts
        </h2>
        <div className="flex items-center justify-between rounded-xl border-2 p-4">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 fill-rose-500 text-rose-500" />
            <div>
              <p className="font-bold text-neutral-700">
                {hearts} / {MAX_HEARTS} hearts
              </p>
              <p className="text-sm text-muted-foreground">
                {hearts === MAX_HEARTS
                  ? "Your hearts are full!"
                  : `Refill costs ${POINTS_TO_REFILL} points`}
              </p>
            </div>
          </div>
          <Button
            onClick={onRefillHearts}
            disabled={
              pending || hearts === MAX_HEARTS || points < POINTS_TO_REFILL
            }
            size="sm"
            className="bg-brand-navy hover:bg-brand-navy/90"
          >
            {hearts === MAX_HEARTS ? "Full" : "Refill"}
          </Button>
        </div>
      </div>

      {/* Reminders section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">
          Reminders
        </h2>

        {/* Email (read-only, uses login email) */}
        <div className="flex items-center justify-between rounded-xl border-2 border-neutral-200 bg-neutral-50 p-4">
          <div>
            <p className="text-sm font-bold text-neutral-700">Reminder email</p>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
        </div>

        {/* Enable/Disable */}
        <div className="flex items-center justify-between rounded-xl border-2 p-4">
          <div>
            <p className="font-bold text-neutral-700">Daily reminders</p>
            <p className="text-sm text-muted-foreground">
              Get nudged to keep your streak alive
            </p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              enabled ? "bg-brand-navy" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                enabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Preferred Time */}
        {enabled && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">
              Reminder time
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border-2 px-4 py-3 text-sm outline-none focus:border-brand-navy"
            >
              <option value="08:00">8:00 AM</option>
              <option value="09:00">9:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="17:00">5:00 PM</option>
              <option value="18:00">6:00 PM</option>
              <option value="19:00">7:00 PM</option>
              <option value="20:00">8:00 PM (default)</option>
              <option value="21:00">9:00 PM</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Time in IST (India Standard Time)
            </p>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={onSave}
          disabled={pending}
          className="w-full bg-brand-navy hover:bg-brand-navy/90"
          size="lg"
        >
          {pending ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Account actions */}
      <div className="space-y-3 border-t-2 border-neutral-100 pt-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">
          Account actions
        </h2>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl border-2 border-neutral-200 px-4 py-3.5 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          <LogOut className="h-4 w-4 text-neutral-400" />
          Sign out
        </button>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex w-full items-center gap-3 rounded-xl border-2 border-red-200 px-4 py-3.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete account
          </button>
        ) : (
          <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
            <p className="mb-3 text-sm font-semibold text-red-800">
              Are you sure? This will permanently delete your account and all
              your progress. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, delete my account"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-bold text-neutral-600 transition-colors hover:bg-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

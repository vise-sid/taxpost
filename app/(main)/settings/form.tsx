"use client";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import { upsertReminderPrefs } from "@/actions/reminder-prefs";
import { Button } from "@/components/ui/button";

type SettingsFormProps = {
  initialEmail: string;
  initialEnabled: boolean;
  initialTime: string;
};

export const SettingsForm = ({
  initialEmail,
  initialEnabled,
  initialTime,
}: SettingsFormProps) => {
  const [email, setEmail] = useState(initialEmail);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [time, setTime] = useState(initialTime);
  const [pending, startTransition] = useTransition();

  const onSave = () => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    startTransition(() => {
      upsertReminderPrefs({
        email,
        reminderEnabled: enabled,
        preferredTime: time,
      })
        .then(() => toast.success("Settings saved!"))
        .catch(() => toast.error("Something went wrong."));
    });
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-neutral-700">
          Email for reminders
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border-2 px-4 py-3 text-sm outline-none focus:border-brand-navy"
        />
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
          <p className="text-xs text-muted-foreground">Time in IST (India Standard Time)</p>
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
  );
};

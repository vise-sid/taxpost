import { getUserProgress, getUserStreak } from "@/db/queries";

import { getUserReminderPrefs } from "@/actions/reminder-prefs";
import { SettingsForm } from "./form";

const SettingsPage = async () => {
  const [userProgress, streak] = await Promise.all([
    getUserProgress(),
    getUserStreak(),
  ]);

  const prefs = await getUserReminderPrefs();

  return (
    <div className="px-6">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">
          Settings
        </h1>
        <p className="mb-6 text-center text-lg text-muted-foreground">
          Manage your account and preferences.
        </p>

        <SettingsForm
          hearts={userProgress?.hearts ?? 0}
          points={userProgress?.points ?? 0}
          streak={streak?.currentStreak ?? 0}
          initialEnabled={prefs?.reminderEnabled ?? true}
          initialTime={prefs?.preferredTime ?? "20:00"}
        />
      </div>
    </div>
  );
};

export default SettingsPage;

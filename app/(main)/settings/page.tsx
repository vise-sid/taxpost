import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { getUserProgress } from "@/db/queries";

import { getUserReminderPrefs } from "@/actions/reminder-prefs";
import { SettingsForm } from "./form";

const SettingsPage = async () => {
  const userProgress = await getUserProgress();

  if (!userProgress || !userProgress.activeCourse) redirect("/courses");

  const prefs = await getUserReminderPrefs();

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
        />
      </StickyWrapper>

      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
          <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">
            Settings
          </h1>
          <p className="mb-6 text-center text-lg text-muted-foreground">
            Manage your reminder preferences.
          </p>

          <SettingsForm
            initialEmail={prefs?.email ?? ""}
            initialEnabled={prefs?.reminderEnabled ?? true}
            initialTime={prefs?.preferredTime ?? "20:00"}
          />
        </div>
      </FeedWrapper>
    </div>
  );
};

export default SettingsPage;

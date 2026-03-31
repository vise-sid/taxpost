"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { userReminderPrefs } from "@/db/schema";

export const getUserReminderPrefs = async () => {
  const { userId } = await auth();
  if (!userId) return null;

  const prefs = await db.query.userReminderPrefs.findFirst({
    where: eq(userReminderPrefs.userId, userId),
  });

  return prefs;
};

export const upsertReminderPrefs = async (data: {
  reminderEnabled: boolean;
  preferredTime: string;
}) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("No email found on account.");

  const existing = await db.query.userReminderPrefs.findFirst({
    where: eq(userReminderPrefs.userId, userId),
  });

  if (existing) {
    await db
      .update(userReminderPrefs)
      .set({
        email,
        reminderEnabled: data.reminderEnabled,
        preferredTime: data.preferredTime,
      })
      .where(eq(userReminderPrefs.id, existing.id));
  } else {
    await db.insert(userReminderPrefs).values({
      userId,
      email,
      reminderEnabled: data.reminderEnabled,
      preferredTime: data.preferredTime,
    });
  }

  revalidatePath("/settings");
};

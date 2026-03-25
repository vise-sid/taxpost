"use server";

import { auth } from "@clerk/nextjs/server";
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
  email: string;
  reminderEnabled: boolean;
  preferredTime: string;
}) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const existing = await db.query.userReminderPrefs.findFirst({
    where: eq(userReminderPrefs.userId, userId),
  });

  if (existing) {
    await db
      .update(userReminderPrefs)
      .set({
        email: data.email,
        reminderEnabled: data.reminderEnabled,
        preferredTime: data.preferredTime,
      })
      .where(eq(userReminderPrefs.id, existing.id));
  } else {
    await db.insert(userReminderPrefs).values({
      userId,
      email: data.email,
      reminderEnabled: data.reminderEnabled,
      preferredTime: data.preferredTime,
    });
  }

  revalidatePath("/settings");
};

import { NextResponse } from "next/server";

import { sql } from "drizzle-orm";

import db from "@/db/drizzle";
import { userReminderPrefs, userStreaks, userProgress } from "@/db/schema";
import { streakAtRiskEmail, streakBrokenEmail, morningMotivationEmail } from "@/lib/emails";
import { resend } from "@/lib/resend";

// This endpoint is called by Vercel Cron
// Vercel cron config goes in vercel.json
export async function GET(request: Request) {
  // Verify cron secret (optional but recommended)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all users with reminders enabled
    const reminders = await db.query.userReminderPrefs.findMany({
      where: sql`${userReminderPrefs.reminderEnabled} = true`,
    });

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let sent = 0;

    for (const pref of reminders) {
      const streak = await db.query.userStreaks.findFirst({
        where: sql`${userStreaks.userId} = ${pref.userId}`,
      });

      const progress = await db.query.userProgress.findFirst({
        where: sql`${userProgress.userId} = ${pref.userId}`,
      });

      const userName = progress?.userName ?? "there";

      if (!streak) continue;

      // If user completed today, skip
      if (streak.lastCompletedDate === today) continue;

      // If last completion was yesterday — streak at risk
      if (streak.lastCompletedDate === yesterdayStr && streak.currentStreak > 0) {
        const email = streakAtRiskEmail(userName, streak.currentStreak);
        await resend.emails.send({
          from: "Taxpost <reminders@taxpost.in>",
          to: pref.email,
          subject: email.subject,
          html: email.html,
        });
        sent++;
      }
      // If last completion was more than 1 day ago — streak broken
      else if (streak.lastCompletedDate && streak.lastCompletedDate < yesterdayStr) {
        const email = streakBrokenEmail(userName);
        await resend.emails.send({
          from: "Taxpost <reminders@taxpost.in>",
          to: pref.email,
          subject: email.subject,
          html: email.html,
        });
        sent++;
      }
    }

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error("Reminder cron error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

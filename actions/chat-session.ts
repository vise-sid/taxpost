"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { chatSessions } from "@/db/schema";

export const getOrCreateChatSession = async (unitId: number) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  const existing = await db.query.chatSessions.findFirst({
    where: and(
      eq(chatSessions.userId, userId),
      eq(chatSessions.unitId, unitId)
    ),
  });

  if (existing) {
    return {
      id: existing.id,
      history: existing.history as any[],
      messages: existing.messages as any[],
      status: existing.status as "teaching" | "testing" | "completed",
    };
  }

  const [created] = await db
    .insert(chatSessions)
    .values({
      userId,
      unitId,
      history: [],
      messages: [],
      status: "teaching",
    })
    .returning();

  return {
    id: created.id,
    history: [] as any[],
    messages: [] as any[],
    status: "teaching" as const,
  };
};

export const updateChatSession = async (
  unitId: number,
  data: {
    history?: any[];
    messages?: any[];
    status?: "teaching" | "testing" | "completed";
  }
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized.");

  await db
    .update(chatSessions)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(chatSessions.userId, userId),
        eq(chatSessions.unitId, unitId)
      )
    );
};

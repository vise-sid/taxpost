import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  time,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { MAX_HEARTS } from "@/constants";

// --- Enums ---

export const challengesEnum = pgEnum("type", ["SELECT", "ASSIST"]);

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

// --- Courses (Topics) ---

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageSrc: text("image_src").notNull(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
  userProgress: many(userProgress),
  units: many(units),
}));

// --- Units (Sub-topics) ---

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  courseId: integer("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull(),
});

export const unitsRelations = relations(units, ({ many, one }) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
  tierProgress: many(unitTierProgress),
}));

// --- Lessons ---

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  unitId: integer("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull(),
  tier: integer("tier").notNull().default(1), // 1=Know It, 2=Understand It, 3=Apply It
});

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  challenges: many(challenges),
}));

// --- Challenges (Questions) ---

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id")
    .references(() => lessons.id, { onDelete: "cascade" })
    .notNull(),
  type: challengesEnum("type").notNull(),
  question: text("question").notNull(),
  order: integer("order").notNull(),
  // Taxpost learning fields
  difficulty: difficultyEnum("difficulty").default("medium"),
  tier: integer("tier").notNull().default(1), // 1=Know It, 2=Understand It, 3=Apply It
  explanation: text("explanation"), // shown on correct answer
  explanationWrong: text("explanation_wrong"), // encouraging explanation on wrong answer
  oldSection: text("old_section"),
  newSection: text("new_section"),
  tags: text("tags"), // comma-separated tags
  subConcepts: text("sub_concepts"), // comma-separated granular concept tags
  isReview: boolean("is_review").notNull().default(false), // Q3 review from other unit
});

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [challenges.lessonId],
    references: [lessons.id],
  }),
  challengeOptions: many(challengeOptions),
  challengeProgress: many(challengeProgress),
}));

// --- Challenge Options (Answer Choices) ---

export const challengeOptions = pgTable("challenge_options", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
  correct: boolean("correct").notNull(),
  imageSrc: text("image_src"),
  audioSrc: text("audio_src"),
});

export const challengeOptionsRelations = relations(
  challengeOptions,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeOptions.challengeId],
      references: [challenges.id],
    }),
  })
);

// --- Challenge Progress ---

export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const challengeProgressRelations = relations(
  challengeProgress,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeProgress.challengeId],
      references: [challenges.id],
    }),
  })
);

// --- User Progress ---

export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),
  userName: text("user_name").notNull().default("User"),
  userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
  activeCourseId: integer("active_course_id").references(() => courses.id, {
    onDelete: "cascade",
  }),
  hearts: integer("hearts").notNull().default(MAX_HEARTS),
  points: integer("points").notNull().default(0),
});

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  activeCourse: one(courses, {
    fields: [userProgress.activeCourseId],
    references: [courses.id],
  }),
}));

// --- Streak Tracking ---

export const userStreaks = pgTable("user_streaks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastCompletedDate: date("last_completed_date"),
  streakFreezeAvailable: boolean("streak_freeze_available")
    .notNull()
    .default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// --- Spaced Repetition (Leitner Box System) ---

export const challengeRepetition = pgTable("challenge_repetition", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  boxNumber: integer("box_number").notNull().default(1), // 1-5
  timesCorrect: integer("times_correct").notNull().default(0),
  timesWrong: integer("times_wrong").notNull().default(0),
  lastReviewed: timestamp("last_reviewed"),
  nextReview: timestamp("next_review"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challengeRepetitionRelations = relations(
  challengeRepetition,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeRepetition.challengeId],
      references: [challenges.id],
    }),
  })
);

// --- Lesson Completions (Timer Tracking) ---

export const lessonCompletions = pgTable("lesson_completions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  lessonId: integer("lesson_id")
    .references(() => lessons.id, { onDelete: "cascade" })
    .notNull(),
  timeTakenSeconds: integer("time_taken_seconds"),
  score: integer("score"), // correct answers out of total
  totalQuestions: integer("total_questions"),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const lessonCompletionsRelations = relations(
  lessonCompletions,
  ({ one }) => ({
    lesson: one(lessons, {
      fields: [lessonCompletions.lessonId],
      references: [lessons.id],
    }),
  })
);

// --- Unit Tier Progress ---

export const unitTierProgress = pgTable("unit_tier_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  unitId: integer("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  tier: integer("tier").notNull(), // 1, 2, or 3
  lessonsCompleted: integer("lessons_completed").notNull().default(0),
  totalCorrect: integer("total_correct").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(0),
  unlockedAt: timestamp("unlocked_at"), // null = locked
  completedAt: timestamp("completed_at"), // null = not yet completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const unitTierProgressRelations = relations(
  unitTierProgress,
  ({ one }) => ({
    unit: one(units, {
      fields: [unitTierProgress.unitId],
      references: [units.id],
    }),
  })
);

// --- Chat Sessions (AI Tutor) ---

export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    unitId: integer("unit_id")
      .references(() => units.id, { onDelete: "cascade" })
      .notNull(),
    history: jsonb("history").notNull().default([]), // raw Gemini conversation array
    messages: jsonb("messages").notNull().default([]), // UI ChatMessage[]
    status: text("status").notNull().default("teaching"), // teaching | testing | completed
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("chat_sessions_user_unit_idx").on(table.userId, table.unitId),
  ]
);

export const chatSessionsRelations = relations(chatSessions, ({ one }) => ({
  unit: one(units, {
    fields: [chatSessions.unitId],
    references: [units.id],
  }),
}));

// --- Reminder Preferences ---

export const userReminderPrefs = pgTable("user_reminder_prefs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  email: text("email").notNull(),
  reminderEnabled: boolean("reminder_enabled").notNull().default(true),
  preferredTime: time("preferred_time").default("20:00"),
  timezone: text("timezone").default("Asia/Kolkata"),
  createdAt: timestamp("created_at").defaultNow(),
});

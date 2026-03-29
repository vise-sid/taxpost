import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as fs from "fs";
import * as path from "path";

import * as schema from "@/db/schema";

const sql = neon(process.env.DATABASE_URL!);

const db = drizzle(sql, { schema });

// ============================================================================
// MODULE REGISTRY — All 20 modules from the course outline
// Folder name is the single source of truth. Just drop JSON files inside.
// ============================================================================

const MODULE_REGISTRY: Record<string, { title: string; imageSrc: string; order: number }> = {
  "m0-orientation":          { title: "Orientation",            imageSrc: "/orientation.svg",    order: 1 },
  "m1-foundation":           { title: "Foundation",             imageSrc: "/foundation.svg",     order: 2 },
  "m2-transition":           { title: "Transition Bridge",      imageSrc: "/transition.svg",     order: 3 },
  "m3-tds-tcs":              { title: "TDS & TCS",              imageSrc: "/tds.svg",            order: 4 },
  "m4-salary":               { title: "Salary Income",          imageSrc: "/salary.svg",         order: 5 },
  "m5-house-property":       { title: "House Property",         imageSrc: "/house-property.svg", order: 6 },
  "m6-business-profession":  { title: "Business & Profession",  imageSrc: "/business.svg",       order: 7 },
  "m7-capital-gains":        { title: "Capital Gains",          imageSrc: "/capital-gains.svg",  order: 8 },
  "m8-other-sources":        { title: "Other Sources",          imageSrc: "/other-sources.svg",  order: 9 },
  "m9-deductions":           { title: "Deductions",             imageSrc: "/deductions.svg",     order: 10 },
  "m10-exempt-income":       { title: "Exempt Income",          imageSrc: "/exempt-income.svg",  order: 11 },
  "m11-set-off-carry-forward": { title: "Set Off & Carry Forward", imageSrc: "/set-off.svg",     order: 12 },
  "m12-assessment-appeals":  { title: "Assessment & Appeals",   imageSrc: "/assessment.svg",     order: 13 },
  "m13-advance-tax-interest": { title: "Advance Tax & Interest", imageSrc: "/advance-tax.svg",   order: 14 },
  "m14-special-provisions":  { title: "Special Provisions",     imageSrc: "/special.svg",        order: 15 },
  "m15-international-tax":   { title: "International Tax",      imageSrc: "/international.svg",  order: 16 },
  "m16-trusts-npos":         { title: "Trusts & NPOs",          imageSrc: "/trusts.svg",         order: 17 },
  "m17-other-entities":      { title: "Other Entities",         imageSrc: "/entities.svg",       order: 18 },
  "m18-compliance-infra":    { title: "Compliance Infrastructure", imageSrc: "/compliance.svg",  order: 19 },
  "m19-rules-2026":          { title: "Rules 2026",             imageSrc: "/rules.svg",          order: 20 },
  "m20-unexplained-income":  { title: "Unexplained Income",     imageSrc: "/unexplained.svg",    order: 21 },
};

// ============================================================================
// TYPES for JSON question files
// ============================================================================

interface QuestionOption {
  text: string;
  correct: boolean;
}

interface Question {
  order: number;
  question: string;
  options: QuestionOption[];
  explanation: string;
  explanationWrong: string;
  tier: number;
  subConcepts: string[];
  isReview: boolean;
  oldSection: string | null;
  newSection: string | null;
}

interface LessonData {
  title: string;
  tier: number;
  order: number;
  questions: Question[];
}

interface UnitFile {
  unit: string;
  title: string;
  totalQuestions: number;
  lessons: LessonData[];
}

// ============================================================================
// AUTO-DISCOVERY: Scan content/units/ for module folders and question files
// ============================================================================

function discoverModules(): { folder: string; title: string; imageSrc: string; order: number; units: UnitFile[] }[] {
  const unitsRoot = path.join(process.cwd(), "content", "units");
  const discovered: { folder: string; title: string; imageSrc: string; order: number; units: UnitFile[] }[] = [];

  // Scan for all m*-* folders
  const folders = fs
    .readdirSync(unitsRoot)
    .filter((f) => f.startsWith("m") && fs.statSync(path.join(unitsRoot, f)).isDirectory())
    .sort();

  for (const folder of folders) {
    const registry = MODULE_REGISTRY[folder];

    if (!registry) {
      console.warn(`  ⚠ Unknown module folder: ${folder} — not in MODULE_REGISTRY, skipping.`);
      continue;
    }

    // Find all *-questions.json files in this folder
    const folderPath = path.join(unitsRoot, folder);
    const jsonFiles = fs
      .readdirSync(folderPath)
      .filter((f) => f.endsWith("-questions.json"))
      .sort();

    if (jsonFiles.length === 0) {
      // Empty module — still create the course, but no units
      discovered.push({
        folder,
        title: registry.title,
        imageSrc: registry.imageSrc,
        order: registry.order,
        units: [],
      });
      continue;
    }

    const units: UnitFile[] = jsonFiles.map((file) => {
      const raw = fs.readFileSync(path.join(folderPath, file), "utf-8");
      return JSON.parse(raw) as UnitFile;
    });

    discovered.push({
      folder,
      title: registry.title,
      imageSrc: registry.imageSrc,
      order: registry.order,
      units,
    });
  }

  // Sort by order from registry
  discovered.sort((a, b) => a.order - b.order);

  return discovered;
}

// ============================================================================
// MAIN SEED
// ============================================================================

const main = async () => {
  try {
    console.log("🌱 Seeding database from content/units/ ...\n");

    // ------------------------------------------------------------------
    // 1. DISCOVER all content
    // ------------------------------------------------------------------

    const modules = discoverModules();

    console.log(`Found ${modules.length} modules:\n`);
    for (const m of modules) {
      const unitCount = m.units.length;
      const questionCount = m.units.reduce((sum, u) => sum + u.totalQuestions, 0);
      console.log(
        `  ${m.folder.padEnd(28)} → ${m.title.padEnd(28)} ${unitCount} units, ${questionCount} questions`
      );
    }

    // ------------------------------------------------------------------
    // 2. DELETE all existing data
    // ------------------------------------------------------------------

    console.log("\nDeleting existing data...");

    await Promise.all([
      db.delete(schema.userProgress),
      db.delete(schema.challengeProgress),
      db.delete(schema.challengeRepetition),
      db.delete(schema.lessonCompletions),
      db.delete(schema.userStreaks),
      db.delete(schema.userReminderPrefs),
      db.delete(schema.unitTierProgress),
    ]);

    await db.delete(schema.challengeOptions);
    await db.delete(schema.challenges);
    await db.delete(schema.lessons);
    await db.delete(schema.units);
    await db.delete(schema.courses);

    console.log("✓ Deleted all existing data.\n");

    // ------------------------------------------------------------------
    // 3. BUILD insert arrays
    // ------------------------------------------------------------------

    let courseIdCounter = 0;
    let unitIdCounter = 0;
    let lessonIdCounter = 0;
    let challengeIdCounter = 0;
    let optionIdCounter = 0;

    const allCourses: (typeof schema.courses.$inferInsert)[] = [];
    const allUnits: (typeof schema.units.$inferInsert)[] = [];
    const allLessons: (typeof schema.lessons.$inferInsert)[] = [];
    const allChallenges: (typeof schema.challenges.$inferInsert)[] = [];
    const allOptions: (typeof schema.challengeOptions.$inferInsert)[] = [];

    for (const mod of modules) {
      courseIdCounter++;
      const currentCourseId = courseIdCounter;

      allCourses.push({
        id: currentCourseId,
        title: mod.title,
        imageSrc: mod.imageSrc,
      });

      if (mod.units.length === 0) continue;

      let unitOrder = 0;

      for (const unitFile of mod.units) {
        unitIdCounter++;
        unitOrder++;
        const currentUnitId = unitIdCounter;

        allUnits.push({
          id: currentUnitId,
          title: unitFile.title,
          description: `Unit ${unitFile.unit}: ${unitFile.title}`,
          courseId: currentCourseId,
          order: unitOrder,
        });

        let lessonOrder = 0;

        for (const lesson of unitFile.lessons) {
          lessonIdCounter++;
          lessonOrder++;
          const currentLessonId = lessonIdCounter;

          allLessons.push({
            id: currentLessonId,
            title: lesson.title,
            unitId: currentUnitId,
            order: lessonOrder,
            tier: lesson.tier,
          });

          for (const q of lesson.questions) {
            challengeIdCounter++;
            const currentChallengeId = challengeIdCounter;

            const difficulty: "easy" | "medium" | "hard" =
              q.tier === 1 ? "easy" : q.tier === 2 ? "medium" : "hard";

            allChallenges.push({
              id: currentChallengeId,
              lessonId: currentLessonId,
              type: "SELECT",
              question: q.question,
              order: q.order,
              difficulty,
              tier: q.tier,
              explanation: q.explanation,
              explanationWrong: q.explanationWrong || null,
              oldSection: q.oldSection || null,
              newSection: q.newSection || null,
              tags: q.subConcepts?.join(",") || null,
              subConcepts: q.subConcepts?.join(",") || null,
              isReview: q.isReview || false,
            });

            for (const opt of q.options) {
              optionIdCounter++;
              allOptions.push({
                id: optionIdCounter,
                challengeId: currentChallengeId,
                text: opt.text,
                correct: opt.correct,
                imageSrc: null,
                audioSrc: null,
              });
            }
          }
        }
      }
    }

    // ------------------------------------------------------------------
    // 4. BATCH INSERT
    // ------------------------------------------------------------------

    console.log("Inserting into database...");

    const BATCH_SIZE = 50;

    // Courses
    if (allCourses.length > 0) {
      await db.insert(schema.courses).values(allCourses);
    }
    console.log(`  ✓ ${allCourses.length} courses`);

    // Units
    if (allUnits.length > 0) {
      for (let i = 0; i < allUnits.length; i += BATCH_SIZE) {
        await db.insert(schema.units).values(allUnits.slice(i, i + BATCH_SIZE));
      }
    }
    console.log(`  ✓ ${allUnits.length} units`);

    // Lessons
    if (allLessons.length > 0) {
      for (let i = 0; i < allLessons.length; i += BATCH_SIZE) {
        await db.insert(schema.lessons).values(allLessons.slice(i, i + BATCH_SIZE));
      }
    }
    console.log(`  ✓ ${allLessons.length} lessons`);

    // Challenges
    if (allChallenges.length > 0) {
      for (let i = 0; i < allChallenges.length; i += BATCH_SIZE) {
        await db.insert(schema.challenges).values(allChallenges.slice(i, i + BATCH_SIZE));
      }
    }
    console.log(`  ✓ ${allChallenges.length} challenges`);

    // Options
    if (allOptions.length > 0) {
      for (let i = 0; i < allOptions.length; i += BATCH_SIZE) {
        await db.insert(schema.challengeOptions).values(allOptions.slice(i, i + BATCH_SIZE));
      }
    }
    console.log(`  ✓ ${allOptions.length} challenge options`);

    // ------------------------------------------------------------------
    // 5. SUMMARY
    // ------------------------------------------------------------------

    const modulesWithContent = modules.filter((m) => m.units.length > 0).length;
    const emptyModules = modules.length - modulesWithContent;

    console.log("\n========================================");
    console.log("🎉 Seeding complete!");
    console.log("========================================");
    console.log(`  Courses:            ${allCourses.length} (${modulesWithContent} with content, ${emptyModules} empty)`);
    console.log(`  Units:              ${allUnits.length}`);
    console.log(`  Lessons:            ${allLessons.length}`);
    console.log(`  Questions:          ${allChallenges.length}`);
    console.log(`  Options:            ${allOptions.length}`);
    console.log("========================================\n");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};

main();

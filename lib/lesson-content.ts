import * as fs from "fs";
import * as path from "path";

import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { lessons, units } from "@/db/schema";

const COURSE_TO_FOLDER: Record<string, string> = {
  Orientation: "m0-orientation",
  Foundation: "m1-foundation",
  "Transition Bridge": "m2-transition",
  "TDS & TCS": "m3-tds-tcs",
  "Salary Income": "m4-salary",
  "House Property": "m5-house-property",
  "Business & Profession": "m6-business-profession",
  "Capital Gains": "m7-capital-gains",
  "Other Sources": "m8-other-sources",
  Deductions: "m9-deductions",
  "Exempt Income": "m10-exempt-income",
  "Set Off & Carry Forward": "m11-set-off-carry-forward",
  "Assessment & Appeals": "m12-assessment-appeals",
  "Advance Tax & Interest": "m13-advance-tax-interest",
  "Special Provisions": "m14-special-provisions",
  "International Tax": "m15-international-tax",
  "Trusts & NPOs": "m16-trusts-npos",
  "Other Entities": "m17-other-entities",
  "Compliance Infrastructure": "m18-compliance-infra",
  "Rules 2026": "m19-rules-2026",
  "Unexplained Income": "m20-unexplained-income",
};

export async function getLessonContent(lessonId: number) {
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      unit: {
        with: {
          course: true,
        },
      },
    },
  });

  if (!lesson?.unit?.course) return null;

  const courseTitle = lesson.unit.course.title;
  const moduleFolder = COURSE_TO_FOLDER[courseTitle];
  if (!moduleFolder) return null;

  const unitMatch = lesson.unit.description.match(/Unit\s+(\d+\.\d+)/);
  const unitNumber = unitMatch ? unitMatch[1] : null;
  if (!unitNumber) return null;

  const contentDir = path.join(process.cwd(), "content", "units", moduleFolder);
  if (!fs.existsSync(contentDir)) return null;

  const mdFiles = fs
    .readdirSync(contentDir)
    .filter((f) => f.startsWith(unitNumber + "-") && f.endsWith(".md"));

  if (mdFiles.length === 0) return null;

  const markdown = fs.readFileSync(
    path.join(contentDir, mdFiles[0]),
    "utf-8"
  );

  return {
    markdown,
    unitTitle: lesson.unit.title,
    courseTitle,
    lessonTitle: lesson.title,
  };
}

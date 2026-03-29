import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

import db from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { units, courses } from "@/db/schema";

/**
 * GET /api/guidebook/[unitId]
 *
 * Returns the markdown content for a unit's guidebook.
 * Resolves the unit's description (e.g., "Unit 0.1: Why a New Act?")
 * to find the corresponding MD file in content/units/.
 */

// Map courseId → module folder name
// Built from MODULE_REGISTRY in prod.ts
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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ unitId: string }> }
) {
  try {
    const { unitId: unitIdParam } = await params;
    const unitId = parseInt(unitIdParam);
    if (isNaN(unitId)) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
    }

    // Fetch unit + its course name
    const unit = await db.query.units.findFirst({
      where: eq(units.id, unitId),
      with: {
        course: true,
      },
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    const courseTitle = unit.course.title;
    const moduleFolder = COURSE_TO_FOLDER[courseTitle];

    if (!moduleFolder) {
      return NextResponse.json(
        { error: "No content folder mapped for this course" },
        { status: 404 }
      );
    }

    // Find the MD file: scan the module folder for files matching the unit number
    // Unit description format: "Unit 0.1: Why a New Act?" → extract "0.1"
    const unitMatch = unit.description.match(/Unit\s+(\d+\.\d+)/);
    const unitNumber = unitMatch ? unitMatch[1] : null;

    if (!unitNumber) {
      return NextResponse.json(
        { error: "Could not parse unit number from description" },
        { status: 404 }
      );
    }

    const contentDir = path.join(process.cwd(), "content", "units", moduleFolder);

    if (!fs.existsSync(contentDir)) {
      return NextResponse.json(
        { error: "Content directory not found" },
        { status: 404 }
      );
    }

    // Find MD file starting with the unit number (e.g., "0.1-why-a-new-act.md")
    const mdFiles = fs
      .readdirSync(contentDir)
      .filter((f) => f.startsWith(unitNumber + "-") && f.endsWith(".md"));

    if (mdFiles.length === 0) {
      return NextResponse.json(
        { error: "No guidebook content available for this unit yet" },
        { status: 404 }
      );
    }

    const mdContent = fs.readFileSync(
      path.join(contentDir, mdFiles[0]),
      "utf-8"
    );

    return NextResponse.json({
      unitId,
      unitTitle: unit.title,
      courseTitle,
      content: mdContent,
    });
  } catch (error) {
    console.error("Guidebook API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { redirect } from "next/navigation";
import * as fs from "fs";
import * as path from "path";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { units } from "@/db/schema";

import { GuidebookContent } from "./guidebook-content";

// Map course title → module folder
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

async function getGuidebookContent(unitId: number) {
  try {
    const unit = await db.query.units.findFirst({
      where: eq(units.id, unitId),
      with: { course: true },
    });

    if (!unit) return null;

    const moduleFolder = COURSE_TO_FOLDER[unit.course.title];
    if (!moduleFolder) return null;

    // Extract unit number from description: "Unit 0.1: Why a New Act?" → "0.1"
    const unitMatch = unit.description.match(/Unit\s+(\d+\.\d+)/);
    const unitNumber = unitMatch ? unitMatch[1] : null;
    if (!unitNumber) return null;

    const contentDir = path.join(process.cwd(), "content", "units", moduleFolder);
    if (!fs.existsSync(contentDir)) return null;

    const mdFiles = fs
      .readdirSync(contentDir)
      .filter((f: string) => f.startsWith(unitNumber + "-") && f.endsWith(".md"));

    if (mdFiles.length === 0) return null;

    const mdContent = fs.readFileSync(path.join(contentDir, mdFiles[0]), "utf-8");

    return {
      unitTitle: unit.title,
      courseTitle: unit.course.title,
      unitOrder: unit.order,
      content: mdContent,
    };
  } catch {
    return null;
  }
}

type Props = {
  params: Promise<{ unitId: string }>;
};

const GuidebookPage = async ({ params }: Props) => {
  const { unitId: unitIdParam } = await params;
  const unitId = parseInt(unitIdParam);
  if (isNaN(unitId)) redirect("/learn");

  const data = await getGuidebookContent(unitId);

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-4 lg:px-6">
        <Link
          href="/learn"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-500 transition-colors hover:text-neutral-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Learn</span>
        </Link>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h1 className="mb-3 text-2xl font-bold text-neutral-800">
            Guidebook coming soon
          </h1>
          <p className="text-neutral-500">
            This unit&apos;s guidebook is being prepared. Check back shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-4 lg:px-6">
      {/* Back to learn */}
      <Link
        href="/learn"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-500 transition-colors hover:text-neutral-800"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>
          {data.courseTitle}, Unit {data.unitOrder}
        </span>
      </Link>

      {/* Title */}
      <h1 className="mb-8 text-3xl font-extrabold text-neutral-800 lg:text-4xl">
        {data.unitTitle}
      </h1>

      {/* Rendered markdown */}
      <GuidebookContent content={data.content} />
    </div>
  );
};

export default GuidebookPage;

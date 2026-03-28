import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";

const sql = neon(process.env.DATABASE_URL!);

const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("Seeding database...");

    // Delete all existing data (user-related first, then content)
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

    console.log("Deleted all existing data.");

    // ========================================================================
    // COURSES
    // ========================================================================

    const courses = await db
      .insert(schema.courses)
      .values([
        { id: 1, title: "TDS & TCS", imageSrc: "/tds.svg" },
        { id: 2, title: "Capital Gains", imageSrc: "/capital-gains.svg" },
        { id: 3, title: "Salary Income", imageSrc: "/salary.svg" },
        { id: 4, title: "House Property", imageSrc: "/house-property.svg" },
        { id: 5, title: "Business & Profession", imageSrc: "/business.svg" },
        { id: 6, title: "Deductions", imageSrc: "/deductions.svg" },
        { id: 7, title: "Exempt Income", imageSrc: "/exempt-income.svg" },
        { id: 8, title: "Basics & Definitions", imageSrc: "/basics.svg" },
      ])
      .returning();

    console.log(`Inserted ${courses.length} courses.`);

    // ========================================================================
    // UNITS
    // ========================================================================

    const units = await db
      .insert(schema.units)
      .values([
        // Course 1: TDS & TCS
        { id: 1, title: "TDS Provisions", description: "Tax Deducted at Source under the new Income Tax Act 2025", courseId: 1, order: 1 },
        { id: 2, title: "TCS & Returns", description: "Tax Collected at Source and TDS/TCS return filing", courseId: 1, order: 2 },
        // Course 2: Capital Gains
        { id: 3, title: "Capital Gains Basics", description: "Charging section, computation, and classification of capital gains", courseId: 2, order: 1 },
        { id: 4, title: "Exemptions & Tax Rates", description: "Capital gains exemptions and applicable tax rates under the new Act", courseId: 2, order: 2 },
        // Course 3: Salary Income
        { id: 5, title: "Salary Computation", description: "Charging section, allowances, and perquisites under salary income", courseId: 3, order: 1 },
        { id: 6, title: "Deductions & Exemptions", description: "Standard deduction, HRA, and other salary-related deductions", courseId: 3, order: 2 },
        // Course 4: House Property
        { id: 7, title: "Annual Value & Taxation", description: "Computation of income from house property and annual value", courseId: 4, order: 1 },
        { id: 8, title: "Deductions & Special Cases", description: "Interest deduction, standard deduction, and deemed let-out provisions", courseId: 4, order: 2 },
        // Course 5: Business & Profession
        { id: 9, title: "Business Income Basics", description: "Charging section, depreciation, and allowable deductions", courseId: 5, order: 1 },
        { id: 10, title: "Presumptive Taxation & Disallowances", description: "Presumptive taxation schemes and specific disallowances", courseId: 5, order: 2 },
        // Course 6: Deductions
        { id: 11, title: "Investment Deductions", description: "Deductions for investments under 80C equivalent, NPS, and insurance", courseId: 6, order: 1 },
        { id: 12, title: "Other Deductions", description: "Deductions for education loan, donations, and savings interest", courseId: 6, order: 2 },
        // Course 7: Exempt Income
        { id: 13, title: "Schedule-Based Exemptions", description: "Understanding the new schedule-based exemption structure", courseId: 7, order: 1 },
        { id: 14, title: "Specific Exemptions", description: "Agricultural income, capital gains threshold, and employment exemptions", courseId: 7, order: 2 },
        // Course 8: Basics & Definitions
        { id: 15, title: "Key Definitions", description: "Important definitions and terminology changes in the new Act", courseId: 8, order: 1 },
        { id: 16, title: "Structure & Scope", description: "Overall structure of the new Act and scope of total income", courseId: 8, order: 2 },
      ])
      .returning();

    console.log(`Inserted ${units.length} units.`);

    // ========================================================================
    // LESSONS
    // ========================================================================

    const lessons = await db
      .insert(schema.lessons)
      .values([
        // Unit 1: TDS Provisions (Course 1)
        { id: 1, title: "TDS on Salary", unitId: 1, order: 1, tier: 1 },
        { id: 2, title: "TDS on Non-Salary Payments", unitId: 1, order: 2, tier: 1 },
        { id: 3, title: "Consolidated TDS Schedule", unitId: 1, order: 3, tier: 1 },
        // Unit 2: TCS & Returns (Course 1)
        { id: 4, title: "TCS Provisions", unitId: 2, order: 1, tier: 1 },
        { id: 5, title: "TDS/TCS Returns", unitId: 2, order: 2, tier: 1 },
        // Unit 3: Capital Gains Basics (Course 2)
        { id: 6, title: "Charging Section & Computation", unitId: 3, order: 1, tier: 1 },
        { id: 7, title: "Short-Term vs Long-Term Classification", unitId: 3, order: 2, tier: 1 },
        { id: 8, title: "Stamp Duty & Transfer Provisions", unitId: 3, order: 3, tier: 1 },
        // Unit 4: Exemptions & Tax Rates (Course 2)
        { id: 9, title: "Capital Gains Exemptions", unitId: 4, order: 1, tier: 1 },
        { id: 10, title: "Tax Rates on Capital Gains", unitId: 4, order: 2, tier: 1 },
        // Unit 5: Salary Computation (Course 3)
        { id: 11, title: "Salary Charging Section", unitId: 5, order: 1, tier: 1 },
        { id: 12, title: "Perquisites & Allowances", unitId: 5, order: 2, tier: 1 },
        // Unit 6: Deductions & Exemptions from Salary (Course 3)
        { id: 13, title: "Standard Deduction & Professional Tax", unitId: 6, order: 1, tier: 1 },
        { id: 14, title: "HRA & Entertainment Allowance", unitId: 6, order: 2, tier: 1 },
        { id: 15, title: "Salary Tax Planning", unitId: 6, order: 3, tier: 1 },
        // Unit 7: Annual Value & Taxation (Course 4)
        { id: 16, title: "Income from House Property Basics", unitId: 7, order: 1, tier: 1 },
        { id: 17, title: "Annual Value Determination", unitId: 7, order: 2, tier: 1 },
        // Unit 8: HP Deductions & Special Cases (Course 4)
        { id: 18, title: "Deductions under House Property", unitId: 8, order: 1, tier: 1 },
        { id: 19, title: "Self-Occupied & Deemed Let-Out", unitId: 8, order: 2, tier: 1 },
        { id: 20, title: "House Property Scenarios", unitId: 8, order: 3, tier: 1 },
        // Unit 9: Business Income Basics (Course 5)
        { id: 21, title: "Business Charging Section", unitId: 9, order: 1, tier: 1 },
        { id: 22, title: "Depreciation", unitId: 9, order: 2, tier: 1 },
        { id: 23, title: "Allowable Deductions", unitId: 9, order: 3, tier: 1 },
        // Unit 10: Presumptive & Disallowances (Course 5)
        { id: 24, title: "Presumptive Taxation", unitId: 10, order: 1, tier: 1 },
        { id: 25, title: "Specific Disallowances", unitId: 10, order: 2, tier: 1 },
        // Unit 11: Investment Deductions (Course 6)
        { id: 26, title: "Section 80C Equivalent", unitId: 11, order: 1, tier: 1 },
        { id: 27, title: "NPS & Insurance Deductions", unitId: 11, order: 2, tier: 1 },
        // Unit 12: Other Deductions (Course 6)
        { id: 28, title: "Education Loan & Donations", unitId: 12, order: 1, tier: 1 },
        { id: 29, title: "Savings Interest & Regime Comparison", unitId: 12, order: 2, tier: 1 },
        { id: 30, title: "Deduction Strategy", unitId: 12, order: 3, tier: 1 },
        // Unit 13: Schedule-Based Exemptions (Course 7)
        { id: 31, title: "New Schedule Structure", unitId: 13, order: 1, tier: 1 },
        { id: 32, title: "Employment-Related Exemptions", unitId: 13, order: 2, tier: 1 },
        // Unit 14: Specific Exemptions (Course 7)
        { id: 33, title: "Agricultural & Capital Gains Exemptions", unitId: 14, order: 1, tier: 1 },
        { id: 34, title: "Gratuity & Leave Encashment", unitId: 14, order: 2, tier: 1 },
        { id: 35, title: "Exempt Income Scenarios", unitId: 14, order: 3, tier: 1 },
        // Unit 15: Key Definitions (Course 8)
        { id: 36, title: "Tax Year & Person", unitId: 15, order: 1, tier: 1 },
        { id: 37, title: "Income & Residential Status", unitId: 15, order: 2, tier: 1 },
        // Unit 16: Structure & Scope (Course 8)
        { id: 38, title: "New Act Overview", unitId: 16, order: 1, tier: 1 },
        { id: 39, title: "Total Income & Scope", unitId: 16, order: 2, tier: 1 },
        { id: 40, title: "Transition & Key Changes", unitId: 16, order: 3, tier: 1 },
      ])
      .returning();

    console.log(`Inserted ${lessons.length} lessons.`);

    // ========================================================================
    // CHALLENGES & OPTIONS
    // ========================================================================
    // Helper: each challenge gets a unique ID, auto-incremented
    let challengeId = 0;
    let optionId = 0;

    const allChallenges: (typeof schema.challenges.$inferInsert)[] = [];
    const allOptions: (typeof schema.challengeOptions.$inferInsert)[] = [];

    const addQuestion = (
      lessonId: number,
      order: number,
      question: string,
      difficulty: "easy" | "medium" | "hard",
      explanation: string,
      oldSection: string | null,
      newSection: string | null,
      tags: string,
      options: { text: string; correct: boolean }[],
      extra?: {
        tier?: number;
        explanationWrong?: string;
        subConcepts?: string;
        isReview?: boolean;
      }
    ) => {
      challengeId++;
      allChallenges.push({
        id: challengeId,
        lessonId,
        type: "SELECT",
        question,
        order,
        difficulty,
        tier: extra?.tier ?? 1,
        explanation,
        explanationWrong: extra?.explanationWrong ?? null,
        oldSection,
        newSection,
        tags,
        subConcepts: extra?.subConcepts ?? null,
        isReview: extra?.isReview ?? false,
      });
      for (const opt of options) {
        optionId++;
        allOptions.push({
          id: optionId,
          challengeId,
          text: opt.text,
          correct: opt.correct,
          imageSrc: null,
          audioSrc: null,
        });
      }
    };

    // ====================================================================
    // COURSE 1: TDS & TCS
    // ====================================================================

    // Lesson 1: TDS on Salary (Unit 1)
    addQuestion(1, 1,
      "Under the new Income Tax Act 2025, which section governs TDS on salary?",
      "easy",
      "Old Section 192 (TDS on salary) has been mapped to new Section 392 in the Income Tax Act 2025.",
      "Section 192", "Section 392", "TDS,salary,section-mapping",
      [
        { text: "Section 392", correct: true },
        { text: "Section 393", correct: false },
        { text: "Section 192", correct: false },
        { text: "Section 394", correct: false },
      ]
    );
    addQuestion(1, 2,
      "Which of the following statements about TDS on salary under the new Act is TRUE?",
      "medium",
      "TDS on salary remains a standalone provision under Section 392, separate from the consolidated TDS schedule under Section 393.",
      "Section 192", "Section 392", "TDS,salary,true-false",
      [
        { text: "TDS on salary is governed by a separate section (Sec 392) and not consolidated under Sec 393", correct: true },
        { text: "TDS on salary is now part of the consolidated schedule under Sec 393", correct: false },
        { text: "TDS on salary has been abolished under the new Act", correct: false },
        { text: "TDS on salary now falls under TCS provisions of Sec 394", correct: false },
      ]
    );
    addQuestion(1, 3,
      "An employer deducting TDS on salary of Rs 12 lakh per annum must comply with which new section?",
      "medium",
      "Section 392 of the new Act governs TDS on salary, replacing old Section 192.",
      "Section 192", "Section 392", "TDS,salary,scenario",
      [
        { text: "Section 392", correct: true },
        { text: "Section 194A", correct: false },
        { text: "Section 393", correct: false },
        { text: "Section 206C", correct: false },
      ]
    );
    addQuestion(1, 4,
      "Old Section 192 of the Income Tax Act 1961 corresponds to which section in the new Act?",
      "easy",
      "Section 192 (TDS on salary) has been renumbered as Section 392.",
      "Section 192", "Section 392", "TDS,salary,section-mapping",
      [
        { text: "Section 392", correct: true },
        { text: "Section 292", correct: false },
        { text: "Section 393", correct: false },
        { text: "Section 395", correct: false },
      ]
    );
    addQuestion(1, 5,
      "Which of the following is a key change in TDS on salary under the new Act?",
      "hard",
      "The section number has changed from 192 to 392 but TDS on salary remains a dedicated provision, unlike other TDS sections which were consolidated.",
      "Section 192", "Section 392", "TDS,salary,what-changed",
      [
        { text: "Salary TDS retains a dedicated section (392) while other TDS provisions are consolidated", correct: true },
        { text: "TDS on salary has been merged into the TCS provisions", correct: false },
        { text: "Employers no longer need to deduct TDS on salary", correct: false },
        { text: "TDS on salary is now optional for amounts below Rs 10 lakh", correct: false },
      ]
    );

    // Lesson 2: TDS on Non-Salary Payments (Unit 1)
    addQuestion(2, 1,
      "Under the new Act, TDS on interest (previously Section 194A) is now governed by:",
      "easy",
      "TDS on interest other than salary was under old Section 194A and is now covered under the Schedule to Section 393.",
      "Section 194A", "Schedule to Sec 393", "TDS,interest,section-mapping",
      [
        { text: "Schedule to Section 393", correct: true },
        { text: "Section 392", correct: false },
        { text: "Section 194A (retained as is)", correct: false },
        { text: "Section 395", correct: false },
      ]
    );
    addQuestion(2, 2,
      "TDS on payments to contractors was governed by Section 194C. Under the new Act, it falls under:",
      "easy",
      "Old Section 194C (contractor payments) is now part of the consolidated Schedule to Section 393.",
      "Section 194C", "Schedule to Sec 393", "TDS,contractor,section-mapping",
      [
        { text: "Schedule to Section 393", correct: true },
        { text: "Section 392", correct: false },
        { text: "Section 394", correct: false },
        { text: "Section 194C (unchanged)", correct: false },
      ]
    );
    addQuestion(2, 3,
      "Which of the following TDS provisions has NOT been consolidated under Section 393?",
      "medium",
      "TDS on salary (old Sec 192, new Sec 392) is kept separate. All other TDS provisions (194A, 194C, 194H, 194I, 194J) are consolidated under Section 393.",
      null, "Section 392, 393", "TDS,consolidation,what-changed",
      [
        { text: "TDS on salary", correct: true },
        { text: "TDS on interest", correct: false },
        { text: "TDS on contractor payments", correct: false },
        { text: "TDS on rent", correct: false },
      ]
    );
    addQuestion(2, 4,
      "Old Section 194J (TDS on professional fees) is now covered under:",
      "easy",
      "Section 194J (professional/technical fees) has been consolidated into the Schedule to Section 393.",
      "Section 194J", "Schedule to Sec 393", "TDS,professional-fees,section-mapping",
      [
        { text: "Schedule to Section 393", correct: true },
        { text: "Section 392", correct: false },
        { text: "Section 394", correct: false },
        { text: "Section 194J (retained)", correct: false },
      ]
    );
    addQuestion(2, 5,
      "A company pays rent of Rs 3 lakh per month. Under the new Act, TDS on this rent is governed by:",
      "medium",
      "TDS on rent (old Sec 194I) is now part of the Schedule to Section 393 under the consolidated TDS framework.",
      "Section 194I", "Schedule to Sec 393", "TDS,rent,scenario",
      [
        { text: "Schedule to Section 393", correct: true },
        { text: "Section 392", correct: false },
        { text: "Section 194I (unchanged)", correct: false },
        { text: "Section 395", correct: false },
      ]
    );

    // Lesson 3: Consolidated TDS Schedule (Unit 1)
    addQuestion(3, 1,
      "What is the key structural change in TDS provisions under the new Act?",
      "medium",
      "The new Act consolidates all TDS provisions (except salary) under Section 393 with schedules/tables, instead of separate sections for each type.",
      null, "Section 393", "TDS,consolidation,what-changed",
      [
        { text: "All non-salary TDS provisions are consolidated under Sec 393 with schedules", correct: true },
        { text: "Each TDS type still has its own separate section", correct: false },
        { text: "TDS provisions have been moved to a separate statute", correct: false },
        { text: "TDS is now governed entirely by CBDT notifications", correct: false },
      ]
    );
    addQuestion(3, 2,
      "TDS on commission (old Section 194H) is now found in:",
      "easy",
      "Old Section 194H (commission/brokerage) is consolidated into the Schedule to Section 393.",
      "Section 194H", "Schedule to Sec 393", "TDS,commission,section-mapping",
      [
        { text: "Schedule to Section 393", correct: true },
        { text: "Section 392", correct: false },
        { text: "Section 395", correct: false },
        { text: "Section 194H (retained)", correct: false },
      ]
    );
    addQuestion(3, 3,
      "Which of the following best describes the consolidation approach for TDS under the new Act?",
      "hard",
      "Instead of multiple separate sections (194A to 194Q), the new Act uses a single Section 393 with detailed schedules/tables specifying rates and thresholds for different payment types.",
      null, "Section 393", "TDS,consolidation,what-changed",
      [
        { text: "A single section (393) with schedules/tables for different payment types", correct: true },
        { text: "A single section with no supporting schedules", correct: false },
        { text: "Multiple new sections numbered 393A, 393B, etc.", correct: false },
        { text: "TDS provisions remain identical to the old Act", correct: false },
      ]
    );
    addQuestion(3, 4,
      "Your client makes both salary payments and professional fee payments. Under the new Act, how many distinct TDS sections apply?",
      "hard",
      "Salary TDS is under Section 392 (standalone) and professional fees TDS falls under Section 393 (consolidated). So two distinct sections apply.",
      "Section 192, 194J", "Section 392, 393", "TDS,scenario,consolidation",
      [
        { text: "Two: Section 392 for salary and Section 393 for professional fees", correct: true },
        { text: "One: everything is under Section 393", correct: false },
        { text: "Three: Sections 392, 393, and 394", correct: false },
        { text: "Four: one section per payment type", correct: false },
      ]
    );
    addQuestion(3, 5,
      "Under the old Act, how many separate sections dealt with various TDS provisions (194A to 194Q)?",
      "medium",
      "The old Act had numerous separate TDS sections (194A, 194B, 194C, etc. up to 194Q and beyond). The new Act consolidates most of these under Section 393.",
      "Sections 194A-194Q", "Section 393", "TDS,consolidation,what-changed",
      [
        { text: "More than 20 separate sections", correct: true },
        { text: "Exactly 5 sections", correct: false },
        { text: "Only 3 sections", correct: false },
        { text: "Only 1 section", correct: false },
      ]
    );

    // Lesson 4: TCS Provisions (Unit 2)
    addQuestion(4, 1,
      "Old Section 206C (TCS) corresponds to which section in the new Act?",
      "easy",
      "Section 206C of the old Act (Tax Collected at Source) is mapped to Section 394 in the new Act.",
      "Section 206C", "Section 394", "TCS,section-mapping",
      [
        { text: "Section 394", correct: true },
        { text: "Section 393", correct: false },
        { text: "Section 392", correct: false },
        { text: "Section 206C (unchanged)", correct: false },
      ]
    );
    addQuestion(4, 2,
      "Which of the following is TRUE about TCS under the new Act?",
      "medium",
      "TCS is governed by Section 394 in the new Act, maintaining a separate identity from TDS provisions in Sections 392-393.",
      "Section 206C", "Section 394", "TCS,true-false",
      [
        { text: "TCS has its own dedicated section (394) separate from TDS", correct: true },
        { text: "TCS has been merged with TDS under Section 393", correct: false },
        { text: "TCS has been abolished in the new Act", correct: false },
        { text: "TCS is now governed by the same schedules as TDS", correct: false },
      ]
    );
    addQuestion(4, 3,
      "A seller collecting TCS on sale of scrap must now refer to which section?",
      "medium",
      "All TCS provisions previously under Section 206C are now governed by Section 394.",
      "Section 206C", "Section 394", "TCS,scenario",
      [
        { text: "Section 394", correct: true },
        { text: "Section 393", correct: false },
        { text: "Section 206C (old Act still applies)", correct: false },
        { text: "Section 395", correct: false },
      ]
    );
    addQuestion(4, 4,
      "The new Act keeps TDS and TCS under:",
      "easy",
      "TDS on salary is Section 392, other TDS is Section 393, and TCS is Section 394 - all under separate sections.",
      null, "Sections 392-394", "TDS,TCS,structure",
      [
        { text: "Separate sections: 392 (salary TDS), 393 (other TDS), 394 (TCS)", correct: true },
        { text: "A single consolidated section for both TDS and TCS", correct: false },
        { text: "TDS and TCS are no longer part of the Income Tax Act", correct: false },
        { text: "Only two sections: one for TDS and one for TCS", correct: false },
      ]
    );
    addQuestion(4, 5,
      "Which of the following changes was introduced for TCS in the new Act?",
      "hard",
      "The section number changed from 206C to 394, but TCS retains a dedicated provision separate from TDS. The consolidation approach mainly applies to TDS (non-salary).",
      "Section 206C", "Section 394", "TCS,what-changed",
      [
        { text: "TCS moved from Section 206C to a dedicated Section 394", correct: true },
        { text: "TCS provisions were eliminated entirely", correct: false },
        { text: "TCS was merged into the TDS schedule under Section 393", correct: false },
        { text: "TCS rates were doubled under the new Act", correct: false },
      ]
    );

    // Lesson 5: TDS/TCS Returns (Unit 2)
    addQuestion(5, 1,
      "TDS return filing under the new Act is governed by which section?",
      "easy",
      "TDS return filing is now under Section 395 in the new Act.",
      null, "Section 395", "TDS,returns,section-mapping",
      [
        { text: "Section 395", correct: true },
        { text: "Section 393", correct: false },
        { text: "Section 392", correct: false },
        { text: "Section 200 (old Act)", correct: false },
      ]
    );
    addQuestion(5, 2,
      "Your client is a deductor who needs to file TDS returns. Under the new Act, which section specifies the return filing requirement?",
      "medium",
      "Section 395 of the new Act deals with TDS return filing requirements.",
      null, "Section 395", "TDS,returns,scenario",
      [
        { text: "Section 395", correct: true },
        { text: "Section 394", correct: false },
        { text: "Section 392", correct: false },
        { text: "Section 393", correct: false },
      ]
    );
    addQuestion(5, 3,
      "Which of the following is TRUE about TDS/TCS return filing under the new Act?",
      "medium",
      "TDS return filing has a dedicated section (395), keeping compliance requirements clearly defined in the new Act.",
      null, "Section 395", "TDS,TCS,returns,true-false",
      [
        { text: "TDS return filing has a dedicated Section 395 in the new Act", correct: true },
        { text: "TDS returns are no longer required under the new Act", correct: false },
        { text: "TDS and TCS returns have been merged into income tax return filing", correct: false },
        { text: "Only TCS collectors need to file returns; TDS deductors are exempt", correct: false },
      ]
    );
    addQuestion(5, 4,
      "The TDS/TCS framework under the new Act spans which sections?",
      "hard",
      "Sections 392 (salary TDS), 393 (other TDS), 394 (TCS), and 395 (return filing) form the complete TDS/TCS framework.",
      null, "Sections 392-395", "TDS,TCS,structure",
      [
        { text: "Sections 392 to 395", correct: true },
        { text: "Sections 192 to 206C", correct: false },
        { text: "Sections 100 to 110", correct: false },
        { text: "Sections 393 to 394 only", correct: false },
      ]
    );
    addQuestion(5, 5,
      "Compared to the old Act, the new Act's TDS provisions are:",
      "hard",
      "The new Act consolidates previously scattered TDS provisions (194A through 194Q, etc.) into a streamlined Sections 392-395 framework with schedules.",
      null, "Sections 392-395", "TDS,what-changed,consolidation",
      [
        { text: "More consolidated, using schedules/tables under fewer sections", correct: true },
        { text: "Expanded into more individual sections than before", correct: false },
        { text: "Completely unchanged from the old Act", correct: false },
        { text: "Moved to a separate TDS statute outside the Income Tax Act", correct: false },
      ]
    );

    // ====================================================================
    // COURSE 2: CAPITAL GAINS
    // ====================================================================

    // Lesson 6: Charging Section & Computation (Unit 3)
    addQuestion(6, 1,
      "Old Section 45 (Capital gains charging section) corresponds to which section in the new Act?",
      "easy",
      "The charging section for capital gains moves from Section 45 to Section 67.",
      "Section 45", "Section 67", "capital-gains,charging-section,section-mapping",
      [
        { text: "Section 67", correct: true },
        { text: "Section 72", correct: false },
        { text: "Section 78", correct: false },
        { text: "Section 45 (unchanged)", correct: false },
      ]
    );
    addQuestion(6, 2,
      "The mode of computation of capital gains (old Section 48) is now covered by:",
      "easy",
      "Old Section 48 (mode of computation) has been mapped to Section 72 in the new Act.",
      "Section 48", "Section 72", "capital-gains,computation,section-mapping",
      [
        { text: "Section 72", correct: true },
        { text: "Section 67", correct: false },
        { text: "Section 73", correct: false },
        { text: "Section 48 (retained)", correct: false },
      ]
    );
    addQuestion(6, 3,
      "Your client sold a capital asset. To determine the computation method under the new Act, you would refer to:",
      "medium",
      "Section 72 of the new Act deals with the mode of computation of capital gains, replacing old Section 48.",
      "Section 48", "Section 72", "capital-gains,computation,scenario",
      [
        { text: "Section 72", correct: true },
        { text: "Section 67", correct: false },
        { text: "Section 45", correct: false },
        { text: "Section 73", correct: false },
      ]
    );
    addQuestion(6, 4,
      "Which of the following is TRUE about the capital gains charging section under the new Act?",
      "medium",
      "The charging section moved from Section 45 to Section 67. The basic principle that capital gains arise on transfer of a capital asset continues.",
      "Section 45", "Section 67", "capital-gains,true-false",
      [
        { text: "The charging section has moved from Sec 45 to Sec 67 but the core principle remains the same", correct: true },
        { text: "Capital gains are no longer taxable under the new Act", correct: false },
        { text: "The charging section number remains Section 45", correct: false },
        { text: "Capital gains are now taxed under the head 'Other Sources'", correct: false },
      ]
    );
    addQuestion(6, 5,
      "Under the new Act, the full sale consideration minus cost of acquisition and improvement is computed under:",
      "medium",
      "Section 72 governs the mode of computation (full sale consideration minus indexed/actual cost of acquisition and improvement).",
      "Section 48", "Section 72", "capital-gains,computation,scenario",
      [
        { text: "Section 72", correct: true },
        { text: "Section 67", correct: false },
        { text: "Section 68", correct: false },
        { text: "Section 78", correct: false },
      ]
    );

    // Lesson 7: Short-Term vs Long-Term Classification (Unit 3)
    addQuestion(7, 1,
      "The holding period for classifying assets as short-term or long-term was defined in old Section 2(42A). In the new Act, it is in:",
      "medium",
      "The definition of short-term capital asset (holding period) moved from Sec 2(42A) to Sec 2(29) read with the First Schedule.",
      "Section 2(42A)", "Section 2(29) read with First Schedule", "capital-gains,holding-period,section-mapping",
      [
        { text: "Section 2(29) read with the First Schedule", correct: true },
        { text: "Section 67", correct: false },
        { text: "Section 2(42A) (unchanged)", correct: false },
        { text: "Section 72", correct: false },
      ]
    );
    addQuestion(7, 2,
      "What change has the new Act introduced regarding the holding period classification?",
      "hard",
      "The new Act simplifies the holding period concept by placing it in the First Schedule rather than scattered definitions.",
      "Section 2(42A)", "First Schedule", "capital-gains,holding-period,what-changed",
      [
        { text: "Holding period rules are simplified and placed in the First Schedule", correct: true },
        { text: "All assets now have a uniform 3-year holding period", correct: false },
        { text: "The concept of holding period has been abolished", correct: false },
        { text: "Holding period is now determined by CBDT notification only", correct: false },
      ]
    );
    addQuestion(7, 3,
      "Under the new Act, to determine whether a capital asset is short-term, a CA should refer to:",
      "medium",
      "Section 2(29) defines short-term capital asset, and the First Schedule provides the detailed holding period rules.",
      "Section 2(42A)", "Section 2(29), First Schedule", "capital-gains,holding-period,scenario",
      [
        { text: "Section 2(29) and the First Schedule", correct: true },
        { text: "Section 67 only", correct: false },
        { text: "Section 72", correct: false },
        { text: "Section 2(42A) of the old Act", correct: false },
      ]
    );
    addQuestion(7, 4,
      "Which of the following is TRUE about capital asset classification in the new Act?",
      "medium",
      "The new Act uses Section 2(29) for the definition and the First Schedule for detailed holding period rules, simplifying the classification process.",
      null, "Section 2(29), First Schedule", "capital-gains,classification,true-false",
      [
        { text: "The First Schedule provides a simplified table for holding period classification", correct: true },
        { text: "Short-term and long-term distinction has been eliminated", correct: false },
        { text: "All gains are now treated as short-term", correct: false },
        { text: "The holding period rules are unchanged from the old Act", correct: false },
      ]
    );
    addQuestion(7, 5,
      "A client holds listed equity shares. To check the applicable holding period under the new Act, you refer to:",
      "hard",
      "For listed equity shares, the holding period classification is found in the First Schedule read with Section 2(29).",
      "Section 2(42A)", "Section 2(29), First Schedule", "capital-gains,listed-equity,scenario",
      [
        { text: "The First Schedule to the new Act", correct: true },
        { text: "Section 67", correct: false },
        { text: "Section 68", correct: false },
        { text: "Section 2(42A) of the old Act", correct: false },
      ]
    );

    // Lesson 8: Stamp Duty & Transfer Provisions (Unit 3)
    addQuestion(8, 1,
      "Old Section 50C (stamp duty value for capital gains) corresponds to which new section?",
      "easy",
      "Section 50C (adoption of stamp duty value as full value of consideration) is now Section 73.",
      "Section 50C", "Section 73", "capital-gains,stamp-duty,section-mapping",
      [
        { text: "Section 73", correct: true },
        { text: "Section 72", correct: false },
        { text: "Section 67", correct: false },
        { text: "Section 50C (unchanged)", correct: false },
      ]
    );
    addQuestion(8, 2,
      "If the stamp duty value of a property exceeds the actual sale consideration, the deemed consideration under the new Act is determined by:",
      "medium",
      "Section 73 (replacing old Sec 50C) deals with the adoption of stamp duty value as deemed sale consideration.",
      "Section 50C", "Section 73", "capital-gains,stamp-duty,scenario",
      [
        { text: "Section 73", correct: true },
        { text: "Section 72", correct: false },
        { text: "Section 78", correct: false },
        { text: "Section 67", correct: false },
      ]
    );
    addQuestion(8, 3,
      "Which statement about Section 73 of the new Act is TRUE?",
      "medium",
      "Section 73 replaces old Section 50C and continues the provision that stamp duty value may be adopted as deemed sale consideration.",
      "Section 50C", "Section 73", "capital-gains,stamp-duty,true-false",
      [
        { text: "It replaces old Sec 50C and continues the stamp duty value deeming provision", correct: true },
        { text: "It introduces a completely new concept not present in the old Act", correct: false },
        { text: "It deals with computation of capital gains", correct: false },
        { text: "It governs TDS on property transfers", correct: false },
      ]
    );
    addQuestion(8, 4,
      "Your client sells immovable property for Rs 80 lakh but stamp duty value is Rs 1 crore. Under the new Act, which section applies?",
      "hard",
      "Section 73 (old Sec 50C) provides that where the consideration is less than stamp duty value, the stamp duty value may be deemed as full value of consideration.",
      "Section 50C", "Section 73", "capital-gains,stamp-duty,scenario",
      [
        { text: "Section 73", correct: true },
        { text: "Section 67", correct: false },
        { text: "Section 72", correct: false },
        { text: "Section 79", correct: false },
      ]
    );
    addQuestion(8, 5,
      "Old Section 50C and new Section 73 both deal with:",
      "easy",
      "Both sections deal with adoption of stamp duty value as deemed sale consideration for immovable property transfers.",
      "Section 50C", "Section 73", "capital-gains,stamp-duty,section-mapping",
      [
        { text: "Adoption of stamp duty value as deemed sale consideration", correct: true },
        { text: "Exemption on sale of residential house", correct: false },
        { text: "Tax rates on capital gains", correct: false },
        { text: "Holding period classification", correct: false },
      ]
    );

    // Lesson 9: Capital Gains Exemptions (Unit 4)
    addQuestion(9, 1,
      "Old Section 54 (exemption on sale of residential house) corresponds to which new section?",
      "easy",
      "Section 54 (exemption on reinvestment in residential house) is now Section 78.",
      "Section 54", "Section 78", "capital-gains,exemption,section-mapping",
      [
        { text: "Section 78", correct: true },
        { text: "Section 79", correct: false },
        { text: "Section 80", correct: false },
        { text: "Section 54 (unchanged)", correct: false },
      ]
    );
    addQuestion(9, 2,
      "Your client sold a residential house and wants to claim exemption by investing in another house. Under the new Act, which section applies?",
      "medium",
      "Section 78 (replacing old Sec 54) provides exemption from capital gains on sale of residential house if reinvested in another residential house.",
      "Section 54", "Section 78", "capital-gains,exemption,scenario",
      [
        { text: "Section 78", correct: true },
        { text: "Section 79", correct: false },
        { text: "Section 67", correct: false },
        { text: "Section 54 (old Act)", correct: false },
      ]
    );
    addQuestion(9, 3,
      "Old Section 54EC (exemption for investment in specified bonds) is now:",
      "easy",
      "Section 54EC (capital gains bonds exemption) has been mapped to Section 79.",
      "Section 54EC", "Section 79", "capital-gains,bonds,section-mapping",
      [
        { text: "Section 79", correct: true },
        { text: "Section 78", correct: false },
        { text: "Section 80", correct: false },
        { text: "Section 54EC (retained)", correct: false },
      ]
    );
    addQuestion(9, 4,
      "Old Section 54F (exemption on sale of non-residential asset with reinvestment in house) is now:",
      "easy",
      "Section 54F is mapped to Section 80 in the new Act.",
      "Section 54F", "Section 80", "capital-gains,exemption,section-mapping",
      [
        { text: "Section 80", correct: true },
        { text: "Section 78", correct: false },
        { text: "Section 79", correct: false },
        { text: "Section 54F (retained)", correct: false },
      ]
    );
    addQuestion(9, 5,
      "A client sells a commercial property and invests in NHAI/REC bonds. The exemption under the new Act is under:",
      "medium",
      "Investment in specified bonds (NHAI, REC, etc.) for capital gains exemption is governed by Section 79 (old Sec 54EC).",
      "Section 54EC", "Section 79", "capital-gains,bonds,scenario",
      [
        { text: "Section 79", correct: true },
        { text: "Section 78", correct: false },
        { text: "Section 80", correct: false },
        { text: "Section 67", correct: false },
      ]
    );

    // Lesson 10: Tax Rates on Capital Gains (Unit 4)
    addQuestion(10, 1,
      "Tax rates on short-term capital gains under the new Act are specified in:",
      "easy",
      "Section 68 of the new Act specifies tax rates on short-term capital gains.",
      null, "Section 68", "capital-gains,tax-rates,section-mapping",
      [
        { text: "Section 68", correct: true },
        { text: "Section 69", correct: false },
        { text: "Section 67", correct: false },
        { text: "Section 72", correct: false },
      ]
    );
    addQuestion(10, 2,
      "Tax rates on long-term capital gains under the new Act are specified in:",
      "easy",
      "Section 69 of the new Act specifies tax rates on long-term capital gains.",
      null, "Section 69", "capital-gains,tax-rates,section-mapping",
      [
        { text: "Section 69", correct: true },
        { text: "Section 68", correct: false },
        { text: "Section 67", correct: false },
        { text: "Section 72", correct: false },
      ]
    );
    addQuestion(10, 3,
      "Long-term capital gains up to Rs 1.25 lakh are exempt under which provision of the new Act?",
      "medium",
      "Section 69(2) provides that long-term capital gains up to Rs 1.25 lakh are exempt from tax.",
      null, "Section 69(2)", "capital-gains,exemption,tax-rates",
      [
        { text: "Section 69(2)", correct: true },
        { text: "Section 68(2)", correct: false },
        { text: "Section 78", correct: false },
        { text: "Section 10(38) of the old Act", correct: false },
      ]
    );
    addQuestion(10, 4,
      "Under the new Act, Sections 68 and 69 deal with:",
      "easy",
      "Section 68 covers STCG tax rates and Section 69 covers LTCG tax rates.",
      null, "Sections 68, 69", "capital-gains,tax-rates,structure",
      [
        { text: "Tax rates on short-term (Sec 68) and long-term (Sec 69) capital gains", correct: true },
        { text: "Exemptions from capital gains", correct: false },
        { text: "Mode of computation of capital gains", correct: false },
        { text: "Charging section for capital gains", correct: false },
      ]
    );
    addQuestion(10, 5,
      "Your client has LTCG of Rs 2 lakh from sale of listed equity shares. How much is exempt under Sec 69(2)?",
      "hard",
      "Under Section 69(2), LTCG up to Rs 1.25 lakh is exempt. The balance Rs 75,000 would be taxable.",
      null, "Section 69(2)", "capital-gains,exemption,scenario",
      [
        { text: "Rs 1.25 lakh is exempt; Rs 75,000 is taxable", correct: true },
        { text: "The entire Rs 2 lakh is exempt", correct: false },
        { text: "Rs 1 lakh is exempt; Rs 1 lakh is taxable", correct: false },
        { text: "No exemption is available", correct: false },
      ]
    );

    // ====================================================================
    // COURSE 3: SALARY INCOME
    // ====================================================================

    // Lesson 11: Salary Charging Section (Unit 5)
    addQuestion(11, 1,
      "The charging section for salary income (Section 15) in the new Act:",
      "easy",
      "Section 15 (Salaries) retains the same section number in the new Act.",
      "Section 15", "Section 15", "salary,charging-section,section-mapping",
      [
        { text: "Retains the same number - Section 15", correct: true },
        { text: "Has been renumbered to Section 115", correct: false },
        { text: "Has been merged with Section 17", correct: false },
        { text: "Has been abolished", correct: false },
      ]
    );
    addQuestion(11, 2,
      "Which of the following is TRUE about salary income taxation under the new Act?",
      "medium",
      "The charging section for salary (Sec 15) remains at the same section number, maintaining continuity.",
      "Section 15", "Section 15", "salary,true-false",
      [
        { text: "The charging section (Sec 15) retains its number from the old Act", correct: true },
        { text: "Salary income is now taxed under a different head of income", correct: false },
        { text: "Salary income is fully exempt under the new Act", correct: false },
        { text: "Section 15 now covers both salary and business income", correct: false },
      ]
    );
    addQuestion(11, 3,
      "Under which section does salary income become taxable in the new Act?",
      "easy",
      "Section 15 is the charging section for salary income in the new Act, same as the old Act.",
      "Section 15", "Section 15", "salary,charging-section",
      [
        { text: "Section 15", correct: true },
        { text: "Section 19", correct: false },
        { text: "Section 17", correct: false },
        { text: "Section 20", correct: false },
      ]
    );
    addQuestion(11, 4,
      "An employee receives salary of Rs 15 lakh. The income is chargeable under which section of the new Act?",
      "easy",
      "Salary income is chargeable under Section 15 of the new Act.",
      "Section 15", "Section 15", "salary,scenario",
      [
        { text: "Section 15", correct: true },
        { text: "Section 392", correct: false },
        { text: "Section 19", correct: false },
        { text: "Section 23", correct: false },
      ]
    );
    addQuestion(11, 5,
      "Which of the following salary-related sections has the same number in both old and new Acts?",
      "medium",
      "Section 15 (Salaries) retains the same number. Section 16 changed to 19, and Section 17 (Perquisites) also retains its number.",
      "Section 15, 17", "Section 15, 17", "salary,section-mapping",
      [
        { text: "Section 15 (Salaries) and Section 17 (Perquisites)", correct: true },
        { text: "Section 16 (Deductions from salary)", correct: false },
        { text: "Section 10(13A) (HRA exemption)", correct: false },
        { text: "All salary sections have new numbers", correct: false },
      ]
    );

    // Lesson 12: Perquisites & Allowances (Unit 5)
    addQuestion(12, 1,
      "Old Section 17 (Perquisites) corresponds to which section in the new Act?",
      "easy",
      "Section 17 dealing with the definition and valuation of perquisites retains the same number in the new Act.",
      "Section 17", "Section 17", "salary,perquisites,section-mapping",
      [
        { text: "Section 17 (same number retained)", correct: true },
        { text: "Section 19", correct: false },
        { text: "Section 15", correct: false },
        { text: "Section 117", correct: false },
      ]
    );
    addQuestion(12, 2,
      "Under the new Act, the definition and valuation of perquisites is found in:",
      "easy",
      "Section 17 continues to deal with perquisites in the new Act.",
      "Section 17", "Section 17", "salary,perquisites",
      [
        { text: "Section 17", correct: true },
        { text: "Section 15", correct: false },
        { text: "Section 19", correct: false },
        { text: "Second Schedule", correct: false },
      ]
    );
    addQuestion(12, 3,
      "Your client receives a rent-free accommodation from the employer. Perquisite valuation is governed by:",
      "medium",
      "Valuation of perquisites including rent-free accommodation continues under Section 17 of the new Act.",
      "Section 17", "Section 17", "salary,perquisites,scenario",
      [
        { text: "Section 17 of the new Act", correct: true },
        { text: "Section 15 of the new Act", correct: false },
        { text: "Section 19 of the new Act", correct: false },
        { text: "Second Schedule only", correct: false },
      ]
    );
    addQuestion(12, 4,
      "Which of the following is TRUE about perquisites under the new Act?",
      "medium",
      "The perquisites section retains the same number (17) for continuity, making transition easier for practitioners.",
      "Section 17", "Section 17", "salary,perquisites,true-false",
      [
        { text: "Section 17 retains the same number as in the old Act", correct: true },
        { text: "Perquisites are no longer taxable under the new Act", correct: false },
        { text: "Perquisites have been merged with Section 15", correct: false },
        { text: "All perquisites are now exempt under the new regime", correct: false },
      ]
    );
    addQuestion(12, 5,
      "The new Act treats perquisites provided by an employer as:",
      "medium",
      "Perquisites continue to be included in salary income and taxed under the head 'Salaries' per Section 17.",
      "Section 17", "Section 17", "salary,perquisites",
      [
        { text: "Part of salary income, taxable under Section 17 read with Section 15", correct: true },
        { text: "Exempt income under the Second Schedule", correct: false },
        { text: "Income from other sources", correct: false },
        { text: "Business income of the employee", correct: false },
      ]
    );

    // Lesson 13: Standard Deduction & Professional Tax (Unit 6)
    addQuestion(13, 1,
      "Old Section 16 (Deductions from salary) corresponds to which section in the new Act?",
      "easy",
      "Section 16 (deductions from salary including standard deduction) is now Section 19.",
      "Section 16", "Section 19", "salary,deductions,section-mapping",
      [
        { text: "Section 19", correct: true },
        { text: "Section 16 (unchanged)", correct: false },
        { text: "Section 15", correct: false },
        { text: "Section 17", correct: false },
      ]
    );
    addQuestion(13, 2,
      "The standard deduction for salaried employees under the new regime is:",
      "easy",
      "Under the new regime, the standard deduction is Rs 75,000 as per Section 19.",
      "Section 16", "Section 19", "salary,standard-deduction",
      [
        { text: "Rs 75,000", correct: true },
        { text: "Rs 50,000", correct: false },
        { text: "Rs 1,00,000", correct: false },
        { text: "Rs 40,000", correct: false },
      ]
    );
    addQuestion(13, 3,
      "Under Section 19 of the new Act, the standard deduction of Rs 75,000 is available to:",
      "medium",
      "The standard deduction of Rs 75,000 under the new regime is available to salaried employees under Section 19.",
      "Section 16", "Section 19", "salary,standard-deduction,scenario",
      [
        { text: "Salaried employees under the new tax regime", correct: true },
        { text: "Only government employees", correct: false },
        { text: "Only employees earning above Rs 15 lakh", correct: false },
        { text: "Self-employed professionals", correct: false },
      ]
    );
    addQuestion(13, 4,
      "Which of the following is a change from the old Act regarding standard deduction?",
      "medium",
      "The standard deduction amount has been increased to Rs 75,000 under the new regime (from Rs 50,000 in the old regime).",
      "Section 16", "Section 19", "salary,standard-deduction,what-changed",
      [
        { text: "Standard deduction increased to Rs 75,000 under the new regime", correct: true },
        { text: "Standard deduction has been abolished", correct: false },
        { text: "Standard deduction remains Rs 50,000", correct: false },
        { text: "Standard deduction is now Rs 1 lakh", correct: false },
      ]
    );
    addQuestion(13, 5,
      "An employee with salary income of Rs 10 lakh claims standard deduction under the new Act. The deduction under Section 19 is:",
      "easy",
      "The standard deduction is a flat Rs 75,000 regardless of salary amount, under Section 19.",
      "Section 16", "Section 19", "salary,standard-deduction,scenario",
      [
        { text: "Rs 75,000", correct: true },
        { text: "Rs 50,000", correct: false },
        { text: "10% of salary", correct: false },
        { text: "Rs 1,00,000", correct: false },
      ]
    );

    // Lesson 14: HRA & Entertainment Allowance (Unit 6)
    addQuestion(14, 1,
      "HRA exemption under the old Act was governed by Section 10(13A). In the new Act, it is in:",
      "easy",
      "HRA exemption has been moved from Section 10(13A) to the Second Schedule of the new Act.",
      "Section 10(13A)", "Second Schedule", "salary,HRA,section-mapping",
      [
        { text: "Second Schedule", correct: true },
        { text: "Section 19", correct: false },
        { text: "Section 10(13A) (unchanged)", correct: false },
        { text: "Section 15", correct: false },
      ]
    );
    addQuestion(14, 2,
      "Entertainment allowance deduction under the new Act is available to:",
      "medium",
      "Entertainment allowance deduction continues to be available only to government employees under the new Act.",
      null, null, "salary,entertainment-allowance",
      [
        { text: "Only government employees", correct: true },
        { text: "All salaried employees", correct: false },
        { text: "Employees earning above Rs 10 lakh", correct: false },
        { text: "No one - it has been abolished", correct: false },
      ]
    );
    addQuestion(14, 3,
      "Which of the following is TRUE about HRA exemption under the new Act?",
      "medium",
      "HRA exemption rules have been moved to the Second Schedule, as part of the new Act's table/schedule-based approach to exemptions.",
      "Section 10(13A)", "Second Schedule", "salary,HRA,true-false",
      [
        { text: "HRA exemption is now in the Second Schedule instead of Section 10(13A)", correct: true },
        { text: "HRA exemption has been abolished completely", correct: false },
        { text: "HRA exemption remains in Section 10(13A)", correct: false },
        { text: "HRA exemption is now unlimited", correct: false },
      ]
    );
    addQuestion(14, 4,
      "Your client is a government employee claiming entertainment allowance. Under the new Act, this deduction is:",
      "hard",
      "Entertainment allowance deduction continues to be restricted to government employees only under the new Act.",
      null, null, "salary,entertainment-allowance,scenario",
      [
        { text: "Available, as it is restricted to government employees only", correct: true },
        { text: "Not available as it has been abolished", correct: false },
        { text: "Available to all employees regardless of sector", correct: false },
        { text: "Available only if salary exceeds Rs 5 lakh", correct: false },
      ]
    );
    addQuestion(14, 5,
      "The new Act places HRA exemption in the Second Schedule. This is an example of:",
      "hard",
      "The new Act uses a table/schedule-based format for exemptions instead of a single Section 10 with multiple sub-clauses.",
      "Section 10", "Second Schedule", "salary,HRA,what-changed",
      [
        { text: "The new Act's schedule/table-based approach replacing Section 10 sub-clauses", correct: true },
        { text: "A temporary measure pending further legislation", correct: false },
        { text: "A change that eliminates HRA exemption", correct: false },
        { text: "An error in the drafting of the new Act", correct: false },
      ]
    );

    // Lesson 15: Salary Tax Planning (Unit 6)
    addQuestion(15, 1,
      "Under the new tax regime, which of the following salary deductions is available?",
      "medium",
      "Under the new regime, the standard deduction of Rs 75,000 under Section 19 is available. Most other deductions are restricted.",
      null, "Section 19", "salary,new-regime,deductions",
      [
        { text: "Standard deduction of Rs 75,000 (Sec 19)", correct: true },
        { text: "HRA exemption", correct: false },
        { text: "Leave travel allowance", correct: false },
        { text: "Section 80C deductions", correct: false },
      ]
    );
    addQuestion(15, 2,
      "An employee earning Rs 20 lakh chooses the new regime. The maximum standard deduction under Sec 19 is:",
      "easy",
      "The standard deduction is Rs 75,000 under the new regime, regardless of salary level.",
      null, "Section 19", "salary,standard-deduction,scenario",
      [
        { text: "Rs 75,000", correct: true },
        { text: "Rs 50,000", correct: false },
        { text: "Rs 2,00,000", correct: false },
        { text: "10% of salary", correct: false },
      ]
    );
    addQuestion(15, 3,
      "Which of the following is NOT available under the new tax regime for salary income?",
      "medium",
      "Under the new regime, HRA exemption and most Chapter VI-A deductions are not available. Only the standard deduction of Rs 75,000 is allowed.",
      null, null, "salary,new-regime,true-false",
      [
        { text: "HRA exemption", correct: true },
        { text: "Standard deduction of Rs 75,000", correct: false },
        { text: "Employer's NPS contribution deduction", correct: false },
        { text: "Professional tax deduction", correct: false },
      ]
    );
    addQuestion(15, 4,
      "Under the old regime, a salaried employee could claim how many more deductions compared to the new regime?",
      "hard",
      "The old regime allows HRA, LTA, 80C, 80D, entertainment allowance and many more deductions beyond just the standard deduction available in the new regime.",
      null, null, "salary,regime-comparison,what-changed",
      [
        { text: "Significantly more deductions including HRA, LTA, 80C, 80D etc.", correct: true },
        { text: "The same number of deductions", correct: false },
        { text: "Fewer deductions than the new regime", correct: false },
        { text: "No deductions were available under the old regime", correct: false },
      ]
    );
    addQuestion(15, 5,
      "A salaried employee under the new regime can claim standard deduction under Section 19 of:",
      "easy",
      "Standard deduction is Rs 75,000 under Section 19 for the new regime.",
      "Section 16", "Section 19", "salary,standard-deduction",
      [
        { text: "Rs 75,000", correct: true },
        { text: "Rs 50,000", correct: false },
        { text: "Rs 1,50,000", correct: false },
        { text: "Rs 25,000", correct: false },
      ]
    );

    // ====================================================================
    // COURSE 4: HOUSE PROPERTY
    // ====================================================================

    // Lesson 16: Income from House Property Basics (Unit 7)
    addQuestion(16, 1,
      "Old Section 22 (Income from house property) corresponds to which new section?",
      "easy",
      "Section 22 (charging section for house property) is now Section 20 in the new Act.",
      "Section 22", "Section 20", "house-property,charging-section,section-mapping",
      [
        { text: "Section 20", correct: true },
        { text: "Section 22 (unchanged)", correct: false },
        { text: "Section 21", correct: false },
        { text: "Section 24", correct: false },
      ]
    );
    addQuestion(16, 2,
      "Under the new Act, income from house property is chargeable under:",
      "easy",
      "Section 20 is the charging section for income from house property in the new Act.",
      "Section 22", "Section 20", "house-property,charging-section",
      [
        { text: "Section 20", correct: true },
        { text: "Section 22", correct: false },
        { text: "Section 21", correct: false },
        { text: "Section 23", correct: false },
      ]
    );
    addQuestion(16, 3,
      "Which of the following is TRUE about the house property charging section in the new Act?",
      "medium",
      "The charging section moved from Section 22 to Section 20, but the basic charge on annual value of house property remains the same.",
      "Section 22", "Section 20", "house-property,true-false",
      [
        { text: "It moved from Sec 22 to Sec 20 but the basic charge remains similar", correct: true },
        { text: "House property income is no longer a separate head of income", correct: false },
        { text: "The section number remains unchanged at 22", correct: false },
        { text: "Only commercial properties are taxed under this head now", correct: false },
      ]
    );
    addQuestion(16, 4,
      "Your client owns a let-out property. The rental income is taxable under which head and section of the new Act?",
      "medium",
      "Rental income from let-out property is taxable under the head 'Income from House Property' governed by Section 20.",
      "Section 22", "Section 20", "house-property,scenario",
      [
        { text: "Income from House Property, Section 20", correct: true },
        { text: "Business income, Section 23", correct: false },
        { text: "Income from Other Sources", correct: false },
        { text: "Capital Gains, Section 67", correct: false },
      ]
    );
    addQuestion(16, 5,
      "The annual value determination was under old Section 23. In the new Act, it is under:",
      "easy",
      "Old Section 23 (annual value) has been mapped to Section 21 in the new Act.",
      "Section 23", "Section 21", "house-property,annual-value,section-mapping",
      [
        { text: "Section 21", correct: true },
        { text: "Section 20", correct: false },
        { text: "Section 23 (unchanged)", correct: false },
        { text: "Section 22", correct: false },
      ]
    );

    // Lesson 17: Annual Value Determination (Unit 7)
    addQuestion(17, 1,
      "Old Section 23 (Annual value determination) is now which section?",
      "easy",
      "Section 23 of the old Act dealing with annual value is now Section 21.",
      "Section 23", "Section 21", "house-property,annual-value,section-mapping",
      [
        { text: "Section 21", correct: true },
        { text: "Section 20", correct: false },
        { text: "Section 22", correct: false },
        { text: "Section 23 (retained)", correct: false },
      ]
    );
    addQuestion(17, 2,
      "Under Section 21 of the new Act, the annual value of a let-out property is determined based on:",
      "medium",
      "Section 21 (like old Sec 23) determines annual value based on the higher of expected rent or actual rent received.",
      "Section 23", "Section 21", "house-property,annual-value",
      [
        { text: "The higher of expected rent or actual rent received/receivable", correct: true },
        { text: "Only the actual rent received", correct: false },
        { text: "A standard value fixed by the government", correct: false },
        { text: "The stamp duty value of the property", correct: false },
      ]
    );
    addQuestion(17, 3,
      "For a self-occupied property, the annual value under the new Act is:",
      "easy",
      "For a self-occupied property, the annual value is taken as nil, same as under the old Act.",
      "Section 23", "Section 21", "house-property,self-occupied",
      [
        { text: "Nil", correct: true },
        { text: "Fair market rent", correct: false },
        { text: "Municipal valuation", correct: false },
        { text: "10% of stamp duty value", correct: false },
      ]
    );
    addQuestion(17, 4,
      "Which provision of the new Act deals with the annual value of house property?",
      "easy",
      "Section 21 of the new Act deals with the determination of annual value of house property.",
      "Section 23", "Section 21", "house-property,annual-value",
      [
        { text: "Section 21", correct: true },
        { text: "Section 20", correct: false },
        { text: "Section 22", correct: false },
        { text: "Section 23", correct: false },
      ]
    );
    addQuestion(17, 5,
      "Your client's property is let out at Rs 30,000/month but the expected rent is Rs 25,000/month. Under Sec 21, the annual value is based on:",
      "hard",
      "Under Section 21, when actual rent exceeds expected rent, the actual rent received is taken as annual value.",
      "Section 23", "Section 21", "house-property,annual-value,scenario",
      [
        { text: "Actual rent of Rs 30,000/month (higher of the two)", correct: true },
        { text: "Expected rent of Rs 25,000/month", correct: false },
        { text: "Average of Rs 27,500/month", correct: false },
        { text: "Municipal valuation", correct: false },
      ]
    );

    // Lesson 18: Deductions under House Property (Unit 8)
    addQuestion(18, 1,
      "Old Section 24 (Deductions from house property) corresponds to which new section?",
      "easy",
      "Section 24 dealing with deductions from house property income is now Section 22 in the new Act.",
      "Section 24", "Section 22", "house-property,deductions,section-mapping",
      [
        { text: "Section 22", correct: true },
        { text: "Section 20", correct: false },
        { text: "Section 24 (unchanged)", correct: false },
        { text: "Section 21", correct: false },
      ]
    );
    addQuestion(18, 2,
      "The standard deduction from house property income (30% of annual value) under the new Act is:",
      "easy",
      "The standard deduction of 30% of annual value continues under Section 22 of the new Act.",
      "Section 24", "Section 22", "house-property,standard-deduction",
      [
        { text: "30% of annual value, continuing from the old Act", correct: true },
        { text: "Increased to 40% of annual value", correct: false },
        { text: "Reduced to 20% of annual value", correct: false },
        { text: "Abolished under the new Act", correct: false },
      ]
    );
    addQuestion(18, 3,
      "Interest on housing loan deduction for self-occupied property under the new Act (Sec 22) is limited to:",
      "medium",
      "The interest deduction for self-occupied property continues at Rs 2 lakh under Section 22.",
      "Section 24", "Section 22", "house-property,interest-deduction",
      [
        { text: "Rs 2 lakh", correct: true },
        { text: "Rs 1.5 lakh", correct: false },
        { text: "Rs 3 lakh", correct: false },
        { text: "No limit", correct: false },
      ]
    );
    addQuestion(18, 4,
      "Your client has a let-out property with annual value of Rs 5 lakh. The standard deduction under Sec 22 is:",
      "medium",
      "Standard deduction is 30% of annual value = 30% of Rs 5 lakh = Rs 1.5 lakh.",
      "Section 24", "Section 22", "house-property,standard-deduction,scenario",
      [
        { text: "Rs 1,50,000 (30% of Rs 5 lakh)", correct: true },
        { text: "Rs 75,000", correct: false },
        { text: "Rs 2,00,000", correct: false },
        { text: "Rs 50,000", correct: false },
      ]
    );
    addQuestion(18, 5,
      "Which of the following deductions is allowed from house property income under the new Act?",
      "medium",
      "Under Section 22, both standard deduction (30% of annual value) and interest on housing loan are allowed.",
      "Section 24", "Section 22", "house-property,deductions,true-false",
      [
        { text: "Standard deduction (30%) and interest on housing loan", correct: true },
        { text: "Only standard deduction, interest deduction has been abolished", correct: false },
        { text: "Only interest on loan, standard deduction has been abolished", correct: false },
        { text: "No deductions are allowed under the new Act", correct: false },
      ]
    );

    // Lesson 19: Self-Occupied & Deemed Let-Out (Unit 8)
    addQuestion(19, 1,
      "Under the new Act, how many properties can be claimed as self-occupied?",
      "medium",
      "Under the new Act, if you own more than 2 properties, only 2 can be treated as self-occupied; the rest are deemed let-out.",
      null, null, "house-property,self-occupied,deemed-let-out",
      [
        { text: "Up to 2 properties", correct: true },
        { text: "Only 1 property", correct: false },
        { text: "Up to 3 properties", correct: false },
        { text: "Unlimited properties", correct: false },
      ]
    );
    addQuestion(19, 2,
      "Your client owns 3 houses and lives in 2 of them. Under the new Act, the third house is:",
      "medium",
      "If a person owns more than 2 self-occupied properties, the excess properties are deemed let-out.",
      null, null, "house-property,deemed-let-out,scenario",
      [
        { text: "Deemed to be let-out and taxed on notional rent", correct: true },
        { text: "Treated as self-occupied with nil annual value", correct: false },
        { text: "Exempt from tax", correct: false },
        { text: "Taxed under capital gains", correct: false },
      ]
    );
    addQuestion(19, 3,
      "The deemed let-out provision applies when a taxpayer owns more than:",
      "easy",
      "When a taxpayer owns more than 2 self-occupied properties, the additional ones are deemed let-out.",
      null, null, "house-property,deemed-let-out",
      [
        { text: "2 self-occupied properties", correct: true },
        { text: "1 self-occupied property", correct: false },
        { text: "3 self-occupied properties", correct: false },
        { text: "5 self-occupied properties", correct: false },
      ]
    );
    addQuestion(19, 4,
      "For a deemed let-out property, the annual value is determined based on:",
      "hard",
      "For deemed let-out property, the annual value is determined based on the expected rent that the property could fetch if let out.",
      null, "Section 21", "house-property,deemed-let-out,annual-value",
      [
        { text: "Expected rent that the property could reasonably fetch", correct: true },
        { text: "Zero, same as self-occupied", correct: false },
        { text: "Actual municipal taxes paid", correct: false },
        { text: "Stamp duty value of the property", correct: false },
      ]
    );
    addQuestion(19, 5,
      "Which of the following is TRUE about self-occupied property provisions in the new Act?",
      "medium",
      "The limit is 2 self-occupied properties; beyond that, deemed let-out provisions apply. Interest deduction on self-occupied is limited to Rs 2 lakh.",
      null, "Section 22", "house-property,self-occupied,true-false",
      [
        { text: "Maximum 2 properties can be self-occupied; interest deduction capped at Rs 2 lakh per self-occupied property", correct: true },
        { text: "There is no limit on self-occupied properties", correct: false },
        { text: "Interest deduction is unlimited for self-occupied property", correct: false },
        { text: "Self-occupied properties are taxed at fair market rent", correct: false },
      ]
    );

    // Lesson 20: House Property Scenarios (Unit 8)
    addQuestion(20, 1,
      "A taxpayer owns 4 houses - 2 self-occupied, 1 let-out, 1 vacant. Under the new Act, how many are taxable?",
      "hard",
      "2 self-occupied (nil annual value), 1 let-out (actual rent), 1 vacant deemed let-out (notional rent). So 2 properties generate taxable income.",
      null, "Sections 20-22", "house-property,scenario",
      [
        { text: "2 properties: the let-out and the vacant (deemed let-out) one", correct: true },
        { text: "All 4 properties", correct: false },
        { text: "Only the 1 let-out property", correct: false },
        { text: "3 properties (all except 1 self-occupied)", correct: false },
      ]
    );
    addQuestion(20, 2,
      "Your client has a housing loan interest of Rs 3 lakh on a self-occupied property. The deduction under Sec 22 is:",
      "medium",
      "For self-occupied property, interest deduction is capped at Rs 2 lakh under Section 22.",
      "Section 24", "Section 22", "house-property,interest-deduction,scenario",
      [
        { text: "Rs 2 lakh (maximum limit)", correct: true },
        { text: "Rs 3 lakh (actual interest)", correct: false },
        { text: "Rs 1.5 lakh", correct: false },
        { text: "Rs 30,000", correct: false },
      ]
    );
    addQuestion(20, 3,
      "For a let-out property, is there a cap on housing loan interest deduction under the new Act?",
      "medium",
      "For let-out property, there is no cap on interest deduction. The entire interest amount can be claimed under Section 22.",
      "Section 24", "Section 22", "house-property,interest-deduction",
      [
        { text: "No cap - entire interest can be claimed for let-out property", correct: true },
        { text: "Rs 2 lakh cap applies to all properties", correct: false },
        { text: "Rs 3 lakh cap for let-out properties", correct: false },
        { text: "Interest deduction not available for let-out property", correct: false },
      ]
    );
    addQuestion(20, 4,
      "Under the new Act, the net income from house property is computed as:",
      "medium",
      "Net income = Annual value minus standard deduction (30%) minus interest on loan.",
      null, "Sections 20-22", "house-property,computation",
      [
        { text: "Annual value - 30% standard deduction - interest on housing loan", correct: true },
        { text: "Annual value - actual expenses incurred", correct: false },
        { text: "Actual rent received - municipal taxes only", correct: false },
        { text: "Annual value - 50% standard deduction", correct: false },
      ]
    );
    addQuestion(20, 5,
      "Section 20, 21, and 22 of the new Act together deal with:",
      "easy",
      "Section 20 (charging), Section 21 (annual value), Section 22 (deductions) form the complete house property taxation framework.",
      "Sections 22-24", "Sections 20-22", "house-property,structure",
      [
        { text: "Charging section, annual value, and deductions for house property", correct: true },
        { text: "TDS on rent, property sale, and registration", correct: false },
        { text: "Capital gains on house property", correct: false },
        { text: "Business income from property dealing", correct: false },
      ]
    );

    // ====================================================================
    // COURSE 5: BUSINESS & PROFESSION
    // ====================================================================

    // Lesson 21: Business Charging Section (Unit 9)
    addQuestion(21, 1,
      "Old Section 28 (Profits and gains of business or profession) is now:",
      "easy",
      "Section 28 (business income charging section) has been mapped to Section 23 in the new Act.",
      "Section 28", "Section 23", "business,charging-section,section-mapping",
      [
        { text: "Section 23", correct: true },
        { text: "Section 28 (unchanged)", correct: false },
        { text: "Section 27", correct: false },
        { text: "Section 29", correct: false },
      ]
    );
    addQuestion(21, 2,
      "Income from business or profession is chargeable under which section of the new Act?",
      "easy",
      "Section 23 is the charging section for business/profession income in the new Act.",
      "Section 28", "Section 23", "business,charging-section",
      [
        { text: "Section 23", correct: true },
        { text: "Section 28", correct: false },
        { text: "Section 20", correct: false },
        { text: "Section 15", correct: false },
      ]
    );
    addQuestion(21, 3,
      "Your client runs a manufacturing business. The income is chargeable under which section of the new Act?",
      "easy",
      "Business income is chargeable under Section 23 of the new Act.",
      "Section 28", "Section 23", "business,scenario",
      [
        { text: "Section 23", correct: true },
        { text: "Section 20", correct: false },
        { text: "Section 44", correct: false },
        { text: "Section 15", correct: false },
      ]
    );
    addQuestion(21, 4,
      "Which of the following correctly maps the old business income section to the new?",
      "easy",
      "Old Section 28 → New Section 23 for the charging section of business/profession income.",
      "Section 28", "Section 23", "business,section-mapping",
      [
        { text: "Old Sec 28 → New Sec 23", correct: true },
        { text: "Old Sec 28 → New Sec 28 (unchanged)", correct: false },
        { text: "Old Sec 28 → New Sec 44", correct: false },
        { text: "Old Sec 28 → New Sec 27", correct: false },
      ]
    );
    addQuestion(21, 5,
      "Under the new Act, Section 23 includes income from:",
      "medium",
      "Section 23 covers profits and gains from any business or profession, same scope as old Section 28.",
      "Section 28", "Section 23", "business,scope",
      [
        { text: "Any business or profession carried on by the assessee", correct: true },
        { text: "Only manufacturing businesses", correct: false },
        { text: "Only professional income", correct: false },
        { text: "Business and house property income combined", correct: false },
      ]
    );

    // Lesson 22: Depreciation (Unit 9)
    addQuestion(22, 1,
      "Old Section 32 (Depreciation) corresponds to which new section?",
      "easy",
      "Section 32 (depreciation on assets) is now Section 27 in the new Act.",
      "Section 32", "Section 27", "business,depreciation,section-mapping",
      [
        { text: "Section 27", correct: true },
        { text: "Section 32 (unchanged)", correct: false },
        { text: "Section 23", correct: false },
        { text: "Section 30", correct: false },
      ]
    );
    addQuestion(22, 2,
      "Under the new Act, depreciation on business assets is claimed under:",
      "easy",
      "Depreciation is governed by Section 27 of the new Act.",
      "Section 32", "Section 27", "business,depreciation",
      [
        { text: "Section 27", correct: true },
        { text: "Section 32", correct: false },
        { text: "Section 28", correct: false },
        { text: "Section 23", correct: false },
      ]
    );
    addQuestion(22, 3,
      "Your client purchased new machinery for the business. Depreciation claim under the new Act is under:",
      "medium",
      "Section 27 governs depreciation allowance on tangible and intangible assets used in business.",
      "Section 32", "Section 27", "business,depreciation,scenario",
      [
        { text: "Section 27", correct: true },
        { text: "Section 30", correct: false },
        { text: "Section 28", correct: false },
        { text: "Section 29", correct: false },
      ]
    );
    addQuestion(22, 4,
      "Which of the following correctly maps the old depreciation section to the new?",
      "easy",
      "Old Section 32 → New Section 27.",
      "Section 32", "Section 27", "business,depreciation,section-mapping",
      [
        { text: "Old Sec 32 → New Sec 27", correct: true },
        { text: "Old Sec 32 → New Sec 32 (same)", correct: false },
        { text: "Old Sec 32 → New Sec 23", correct: false },
        { text: "Old Sec 32 → New Sec 44", correct: false },
      ]
    );
    addQuestion(22, 5,
      "Which statement about depreciation under the new Act is TRUE?",
      "medium",
      "Depreciation provisions continue under a new section number (27), allowing deduction for wear and tear of business assets.",
      "Section 32", "Section 27", "business,depreciation,true-false",
      [
        { text: "Depreciation continues to be allowed under a new section number (27)", correct: true },
        { text: "Depreciation has been abolished under the new Act", correct: false },
        { text: "Only intangible assets qualify for depreciation", correct: false },
        { text: "Depreciation is now governed by CBDT notification only", correct: false },
      ]
    );

    // Lesson 23: Allowable Deductions (Unit 9)
    addQuestion(23, 1,
      "Old Section 36 (Other deductions for business) corresponds to which new section?",
      "easy",
      "Section 36 has been mapped to Section 28 in the new Act.",
      "Section 36", "Section 28", "business,deductions,section-mapping",
      [
        { text: "Section 28", correct: true },
        { text: "Section 36 (unchanged)", correct: false },
        { text: "Section 29", correct: false },
        { text: "Section 27", correct: false },
      ]
    );
    addQuestion(23, 2,
      "Old Section 37 (General deduction for business expenditure) is now:",
      "easy",
      "Section 37 (general residuary deduction) has been mapped to Section 29.",
      "Section 37", "Section 29", "business,general-deduction,section-mapping",
      [
        { text: "Section 29", correct: true },
        { text: "Section 37 (unchanged)", correct: false },
        { text: "Section 28", correct: false },
        { text: "Section 23", correct: false },
      ]
    );
    addQuestion(23, 3,
      "Scientific research expenditure (old Section 35) is now governed by:",
      "medium",
      "Section 35 (scientific research) has been mapped to Section 30 in the new Act.",
      "Section 35", "Section 30", "business,research,section-mapping",
      [
        { text: "Section 30", correct: true },
        { text: "Section 35 (unchanged)", correct: false },
        { text: "Section 27", correct: false },
        { text: "Section 29", correct: false },
      ]
    );
    addQuestion(23, 4,
      "Under the new Act, the general deduction for wholly and exclusively incurred business expenses is under:",
      "medium",
      "Section 29 (old Sec 37) provides the residuary deduction for business expenses wholly and exclusively incurred.",
      "Section 37", "Section 29", "business,general-deduction",
      [
        { text: "Section 29", correct: true },
        { text: "Section 23", correct: false },
        { text: "Section 27", correct: false },
        { text: "Section 44", correct: false },
      ]
    );
    addQuestion(23, 5,
      "Your client spent Rs 5 lakh on in-house scientific research. The deduction under the new Act is claimed under:",
      "hard",
      "Scientific research deduction is under Section 30 (replacing old Section 35).",
      "Section 35", "Section 30", "business,research,scenario",
      [
        { text: "Section 30", correct: true },
        { text: "Section 29", correct: false },
        { text: "Section 27", correct: false },
        { text: "Section 35 (old Act)", correct: false },
      ]
    );

    // Lesson 24: Presumptive Taxation (Unit 10)
    addQuestion(24, 1,
      "Old Section 44AD (Presumptive taxation) corresponds to which new section?",
      "easy",
      "Section 44AD has been mapped to Section 44 in the new Act.",
      "Section 44AD", "Section 44", "business,presumptive,section-mapping",
      [
        { text: "Section 44", correct: true },
        { text: "Section 44AD (unchanged)", correct: false },
        { text: "Section 23", correct: false },
        { text: "Section 29", correct: false },
      ]
    );
    addQuestion(24, 2,
      "The turnover threshold for presumptive taxation under the new Act is:",
      "medium",
      "The threshold is Rs 3 crore where digital receipts exceed 95% of total receipts.",
      "Section 44AD", "Section 44", "business,presumptive,threshold",
      [
        { text: "Rs 3 crore (with digital receipts > 95%)", correct: true },
        { text: "Rs 2 crore", correct: false },
        { text: "Rs 1 crore", correct: false },
        { text: "Rs 5 crore", correct: false },
      ]
    );
    addQuestion(24, 3,
      "A trader with turnover of Rs 2.5 crore (98% digital receipts) can opt for presumptive taxation under:",
      "medium",
      "With turnover under Rs 3 crore and digital receipts > 95%, the trader qualifies for Section 44.",
      "Section 44AD", "Section 44", "business,presumptive,scenario",
      [
        { text: "Section 44, as turnover is below Rs 3 crore with >95% digital receipts", correct: true },
        { text: "Section 44 is not available as turnover exceeds Rs 2 crore", correct: false },
        { text: "Section 23 only", correct: false },
        { text: "Section 29", correct: false },
      ]
    );
    addQuestion(24, 4,
      "What is the condition for the enhanced Rs 3 crore limit under presumptive taxation?",
      "hard",
      "The enhanced limit of Rs 3 crore is available only when digital receipts exceed 95% of total receipts.",
      "Section 44AD", "Section 44", "business,presumptive,condition",
      [
        { text: "Digital receipts must exceed 95% of total receipts", correct: true },
        { text: "The business must be in the IT sector", correct: false },
        { text: "The business must have been operating for 5+ years", correct: false },
        { text: "No conditions - Rs 3 crore is the universal limit", correct: false },
      ]
    );
    addQuestion(24, 5,
      "Which of the following is TRUE about presumptive taxation under the new Act?",
      "medium",
      "Old Sec 44AD is now Sec 44. The enhanced threshold of Rs 3 crore applies when digital receipts > 95%.",
      "Section 44AD", "Section 44", "business,presumptive,true-false",
      [
        { text: "The threshold is Rs 3 crore with the digital receipts condition (>95%)", correct: true },
        { text: "Presumptive taxation has been abolished", correct: false },
        { text: "The threshold remains Rs 2 crore without any conditions", correct: false },
        { text: "Only professionals can opt for presumptive taxation", correct: false },
      ]
    );

    // Lesson 25: Specific Disallowances (Unit 10)
    addQuestion(25, 1,
      "Old Section 40A(3) (Cash payment limit for business) corresponds to which new section?",
      "easy",
      "Section 40A(3) has been mapped to Section 34 in the new Act.",
      "Section 40A(3)", "Section 34", "business,disallowance,section-mapping",
      [
        { text: "Section 34", correct: true },
        { text: "Section 40A(3) (unchanged)", correct: false },
        { text: "Section 40", correct: false },
        { text: "Section 29", correct: false },
      ]
    );
    addQuestion(25, 2,
      "Old Section 43B (Certain deductions allowable on payment basis) is now:",
      "easy",
      "Section 43B has been mapped to Section 40 in the new Act.",
      "Section 43B", "Section 40", "business,payment-basis,section-mapping",
      [
        { text: "Section 40", correct: true },
        { text: "Section 43B (unchanged)", correct: false },
        { text: "Section 34", correct: false },
        { text: "Section 29", correct: false },
      ]
    );
    addQuestion(25, 3,
      "Your client made a cash payment of Rs 12,000 for a business expense. Under the new Act, which section governs cash payment disallowance?",
      "medium",
      "Section 34 (old Sec 40A(3)) deals with disallowance of cash payments above the prescribed limit.",
      "Section 40A(3)", "Section 34", "business,cash-payment,scenario",
      [
        { text: "Section 34", correct: true },
        { text: "Section 40", correct: false },
        { text: "Section 29", correct: false },
        { text: "Section 23", correct: false },
      ]
    );
    addQuestion(25, 4,
      "Under the new Act, deductions allowable only on actual payment basis (like taxes, bonus, PF) are governed by:",
      "medium",
      "Section 40 (old Sec 43B) mandates that certain deductions like statutory dues are allowed only on payment basis.",
      "Section 43B", "Section 40", "business,payment-basis,scenario",
      [
        { text: "Section 40", correct: true },
        { text: "Section 34", correct: false },
        { text: "Section 28", correct: false },
        { text: "Section 23", correct: false },
      ]
    );
    addQuestion(25, 5,
      "Which of the following mappings is correct for business disallowance provisions?",
      "hard",
      "Old Sec 40A(3) → New Sec 34 (cash payment limit) and Old Sec 43B → New Sec 40 (payment basis deductions).",
      "Section 40A(3), 43B", "Section 34, 40", "business,disallowance,section-mapping",
      [
        { text: "Old 40A(3) → New 34 and Old 43B → New 40", correct: true },
        { text: "Old 40A(3) → New 40 and Old 43B → New 34", correct: false },
        { text: "Both remain unchanged", correct: false },
        { text: "Old 40A(3) → New 29 and Old 43B → New 23", correct: false },
      ]
    );

    // ====================================================================
    // COURSE 6: DEDUCTIONS
    // ====================================================================

    // Lesson 26: Section 80C Equivalent (Unit 11)
    addQuestion(26, 1,
      "Old Section 80C (Life insurance, PPF, etc.) corresponds to which new section?",
      "easy",
      "Section 80C has been mapped to Section 123 in the new Act.",
      "Section 80C", "Section 123", "deductions,80C,section-mapping",
      [
        { text: "Section 123", correct: true },
        { text: "Section 80C (unchanged)", correct: false },
        { text: "Section 124", correct: false },
        { text: "Section 125", correct: false },
      ]
    );
    addQuestion(26, 2,
      "Under the new Act, deduction for PPF, LIC, ELSS investments is available under:",
      "easy",
      "Section 123 (replacing old Sec 80C) provides deduction for specified investments and payments.",
      "Section 80C", "Section 123", "deductions,80C,investments",
      [
        { text: "Section 123", correct: true },
        { text: "Section 80C (old Act)", correct: false },
        { text: "Section 124", correct: false },
        { text: "Section 127", correct: false },
      ]
    );
    addQuestion(26, 3,
      "Which of the following is TRUE about Section 123 (old 80C) deductions under the new regime?",
      "medium",
      "Most Section 123 deductions (old 80C) are available only under the old regime. The new regime does not allow these deductions.",
      "Section 80C", "Section 123", "deductions,80C,regime,true-false",
      [
        { text: "These deductions are available only under the old tax regime", correct: true },
        { text: "These deductions are available under both regimes", correct: false },
        { text: "These deductions are available only under the new regime", correct: false },
        { text: "These deductions have been abolished entirely", correct: false },
      ]
    );
    addQuestion(26, 4,
      "Your client invested Rs 1.5 lakh in PPF and wants the deduction under the new Act. The applicable section is:",
      "medium",
      "PPF investment deduction falls under Section 123 (old Sec 80C), but is available only under the old regime.",
      "Section 80C", "Section 123", "deductions,PPF,scenario",
      [
        { text: "Section 123 (available only if the client opts for the old regime)", correct: true },
        { text: "Section 124", correct: false },
        { text: "Section 123 (available under both regimes)", correct: false },
        { text: "No section - PPF deduction has been abolished", correct: false },
      ]
    );
    addQuestion(26, 5,
      "Old Section 80C is now Section 123 in the new Act. The maximum deduction limit is:",
      "medium",
      "The Rs 1.5 lakh limit under old Section 80C continues under Section 123 for those opting for the old regime.",
      "Section 80C", "Section 123", "deductions,80C,limit",
      [
        { text: "Rs 1,50,000 (continuing from the old Act)", correct: true },
        { text: "Rs 2,00,000", correct: false },
        { text: "Rs 1,00,000", correct: false },
        { text: "Rs 2,50,000", correct: false },
      ]
    );

    // Lesson 27: NPS & Insurance Deductions (Unit 11)
    addQuestion(27, 1,
      "Old Section 80CCD (NPS deduction) corresponds to which new section?",
      "easy",
      "Section 80CCD (NPS) has been mapped to Section 124 in the new Act.",
      "Section 80CCD", "Section 124", "deductions,NPS,section-mapping",
      [
        { text: "Section 124", correct: true },
        { text: "Section 123", correct: false },
        { text: "Section 80CCD (unchanged)", correct: false },
        { text: "Section 125", correct: false },
      ]
    );
    addQuestion(27, 2,
      "Under the new tax regime, which deduction related to NPS is available?",
      "hard",
      "Under the new regime, only employer's contribution to NPS is deductible under Section 124. Employee's own contribution is not deductible.",
      "Section 80CCD", "Section 124", "deductions,NPS,new-regime",
      [
        { text: "Only employer's NPS contribution (Sec 124)", correct: true },
        { text: "Both employer and employee NPS contributions", correct: false },
        { text: "No NPS deduction at all", correct: false },
        { text: "Only employee's NPS contribution", correct: false },
      ]
    );
    addQuestion(27, 3,
      "Old Section 80D (Medical insurance) is now:",
      "easy",
      "Section 80D has been mapped to Section 125 in the new Act.",
      "Section 80D", "Section 125", "deductions,medical-insurance,section-mapping",
      [
        { text: "Section 125", correct: true },
        { text: "Section 124", correct: false },
        { text: "Section 123", correct: false },
        { text: "Section 80D (unchanged)", correct: false },
      ]
    );
    addQuestion(27, 4,
      "Under the new regime, deduction for medical insurance premium (old 80D) is:",
      "medium",
      "Medical insurance deduction (Sec 125, old 80D) is NOT available under the new tax regime.",
      "Section 80D", "Section 125", "deductions,medical-insurance,regime",
      [
        { text: "Not available under the new regime", correct: true },
        { text: "Available up to Rs 25,000", correct: false },
        { text: "Available up to Rs 50,000", correct: false },
        { text: "Available without any limit", correct: false },
      ]
    );
    addQuestion(27, 5,
      "Your client's employer contributes Rs 50,000 to NPS. Under the new regime, the deduction under Sec 124 is:",
      "hard",
      "Employer's NPS contribution is deductible under Section 124 even under the new regime.",
      "Section 80CCD", "Section 124", "deductions,NPS,scenario",
      [
        { text: "Rs 50,000 (employer NPS contribution is allowed under the new regime)", correct: true },
        { text: "Nil, as no NPS deduction is allowed", correct: false },
        { text: "Rs 25,000 only", correct: false },
        { text: "Rs 1,50,000", correct: false },
      ]
    );

    // Lesson 28: Education Loan & Donations (Unit 12)
    addQuestion(28, 1,
      "Old Section 80E (Education loan interest) corresponds to which new section?",
      "easy",
      "Section 80E has been mapped to Section 126 in the new Act.",
      "Section 80E", "Section 126", "deductions,education-loan,section-mapping",
      [
        { text: "Section 126", correct: true },
        { text: "Section 125", correct: false },
        { text: "Section 80E (unchanged)", correct: false },
        { text: "Section 127", correct: false },
      ]
    );
    addQuestion(28, 2,
      "Old Section 80G (Donations) corresponds to which new section?",
      "easy",
      "Section 80G (donations to charitable institutions) has been mapped to Section 127.",
      "Section 80G", "Section 127", "deductions,donations,section-mapping",
      [
        { text: "Section 127", correct: true },
        { text: "Section 126", correct: false },
        { text: "Section 128", correct: false },
        { text: "Section 80G (unchanged)", correct: false },
      ]
    );
    addQuestion(28, 3,
      "Your client paid Rs 5 lakh interest on an education loan. The deduction under the new Act is under:",
      "medium",
      "Education loan interest deduction is under Section 126 (old Sec 80E). Available under the old regime.",
      "Section 80E", "Section 126", "deductions,education-loan,scenario",
      [
        { text: "Section 126 (available under old regime)", correct: true },
        { text: "Section 127", correct: false },
        { text: "Section 125", correct: false },
        { text: "No deduction available", correct: false },
      ]
    );
    addQuestion(28, 4,
      "Your client donated Rs 1 lakh to a recognized charitable institution. Deduction is claimed under:",
      "medium",
      "Donations to charitable institutions are deductible under Section 127 (old Sec 80G).",
      "Section 80G", "Section 127", "deductions,donations,scenario",
      [
        { text: "Section 127", correct: true },
        { text: "Section 126", correct: false },
        { text: "Section 123", correct: false },
        { text: "Section 128", correct: false },
      ]
    );
    addQuestion(28, 5,
      "Which of the following correctly maps old deduction sections to new?",
      "hard",
      "80E → 126 (education loan), 80G → 127 (donations). Both available primarily under the old regime.",
      "Section 80E, 80G", "Section 126, 127", "deductions,section-mapping",
      [
        { text: "80E → 126, 80G → 127", correct: true },
        { text: "80E → 127, 80G → 126", correct: false },
        { text: "80E → 125, 80G → 128", correct: false },
        { text: "Both remain unchanged", correct: false },
      ]
    );

    // Lesson 29: Savings Interest & Regime Comparison (Unit 12)
    addQuestion(29, 1,
      "Old Section 80TTA (Savings account interest deduction) corresponds to which new section?",
      "easy",
      "Both Section 80TTA and 80TTB have been mapped to Section 128 in the new Act.",
      "Section 80TTA", "Section 128", "deductions,savings-interest,section-mapping",
      [
        { text: "Section 128", correct: true },
        { text: "Section 127", correct: false },
        { text: "Section 80TTA (unchanged)", correct: false },
        { text: "Section 126", correct: false },
      ]
    );
    addQuestion(29, 2,
      "Old Section 80TTB (Senior citizen deposit interest) is now combined with 80TTA under:",
      "medium",
      "Both 80TTA and 80TTB are consolidated into Section 128.",
      "Section 80TTB", "Section 128", "deductions,senior-citizen,section-mapping",
      [
        { text: "Section 128", correct: true },
        { text: "Section 127", correct: false },
        { text: "Section 126", correct: false },
        { text: "Section 129", correct: false },
      ]
    );
    addQuestion(29, 3,
      "Under the new tax regime, which of the following deductions is available?",
      "hard",
      "Under the new regime, only employer's NPS contribution (Sec 124) is available. Most other deductions (80C/123, 80D/125, etc.) are not.",
      null, "Section 124", "deductions,new-regime,comparison",
      [
        { text: "Employer's NPS contribution under Section 124", correct: true },
        { text: "Section 123 (old 80C) deductions", correct: false },
        { text: "Section 125 (old 80D) medical insurance", correct: false },
        { text: "Section 127 (old 80G) donations", correct: false },
      ]
    );
    addQuestion(29, 4,
      "Most Chapter VI-A deductions under the new Act are available under:",
      "medium",
      "Most deductions (Sec 123-128) are available only under the old tax regime, not the new default regime.",
      null, null, "deductions,regime,true-false",
      [
        { text: "The old tax regime only", correct: true },
        { text: "Both old and new regimes", correct: false },
        { text: "The new tax regime only", correct: false },
        { text: "Neither regime - they have been abolished", correct: false },
      ]
    );
    addQuestion(29, 5,
      "Which of the following is the complete mapping of old to new deduction sections?",
      "hard",
      "80C→123, 80CCD→124, 80D→125, 80E→126, 80G→127, 80TTA/TTB→128.",
      null, null, "deductions,section-mapping,comprehensive",
      [
        { text: "80C→123, 80CCD→124, 80D→125, 80E→126, 80G→127, 80TTA/TTB→128", correct: true },
        { text: "80C→124, 80CCD→123, 80D→126, 80E→125, 80G→128, 80TTA/TTB→127", correct: false },
        { text: "All sections retain their old numbers", correct: false },
        { text: "80C→120, 80D→121, 80G→122", correct: false },
      ]
    );

    // Lesson 30: Deduction Strategy (Unit 12)
    addQuestion(30, 1,
      "A CA advising a client on the new regime should note that the ONLY deduction available is:",
      "medium",
      "Under the new default regime, only employer's NPS contribution (Sec 124) and standard deduction (Sec 19) are available.",
      null, "Section 124, 19", "deductions,strategy,new-regime",
      [
        { text: "Employer's NPS contribution (Sec 124) and standard deduction (Sec 19)", correct: true },
        { text: "All Chapter VI-A deductions", correct: false },
        { text: "Section 123 (old 80C) up to Rs 1.5 lakh", correct: false },
        { text: "No deductions at all", correct: false },
      ]
    );
    addQuestion(30, 2,
      "Your client has Rs 1.5 lakh in 80C investments, Rs 25,000 in health insurance, and Rs 50,000 employer NPS. Under the new regime, total deductions available are:",
      "hard",
      "Under the new regime, only employer's NPS of Rs 50,000 and standard deduction of Rs 75,000 are available. 80C and 80D are not available.",
      null, "Section 19, 124", "deductions,strategy,scenario",
      [
        { text: "Rs 1,25,000 (Rs 75,000 standard deduction + Rs 50,000 employer NPS)", correct: true },
        { text: "Rs 2,25,000 (all deductions combined)", correct: false },
        { text: "Rs 50,000 (only employer NPS)", correct: false },
        { text: "Rs 75,000 (only standard deduction)", correct: false },
      ]
    );
    addQuestion(30, 3,
      "When comparing regimes, a taxpayer with high deductions should consider:",
      "hard",
      "Taxpayers with high deductions (80C, 80D, HRA, etc.) may benefit from the old regime as these are not available under the new regime.",
      null, null, "deductions,strategy,regime-comparison",
      [
        { text: "The old regime may be beneficial as it allows more deductions", correct: true },
        { text: "The new regime is always better regardless of deductions", correct: false },
        { text: "Deductions are irrelevant for regime selection", correct: false },
        { text: "The old regime has been abolished, so there is no choice", correct: false },
      ]
    );
    addQuestion(30, 4,
      "Section 123 to 128 of the new Act collectively cover:",
      "medium",
      "Sections 123-128 cover the Chapter VI-A equivalent deductions in the new Act.",
      "Chapter VI-A (80C-80U)", "Sections 123-128", "deductions,structure",
      [
        { text: "Chapter VI-A equivalent deductions from the old Act", correct: true },
        { text: "TDS and TCS provisions", correct: false },
        { text: "Capital gains exemptions", correct: false },
        { text: "Salary income deductions", correct: false },
      ]
    );
    addQuestion(30, 5,
      "Which of the following deductions is NOT mapped to the 120s range in the new Act?",
      "hard",
      "Standard deduction from salary is under Section 19, not in the 120s range. The 120s range covers Chapter VI-A equivalent deductions.",
      null, "Section 19", "deductions,section-mapping,true-false",
      [
        { text: "Standard deduction from salary (Sec 19, not in the 120s)", correct: true },
        { text: "PPF investment deduction (Sec 123)", correct: false },
        { text: "NPS deduction (Sec 124)", correct: false },
        { text: "Medical insurance deduction (Sec 125)", correct: false },
      ]
    );

    // ====================================================================
    // COURSE 7: EXEMPT INCOME
    // ====================================================================

    // Lesson 31: New Schedule Structure (Unit 13)
    addQuestion(31, 1,
      "Old Section 10 (Exemptions) has been restructured in the new Act into:",
      "easy",
      "Instead of a single Section 10 with numerous sub-clauses, the new Act uses Second to Sixth Schedules for exemptions.",
      "Section 10", "Second to Sixth Schedules", "exempt-income,structure,what-changed",
      [
        { text: "Second to Sixth Schedules", correct: true },
        { text: "A single new Section 10 with fewer clauses", correct: false },
        { text: "Section 110", correct: false },
        { text: "Exemptions have been abolished", correct: false },
      ]
    );
    addQuestion(31, 2,
      "Which of the following is a key structural change for exempt income under the new Act?",
      "medium",
      "The new Act replaces the single Section 10 with multiple schedules using a table-based format.",
      "Section 10", "Schedules", "exempt-income,structure,what-changed",
      [
        { text: "Table/schedule-based format replaces the long Section 10 with sub-clauses", correct: true },
        { text: "All exemptions are now in a single schedule", correct: false },
        { text: "Section 10 remains unchanged", correct: false },
        { text: "Exemptions are now governed by CBDT circulars only", correct: false },
      ]
    );
    addQuestion(31, 3,
      "The new Act uses how many schedules to cover the erstwhile Section 10 exemptions?",
      "medium",
      "Exemptions previously under Section 10 are spread across the Second to Sixth Schedules (5 schedules).",
      "Section 10", "Second to Sixth Schedules", "exempt-income,structure",
      [
        { text: "Five schedules (Second to Sixth)", correct: true },
        { text: "One schedule", correct: false },
        { text: "Three schedules", correct: false },
        { text: "Ten schedules", correct: false },
      ]
    );
    addQuestion(31, 4,
      "Which of the following is TRUE about exemptions under the new Act?",
      "medium",
      "The new Act moves from a sub-clause approach (Section 10(1), 10(2), etc.) to a schedule/table format for better organization.",
      "Section 10", "Schedules", "exempt-income,true-false",
      [
        { text: "Exemptions are organized in schedules/tables instead of Section 10 sub-clauses", correct: true },
        { text: "All exemptions from the old Act have been eliminated", correct: false },
        { text: "Section 10 retains all its original sub-clauses", correct: false },
        { text: "Only agricultural income exemption survives in the new Act", correct: false },
      ]
    );
    addQuestion(31, 5,
      "The move from Section 10 sub-clauses to schedules in the new Act is intended to:",
      "hard",
      "The schedule/table-based format makes it easier to look up specific exemptions and reduces the complexity of a single overloaded section.",
      "Section 10", "Schedules", "exempt-income,what-changed",
      [
        { text: "Improve readability and organization of exemption provisions", correct: true },
        { text: "Reduce the total number of exemptions available", correct: false },
        { text: "Make exemptions more difficult to claim", correct: false },
        { text: "Transfer exemption powers to state governments", correct: false },
      ]
    );

    // Lesson 32: Employment-Related Exemptions (Unit 13)
    addQuestion(32, 1,
      "Gratuity exemption under the new Act is found in:",
      "easy",
      "Gratuity exemption has been moved from Section 10(10) to the Second Schedule.",
      "Section 10(10)", "Second Schedule", "exempt-income,gratuity,section-mapping",
      [
        { text: "Second Schedule", correct: true },
        { text: "Section 10(10) (unchanged)", correct: false },
        { text: "Third Schedule", correct: false },
        { text: "Section 123", correct: false },
      ]
    );
    addQuestion(32, 2,
      "Leave encashment exemption under the new Act is in:",
      "easy",
      "Leave encashment exemption has been moved from Section 10(10AA) to the Second Schedule.",
      "Section 10(10AA)", "Second Schedule", "exempt-income,leave-encashment,section-mapping",
      [
        { text: "Second Schedule", correct: true },
        { text: "Section 10(10AA) (unchanged)", correct: false },
        { text: "Third Schedule", correct: false },
        { text: "Section 19", correct: false },
      ]
    );
    addQuestion(32, 3,
      "HRA exemption in the new Act is found in:",
      "easy",
      "HRA exemption has been moved from Section 10(13A) to the Second Schedule.",
      "Section 10(13A)", "Second Schedule", "exempt-income,HRA,section-mapping",
      [
        { text: "Second Schedule", correct: true },
        { text: "Section 10(13A) (unchanged)", correct: false },
        { text: "Fifth Schedule", correct: false },
        { text: "Section 15", correct: false },
      ]
    );
    addQuestion(32, 4,
      "Which schedule of the new Act contains most employment-related exemptions?",
      "medium",
      "The Second Schedule contains gratuity, leave encashment, HRA, and other employment-related exemptions.",
      "Section 10", "Second Schedule", "exempt-income,employment",
      [
        { text: "Second Schedule", correct: true },
        { text: "First Schedule", correct: false },
        { text: "Third Schedule", correct: false },
        { text: "Sixth Schedule", correct: false },
      ]
    );
    addQuestion(32, 5,
      "Your client is retiring and receiving gratuity. The exemption provision under the new Act is in:",
      "medium",
      "Gratuity exemption (old Sec 10(10)) is now in the Second Schedule of the new Act.",
      "Section 10(10)", "Second Schedule", "exempt-income,gratuity,scenario",
      [
        { text: "Second Schedule", correct: true },
        { text: "Section 10(10)", correct: false },
        { text: "Section 123", correct: false },
        { text: "Section 78", correct: false },
      ]
    );

    // Lesson 33: Agricultural & Capital Gains Exemptions (Unit 14)
    addQuestion(33, 1,
      "Agricultural income under the new Act is:",
      "easy",
      "Agricultural income continues to be exempt as this exemption is rooted in the Constitution, not just the Income Tax Act.",
      null, null, "exempt-income,agricultural,constitutional",
      [
        { text: "Still exempt under the Constitution", correct: true },
        { text: "Now taxable under the new Act", correct: false },
        { text: "Exempt only up to Rs 5 lakh", correct: false },
        { text: "Taxed at a concessional rate of 10%", correct: false },
      ]
    );
    addQuestion(33, 2,
      "Long-term capital gains exemption up to Rs 1.25 lakh is available under:",
      "medium",
      "Section 69(2) of the new Act provides exemption for LTCG up to Rs 1.25 lakh.",
      null, "Section 69(2)", "exempt-income,LTCG,exemption",
      [
        { text: "Section 69(2)", correct: true },
        { text: "Section 68", correct: false },
        { text: "Section 78", correct: false },
        { text: "Second Schedule", correct: false },
      ]
    );
    addQuestion(33, 3,
      "Why is agricultural income exempt under the new Act?",
      "hard",
      "Agricultural income is exempt because taxation of agriculture is a State subject under the Constitution. This is not dependent on any Income Tax Act provision.",
      null, null, "exempt-income,agricultural,constitutional",
      [
        { text: "It is a State subject under the Constitution and beyond Parliament's taxing power", correct: true },
        { text: "It is specifically exempted under Section 10 of the new Act", correct: false },
        { text: "The new Act includes a special schedule for agricultural exemption", correct: false },
        { text: "CBDT has issued a notification exempting it", correct: false },
      ]
    );
    addQuestion(33, 4,
      "Your client has LTCG of Rs 1 lakh from listed shares. Under the new Act, this is:",
      "medium",
      "LTCG up to Rs 1.25 lakh is exempt under Section 69(2). Since Rs 1 lakh is within this limit, it is fully exempt.",
      null, "Section 69(2)", "exempt-income,LTCG,scenario",
      [
        { text: "Fully exempt as it is within the Rs 1.25 lakh limit under Sec 69(2)", correct: true },
        { text: "Fully taxable at 10%", correct: false },
        { text: "Exempt only if held for more than 3 years", correct: false },
        { text: "Partially exempt up to Rs 1 lakh", correct: false },
      ]
    );
    addQuestion(33, 5,
      "The exemption limit for LTCG under Section 69(2) is:",
      "easy",
      "Section 69(2) provides an exemption of Rs 1.25 lakh for long-term capital gains.",
      null, "Section 69(2)", "exempt-income,LTCG,limit",
      [
        { text: "Rs 1.25 lakh", correct: true },
        { text: "Rs 1 lakh", correct: false },
        { text: "Rs 1.5 lakh", correct: false },
        { text: "Rs 2 lakh", correct: false },
      ]
    );

    // Lesson 34: Gratuity & Leave Encashment (Unit 14)
    addQuestion(34, 1,
      "Under the new Act, gratuity exemption limits are specified in:",
      "easy",
      "Gratuity exemption details are in the Second Schedule, replacing old Section 10(10).",
      "Section 10(10)", "Second Schedule", "exempt-income,gratuity",
      [
        { text: "Second Schedule", correct: true },
        { text: "Section 10(10)", correct: false },
        { text: "First Schedule", correct: false },
        { text: "Section 123", correct: false },
      ]
    );
    addQuestion(34, 2,
      "Leave encashment received at retirement is exempt under the new Act as per:",
      "easy",
      "Leave encashment exemption is in the Second Schedule, replacing old Section 10(10AA).",
      "Section 10(10AA)", "Second Schedule", "exempt-income,leave-encashment",
      [
        { text: "Second Schedule", correct: true },
        { text: "Section 10(10AA)", correct: false },
        { text: "Section 19", correct: false },
        { text: "Third Schedule", correct: false },
      ]
    );
    addQuestion(34, 3,
      "Both gratuity and leave encashment exemptions are found in which schedule?",
      "easy",
      "Both are employment-related exemptions placed in the Second Schedule.",
      null, "Second Schedule", "exempt-income,employment,structure",
      [
        { text: "Second Schedule", correct: true },
        { text: "First Schedule", correct: false },
        { text: "Third Schedule", correct: false },
        { text: "Different schedules for each", correct: false },
      ]
    );
    addQuestion(34, 4,
      "Your client, a private sector employee retiring after 30 years, receives gratuity of Rs 25 lakh. The exemption is governed by:",
      "medium",
      "Gratuity exemption for private sector employees is in the Second Schedule with prescribed limits.",
      "Section 10(10)", "Second Schedule", "exempt-income,gratuity,scenario",
      [
        { text: "Second Schedule of the new Act", correct: true },
        { text: "Section 10(10) of the old Act still applies", correct: false },
        { text: "Section 123", correct: false },
        { text: "No exemption for private sector employees", correct: false },
      ]
    );
    addQuestion(34, 5,
      "Which of the following old Section 10 exemptions is NOT in the Second Schedule?",
      "hard",
      "Agricultural income exemption is Constitutional and not part of the Second Schedule. The Second Schedule covers employment-related exemptions.",
      null, "Second Schedule", "exempt-income,structure,true-false",
      [
        { text: "Agricultural income (exempt under the Constitution, not a schedule provision)", correct: true },
        { text: "Gratuity exemption", correct: false },
        { text: "Leave encashment exemption", correct: false },
        { text: "HRA exemption", correct: false },
      ]
    );

    // Lesson 35: Exempt Income Scenarios (Unit 14)
    addQuestion(35, 1,
      "A taxpayer with LTCG of Rs 2 lakh and agricultural income of Rs 5 lakh. Total exempt income under the new Act is:",
      "hard",
      "Agricultural income (Rs 5 lakh) is fully exempt under the Constitution. LTCG up to Rs 1.25 lakh is exempt under Sec 69(2). Total exempt = Rs 6.25 lakh.",
      null, "Section 69(2)", "exempt-income,scenario",
      [
        { text: "Rs 6.25 lakh (full agricultural income + Rs 1.25 lakh LTCG exemption)", correct: true },
        { text: "Rs 7 lakh (everything exempt)", correct: false },
        { text: "Rs 5 lakh (only agricultural income)", correct: false },
        { text: "Rs 1.25 lakh (only LTCG exemption)", correct: false },
      ]
    );
    addQuestion(35, 2,
      "Under the new Act, to find the exemption for a specific type of receipt, a CA should:",
      "medium",
      "The new Act organizes exemptions in Second to Sixth Schedules. CAs should look up the relevant schedule based on the nature of income.",
      "Section 10", "Second to Sixth Schedules", "exempt-income,practice",
      [
        { text: "Look up the relevant schedule (Second to Sixth) based on the type of income", correct: true },
        { text: "Search through Section 10 sub-clauses as before", correct: false },
        { text: "Refer to CBDT notifications only", correct: false },
        { text: "Check Section 123-128 for all exemptions", correct: false },
      ]
    );
    addQuestion(35, 3,
      "The shift from Section 10 to schedules means that a CA looking for HRA exemption should now check:",
      "medium",
      "HRA exemption is in the Second Schedule of the new Act.",
      "Section 10(13A)", "Second Schedule", "exempt-income,HRA,practice",
      [
        { text: "The Second Schedule", correct: true },
        { text: "Section 10(13A)", correct: false },
        { text: "Section 19", correct: false },
        { text: "The First Schedule", correct: false },
      ]
    );
    addQuestion(35, 4,
      "Which of the following statements about exempt income under the new Act is TRUE?",
      "hard",
      "Exemptions have been reorganized into schedules but the substantive exemptions largely continue. The new format is more structured.",
      "Section 10", "Schedules", "exempt-income,true-false",
      [
        { text: "Most substantive exemptions continue but are reorganized into schedules for clarity", correct: true },
        { text: "All exemptions from the old Act have been eliminated", correct: false },
        { text: "New exemptions have been added that did not exist before", correct: false },
        { text: "The schedule format makes no practical difference", correct: false },
      ]
    );
    addQuestion(35, 5,
      "An NRI receives income from Indian mutual funds. The tax exemption (if applicable) would be in:",
      "hard",
      "Exemptions applicable to specific categories of income (including NRI-related) are organized in the relevant schedules of the new Act.",
      "Section 10", "Relevant Schedule", "exempt-income,NRI,scenario",
      [
        { text: "The relevant schedule of the new Act (replacing Section 10 clauses)", correct: true },
        { text: "Section 10 of the old Act still applies to NRIs", correct: false },
        { text: "Section 123", correct: false },
        { text: "NRIs have no exemptions under the new Act", correct: false },
      ]
    );

    // ====================================================================
    // COURSE 8: BASICS & DEFINITIONS
    // ====================================================================

    // Lesson 36: Tax Year & Person (Unit 15)
    addQuestion(36, 1,
      "The term 'Previous Year' in the old Act has been replaced by which term in the new Act?",
      "easy",
      "Previous Year is now called 'Tax Year' as defined in Section 2(38) of the new Act.",
      null, "Section 2(38)", "basics,tax-year,definition",
      [
        { text: "Tax Year", correct: true },
        { text: "Financial Year", correct: false },
        { text: "Assessment Year", correct: false },
        { text: "Accounting Year", correct: false },
      ]
    );
    addQuestion(36, 2,
      "'Tax Year' is defined in which section of the new Act?",
      "easy",
      "Tax Year is defined in Section 2(38).",
      null, "Section 2(38)", "basics,tax-year,section-mapping",
      [
        { text: "Section 2(38)", correct: true },
        { text: "Section 2(31)", correct: false },
        { text: "Section 2(15)", correct: false },
        { text: "Section 6", correct: false },
      ]
    );
    addQuestion(36, 3,
      "The Tax Year under the new Act runs from:",
      "easy",
      "Tax Year is April 1 to March 31, the same period as the old 'Previous Year'.",
      null, "Section 2(38)", "basics,tax-year,period",
      [
        { text: "April 1 to March 31", correct: true },
        { text: "January 1 to December 31", correct: false },
        { text: "July 1 to June 30", correct: false },
        { text: "October 1 to September 30", correct: false },
      ]
    );
    addQuestion(36, 4,
      "The definition of 'Person' in the new Act is in:",
      "medium",
      "Person is defined in Section 2(31) of the new Act, maintaining the same categories as the old Act.",
      null, "Section 2(31)", "basics,person,definition",
      [
        { text: "Section 2(31)", correct: true },
        { text: "Section 2(38)", correct: false },
        { text: "Section 2(15)", correct: false },
        { text: "Section 6", correct: false },
      ]
    );
    addQuestion(36, 5,
      "Which of the following is TRUE about the change from 'Previous Year' to 'Tax Year'?",
      "medium",
      "The period (April 1 to March 31) remains the same; only the terminology has changed from 'Previous Year' to 'Tax Year'.",
      null, "Section 2(38)", "basics,tax-year,what-changed",
      [
        { text: "Only the terminology changed; the period (April 1 - March 31) remains the same", correct: true },
        { text: "The period has also changed to calendar year", correct: false },
        { text: "Tax Year is a completely different concept from Previous Year", correct: false },
        { text: "Previous Year terminology continues in the new Act", correct: false },
      ]
    );

    // Lesson 37: Income & Residential Status (Unit 15)
    addQuestion(37, 1,
      "The definition of 'Income' in the new Act is in:",
      "easy",
      "Income is defined in Section 2(15) of the new Act with an inclusive definition continuing from the old Act.",
      null, "Section 2(15)", "basics,income,definition",
      [
        { text: "Section 2(15)", correct: true },
        { text: "Section 2(31)", correct: false },
        { text: "Section 2(38)", correct: false },
        { text: "Section 5", correct: false },
      ]
    );
    addQuestion(37, 2,
      "Residential status under the new Act is determined by:",
      "medium",
      "Section 6 of the new Act determines residential status, largely retaining the same tests as the old Act.",
      "Section 6", "Section 6", "basics,residential-status,section-mapping",
      [
        { text: "Section 6 (same section number, largely same tests)", correct: true },
        { text: "Section 2(38)", correct: false },
        { text: "Section 5", correct: false },
        { text: "Section 15", correct: false },
      ]
    );
    addQuestion(37, 3,
      "The inclusive definition of income in Section 2(15) means:",
      "medium",
      "An inclusive definition means that the listed items are not exhaustive - income includes those items and potentially other receipts that have the character of income.",
      null, "Section 2(15)", "basics,income,definition",
      [
        { text: "The listed items are not exhaustive; other receipts may also qualify as income", correct: true },
        { text: "Only the listed items are considered income", correct: false },
        { text: "Income is limited to salary and business income only", correct: false },
        { text: "All receipts are automatically considered income", correct: false },
      ]
    );
    addQuestion(37, 4,
      "Your client, an Indian citizen, was in India for 200 days during the tax year. Residential status is determined under:",
      "medium",
      "Section 6 of the new Act provides the tests for determining residential status based on days of stay.",
      "Section 6", "Section 6", "basics,residential-status,scenario",
      [
        { text: "Section 6 of the new Act", correct: true },
        { text: "Section 2(31)", correct: false },
        { text: "Section 5", correct: false },
        { text: "Section 2(38)", correct: false },
      ]
    );
    addQuestion(37, 5,
      "Which of the following is TRUE about residential status provisions in the new Act?",
      "hard",
      "Section 6 retains the same section number and largely the same tests for determining residential status.",
      "Section 6", "Section 6", "basics,residential-status,true-false",
      [
        { text: "Section 6 retains the same number and largely the same tests as the old Act", correct: true },
        { text: "Residential status is no longer relevant in the new Act", correct: false },
        { text: "The section number has changed to Section 106", correct: false },
        { text: "Only days of stay in India matter; other tests are removed", correct: false },
      ]
    );

    // Lesson 38: New Act Overview (Unit 16)
    addQuestion(38, 1,
      "The new Income Tax Act 2025 has how many sections compared to 819 in the old Act?",
      "easy",
      "The new Act has 536 sections compared to 819 sections in the old Income Tax Act 1961.",
      null, null, "basics,structure,overview",
      [
        { text: "536 sections", correct: true },
        { text: "819 sections (same as old)", correct: false },
        { text: "400 sections", correct: false },
        { text: "1000 sections", correct: false },
      ]
    );
    addQuestion(38, 2,
      "The new Income Tax Act 2025 is effective from:",
      "easy",
      "The new Act takes effect from April 1, 2026.",
      null, null, "basics,effective-date",
      [
        { text: "April 1, 2026", correct: true },
        { text: "April 1, 2025", correct: false },
        { text: "January 1, 2026", correct: false },
        { text: "July 1, 2026", correct: false },
      ]
    );
    addQuestion(38, 3,
      "The new Act replaces which existing legislation?",
      "easy",
      "The Income Tax Act 2025 replaces the Income Tax Act 1961.",
      null, null, "basics,overview",
      [
        { text: "Income Tax Act, 1961", correct: true },
        { text: "Income Tax Act, 1922", correct: false },
        { text: "Finance Act, 2024", correct: false },
        { text: "Direct Tax Code, 2010", correct: false },
      ]
    );
    addQuestion(38, 4,
      "One key goal of the new Act is:",
      "medium",
      "The reduction from 819 to 536 sections demonstrates the simplification and consolidation objective of the new Act.",
      null, null, "basics,overview,what-changed",
      [
        { text: "Simplification and consolidation (819 sections reduced to 536)", correct: true },
        { text: "Increasing the number of provisions for greater detail", correct: false },
        { text: "Abolishing all exemptions and deductions", correct: false },
        { text: "Making India a zero-tax jurisdiction", correct: false },
      ]
    );
    addQuestion(38, 5,
      "The reduction from 819 to 536 sections was achieved primarily through:",
      "hard",
      "Consolidation of scattered provisions (like TDS into Section 393, exemptions into schedules) and use of tables/schedules reduced the section count.",
      null, null, "basics,structure,what-changed",
      [
        { text: "Consolidation of provisions and use of schedules/tables instead of separate sections", correct: true },
        { text: "Removing substantive tax provisions", correct: false },
        { text: "Merging all five heads of income into one", correct: false },
        { text: "Eliminating all penalty and prosecution provisions", correct: false },
      ]
    );

    // Lesson 39: Total Income & Scope (Unit 16)
    addQuestion(39, 1,
      "Total income (scope of income) was under old Section 5. In the new Act, it is under:",
      "easy",
      "Section 5 (scope of total income) retains the same section number in the new Act.",
      "Section 5", "Section 5", "basics,total-income,section-mapping",
      [
        { text: "Section 5 (same number retained)", correct: true },
        { text: "Section 105", correct: false },
        { text: "Section 2(15)", correct: false },
        { text: "Section 15", correct: false },
      ]
    );
    addQuestion(39, 2,
      "Under Section 5 of the new Act, the scope of total income for a resident includes:",
      "medium",
      "Section 5 provides that for a resident, total income includes income from all sources, whether earned in India or abroad.",
      "Section 5", "Section 5", "basics,total-income,scope",
      [
        { text: "Income from all sources - Indian and foreign", correct: true },
        { text: "Only Indian source income", correct: false },
        { text: "Only salary income", correct: false },
        { text: "Only business income", correct: false },
      ]
    );
    addQuestion(39, 3,
      "For a non-resident, Section 5 of the new Act taxes:",
      "medium",
      "For non-residents, only income received in India or accruing/arising in India is taxable under Section 5.",
      "Section 5", "Section 5", "basics,total-income,non-resident",
      [
        { text: "Only income received in India or accruing/arising in India", correct: true },
        { text: "Global income", correct: false },
        { text: "No income at all", correct: false },
        { text: "Only salary income from Indian employers", correct: false },
      ]
    );
    addQuestion(39, 4,
      "Which of the following sections retains the same number in both old and new Acts?",
      "hard",
      "Section 5 (total income scope), Section 6 (residential status), Section 15 (salary), and Section 17 (perquisites) retain the same numbers.",
      null, null, "basics,section-mapping,overview",
      [
        { text: "Section 5 (Total Income), Section 6 (Residential Status), and Section 15 (Salary)", correct: true },
        { text: "Section 22 (House Property)", correct: false },
        { text: "Section 28 (Business Income)", correct: false },
        { text: "Section 45 (Capital Gains)", correct: false },
      ]
    );
    addQuestion(39, 5,
      "The Assessment Year concept under the new Act is:",
      "medium",
      "The new Act simplifies the assessment year concept. The focus is on 'Tax Year' rather than the 'Previous Year / Assessment Year' dual terminology.",
      null, "Section 2(38)", "basics,assessment-year,what-changed",
      [
        { text: "Simplified, with primary focus on the 'Tax Year' concept", correct: true },
        { text: "Completely abolished", correct: false },
        { text: "Unchanged from the old Act", correct: false },
        { text: "Renamed to 'Filing Year'", correct: false },
      ]
    );

    // Lesson 40: Transition & Key Changes (Unit 16)
    addQuestion(40, 1,
      "The new Act takes effect from April 1, 2026, meaning the first Tax Year under it is:",
      "easy",
      "Since the Act is effective April 1, 2026, the first Tax Year is 2026-27 (April 1, 2026 to March 31, 2027).",
      null, null, "basics,transition,effective-date",
      [
        { text: "2026-27 (April 1, 2026 to March 31, 2027)", correct: true },
        { text: "2025-26", correct: false },
        { text: "2027-28", correct: false },
        { text: "2024-25", correct: false },
      ]
    );
    addQuestion(40, 2,
      "Which of the following is NOT a change introduced by the new Act?",
      "hard",
      "The five heads of income (Salary, House Property, Business/Profession, Capital Gains, Other Sources) continue under the new Act.",
      null, null, "basics,what-changed,true-false",
      [
        { text: "The five heads of income continue to exist", correct: true },
        { text: "Previous Year renamed to Tax Year", correct: false },
        { text: "TDS provisions consolidated under fewer sections", correct: false },
        { text: "Exemptions moved to schedules from Section 10", correct: false },
      ]
    );
    addQuestion(40, 3,
      "For the transition period, CAs need to be aware that:",
      "hard",
      "Returns for income earned up to March 31, 2026 will be under the old Act. Income from April 1, 2026 onwards falls under the new Act.",
      null, null, "basics,transition,practice",
      [
        { text: "Income up to March 31, 2026 is under the old Act; from April 1, 2026 under the new Act", correct: true },
        { text: "Both Acts apply simultaneously for 2026-27", correct: false },
        { text: "The old Act ceases immediately with no transition", correct: false },
        { text: "Only the new Act applies for all pending assessments", correct: false },
      ]
    );
    addQuestion(40, 4,
      "How many sections does the old Income Tax Act 1961 have compared to the new Act?",
      "easy",
      "The old Act has 819 sections versus 536 in the new Act - a reduction of about 35%.",
      null, null, "basics,structure,comparison",
      [
        { text: "Old: 819 sections, New: 536 sections", correct: true },
        { text: "Old: 536 sections, New: 819 sections", correct: false },
        { text: "Old: 500 sections, New: 400 sections", correct: false },
        { text: "Both have 819 sections", correct: false },
      ]
    );
    addQuestion(40, 5,
      "The new Income Tax Act 2025 can be described as:",
      "medium",
      "The new Act simplifies, consolidates, and modernizes the income tax law by reducing sections, using schedules, and updating terminology.",
      null, null, "basics,overview,summary",
      [
        { text: "A simplified and consolidated version of the 1961 Act with modern terminology", correct: true },
        { text: "A completely different tax system with no connection to the old Act", correct: false },
        { text: "A copy of the old Act with no changes", correct: false },
        { text: "A temporary measure to be replaced soon", correct: false },
      ]
    );

    // ========================================================================
    // INSERT ALL CHALLENGES AND OPTIONS
    // ========================================================================

    // Insert challenges in batches
    const BATCH_SIZE = 50;
    for (let i = 0; i < allChallenges.length; i += BATCH_SIZE) {
      const batch = allChallenges.slice(i, i + BATCH_SIZE);
      await db.insert(schema.challenges).values(batch);
    }
    console.log(`Inserted ${allChallenges.length} challenges.`);

    // Insert options in batches
    for (let i = 0; i < allOptions.length; i += BATCH_SIZE) {
      const batch = allOptions.slice(i, i + BATCH_SIZE);
      await db.insert(schema.challengeOptions).values(batch);
    }
    console.log(`Inserted ${allOptions.length} challenge options.`);

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};

main();

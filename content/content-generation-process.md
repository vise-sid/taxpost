# Content Generation Process — Taxpost

## Purpose

This document defines the end-to-end process for generating unit content (Guidebook MD files) and lesson questions (JSON files) for the Taxpost learning platform. It codifies the lessons learned from generating Modules 0-9 (44 units, 1,980 questions) and serves as the authoritative reference for all future content generation.

---

## Process Overview

```
Step 1: Research (Web Search)
    ↓
Step 2: Attribution Filter ← CRITICAL GATE
    ↓
Step 3: Write Content MD
    ↓
Step 4: Define Learning Objectives
    ↓
Step 5: Generate Questions JSON
    ↓
Step 6: Accuracy Audit
```

---

## Step 1: Research

### Sources (Authoritative Only)

| Source                        | URL                                                      | Use For                                                        |
| ----------------------------- | -------------------------------------------------------- | -------------------------------------------------------------- |
| Income Tax India (Official)   | incometaxindia.gov.in                                    | Act text, section navigator, parallel reading utility          |
| KarSetu FAQ (CBDT)            | incometaxindia.gov.in (FAQs on Interplay and Transition) | Transition provisions, Section 536, dual-track rules           |
| PIB                           | pib.gov.in                                               | Official government communications, Act announcements          |
| EZTax                         | eztax.in/income-tax-act-2025                             | Section-by-section text, old-new section mapper                |
| TaxGuru                       | taxguru.in                                               | Section mapping, comparative analysis, practitioner commentary |
| Taxmann                       | taxmann.com                                              | Detailed commentary, key highlights, section comparisons       |
| ClearTax                      | cleartax.in                                              | Section mapping, structural overviews                          |
| ICAI                          | icai.org                                                 | Professional body guidance, study materials                    |
| Income Tax Rules 2026 (Draft) | Official notification                                    | Form mappings, rule numbers, procedural changes                |

### What to Capture Per Provision

For each provision covered in a unit, research must capture:

1. **Old section number** (1961 Act) → **New section number** (2025 Act)
2. **What changed genuinely in the 2025 Act** — new wording, new provisions, dropped provisions, structural reorganisation
3. **What was already changed by Finance Acts** (2017-2025) and is merely carried forward by the 2025 Act
4. **What is structurally reorganised** — provisos converted to sub-sections, sections merged or split, table format introduced
5. **Exact rates, thresholds, and limits** — with attribution to the Finance Act that set them
6. **Form changes** — old form → new form mappings under IT Rules 2026
7. **Source URLs** — exact links for every claim

---

## Step 2: Attribution Filter

This is the most critical step. Every finding must be classified before it enters the content.

### Classification Rules

| Classification                              | Definition                                                                                                                                                                                                 | Content Treatment                                                                                                                                          |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Renumbered only**                         | Same substance, new section number. No change in law.                                                                                                                                                      | One row in mapping table. No elaboration.                                                                                                                  |
| **Restructured**                            | Same substance, different format. Examples: proviso → sub-section, multiple sections merged into one, prose → table format.                                                                                | Map it. Briefly note the structural change (e.g., "Old Sections 30+31+38 merged into Section 28").                                                         |
| **Genuinely changed by the 2025 Act**       | The 2025 Act itself introduces new wording, adds new provisions, drops provisions, or changes the legal effect. The change did NOT exist under the 1961 Act (as amended by any Finance Act).               | **Highlight prominently.** This is the core content. Dedicate sections, tables, and questions to it.                                                       |
| **Finance Act amendment (carried forward)** | The change was made by a Finance Act (2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, or 2025) to the 1961 Act. It was already operative before the 2025 Act took effect. The 2025 Act merely codifies it. | **One line maximum:** "Carried forward from Finance Act [year] — no further change by the 2025 Act." Do NOT dedicate sections, tables, or questions to it. |
| **Not carried forward**                     | A provision that existed in the 1961 Act but the 2025 Act chose not to re-enact it. Could be sunset-expired, functionally dead, or deliberately dropped.                                                   | Note it as "not carried forward" with the reason (sunset expired, obsolete, etc.).                                                                         |

### The Test

Before writing any content about a provision, ask:

> "Was this already the law under the 1961 Act (as amended by all Finance Acts through 2025) on 31 March 2026?"

- If **yes** → it is carried forward. One line. No elaboration.
- If **no** → it is a genuine 2025 Act change. Highlight it.

### Known Finance Act Changes That Must NOT Be Attributed to the 2025 Act

| Change                                                | Actual Source                       | Year                   |
| ----------------------------------------------------- | ----------------------------------- | ---------------------- |
| STCG equity rate 15% → 20%                            | Finance (No.2) Act, 2024            | Effective 23 July 2024 |
| LTCG equity rate 10% → 12.5%                          | Finance (No.2) Act, 2024            | Effective 23 July 2024 |
| LTCG exemption Rs 1L → Rs 1.25L                       | Finance (No.2) Act, 2024            | Effective 23 July 2024 |
| Indexation abolition                                  | Finance (No.2) Act, 2024            | Effective 23 July 2024 |
| Grandfathering for land/building pre-July 2024        | Finance (No.2) Act, 2024            | Effective 23 July 2024 |
| Pre-2018 equity grandfathering (FMV 31 Jan 2018)      | Finance Act, 2018                   | Effective AY 2019-20   |
| Debt MF/MLD always STCG                               | Finance Act, 2023                   | Effective AY 2024-25   |
| Rs 10 crore cap on Sections 54/54F                    | Finance Act, 2023                   | Effective AY 2024-25   |
| New tax regime as default (Section 115BAC/202)        | Finance Act, 2023                   | Effective AY 2024-25   |
| Standard deduction Rs 75,000 (new regime)             | Finance (No.2) Act, 2024            | Effective AY 2025-26   |
| Standard deduction Rs 50,000 (old regime)             | Finance Act, 2018                   | Effective AY 2019-20   |
| Goodwill excluded from depreciable intangibles        | Finance Act, 2021                   | Effective AY 2021-22   |
| MSME payment — no grace period (Section 43B(h))       | Finance Act, 2023                   | Effective AY 2024-25   |
| Agniveer Corpus Fund (Section 80CCH)                  | Finance Act, 2022                   | Effective AY 2023-24   |
| Rs 7.5L PF/NPS/superannuation cap                     | Finance Act, 2020                   | Effective AY 2021-22   |
| HP loss Rs 2L inter-head set-off cap                  | Finance Act, 2017                   | Effective AY 2018-19   |
| Self-occupied 2-property limit                        | Finance Act, 2019                   | Effective AY 2020-21   |
| HP "any reason" for self-occupied nil annual value    | Finance Act, 2025                   | Effective AY 2025-26   |
| Sections 206AB/206CCA removed (higher TDS non-filers) | Finance Act, 2025                   | Effective 1 April 2025 |
| Leave encashment Rs 25 lakh                           | CBDT Notification, 2023             | Effective AY 2024-25   |
| Senior citizen interest TDS threshold Rs 1 lakh       | Finance Act, 2025                   | Effective FY 2025-26   |
| Dividend TDS threshold Rs 10,000                      | Finance Act, 2025                   | Effective FY 2025-26   |
| Section 194T partner salary TDS                       | Finance (No.2) Act, 2024            | Effective 1 April 2025 |
| CSR expenditure non-deductible                        | Finance Act, 2014                   | Effective AY 2015-16   |
| Political ad expenditure prohibition (Section 37(2B)) | Taxation Laws (Amendment) Act, 1978 | Since 1978             |
| Holding period 24 months (immovable property)         | Finance Act, 2017                   | Effective AY 2018-19   |
| Holding period 12 months (listed equity)              | Finance Act, 2017                   | Effective AY 2018-19   |

---

## Step 3: Write Content MD

### Governing Documents

- **content-writing-directive.md** — tone, structure, rules, template
- This process document — attribution filter, accuracy standards

### Template

```markdown
# Unit X.Y: [Title]

## Overview

[2-3 sentences connecting to daily practice. State what the 2025 Act genuinely changed here — not what Finance Acts already changed.]

> Rates/thresholds/provisions as amended by Finance Act [year] are carried forward — no further change by the 2025 Act.
> [Include this line where applicable.]

---

## Old → New Section Mapping

| Old Section (1961 Act) | New Section (2025 Act) | Subject     | Change Type                                                              |
| ---------------------- | ---------------------- | ----------- | ------------------------------------------------------------------------ |
| X                      | **Y**                  | Description | Renumbered only / Restructured / Genuinely changed / Not carried forward |

---

## [Genuine 2025 Act Change — Section/Topic]

### What Changed

[Only if the 2025 Act itself made the change]

### What Stayed the Same

[Confirmation — CAs need to know what NOT to relearn]

### Practical Impact

[What to do differently in practice]

---

## Key Takeaways

- Bullet points summarising genuine 2025 Act changes
- Section mappings for quick reference

---

### Sources

[Exact URLs]
```

### Writing Rules

1. **Never explain what the CA already knows** — no topic tutorials
2. **Lead with the mapping table** — this is what CAs scan for first
3. **Distinguish "moved" from "changed"** — use explicit labels
4. **Tables over prose** — CAs are practitioners, not readers
5. **Cite exact section numbers** — both old and new, always
6. **Finance Act changes get one line** — not sections, not tables, not questions
7. **Authoritative textbook, third-person tone** — not conversational, not monologue

---

## Step 4: Define Learning Objectives

Before generating questions for each unit, define:

| Tier                      | Question                                                   | What the CA Must...                                                            |
| ------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Tier 1: Know It**       | What section mappings must the CA recall?                  | ...correctly cite the new section number in a return, opinion, or notice.      |
| **Tier 2: Understand It** | Why was this change made? What's the structural rationale? | ...explain to a client or colleague why the new Act is structured differently. |
| **Tier 3: Apply It**      | In what client/practice scenario does this change matter?  | ...correctly apply the new provision in a real professional situation.         |

These objectives must be stated explicitly in the prompt to the question-generation agent. Do not skip this step.

---

## Step 5: Generate Questions JSON

### Governing Documents

- **question-design-framework.md** — philosophy, tier guidelines, anti-patterns, quality rubric, checklist

### Structure

```json
{
  "unit": "X.Y",
  "title": "Unit Title",
  "totalQuestions": 45,
  "lessons": [
    {
      "title": "Lesson Title",
      "tier": 1,
      "order": 1,
      "questions": [
        {
          "order": 1,
          "question": "...",
          "options": [
            { "text": "...", "correct": false },
            { "text": "...", "correct": true },
            { "text": "...", "correct": false },
            { "text": "...", "correct": false }
          ],
          "explanation": "Shown on correct answer — teaches a mental model",
          "explanationWrong": "Shown on wrong answer — warm, encouraging, diagnostic",
          "tier": 1,
          "subConcepts": ["concept-tag-1", "concept-tag-2"],
          "isReview": false,
          "oldSection": "Section X",
          "newSection": "Section Y"
        }
      ]
    }
  ]
}
```

### Rules

| Rule                                   | Detail                                                                                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 45 questions, 9 lessons, 5 per lesson  | Non-negotiable structure                                                                                                                               |
| Tier distribution                      | Lessons 1-3 = Tier 1 (Know It), 4-6 = Tier 2 (Understand It), 7-9 = Tier 3 (Apply It)                                                                  |
| Difficulty curve per lesson            | Q1=easy, Q2=medium, Q3=review from prior units (isReview:true), Q4=hard, Q5=medium-easy                                                                |
| **Only test genuine 2025 Act changes** | Never test Finance Act amendments as "what changed in the 2025 Act." At most one review question can note a Finance Act change was carried forward.    |
| One concept per question               | If the CA gets it wrong, the system knows exactly what to resurface                                                                                    |
| Diagnostic distractors                 | Each wrong answer represents a specific, named misconception a CA would actually have                                                                  |
| Warm explanationWrong                  | "Common mix-up!" / "This trips up most CAs at first." Never punitive.                                                                                  |
| Vivid Tier 3 scenarios                 | Client calls, partner disputes, article clerk errors, audit findings, ERP system flags. 2-4 sentences of professional context.                         |
| Tag oldSection and newSection          | Every question carries both references for cross-referencing                                                                                           |
| Tag subConcepts                        | Granular topic tags enabling spaced repetition and adaptive review                                                                                     |
| No anti-patterns                       | No "All of the above." No "Which is NOT..." No trick questions. No textbook regurgitation. No number soup. No date trivia. No verbatim provision text. |

---

## Step 6: Accuracy Audit

Before finalising any unit, verify:

### Attribution Accuracy

- [ ] Every "change" highlighted in the content is genuinely from the 2025 Act — not a Finance Act amendment carried forward
- [ ] Finance Act changes are limited to one-line acknowledgments, not dedicated sections
- [ ] The questions do not test Finance Act changes as "2025 Act changes"

### Factual Accuracy

- [ ] Section numbers verified against official Act text or incometaxindia.gov.in navigator
- [ ] Rates, thresholds, and limits are current (reflecting all Finance Acts through 2025 and Finance Bill 2026)
- [ ] Form numbers verified against IT Rules 2026 notifications
- [ ] Exactly one unambiguously correct answer per question

### Quality Standards

- [ ] Content follows the content-writing-directive.md template and tone
- [ ] Questions follow the question-design-framework.md guidelines
- [ ] Tier 1 questions test recall of section mappings — no scenarios
- [ ] Tier 2 questions test understanding of why changes were made
- [ ] Tier 3 questions present vivid professional scenarios
- [ ] explanationWrong is warm and diagnostic in every question
- [ ] No question tests a concept not covered in the content MD

---

## Agent Prompts

The following standardised prompts are used for each step. Customise the bracketed sections per unit.

### Research Agent Prompt

```
Research [TOPIC] provisions under the Income Tax Act, 2025 (India) for a CA
learning platform. Use WebSearch and WebFetch on AUTHORITATIVE sources only
(incometaxindia.gov.in, PIB, CBDT, Taxmann, TaxGuru, ClearTax, EZTax, ICAI).

DO NOT write any files. Return ALL findings in structured format.

For each provision, capture:
1. Old section → New section mapping
2. What changed GENUINELY in the 2025 Act (not Finance Act amendments)
3. What was already changed by Finance Acts and is carried forward
4. Structural changes (provisos → sub-sections, mergers, table format)
5. Exact rates, thresholds, limits with Finance Act attribution
6. Form changes under IT Rules 2026

Units covered: [LIST UNITS AND TOPICS]

Return EVERYTHING with exact section mappings, attribution to correct
Finance Act where applicable, and source URLs.
```

### Content Writing Agent Prompt

```
Write content MD file to: [FILE PATH]

Unit [X.Y]: "[TITLE]" for the Taxpost learning platform.

STYLE: Authoritative textbook, third-person tone. Delta-focused — lead with
old→new mapping, distinguish moved vs changed, tables over prose. Follow
content-writing-directive.md.

CRITICAL: Only highlight changes genuinely introduced by the 2025 Act. Finance
Act amendments already operative under the 1961 Act get ONE LINE maximum:
"Carried forward from Finance Act [year] — no further change by the 2025 Act."

VERIFIED RESEARCH DATA:
[PASTE SECTION MAPPINGS, GENUINE CHANGES, CARRIED-FORWARD ITEMS]

Write in directive format: Overview → Old→New Mapping → What Changed (genuine
2025 Act only) → What Stayed the Same → Practical Impact → Key Takeaways →
Sources.
```

### Question Generation Agent Prompt

```
Write questions JSON file to: [FILE PATH]

Unit [X.Y]: "[TITLE]" — 45 questions, 9 lessons, 5/lesson.
Tier 1 (lessons 1-3), Tier 2 (4-6), Tier 3 (7-9).
Q1=easy, Q2=medium, Q3=review (isReview:true), Q4=hard, Q5=medium-easy.

CRITICAL: Only test genuine 2025 Act changes. Do NOT test Finance Act
amendments as "what changed in the 2025 Act."

LEARNING OBJECTIVES:
- Know: [What section mappings must the CA recall?]
- Understand: [Why was this change made? What's the structural rationale?]
- Do: [In what scenario does this change matter?]

KEY FACTS (genuine 2025 Act changes only):
[PASTE VERIFIED FACTS]

FRAMEWORK RULES:
- Warm explanationWrong ("Common mix-up!")
- Vivid Tier 3 scenarios (client calls, audit findings, article clerk errors)
- Diagnostic distractors (each wrong answer = named misconception)
- One concept per question
- No "All of the above," no negative framing, no trick questions
- Tag oldSection, newSection, subConcepts on every question

JSON structure: {"unit":"X.Y","title":"...","totalQuestions":45,"lessons":[...]}
```

### Accuracy Audit Agent Prompt

```
Read these files and audit for accuracy:
[LIST FILE PATHS]

Check specifically:
1. Are any Finance Act amendments (already in the 1961 Act) being wrongly
   attributed as "2025 Act changes"?
2. Are section numbers correct per the official Act text?
3. Are rates, thresholds, and limits current?
4. Does every question have exactly one unambiguous correct answer?

Known Finance Act changes that must NOT be attributed to the 2025 Act:
[PASTE FROM THE TABLE IN STEP 2]

For each issue found, report:
(a) What the file says
(b) What it should say
(c) Exact file path and location

DO NOT modify any files. Report findings only.
```

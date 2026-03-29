---
name: question-design-framework
description: The Art of Question Design for Professional Learning — principles, tier guidelines, anti-patterns, quality rubric
type: framework
---

# Question Design Framework for Taxpost

## Core Philosophy

Questions are not the product. Learning is the product. Questions are the mechanism.

- Don't start with "generate MCQs about Section 392"
- Start with "after this lesson, a CA must be able to correctly cite the TDS section on a salary client's certificate"
- THEN design questions that test whether they can do that

---

## Duolingo's Four-Stage Process (Applied to Tax)

### Stage 1: Define Learning Objective (Human)
Before generating a single question, define:
- What must the CA **know**? (facts, references)
- What must the CA **understand**? (why it changed, what it means)
- What must the CA **be able to do**? (apply to a client situation)

### Stage 2: Create "Raw Content" (Human + AI)
The raw content for each unit:
- Specific provision text (old and new)
- Real client scenarios where this provision applies
- Common mistakes CAs make with this provision
- Edge cases and gotchas
- Memorable scenarios that make the concept stick

### Stage 3: Convert to Interactive Exercises (AI + Human Review)
AI generates MANY variants, human selects the BEST.

### Stage 4: Assemble Personalized Lessons (AI)
Mix new content with review of previously learned material.

---

## What Makes a Question GOOD

### 1. Tests ONE Concept, Not Many
Bad: "Under Section 393(1), Table 1, what is the TDS rate on professional fees paid to a non-resident?"
→ Tests section + rate + residency + table. If wrong, what didn't they know?

Good: "TDS on payments to non-residents is governed by which table in Section 393?"
→ Tests one thing. If wrong, system knows exactly what to resurface.

### 2. Reflects Real Professional Practice
Every question must pass the "would a CA encounter this?" test.

### 3. Wrong Answers Are Plausible and Diagnostic
Each distractor should represent a **real confusion** a CA would have.

Example: "TDS on salary is under which new section?"
- 392 ← correct
- 393 ← knows it's TDS, wrong category
- 394 ← confused TDS and TCS
- 391 ← guessing by proximity

### 4. The Explanation IS the Teaching
Bad: "The correct answer is Section 392."
Good: "Section 392 specifically covers TDS on salary — it's the one section that kept its own dedicated provision. All other TDS categories are consolidated into Section 393's three tables."

### 5. Uses i+1 Principle
Each question tests ONE new thing while assuming everything previously taught is known.

### 6. Makes Mistakes Safe
Tone: "Common mix-up! The difference between 392 and 393 catches most CAs at first."
Never: "Wrong!", "Incorrect answer", "You should know this."

---

## What Makes a Question BAD

### 1. Trivial Questions (Too Easy)
If 95%+ would get it right without study, it's too easy.

### 2. Ambiguous Questions (Two Right Answers)
If a practicing CA could reasonably argue for a different answer, don't generate it. Trust destroyed.

### 3. Trick Questions (Gotcha = Resentment)
Every option should represent a genuine alternative, not a trap.

### 4. Knowledge-External Questions
If the explanation can't connect the answer to professional practice, it doesn't belong.

### 5. Compound Questions (Tests Multiple Things)
One question, one concept. If you need two concepts, make two questions.

---

## Question Design by Tier

### Tier 1: KNOW IT — Building New Vocabulary
- Test recall of mappings (old → new section)
- Test recognition of new terminology
- Test awareness of what was removed
- Create "muscle memory" for daily-use section numbers
- Keep scenarios out — pure facts only
- Focus on the 20% of sections covering 80% of daily practice
- Scaffold levels: Recognition → Constrained recall → Free recall

### Tier 2: UNDERSTAND IT — Grasping What Changed and Why
- Compare old and new provisions
- Test understanding of WHY a change was made
- "What stayed the same?" is as important as "what changed?"
- Test implications, not just facts
- Spot-the-difference and bridge questions

### Tier 3: APPLY IT — Using Knowledge in Real Scenarios
- Present realistic professional scenarios (2-4 sentences)
- Require applying knowledge to determine the answer
- Test judgment, not just memory
- Include professional context: "Your client asks..." / "During an audit..."
- Error identification: describe a mistake and ask what's wrong

---

## Anti-Patterns (Pipeline Must Prevent)

1. **Textbook Regurgitation**: Restated provisions as questions ("Section 392 covers TDS on salary. True/False?")
2. **Number Soup**: Too many section numbers in one question
3. **Negative Questions**: "Which is NOT covered under..." — prefer positive framing
4. **All of the Above**: Lazy question design. Write a better question with one correct answer.
5. **Date Trivia**: Unless the date has practical significance (effective date), dates are trivia
6. **Verbatim Provision**: Testing exact statutory language is for law exams, not professional practice

---

## Quality Scoring Rubric

| Criterion | Weight | Score 1 (Bad) | Score 3 (OK) | Score 5 (Excellent) |
|---|---|---|---|---|
| Accuracy | 30% | Contains factual error | Correct but imprecise | Precisely accurate with section reference |
| Practical relevance | 25% | Trivia or theoretical | Somewhat relevant | Directly reflects daily CA work |
| Diagnostic value | 15% | Can't tell why wrong | Partially diagnostic | Wrong answers reveal specific misconception |
| Explanation quality | 15% | Just states the answer | Explains the answer | Teaches a mental model that aids retention |
| Memorability | 10% | Generic, forgettable | Reasonable context | Vivid scenario that sticks |
| Conciseness | 5% | Wordy, >60 words | Moderate | Crisp, <=30 words for stem |

**Threshold:** Questions scoring below 3.5 weighted average should not be included.

---

## Content Developer's Checklist

### Factual
- [ ] Correct section reference verified against Act text
- [ ] Exactly one unambiguously correct answer
- [ ] No outdated information (reflects final Act, not February 2025 Bill)
- [ ] Explanation references specific provision

### Learning Design
- [ ] Tests ONE concept, not multiple
- [ ] Matches the tier (Tier 1 = facts, Tier 2 = understanding, Tier 3 = application)
- [ ] Distractors represent real professional confusions
- [ ] A CA who gets this wrong will learn from the explanation
- [ ] Passes the "would a CA encounter this?" test
- [ ] Not a trick question, not trivially easy, not ambiguous

### Tone
- [ ] Wrong answer explanation is encouraging, not punitive
- [ ] Professional but warm — colleague, not teacher
- [ ] No jargon the target audience wouldn't know
- [ ] Concise — can be read in 15 seconds

### System
- [ ] Tagged with granular sub_concepts
- [ ] All section references captured (oldSection, newSection)
- [ ] Tier appropriate for the question format
- [ ] Self-contained enough to work as a review question in another unit's lesson

---

## Memorable Scenario Principle

Can't be silly about tax law — but CAN create vivid, human scenarios:
- "Your 85-year-old client proudly tells you he's maintained a 40-year streak of citing Section 80C..."
- "Two partners in a CA firm are arguing: one says Assessment Year still exists..."
- "A client's WhatsApp message: 'Bhai, my CA said I don't need to worry about the new Act until 2027...'"

These stick because they involve human situations, not just legal provisions.

---

## Sources
- Duolingo Method Whitepaper (2023)
- "At Duolingo, humans and AI work together" (2024)
- "How Duolingo uses AI to create lessons faster" (2024)
- Apple Design Awards: Behind the Design
- Item Response Theory literature

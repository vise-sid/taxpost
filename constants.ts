export const POINTS_TO_REFILL = 10;

export const MAX_HEARTS = 5;

// --- Tier System ---

export const TIER_LABELS: Record<number, string> = {
  1: "Know It",
  2: "Understand It",
  3: "Apply It",
};

export const TIER_DESCRIPTIONS: Record<number, string> = {
  1: "Recall the key facts and section mappings",
  2: "Understand what changed and why it matters",
  3: "Apply knowledge to real client scenarios",
};

export const TIER_ACCURACY_THRESHOLDS: Record<number, number> = {
  1: 80,
  2: 75,
  3: 70,
};

export const LESSONS_PER_TIER = 5;

export const QUESTS = [
  {
    title: "Earn 20 XP",
    value: 20,
  },
  {
    title: "Earn 50 XP",
    value: 50,
  },
  {
    title: "Earn 100 XP",
    value: 100,
  },
  {
    title: "Earn 250 XP",
    value: 250,
  },
  {
    title: "Earn 500 XP",
    value: 500,
  },
  {
    title: "Earn 1000 XP",
    value: 1000,
  },
];

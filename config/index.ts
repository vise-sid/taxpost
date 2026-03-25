import type { Metadata } from "next";

export const siteConfig: Metadata = {
  title: "Taxpost",
  description:
    "Master India's new Income Tax Act 2025 through gamified, bite-sized daily learning. Duolingo for tax.",
  keywords: [
    "income-tax-act-2025",
    "chartered-accountant",
    "tax-learning",
    "gamified-education",
    "ca-exam",
    "income-tax",
    "india-tax",
    "taxpost",
  ] as Array<string>,
  authors: {
    name: "Taxpost",
    url: "https://taxpost.in",
  },
} as const;

export const links = {
  sourceCode: "https://github.com/siddharthshah/taxpost",
  email: "hello@taxpost.in",
} as const;

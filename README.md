# Taxpost

**Duolingo for India's New Income Tax Act 2025**

Master the new Income Tax Act 2025 through gamified, bite-sized daily learning — for free.

## Features

- 200+ MCQ questions across 8 tax topics (TDS, Capital Gains, Salary, etc.)
- Streak system with daily habit tracking
- Spaced repetition (Leitner 5-box system)
- Lesson timer with completion tracking
- Explanations with old→new section mapping
- Leaderboard with XP ranking
- Hearts system (5 hearts, refill with XP)
- Email reminders via Resend
- Share score on WhatsApp/Twitter

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Database:** Neon (PostgreSQL) + Drizzle ORM
- **Auth:** Clerk
- **Styling:** Tailwind CSS + shadcn/ui
- **Email:** Resend
- **Hosting:** Vercel

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Push schema to database
npx drizzle-kit push

# Seed the database
npm run db:prod

# Start dev server
npm run dev
```

## Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Neon
DATABASE_URL=postgresql://...

# Resend
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CLERK_ADMIN_IDS="user_..."
```

## License

MIT

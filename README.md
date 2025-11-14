# Franklin: Perfect Day

A minimal, luxurious timeline app for tracking daily blocks against your "Perfect Day" template.

## Overview

Franklin: Perfect Day helps you plan and track your ideal day using time-blocked schedules. The app displays your day as a beautiful vertical timeline with different types of activities (Focus, Physical, Kids, Admin, etc.) styled with strategic color accents on a clean parchment background.

**Visual Theme:** Benjamin Franklin meets Notion—simple luxury with lots of negative space.

## Features

### MVP (Current)
- ✅ User authentication (email/password)
- ✅ Perfect Day template view (expandable bar)
- ✅ Daily timeline auto-generated from template
- ✅ Beautiful minimal UI with custom color palette
- ✅ Block type categorization (F, P, K, A, C, L, M)

### Coming Soon
- Block editing (tasks, notes, metrics)
- Protein tracking
- Daily scoring (0-3 scale)
- Template editing
- Multi-day navigation

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **Deployment:** Ready for Vercel/Netlify

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd franklin_perfect_day
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Set up Supabase database:**
   - Open your Supabase project's SQL Editor
   - Copy and paste the entire contents of `supabase-schema.sql`
   - Execute the SQL script

4. **Create a Perfect Day template:**
   - Sign up for an account in the app
   - Note your user ID from the welcome screen
   - In Supabase SQL Editor, uncomment the seed data section at the bottom of `supabase-schema.sql`
   - Replace `YOUR_USER_ID_HERE` with your actual user ID
   - Execute the seed SQL to create a sample template
   - Refresh the app

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173)

## Database Schema

The app uses 5 main tables:

- **profiles** - User profiles (1:1 with auth.users)
- **perfect_day_templates** - Reusable ideal day templates
- **perfect_day_blocks** - Time blocks in each template
- **day_plans** - One record per day per user
- **day_blocks** - Actual blocks for each day (cloned from template)

See `supabase-schema.sql` for complete schema with RLS policies.

## Block Types

- **F (Focus)** - Deep work and focused building (Red accent)
- **P (Physical)** - Exercise, nutrition, health (Blue accent)
- **K (Kids)** - Family time and parenting (Gold accent)
- **A (Admin)** - Administrative tasks (Gray accent)
- **C (Comms)** - Communications and meetings (Teal accent)
- **L (Learning)** - Reading, courses, skills (Blue accent)
- **M (Margin)** - Rest, breaks, transitions (Neutral accent)

## Color Palette

- **Parchment:** `#F7F0E6` (background)
- **Ink:** `#111827` (primary text)
- **BT3 Red:** `#D61F26` (brand/focus accent)
- **Light Blue:** `#5BC0EB` (learning/physical)
- **Gold:** `#CBA135` (kids/family)

## Project Structure

```
src/
├── components/
│   ├── Auth/              # Authentication components
│   ├── Timeline/          # Timeline and block displays
│   ├── Header.tsx
│   └── PerfectDayBar.tsx
├── context/
│   └── AuthContext.tsx    # Auth state management
├── hooks/
│   ├── usePerfectDayTemplate.ts
│   └── useDayPlan.ts
├── lib/
│   └── supabase.ts        # Supabase client
├── pages/
│   └── TimelinePage.tsx   # Main app page
├── types/
│   └── database.ts        # TypeScript types
└── utils/
    ├── blockStyles.ts     # Block styling utilities
    └── timeFormat.ts      # Time formatting utilities
```

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Roadmap

See `todo.md` for detailed development roadmap and feature breakdown.

## License

Private project - All rights reserved

## Acknowledgments

Inspired by Benjamin Franklin's daily schedule and modern productivity apps.

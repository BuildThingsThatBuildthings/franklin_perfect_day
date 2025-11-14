# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Franklin: Perfect Day** is a minimal, luxurious timeline app for tracking daily blocks against a "Perfect Day" template. The app uses Supabase for backend (auth + database).

### Core Concept
- Shows today as a vertical timeline of macro blocks
- Includes an expandable "Perfect Day" template showing the ideal schedule
- Tracks actual vs. ideal day execution with metrics (protein intake, daily score)
- Visual theme: Benjamin Franklin meets Notion—simple luxury with parchment backgrounds and strategic color accents

## Data Architecture

### Database Schema (Supabase/PostgreSQL)

The app uses 5 main tables:

1. **`profiles`** - User profiles (1:1 with auth.users)
   - Stores: display_name, timezone

2. **`perfect_day_templates`** - User's ideal day template
   - One active template per user

3. **`perfect_day_blocks`** - Template blocks defining the ideal schedule
   - Block types: F (Focus), P (Physical), K (Kids), A (Admin), C (Comms), L (Learning), M (Margin)
   - Stored as time-of-day (no date), reusable across days

4. **`day_plans`** - One row per date per user
   - Tracks daily metrics: protein_target, protein_actual, score_small (0-3)
   - Unique index on (user_id, date)

5. **`day_blocks`** - Actual blocks for a given day
   - Cloned from template at day creation, then editable
   - Contains: tasks (JSONB array), notes, metrics (JSONB object)
   - References template_block_id for linking back to template

### Data Flow
- On first load of a new day: Create day_plan → Clone perfect_day_blocks into day_blocks
- During day: Updates go to day_blocks (tasks, notes, metrics)
- End of day: Update day_plans with final protein/score

## Frontend Architecture

### Tech Stack Assumption
React + Tailwind CSS (as specified in spec.md:199)

### Component Hierarchy
```
<AppShell>
  ├─ <Header />
  ├─ <PerfectDayBar />  (collapsible template view)
  └─ <Timeline />
       └─ <TimelineBlock />  (expandable for tasks/notes)
```

### Key Type Definitions
```typescript
type BlockType = "F" | "P" | "K" | "A" | "C" | "L" | "M";

interface DayBlock {
  id: string;
  block_type: BlockType;
  start_time: string;  // "04:20"
  end_time: string;    // "06:00"
  title: string;
  tasks: { id: string; text: string; done: boolean }[];
  notes?: string;
  metrics?: { [key: string]: number | string };
}
```

## Design System

### Color Palette
- **Parchment (background):** `#F7F0E6`
- **Ink (primary text):** `#111827`
- **BT3 Red (accent/Focus blocks):** `#D61F26`
- **Light Blue (Learning blocks):** `#5BC0EB`
- **Gold (Kids/Family blocks):** `#CBA135`
- **White (cards):** `#FFFFFF`

### Block Type Color Mapping
- **F (Focus):** Red `#D61F26` - outline/text
- **P (Physical):** Blue/green `#5BC0EB`
- **K (Kids):** Gold `#CBA135`
- **A (Admin):** Gray
- **C (Comms):** Teal
- **L (Learning):** Blue `#5BC0EB`
- **M (Margin):** Pale neutral

### UI Principles
- Ridiculously minimal: lots of negative space
- White cards on parchment background
- 16px rounded corners, subtle shadows
- Single modern sans-serif font (Inter/system UI), max 2 weights
- Strategic color usage: mostly parchment + white, small accents per block type

## Implementation Notes

### Supabase Integration
When implementing Supabase queries:
1. Always fetch active template with blocks on login
2. Check for existing day_plan by (user_id, date) before creating
3. Use `.order('sort_index', { ascending: true })` when fetching blocks
4. Clone template blocks preserving: block_type, start_time, end_time, title, sort_index

### Timeline Layout
- Vertical center-left line in light grey
- Each block card anchored to the line with time label on left
- Block type pill at top of card
- Inline expansion for tasks/notes (no modals)

### Current State Indicator
- Thin red line crossing timeline at current time
- Subtle but visible against parchment background

### Protein Tracking
- Primarily tracked in day_plans.protein_actual
- Can be incremented via block metrics (e.g., P blocks: `"protein": 40`)
- Target is day_plans.protein_target (default 200g)

### Perfect Day Score
- Stored as day_plans.score_small (0-3)
- Simple small integer scale for daily self-assessment

## Development Commands

### Setup
```bash
# Install dependencies
npm install

# Create .env.local file with Supabase credentials
cp .env.local.example .env.local
# Then edit .env.local and add your Supabase URL and anon key

# Run database schema in Supabase SQL Editor
# Execute supabase-schema.sql in your Supabase project
```

### Running the App
```bash
# Start development server
npm run dev
# App runs on http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Setup
1. Open Supabase SQL Editor for your project
2. Execute the complete `supabase-schema.sql` file
3. To seed sample data, uncomment and run the seed section at the bottom
4. Replace `YOUR_USER_ID_HERE` with your actual user UUID (found after signup)

### Project Structure
```
src/
├── components/
│   ├── Auth/          # Login, signup, protected route
│   ├── Timeline/      # Timeline and block components
│   ├── Header.tsx
│   └── PerfectDayBar.tsx
├── context/
│   └── AuthContext.tsx
├── hooks/
│   ├── usePerfectDayTemplate.ts
│   └── useDayPlan.ts
├── lib/
│   └── supabase.ts
├── pages/
│   └── TimelinePage.tsx
├── types/
│   └── database.ts
└── utils/
    ├── blockStyles.ts
    └── timeFormat.ts
```

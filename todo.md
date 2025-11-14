# Franklin: Perfect Day - Build Todo

**Project:** Minimal luxury timeline app for tracking daily blocks against a "Perfect Day" template
**Stack:** React + Tailwind CSS + Supabase
**Target:** Web app (responsive)
**Approach:** MVP first, then iterate

---

## 🎯 MVP Scope

**Core Goal:** User can log in and see today's schedule as a beautiful timeline, auto-generated from their Perfect Day template.

**In Scope:**
- Auth (login/signup)
- View today's timeline
- Auto-generate day from template
- Beautiful minimal UI with spec colors
- Collapsed/expandable Perfect Day bar

**Out of Scope (Future):**
- Editing blocks, tasks, notes
- Protein tracking UI
- Daily scoring UI
- Template editing
- Historical day views
- Multi-day navigation

---

## Phase 1: Project Foundation & Setup

### 1.1 Initialize React Project
- [ ] Create Vite + React + TypeScript project
  ```bash
  npm create vite@latest . -- --template react-ts
  ```
- [ ] Install dependencies
  ```bash
  npm install
  ```
- [ ] Verify dev server runs
  ```bash
  npm run dev
  ```

### 1.2 Install & Configure Tailwind CSS
- [ ] Install Tailwind and dependencies
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- [ ] Configure `tailwind.config.js` with custom colors:
  ```js
  colors: {
    parchment: '#F7F0E6',
    ink: '#111827',
    bt3Red: '#D61F26',
    lightBlue: '#5BC0EB',
    gold: '#CBA135',
  }
  ```
- [ ] Add Tailwind directives to `src/index.css`
- [ ] Test custom colors work

### 1.3 Project Structure
- [ ] Create folder structure:
  ```
  src/
    ├── components/
    ├── hooks/
    ├── lib/
    ├── types/
    └── utils/
  ```

### 1.4 Supabase Client Setup
- [ ] Install Supabase JS client
  ```bash
  npm install @supabase/supabase-js
  ```
- [ ] Create `.env.local` with Supabase credentials:
  ```
  VITE_SUPABASE_URL=your_url
  VITE_SUPABASE_ANON_KEY=your_key
  ```
- [ ] Add `.env.local` to `.gitignore`
- [ ] Create `src/lib/supabase.ts` with client initialization
- [ ] Create `src/lib/supabaseClient.ts` singleton export

---

## Phase 2: Database Schema

### 2.1 SQL Schema File
- [ ] Create `supabase-schema.sql` with complete schema
- [ ] Add `block_type` enum: F, P, K, A, C, L, M
- [ ] Create `profiles` table
- [ ] Create `perfect_day_templates` table
- [ ] Create `perfect_day_blocks` table
- [ ] Create `day_plans` table with unique index on (user_id, date)
- [ ] Create `day_blocks` table

### 2.2 Database Triggers & Functions
- [ ] Create trigger: auto-create profile on auth.users insert
- [ ] Create function: clone_template_to_day_blocks(user_id, date)
  - Fetches active template blocks
  - Creates day_plan if not exists
  - Clones blocks to day_blocks

### 2.3 Row Level Security (RLS)
- [ ] Enable RLS on all tables
- [ ] Add policy: users can only read/write their own data
  ```sql
  -- Example for profiles
  CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);
  ```
- [ ] Add policies for all tables (profiles, templates, blocks, plans)

### 2.4 Seed Data (Optional)
- [ ] Create SQL insert for default Perfect Day template
- [ ] Include sample blocks:
  - 4:00-6:00 [F] Deep Work
  - 6:00-7:00 [P] Workout + Protein
  - 8:00-10:00 [F] Focus Block 2
  - (etc.)

### 2.5 TypeScript Types
- [ ] Create `src/types/database.ts`
- [ ] Define `BlockType` type
- [ ] Define `Profile` interface
- [ ] Define `PerfectDayTemplate` interface
- [ ] Define `PerfectDayBlock` interface
- [ ] Define `DayPlan` interface
- [ ] Define `DayBlock` interface
- [ ] Define `Task` and `Metrics` types for JSONB fields

---

## Phase 3: Authentication

### 3.1 Auth Setup
- [ ] Install Supabase Auth UI (optional helper)
  ```bash
  npm install @supabase/auth-ui-react @supabase/auth-ui-shared
  ```
- [ ] Create `src/components/Auth/LoginForm.tsx`
- [ ] Create `src/components/Auth/AuthProvider.tsx` context
- [ ] Implement login with email/password
- [ ] Implement signup with email/password
- [ ] Add loading states

### 3.2 Protected Routes
- [ ] Create `src/components/Auth/ProtectedRoute.tsx`
- [ ] Wrap main app in auth check
- [ ] Redirect to login if not authenticated
- [ ] Redirect to timeline if authenticated

### 3.3 Profile Setup
- [ ] Create hook: `src/hooks/useProfile.ts`
- [ ] Fetch profile on login
- [ ] Create profile if doesn't exist (should be auto-created by trigger)
- [ ] Store profile in context/state

---

## Phase 4: Core Data Hooks

### 4.1 Template Hooks
- [ ] Create `src/hooks/usePerfectDayTemplate.ts`
- [ ] Fetch active template for current user
- [ ] Fetch template blocks (ordered by sort_index)
- [ ] Handle loading/error states

### 4.2 Day Plan Hooks
- [ ] Create `src/hooks/useDayPlan.ts`
- [ ] Accept date parameter (default: today)
- [ ] Check if day_plan exists for (user_id, date)
- [ ] If not exists: create day_plan + clone template blocks
- [ ] Return day_plan and day_blocks

### 4.3 Day Blocks Hook
- [ ] Create `src/hooks/useDayBlocks.ts`
- [ ] Fetch day_blocks for given day_plan_id
- [ ] Order by sort_index
- [ ] Parse JSONB fields (tasks, metrics)

---

## Phase 5: UI Components - Layout

### 5.1 App Shell
- [ ] Create `src/components/AppShell.tsx`
- [ ] Set parchment background color
- [ ] Add proper padding/max-width for content

### 5.2 Header
- [ ] Create `src/components/Header.tsx`
- [ ] Display "Franklin: Perfect Day" (Franklin in red, rest in ink)
- [ ] Display current date: "Today · Tue Nov 13"
- [ ] Add small logo or icon (optional)
- [ ] Make responsive

### 5.3 Perfect Day Bar
- [ ] Create `src/components/PerfectDayBar.tsx`
- [ ] Props: `{ template, blocks, isOpen, onToggle }`
- [ ] Collapsed state:
  - White pill with gold border
  - Show: "Perfect Day · 4:00–19:30 · 4×F · 200g protein"
  - Calculate summary from template blocks
- [ ] Expanded state:
  - Slide down parchment card
  - Map over template blocks
  - Show mini rows (read-only)
- [ ] Add expand/collapse animation

---

## Phase 6: UI Components - Timeline

### 6.1 Timeline Container
- [ ] Create `src/components/Timeline/Timeline.tsx`
- [ ] Props: `{ blocks: DayBlock[] }`
- [ ] Render vertical line (thin, light gray, center-left)
- [ ] Map over blocks → render TimelineBlock components
- [ ] Handle empty state

### 6.2 Timeline Block Component
- [ ] Create `src/components/Timeline/TimelineBlock.tsx`
- [ ] Props: `{ block: DayBlock }`
- [ ] Layout:
  - Time label on left (e.g., "4:20–6:00")
  - White card anchored to timeline
  - Block type pill at top with color
  - Title text below pill
- [ ] MVP: Display only (no expand/edit)

### 6.3 Block Type Styling
- [ ] Create `src/utils/blockStyles.ts`
- [ ] Map block types to colors:
  ```ts
  {
    F: { color: '#D61F26', label: 'Focus' },
    P: { color: '#5BC0EB', label: 'Physical' },
    K: { color: '#CBA135', label: 'Kids' },
    A: { color: '#9CA3AF', label: 'Admin' },
    C: { color: '#14B8A6', label: 'Comms' },
    L: { color: '#5BC0EB', label: 'Learning' },
    M: { color: '#D1D5DB', label: 'Margin' }
  }
  ```
- [ ] Create utility function: `getBlockStyle(type: BlockType)`

### 6.4 Time Formatting
- [ ] Create `src/utils/timeFormat.ts`
- [ ] Function: format time string "04:20" → "4:20"
- [ ] Function: calculate duration between times
- [ ] Function: format for display "4:20–6:00"

---

## Phase 7: Main App Integration

### 7.1 Main Timeline Page
- [ ] Create `src/pages/TimelinePage.tsx`
- [ ] Use `usePerfectDayTemplate()` hook
- [ ] Use `useDayPlan(today)` hook
- [ ] Use `useDayBlocks(dayPlanId)` hook
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Render Header + PerfectDayBar + Timeline

### 7.2 App Routes
- [ ] Create `src/App.tsx` with routing
- [ ] Route: `/login` → LoginForm
- [ ] Route: `/` → ProtectedRoute → TimelinePage
- [ ] Redirect logic

### 7.3 State Management
- [ ] Decide: Context API vs Zustand (recommend Context for MVP)
- [ ] Create `src/context/AppContext.tsx` if needed
- [ ] Store: currentUser, profile, template
- [ ] Provide to app tree

---

## Phase 8: Styling & Polish

### 8.1 Design System Tokens
- [ ] Create `src/styles/tokens.ts`
- [ ] Export spacing scale
- [ ] Export border radius (16px for cards)
- [ ] Export shadow styles (subtle)
- [ ] Export font weights

### 8.2 Component Styling
- [ ] Apply parchment background to body
- [ ] Style white cards with rounded corners + shadow
- [ ] Apply block type colors consistently
- [ ] Add hover states (subtle)
- [ ] Ensure text hierarchy (title sizes, weights)

### 8.3 Responsive Design
- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1200px+)
- [ ] Adjust padding/spacing for each breakpoint
- [ ] Ensure timeline readable on small screens

### 8.4 Loading States
- [ ] Create `src/components/common/Spinner.tsx`
- [ ] Add loading skeleton for timeline blocks
- [ ] Add loading state for Perfect Day bar
- [ ] Smooth transitions

### 8.5 Error States
- [ ] Create `src/components/common/ErrorMessage.tsx`
- [ ] Handle auth errors
- [ ] Handle data fetching errors
- [ ] Provide user-friendly messages

---

## Phase 9: Testing & Deployment Prep

### 9.1 Manual Testing
- [ ] Test: Signup new user
- [ ] Test: Login existing user
- [ ] Test: Template loads correctly
- [ ] Test: Day auto-generates on first load
- [ ] Test: Subsequent loads fetch existing day
- [ ] Test: Perfect Day bar expand/collapse
- [ ] Test: Timeline displays all blocks in order
- [ ] Test: Colors match spec
- [ ] Test: Responsive on mobile

### 9.2 Bug Fixes
- [ ] Fix any broken auth flows
- [ ] Fix data loading issues
- [ ] Fix styling bugs
- [ ] Fix responsive issues

### 9.3 Code Quality
- [ ] Remove console.logs
- [ ] Remove unused imports
- [ ] Add TypeScript types where missing
- [ ] Basic error handling in all hooks

### 9.4 Documentation
- [ ] Update CLAUDE.md with build commands
- [ ] Add README.md with:
  - Project overview
  - Setup instructions
  - Environment variables needed
  - How to run locally
- [ ] Document Supabase setup steps

### 9.5 Build & Deploy
- [ ] Test production build: `npm run build`
- [ ] Fix any build errors
- [ ] Deploy to Vercel/Netlify (optional)
- [ ] Configure environment variables in hosting

---

## 🚀 Future Enhancements (Post-MVP)

### Phase 10: Block Editing
- [ ] Make TimelineBlock expandable
- [ ] Add inline task list (checkbox + text)
- [ ] Add notes textarea
- [ ] Add metrics input (varies by block type)
- [ ] Save changes to day_blocks table
- [ ] Optimistic UI updates

### Phase 11: Protein Tracking
- [ ] Add protein input in P (Physical) blocks
- [ ] Sum protein across blocks
- [ ] Display total in Perfect Day bar
- [ ] Show progress bar (actual vs target)
- [ ] Update day_plans.protein_actual

### Phase 12: Daily Scoring
- [ ] Add end-of-day score modal (0-3 scale)
- [ ] Save to day_plans.score_small
- [ ] Display score in header or summary

### Phase 13: Template Editing
- [ ] Create template editor page
- [ ] Add/edit/delete/reorder blocks
- [ ] Save changes to perfect_day_blocks
- [ ] Confirm before overwriting existing template

### Phase 14: Multi-Day Navigation
- [ ] Add date picker in header
- [ ] Navigate to previous/next days
- [ ] Calendar view (optional)
- [ ] Week summary view (optional)

### Phase 15: Advanced Features
- [ ] Current time indicator (thin red line on timeline)
- [ ] Block duration calculations and validation
- [ ] Drag-to-reorder blocks
- [ ] Duplicate blocks
- [ ] Dark mode toggle
- [ ] Export day as PDF/text
- [ ] Weekly/monthly analytics

---

## 📝 Notes

**Key Files to Create:**
- `supabase-schema.sql` - Complete database schema
- `src/lib/supabase.ts` - Supabase client
- `src/types/database.ts` - TypeScript types
- `src/hooks/usePerfectDayTemplate.ts` - Template data
- `src/hooks/useDayPlan.ts` - Day initialization
- `src/components/Timeline/Timeline.tsx` - Main timeline view
- `src/components/PerfectDayBar.tsx` - Template viewer

**Critical MVP Functionality:**
1. Auth works (login/signup)
2. Template exists with blocks
3. Day auto-generates from template
4. Timeline renders beautifully
5. UI matches spec aesthetic

**Development Order:**
1. Database schema first (foundation)
2. Auth second (gate to app)
3. Data hooks third (business logic)
4. UI components last (presentation)

---

**Status:** Ready to build
**Next Step:** Phase 1.1 - Initialize React project

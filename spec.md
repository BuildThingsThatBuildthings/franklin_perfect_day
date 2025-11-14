Nice, this is a perfect fit for a clean little Franklin app.

Let’s define **Franklin: Perfect Day** as a minimal, luxurious Supabase-backed timeline app.

---

## 1. Concept & Theme

**Name:** `Franklin: Perfect Day`
**Single job:** Show _today_ as a timeline of macro blocks, plus a tap-to-expand **Perfect Day template**.

**Visual vibe:**

- Simple luxury, Benjamin-Franklin-meets-Notion.
- Lots of negative space, ultra-clean shapes.

**Color palette (hex suggestions):**

- **Parchment background:** `#F7F0E6`
- **Ink (primary text):** `#111827`
- **BT3 Red (accent / focus):** `#D61F26`
- **Light Blue (secondary / learning):** `#5BC0EB`
- **Gold (kids/family / success):** `#CBA135`
- **White cards:** `#FFFFFF`

Use colors sparingly: mostly parchment + white, then small accents per block type.

---

## 2. Data Model (Supabase)

You’re using Supabase for auth + DB. Here’s a clean schema.

### 2.1 Tables

#### `profiles`

Linked 1:1 with `auth.users`.

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  display_name text,
  timezone text default 'America/Chicago'
);
```

#### `perfect_day_templates`

Each user can have one primary template (or multiple versions later).

```sql
create table public.perfect_day_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null default 'Default',
  is_active boolean default true,
  created_at timestamptz default now()
);
```

#### `perfect_day_blocks`

Macro blocks that define the _ideal_ day.

```sql
create type block_type as enum ('F','P','K','A','C','L','M');

create table public.perfect_day_blocks (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.perfect_day_templates(id) on delete cascade,
  sort_index int not null,
  block_type block_type not null,
  -- stored as time-of-day, no date
  start_time time not null,
  end_time time not null,
  title text not null,
  created_at timestamptz default now()
);
```

#### `day_plans`

One row per date.

```sql
create table public.day_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null,
  created_at timestamptz default now(),
  protein_target int default 200,
  protein_actual int default 0,
  score_small int default 0 -- 0–3 perfect-day score
);
create unique index day_plans_user_date_idx
  on public.day_plans(user_id, date);
```

#### `day_blocks`

Actual blocks for a given day. These can be cloned from the template and then edited.

```sql
create table public.day_blocks (
  id uuid primary key default gen_random_uuid(),
  day_plan_id uuid references public.day_plans(id) on delete cascade,
  template_block_id uuid references public.perfect_day_blocks(id),
  sort_index int not null,
  block_type block_type not null,
  start_time time not null,
  end_time time not null,
  title text not null,
  notes text,
  tasks jsonb default '[]'::jsonb,    -- [{id, text, done}]
  metrics jsonb default '{}'::jsonb,  -- {"protein": 50, "energy": 3}
  created_at timestamptz default now()
);
create index day_blocks_day_plan_idx on public.day_blocks(day_plan_id);
```

That’s enough to:

- Store a reusable **Perfect Day template**
- Generate each day’s plan from it
- Track actual vs ideal inside `day_blocks` and `day_plans`.

---

## 3. Main Screen UX

### 3.1 Layout

**Top app bar**

- Left: `Franklin: Perfect Day` in small caps.
- Right: “Today · Tue Nov 13” with a subtle chevron for date picker.

**Below: Perfect Day bar (collapsed by default)**

A full-width pill:

> **Perfect Day** · 4:00–19:30 · 4×F · 200g protein

- Background: white with a thin gold border `#CBA135`.
- Text: dark ink, small Franklin icon or lightning bolt in red as micro-accent.
- Tap → slides down a parchment card showing the _template_ schedule (read-only).

**Main content: Vertical timeline for `day_blocks`**

- Background: parchment.
- Center-left: thin vertical line in light grey.
- Each block is a white rounded card anchored to the line.

Example visual:

```text
4:00   ┃ ● [F] Focus 1
       ┃     Deep build: Course module

6:00   ┃ ● [P] Workout + Protein

8:00   ┃ ● [F] Focus 2
...
```

### 3.2 Block Card Design

**Collapsed block:**

- Small time label on the left: `4:20–6:00`
- Block type pill on top of the card:

  - F (Focus) → red outline / red text `#D61F26`
  - P (Physical) → greenish/blue outline (you can reuse `#5BC0EB` or pick a muted green)
  - K (Kids) → gold accent `#CBA135`
  - A (Admin) → gray
  - C (Comms) → teal
  - L (Learning) → blue
  - M (Margin) → pale neutral

- Title text below the pill (one line max).

**Expanded block (on tap):**

Inline expansion reveals:

- tiny subtask checklist
- notes area
- metrics row (e.g. for P: `Protein +40g`; for A: `Automation idea: …`)

No extra panels, no modals for core use.

---

## 4. Components (Frontend Shape)

Assume React + Tailwind (or similar).

### Key components

- `<AppShell>`

  - `<Header />`
  - `<PerfectDayBar />`
  - `<Timeline />`

- `<PerfectDayBar />`

  - props: `{ template, isOpen, onToggle }`
  - Collapsed: pill row with summary.
  - Expanded: map over `perfect_day_blocks` and render mini rows.

- `<Timeline />`

  - props: `{ blocks }`
  - Renders vertical line + a `<TimelineBlock />` for each.

- `<TimelineBlock />`

  - props: `{ block }`
  - Handles expand/collapse for nested tasks/notes.

### Example type definitions

```ts
type BlockType = "F" | "P" | "K" | "A" | "C" | "L" | "M";

interface DayBlock {
  id: string;
  block_type: BlockType;
  start_time: string; // "04:20"
  end_time: string; // "06:00"
  title: string;
  tasks: { id: string; text: string; done: boolean }[];
  notes?: string;
  metrics?: { [key: string]: number | string };
}
```

---

## 5. Supabase Integration Flow

**On login:**

1. Fetch `profile` for current `user.id`.
2. Fetch active `perfect_day_template` and its `perfect_day_blocks`.
3. Check `day_plans` for `today`:

   - If exists: fetch `day_blocks`.
   - If not: create `day_plan` and clone blocks from template:

```ts
// pseudo-code
const { data: templateBlocks } = await supabase
  .from("perfect_day_blocks")
  .select("*")
  .eq("template_id", activeTemplateId)
  .order("sort_index", { ascending: true });

// create day_plan, then day_blocks
```

**During the day:**

- Editing a block (title, notes, tasks) → `update` `day_blocks`.
- Protein or score at end of day → `update` `day_plans`.

---

## 6. Theming Rules

Keep the UI **ridiculously minimal**:

- **Background:** parchment `#F7F0E6`
- **Cards:** pure white with subtle shadow + 16px rounded corners
- **Primary accent:** `#D61F26` (used only in logo text, F-pill outline, selected state)
- **Secondary accent:** `#5BC0EB` (L-block and maybe current-time indicator)
- **Gold:** `#CBA135` for K-blocks and the Perfect Day bar border
- **Fonts:** single modern sans (Inter / system UI), no more than 2 weights.

Examples:

- App title in header: `Franklin` in red, `Perfect Day` in ink.
- Current time marker: thin red line crossing the timeline, subtle.

---

If you want next, I can:

- Draft a **minimal React/Tailwind page** that renders the header, Perfect Day bar, and a mocked timeline using this palette, or
- Write the exact **SQL and Supabase RLS policies** so you can paste them into the SQL editor and be ready to build.

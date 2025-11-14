# Quick Start Guide

Get Franklin: Perfect Day running in **11 minutes**.

## Step 1: Set Up Supabase Database (5 min)

1. Open your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `supabase-schema.sql` in this project
5. Copy the entire file contents
6. Paste into Supabase SQL Editor
7. Click **Run** (bottom right)
8. Verify success: Check **Table Editor** - you should see 5 new tables

## Step 2: Configure Environment Variables (2 min)

1. In this project directory, copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Get your Supabase credentials:
   - In Supabase dashboard, click **Project Settings** (gear icon)
   - Click **API** tab
   - Copy your **Project URL**
   - Copy your **anon public** key

3. Edit `.env.local` and paste your credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 3: Start the App (1 min)

```bash
npm run dev
```

Open browser to: http://localhost:5173

## Step 4: Create Account & Template (3 min)

1. **Sign up** with your email and password
2. You'll see a welcome screen with your **User ID** - copy it!
3. Go back to **Supabase SQL Editor**
4. Open `supabase-schema.sql` and scroll to the bottom
5. **Uncomment** the seed data section (lines starting with `/*` and `*/`)
6. Replace `YOUR_USER_ID_HERE` with your copied User ID
7. Click **Run**
8. **Refresh** your browser

## ✅ You're Done!

You should now see:
- Header with "FRANKLIN: PERFECT DAY" and today's date
- A collapsible "Perfect Day" bar showing your template
- A beautiful timeline with sample blocks

## 🎨 Sample Template Blocks

The seed data creates 12 blocks:
- 4:00-6:00 [F] Deep Work: Course Module
- 6:00-7:00 [P] Workout + Protein Shake
- 7:00-8:00 [A] Morning Admin & Planning
- 8:00-10:00 [F] Focus: Client Project
- 10:00-10:30 [M] Break & Reset
- 10:30-12:00 [K] Kids: Activities & Learning
- 12:00-12:30 [P] Lunch + Protein
- 12:30-15:00 [F] Deep Work: Building
- 15:00-16:00 [C] Communications & Calls
- 16:00-18:00 [K] Family Time
- 18:00-19:00 [L] Learning & Reading
- 19:00-19:30 [M] Evening Wind Down

## 🔧 Troubleshooting

**Can't connect to Supabase?**
- Check your `.env.local` file has correct credentials
- Verify the file is named exactly `.env.local` (not `.env`)
- Restart the dev server after changing `.env.local`

**No template showing?**
- Make sure you ran the seed data SQL
- Make sure you replaced `YOUR_USER_ID_HERE` with your actual ID
- Check **Supabase Table Editor** → `perfect_day_templates` → verify row exists

**SQL errors when creating database?**
- Make sure you're running the **entire** schema file, not just parts
- The file should be run as a single query

## 📖 Next Steps

Once everything is working:
- See `README.md` for full documentation
- See `todo.md` for upcoming features
- See `BUILD_SUMMARY.md` for technical details

**Enjoy building your Perfect Day! 🚀**

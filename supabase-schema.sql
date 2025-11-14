-- Franklin: Perfect Day Database Schema
-- Supabase PostgreSQL Schema

-- ============================================
-- ENUMS
-- ============================================

-- Block types for categorizing activities
CREATE TYPE block_type AS ENUM ('F', 'P', 'K', 'A', 'C', 'L', 'M');
-- F = Focus, P = Physical, K = Kids, A = Admin, C = Comms, L = Learning, M = Margin

-- ============================================
-- TABLES
-- ============================================

-- User profiles (1:1 with auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  display_name TEXT,
  timezone TEXT DEFAULT 'America/Chicago'
);

-- Perfect Day templates (one active template per user)
CREATE TABLE public.perfect_day_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template blocks defining the ideal day schedule
CREATE TABLE public.perfect_day_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.perfect_day_templates(id) ON DELETE CASCADE NOT NULL,
  sort_index INT NOT NULL,
  block_type block_type NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Daily plans (one row per user per date)
CREATE TABLE public.day_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  protein_target INT DEFAULT 200,
  protein_actual INT DEFAULT 0,
  score_small INT DEFAULT 0 CHECK (score_small >= 0 AND score_small <= 3),
  CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- Daily blocks (actual schedule for a specific day)
CREATE TABLE public.day_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_plan_id UUID REFERENCES public.day_plans(id) ON DELETE CASCADE NOT NULL,
  template_block_id UUID REFERENCES public.perfect_day_blocks(id),
  sort_index INT NOT NULL,
  block_type block_type NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  tasks JSONB DEFAULT '[]'::JSONB,
  metrics JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX day_blocks_day_plan_idx ON public.day_blocks(day_plan_id);
CREATE INDEX perfect_day_blocks_template_idx ON public.perfect_day_blocks(template_id);
CREATE INDEX day_plans_user_date_idx ON public.day_plans(user_id, date);
CREATE INDEX perfect_day_templates_user_active_idx ON public.perfect_day_templates(user_id, is_active);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfect_day_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfect_day_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_blocks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Perfect Day Templates policies
CREATE POLICY "Users can view own templates"
  ON public.perfect_day_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates"
  ON public.perfect_day_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON public.perfect_day_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON public.perfect_day_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Perfect Day Blocks policies
CREATE POLICY "Users can view own template blocks"
  ON public.perfect_day_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfect_day_templates
      WHERE id = perfect_day_blocks.template_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own template blocks"
  ON public.perfect_day_blocks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfect_day_templates
      WHERE id = perfect_day_blocks.template_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own template blocks"
  ON public.perfect_day_blocks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfect_day_templates
      WHERE id = perfect_day_blocks.template_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own template blocks"
  ON public.perfect_day_blocks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfect_day_templates
      WHERE id = perfect_day_blocks.template_id
      AND user_id = auth.uid()
    )
  );

-- Day Plans policies
CREATE POLICY "Users can view own day plans"
  ON public.day_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own day plans"
  ON public.day_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own day plans"
  ON public.day_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own day plans"
  ON public.day_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Day Blocks policies
CREATE POLICY "Users can view own day blocks"
  ON public.day_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.day_plans
      WHERE id = day_blocks.day_plan_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own day blocks"
  ON public.day_blocks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.day_plans
      WHERE id = day_blocks.day_plan_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own day blocks"
  ON public.day_blocks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.day_plans
      WHERE id = day_blocks.day_plan_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own day blocks"
  ON public.day_blocks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.day_plans
      WHERE id = day_blocks.day_plan_id
      AND user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Clone template blocks to day blocks
CREATE OR REPLACE FUNCTION public.clone_template_to_day(
  p_user_id UUID,
  p_date DATE
)
RETURNS UUID AS $$
DECLARE
  v_day_plan_id UUID;
  v_template_id UUID;
BEGIN
  -- Get the active template for the user
  SELECT id INTO v_template_id
  FROM public.perfect_day_templates
  WHERE user_id = p_user_id AND is_active = TRUE
  LIMIT 1;

  IF v_template_id IS NULL THEN
    RAISE EXCEPTION 'No active template found for user %', p_user_id;
  END IF;

  -- Create or get existing day plan
  INSERT INTO public.day_plans (user_id, date)
  VALUES (p_user_id, p_date)
  ON CONFLICT (user_id, date) DO UPDATE SET user_id = p_user_id
  RETURNING id INTO v_day_plan_id;

  -- Check if day_blocks already exist for this plan
  IF EXISTS (SELECT 1 FROM public.day_blocks WHERE day_plan_id = v_day_plan_id) THEN
    -- Blocks already exist, just return the plan ID
    RETURN v_day_plan_id;
  END IF;

  -- Clone template blocks to day blocks
  INSERT INTO public.day_blocks (
    day_plan_id,
    template_block_id,
    sort_index,
    block_type,
    start_time,
    end_time,
    title
  )
  SELECT
    v_day_plan_id,
    id,
    sort_index,
    block_type,
    start_time,
    end_time,
    title
  FROM public.perfect_day_blocks
  WHERE template_id = v_template_id
  ORDER BY sort_index;

  RETURN v_day_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DATA (Optional - Sample Perfect Day)
-- ============================================

-- Note: This is commented out - run manually if you want to seed a sample template
-- You'll need to replace 'YOUR_USER_ID_HERE' with an actual user UUID

/*
DO $$
DECLARE
  v_user_id UUID := 'YOUR_USER_ID_HERE';
  v_template_id UUID;
BEGIN
  -- Create default template
  INSERT INTO public.perfect_day_templates (user_id, name, is_active)
  VALUES (v_user_id, 'My Perfect Day', TRUE)
  RETURNING id INTO v_template_id;

  -- Insert sample blocks
  INSERT INTO public.perfect_day_blocks (template_id, sort_index, block_type, start_time, end_time, title) VALUES
    (v_template_id, 1, 'F', '04:00', '06:00', 'Deep Work: Course Module'),
    (v_template_id, 2, 'P', '06:00', '07:00', 'Workout + Protein Shake'),
    (v_template_id, 3, 'A', '07:00', '08:00', 'Morning Admin & Planning'),
    (v_template_id, 4, 'F', '08:00', '10:00', 'Focus: Client Project'),
    (v_template_id, 5, 'M', '10:00', '10:30', 'Break & Reset'),
    (v_template_id, 6, 'K', '10:30', '12:00', 'Kids: Activities & Learning'),
    (v_template_id, 7, 'P', '12:00', '12:30', 'Lunch + Protein'),
    (v_template_id, 8, 'F', '12:30', '15:00', 'Deep Work: Building'),
    (v_template_id, 9, 'C', '15:00', '16:00', 'Communications & Calls'),
    (v_template_id, 10, 'K', '16:00', '18:00', 'Family Time'),
    (v_template_id, 11, 'L', '18:00', '19:00', 'Learning & Reading'),
    (v_template_id, 12, 'M', '19:00', '19:30', 'Evening Wind Down');
END $$;
*/

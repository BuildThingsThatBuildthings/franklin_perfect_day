-- Add key_outcomes JSONB field to day_plans table
ALTER TABLE public.day_plans
ADD COLUMN IF NOT EXISTS key_outcomes JSONB DEFAULT '[]'::JSONB;

-- Add comment explaining the field
COMMENT ON COLUMN public.day_plans.key_outcomes IS 'Array of KeyOutcome objects representing the 1-3 daily wins from Morning OODA planning';

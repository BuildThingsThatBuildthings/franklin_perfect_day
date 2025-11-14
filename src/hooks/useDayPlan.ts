import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DayPlan, DayBlock } from '../types/database';

interface DayPlanData {
  dayPlan: DayPlan | null;
  dayBlocks: DayBlock[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDayPlan(
  userId: string | undefined,
  date: string
): DayPlanData {
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);
  const [dayBlocks, setDayBlocks] = useState<DayBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDayPlan() {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if day plan exists
      const { data: existingPlan, error: planError } = await supabase
        .from('day_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();

      if (planError) {
        setError(planError.message);
        setLoading(false);
        return;
      }

      if (existingPlan) {
        // Day plan exists, fetch it and its blocks
        setDayPlan(existingPlan);

        const { data: blocksData, error: blocksError } = await supabase
          .from('day_blocks')
          .select('*')
          .eq('day_plan_id', existingPlan.id)
          .order('sort_index', { ascending: true });

        if (blocksError) {
          setError(blocksError.message);
        } else {
          setDayBlocks(blocksData || []);
        }
      } else {
        // Check if user has a template before trying to clone
        const { data: templateCheck } = await supabase
          .from('perfect_day_templates')
          .select('id')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();

        if (!templateCheck) {
          // No template exists yet - user needs to create one first
          setError('No Perfect Day template found. Create your template first!');
          setLoading(false);
          return;
        }

        // Day plan doesn't exist, create it by cloning template
        const { data: newPlanId, error: cloneError } = await supabase.rpc(
          'clone_template_to_day',
          {
            p_user_id: userId,
            p_date: date,
          }
        );

        if (cloneError) {
          setError(cloneError.message);
          setLoading(false);
          return;
        }

        // Fetch the newly created day plan and blocks
        const { data: newPlan } = await supabase
          .from('day_plans')
          .select('*')
          .eq('id', newPlanId)
          .single();

        const { data: newBlocks } = await supabase
          .from('day_blocks')
          .select('*')
          .eq('day_plan_id', newPlanId)
          .order('sort_index', { ascending: true });

        if (newPlan) setDayPlan(newPlan);
        if (newBlocks) setDayBlocks(newBlocks);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDayPlan();
  }, [userId, date]);

  return {
    dayPlan,
    dayBlocks,
    loading,
    error,
    refetch: fetchDayPlan,
  };
}

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SkillGap } from '../types/database';

interface SkillGapsData {
  skillGaps: SkillGap[];
  loading: boolean;
  error: string | null;
  getSkillGapsByCategory: (category: string) => SkillGap[];
}

export function useSkillGaps(userId: string | undefined): SkillGapsData {
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchSkillGaps() {
      try {
        // Fetch global skill gaps (the 7 core ones) and user-specific ones
        const { data, error: fetchError } = await supabase
          .from('skill_gaps')
          .select('*')
          .or(`is_global.eq.true,user_id.eq.${userId}`)
          .order('category', { ascending: true });

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setSkillGaps(data as SkillGap[] || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch skill gaps');
      } finally {
        setLoading(false);
      }
    }

    fetchSkillGaps();
  }, [userId]);

  const getSkillGapsByCategory = (category: string) => {
    return skillGaps.filter((gap) => gap.category === category);
  };

  return { skillGaps, loading, error, getSkillGapsByCategory };
}

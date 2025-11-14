import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PerfectDayTemplate, PerfectDayBlock } from '../types/database';

interface TemplateData {
  template: PerfectDayTemplate | null;
  blocks: PerfectDayBlock[];
  loading: boolean;
  error: string | null;
}

export function usePerfectDayTemplate(userId: string | undefined): TemplateData {
  const [template, setTemplate] = useState<PerfectDayTemplate | null>(null);
  const [blocks, setBlocks] = useState<PerfectDayBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchTemplate() {
      try {
        // Fetch active template
        const { data: templateData, error: templateError } = await supabase
          .from('perfect_day_templates')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();

        if (templateError) {
          setError(templateError.message);
          setLoading(false);
          return;
        }

        // No template exists yet - this is okay for new users
        if (!templateData) {
          setTemplate(null);
          setBlocks([]);
          setLoading(false);
          return;
        }

        setTemplate(templateData);

        // Fetch template blocks
        const { data: blocksData, error: blocksError } = await supabase
          .from('perfect_day_blocks')
          .select('*')
          .eq('template_id', templateData.id)
          .order('sort_index', { ascending: true });

        if (blocksError) {
          setError(blocksError.message);
        } else {
          setBlocks(blocksData || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchTemplate();
  }, [userId]);

  return { template, blocks, loading, error };
}

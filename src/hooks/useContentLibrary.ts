import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ContentLibraryDoc } from '../types/database';

interface ContentLibraryData {
  docs: ContentLibraryDoc[];
  loading: boolean;
  error: string | null;
  getDocBySlug: (slug: string) => ContentLibraryDoc | undefined;
  getDocsByCategory: (category: string) => ContentLibraryDoc[];
}

export function useContentLibrary(): ContentLibraryData {
  const [docs, setDocs] = useState<ContentLibraryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocs() {
      try {
        const { data, error: fetchError } = await supabase
          .from('content_library')
          .select('*')
          .eq('is_published', true)
          .order('category', { ascending: true })
          .order('sort_order', { ascending: true });

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setDocs(data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch content');
      } finally {
        setLoading(false);
      }
    }

    fetchDocs();
  }, []);

  const getDocBySlug = (slug: string) => {
    return docs.find((doc) => doc.slug === slug);
  };

  const getDocsByCategory = (category: string) => {
    return docs.filter((doc) => doc.category === category);
  };

  return { docs, loading, error, getDocBySlug, getDocsByCategory };
}

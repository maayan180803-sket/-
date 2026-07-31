import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface WithId {
  id: string;
  household_id?: string;
}

interface UseSupabaseTableOptions {
  orderColumn?: string;
  ascending?: boolean;
}

export function useSupabaseTable<T extends WithId>(
  table: string,
  householdId: string | null | undefined,
  options: UseSupabaseTableOptions = {},
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { orderColumn = 'created_at', ascending = false } = options;

  const refresh = useCallback(async () => {
    if (!householdId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: rows, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('household_id', householdId)
      .order(orderColumn, { ascending });

    if (fetchError) setError(fetchError.message);
    else {
      setError(null);
      setData((rows as T[]) ?? []);
    }
    setLoading(false);
  }, [table, householdId, orderColumn, ascending]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!householdId) return;
    const channel = supabase
      .channel(`${table}-${householdId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `household_id=eq.${householdId}` },
        () => refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, householdId, refresh]);

  const insert = useCallback(
    async (row: Partial<T>) => {
      if (!householdId) return { error: 'לא נמצא מרחב תקציב' };
      const { error: insertError } = await supabase
        .from(table)
        .insert({ ...row, household_id: householdId } as never);
      if (insertError) return { error: insertError.message };
      await refresh();
      return { error: null };
    },
    [table, householdId, refresh],
  );

  const update = useCallback(
    async (id: string, patch: Partial<T>) => {
      const { error: updateError } = await supabase.from(table).update(patch as never).eq('id', id);
      if (updateError) return { error: updateError.message };
      await refresh();
      return { error: null };
    },
    [table, refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from(table).delete().eq('id', id);
      if (deleteError) return { error: deleteError.message };
      await refresh();
      return { error: null };
    },
    [table, refresh],
  );

  return { data, loading, error, refresh, insert, update, remove };
}

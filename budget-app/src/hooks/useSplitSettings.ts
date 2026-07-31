import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useHousehold } from '../contexts/HouseholdContext';
import type { SplitSettings } from '../types';

export function useSplitSettings() {
  const { household } = useHousehold();
  const [settings, setSettings] = useState<SplitSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!household) {
      setSettings(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from('split_settings').select('*').eq('household_id', household.id).maybeSingle();
    setSettings(data ?? null);
    setLoading(false);
  }, [household]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!household) return;
    const channel = supabase
      .channel(`split-settings-${household.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'split_settings', filter: `household_id=eq.${household.id}` },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [household, refresh]);

  const update = useCallback(
    async (patch: Partial<Pick<SplitSettings, 'method' | 'member_percents'>>) => {
      if (!household) return { error: 'לא נמצא מרחב תקציב' };
      const { error } = await supabase.from('split_settings').update(patch).eq('household_id', household.id);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [household, refresh],
  );

  return { settings, loading, update, refresh };
}

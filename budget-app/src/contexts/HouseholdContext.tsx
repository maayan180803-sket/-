import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import type { Household, HouseholdMember } from '../types';

interface HouseholdContextValue {
  household: Household | null;
  members: HouseholdMember[];
  currentMember: HouseholdMember | null;
  loading: boolean;
  refresh: () => Promise<void>;
  createHousehold: (name: string, displayName: string) => Promise<{ error: string | null }>;
  joinHousehold: (code: string, displayName: string) => Promise<{ error: string | null }>;
  updateHousehold: (patch: Partial<Pick<Household, 'name' | 'moving_budget'>>) => Promise<{ error: string | null }>;
}

const HouseholdContext = createContext<HouseholdContextValue | undefined>(undefined);

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setHousehold(null);
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: myMembership } = await supabase
      .from('household_members')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!myMembership) {
      setHousehold(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    const [{ data: householdRow }, { data: memberRows }] = await Promise.all([
      supabase.from('households').select('*').eq('id', myMembership.household_id).maybeSingle(),
      supabase
        .from('household_members')
        .select('*')
        .eq('household_id', myMembership.household_id)
        .order('created_at', { ascending: true }),
    ]);

    setHousehold(householdRow ?? null);
    setMembers(memberRows ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!household) return;
    const channel = supabase
      .channel(`household-members-${household.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'household_members', filter: `household_id=eq.${household.id}` },
        () => load(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [household, load]);

  const createHousehold: HouseholdContextValue['createHousehold'] = async (name, displayName) => {
    const { error } = await supabase.rpc('create_household', { p_name: name, p_display_name: displayName });
    if (error) return { error: error.message };
    await load();
    return { error: null };
  };

  const joinHousehold: HouseholdContextValue['joinHousehold'] = async (code, displayName) => {
    const { error } = await supabase.rpc('accept_household_invite', {
      p_code: code.trim().toLowerCase(),
      p_display_name: displayName,
    });
    if (error) return { error: error.message };
    await load();
    return { error: null };
  };

  const updateHousehold: HouseholdContextValue['updateHousehold'] = async (patch) => {
    if (!household) return { error: 'לא נמצא מרחב תקציב' };
    const { error } = await supabase.from('households').update(patch).eq('id', household.id);
    if (error) return { error: error.message };
    await load();
    return { error: null };
  };

  const currentMember = members.find((m) => m.user_id === user?.id) ?? null;

  return (
    <HouseholdContext.Provider
      value={{ household, members, currentMember, loading, refresh: load, createHousehold, joinHousehold, updateHousehold }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const ctx = useContext(HouseholdContext);
  if (!ctx) throw new Error('useHousehold must be used within HouseholdProvider');
  return ctx;
}

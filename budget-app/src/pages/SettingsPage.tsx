import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { supabase } from '../lib/supabaseClient';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/Field';
import { formatDate } from '../lib/format';
import type { HouseholdInvite } from '../types';

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { household, members, updateHousehold } = useHousehold();
  const [name, setName] = useState(household?.name ?? '');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [invites, setInvites] = useState<HouseholdInvite[]>([]);
  const [creatingInvite, setCreatingInvite] = useState(false);

  useEffect(() => {
    setName(household?.name ?? '');
  }, [household]);

  const loadInvites = async () => {
    if (!household) return;
    const { data } = await supabase
      .from('household_invites')
      .select('*')
      .eq('household_id', household.id)
      .is('used_at', null)
      .order('created_at', { ascending: false });
    setInvites(data ?? []);
  };

  useEffect(() => {
    loadInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [household]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await updateHousehold({ name });
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCreateInvite = async () => {
    if (!household || !user) return;
    setCreatingInvite(true);
    await supabase.from('household_invites').insert({ household_id: household.id, created_by: user.id });
    await loadInvites();
    setCreatingInvite(false);
  };

  const handleRevokeInvite = async (id: string) => {
    await supabase.from('household_invites').delete().eq('id', id);
    await loadInvites();
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // clipboard might be unavailable - the code is still visible on screen
    }
  };

  return (
    <div>
      <PageHeader title="הגדרות" subtitle="ניהול המרחב המשותף, חברים והזמנות" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-bold text-slate-900">פרטי המרחב המשותף</h2>
          <form onSubmit={handleSaveName} className="flex items-end gap-2">
            <div className="flex-1">
              <TextField label="שם התקציב המשותף" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <Button type="submit" disabled={busy}>
              {saved ? 'נשמר ✓' : 'שמירה'}
            </Button>
          </form>

          <h3 className="mb-2 mt-5 text-sm font-semibold text-slate-700">חברים במרחב</h3>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium text-slate-700">
                  {m.display_name}
                  {m.user_id === user?.id && ' (אני)'}
                </span>
                <span className="text-xs text-slate-400">הצטרפ/ה ב-{formatDate(m.created_at)}</span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm text-slate-500">
            מחובר/ת כ-<span className="font-medium text-slate-700">{user?.email}</span>
          </p>
          <button onClick={() => signOut()} className="mt-2 text-sm text-rose-500 hover:underline">
            התנתקות
          </button>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">הזמנת בן/בת זוג</h2>
            <Button onClick={handleCreateInvite} disabled={creatingInvite}>
              + קוד הזמנה חדש
            </Button>
          </div>
          <p className="mb-3 text-sm text-slate-500">
            שתפו את הקוד עם בן/בת הזוג. בעת ההרשמה, הם יבחרו "הצטרפות עם קוד" ויזינו אותו.
          </p>
          {invites.length === 0 ? (
            <p className="text-sm text-slate-400">אין כרגע קודי הזמנה פעילים</p>
          ) : (
            <div className="space-y-2">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                  <div>
                    <p className="font-mono text-lg font-bold tracking-widest text-indigo-700">{invite.code}</p>
                    <p className="text-xs text-slate-400">בתוקף עד {formatDate(invite.expires_at)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copyCode(invite.code)} className="text-xs text-indigo-600 hover:underline">
                      העתקה
                    </button>
                    <button onClick={() => handleRevokeInvite(invite.id)} className="text-xs text-rose-500 hover:underline">
                      ביטול
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

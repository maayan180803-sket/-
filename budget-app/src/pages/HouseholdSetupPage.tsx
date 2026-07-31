import { useState } from 'react';
import { useHousehold } from '../contexts/HouseholdContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/Field';

export function HouseholdSetupPage() {
  const { createHousehold, joinHousehold } = useHousehold();
  const { signOut } = useAuth();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('התקציב המשותף שלנו');
  const [displayName, setDisplayName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await createHousehold(name, displayName);
    setBusy(false);
    if (error) setError(error);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await joinHousehold(code, displayName);
    setBusy(false);
    if (error) setError(error);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">ברוכים הבאים!</h1>
          <p className="mt-1 text-sm text-slate-500">צרו מרחב תקציב משותף חדש, או הצטרפו למרחב קיים של בן/בת הזוג</p>
        </div>

        <Card>
          <div className="mb-4 flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setTab('create')}
              className={`flex-1 rounded-lg py-2 ${tab === 'create' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
              יצירת מרחב חדש
            </button>
            <button
              type="button"
              onClick={() => setTab('join')}
              className={`flex-1 rounded-lg py-2 ${tab === 'join' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
              הצטרפות עם קוד
            </button>
          </div>

          {tab === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-3">
              <TextField label="שם התקציב המשותף" value={name} onChange={(e) => setName(e.target.value)} required />
              <TextField
                label="השם שלי (יוצג לבן/בת הזוג)"
                placeholder="לדוגמה: מעיין"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
              <Button type="submit" disabled={busy} className="w-full">
                צור מרחב תקציב
              </Button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-3">
              <TextField
                label="קוד הזמנה"
                placeholder="קיבלת קוד מבן/בת הזוג"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <TextField
                label="השם שלי (יוצג לבן/בת הזוג)"
                placeholder="לדוגמה: עדי"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
              <Button type="submit" disabled={busy} className="w-full">
                הצטרפות למרחב
              </Button>
            </form>
          )}
        </Card>

        <button onClick={() => signOut()} className="mx-auto mt-4 block text-sm text-slate-400 hover:underline">
          התנתקות
        </button>
      </div>
    </div>
  );
}

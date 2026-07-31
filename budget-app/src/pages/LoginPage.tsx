import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/Field';
import { Card } from '../components/ui/Card';

type Mode = 'login' | 'signup' | 'reset';

export function LoginPage() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setError(error);
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) setError(error);
        else setInfo('נרשמת בהצלחה! אם נדרש אימות מייל, בדקו את תיבת הדואר שלכם, ואז התחברו.');
      } else {
        const { error } = await resetPassword(email);
        if (error) setError(error);
        else setInfo('נשלח מייל לאיפוס סיסמה (אם הכתובת קיימת במערכת).');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl text-white">
            💸
          </div>
          <h1 className="text-2xl font-bold text-slate-900">תקציב משותף</h1>
          <p className="mt-1 text-sm text-slate-500">ניהול הכנסות והוצאות לזוגות</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-3">
            <TextField
              label="אימייל"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            {mode !== 'reset' && (
              <TextField
                label="סיסמה"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            )}

            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
            {info && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{info}</p>}

            <Button type="submit" disabled={busy} className="w-full">
              {mode === 'login' ? 'התחברות' : mode === 'signup' ? 'הרשמה' : 'שלח מייל לאיפוס'}
            </Button>
          </form>

          <div className="mt-4 flex flex-col items-center gap-2 text-sm">
            {mode !== 'login' && (
              <button className="text-indigo-600 hover:underline" onClick={() => setMode('login')}>
                יש לי כבר חשבון - התחברות
              </button>
            )}
            {mode !== 'signup' && (
              <button className="text-indigo-600 hover:underline" onClick={() => setMode('signup')}>
                משתמש חדש - הרשמה
              </button>
            )}
            {mode !== 'reset' && (
              <button className="text-slate-400 hover:underline" onClick={() => setMode('reset')}>
                שכחתי סיסמה
              </button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

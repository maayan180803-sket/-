import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { HouseholdProvider, useHousehold } from './contexts/HouseholdContext';
import { LoginPage } from './pages/LoginPage';
import { HouseholdSetupPage } from './pages/HouseholdSetupPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { IncomePage } from './pages/IncomePage';
import { ExpensesPage } from './pages/ExpensesPage';
import { RecurringExpensesPage } from './pages/RecurringExpensesPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { SplitSettingsPage } from './pages/SplitSettingsPage';
import { MovingPage } from './pages/MovingPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { MonthlyPlanningPage } from './pages/MonthlyPlanningPage';
import { SavingsGoalsPage } from './pages/SavingsGoalsPage';
import { SettingsPage } from './pages/SettingsPage';

const ReportsPage = lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
    </div>
  );
}

function AuthenticatedApp() {
  const { household, loading } = useHousehold();

  if (loading) return <FullScreenLoader />;
  if (!household) return <HouseholdSetupPage />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/income" element={<IncomePage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/recurring" element={<RecurringExpensesPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/split" element={<SplitSettingsPage />} />
        <Route path="/moving" element={<MovingPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route
          path="/reports"
          element={
            <Suspense fallback={<p className="text-slate-400">טוען דוחות...</p>}>
              <ReportsPage />
            </Suspense>
          }
        />
        <Route path="/planning" element={<MonthlyPlanningPage />} />
        <Route path="/goals" element={<SavingsGoalsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;
  if (!user) return <LoginPage />;

  return (
    <HouseholdProvider>
      <AuthenticatedApp />
    </HouseholdProvider>
  );
}

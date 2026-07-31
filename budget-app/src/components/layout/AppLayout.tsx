import { Outlet } from 'react-router-dom';
import { SideNav } from './SideNav';
import { BottomNav } from './BottomNav';
import { useHousehold } from '../../contexts/HouseholdContext';

export function AppLayout() {
  const { household } = useHousehold();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SideNav />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white">💸</div>
          <p className="text-sm font-bold text-slate-900">{household?.name}</p>
        </header>
        <main className="flex-1 px-4 py-5 pb-24 lg:px-8 lg:py-8 lg:pb-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

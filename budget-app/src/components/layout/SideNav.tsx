import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navItems';
import { useAuth } from '../../contexts/AuthContext';
import { useHousehold } from '../../contexts/HouseholdContext';

export function SideNav() {
  const { signOut } = useAuth();
  const { household, currentMember } = useHousehold();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-l border-slate-200 bg-white px-3 py-5 lg:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white">💸</div>
        <div>
          <p className="text-sm font-bold text-slate-900">{household?.name}</p>
          <p className="text-xs text-slate-400">שלום, {currentMember?.display_name}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => signOut()}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
      >
        <span>🚪</span>
        התנתקות
      </button>
    </aside>
  );
}

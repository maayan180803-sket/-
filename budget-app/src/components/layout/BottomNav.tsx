import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from './navItems';
import { useAuth } from '../../contexts/AuthContext';

export function BottomNav() {
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const primaryItems = NAV_ITEMS.filter((i) => i.primary);
  const moreItems = NAV_ITEMS.filter((i) => !i.primary);
  const isMoreActive = moreItems.some((i) => i.to === location.pathname);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {primaryItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                isActive ? 'text-indigo-600' : 'text-slate-500'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={() => setShowMore(true)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
            isMoreActive ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <span className="text-lg">☰</span>
          עוד
        </button>
      </nav>

      {showMore && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-900/50 lg:hidden" onClick={() => setShowMore(false)}>
          <div
            className="w-full rounded-t-3xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setShowMore(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs font-medium ${
                      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
              <button
                onClick={() => signOut()}
                className="flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs font-medium text-slate-500 hover:bg-slate-100"
              >
                <span className="text-xl">🚪</span>
                התנתקות
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

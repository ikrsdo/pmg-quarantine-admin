import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, Activity, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../theme/ThemeToggle';
import UpdateBanner from './UpdateBanner';
import { QUARANTINE_TYPES, DEFAULT_QUARANTINE_TYPE } from '../constants/quarantineTypes';
import { version } from '../../package.json';

function navItemClasses(isActive) {
  return `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
    isActive
      ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
  }`;
}

function navLinkClass({ isActive }) {
  return navItemClasses(isActive);
}

function subNavItemClasses(isActive) {
  return `block rounded-md px-3 py-1.5 text-sm ${
    isActive
      ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
  }`;
}

function mobileNavItemClasses(isActive) {
  return `flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-1 py-2.5 text-center text-xs font-medium ${
    isActive
      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
      : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
  }`;
}

function mobileNavLinkClass({ isActive }) {
  return mobileNavItemClasses(isActive);
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isQuarantineActive = location.pathname.startsWith('/quarantine');
  const activeType = new URLSearchParams(location.search).get('type') || DEFAULT_QUARANTINE_TYPE;

  const [groupOpen, setGroupOpen] = useState(isQuarantineActive);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  useEffect(() => {
    if (!mobileDropdownOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setMobileDropdownOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileDropdownOpen]);

  return (
    <div className="h-screen overflow-hidden bg-white dark:bg-zinc-950 lg:flex">
      <aside className="hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-zinc-200 lg:px-3 lg:py-4 lg:dark:border-zinc-800">
        <div className="px-2">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            PMG Quarantine Admin
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-600">v{version}</p>
        </div>
        <p className="mt-3 truncate px-2 text-xs text-zinc-500 dark:text-zinc-500">{user}</p>
        <div className="mt-3 flex items-center gap-2 px-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <LogOut className="size-3.5" />
            Log out
          </button>
        </div>
        <nav className="mt-6 flex flex-col gap-1">
          <NavLink to="/dashboard" className={navLinkClass}>
            <LayoutDashboard className="size-4" />
            Dashboard
          </NavLink>

          <div>
            <button
              type="button"
              onClick={() => setGroupOpen((v) => !v)}
              className={`${navItemClasses(isQuarantineActive)} w-full`}
            >
              <ShieldAlert className="size-4" />
              Quarantine
              <ChevronDown
                className={`ml-auto size-4 shrink-0 transition-transform ${groupOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {groupOpen && (
              <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-zinc-200 pl-3 dark:border-zinc-800">
                {QUARANTINE_TYPES.map((t) => (
                  <Link
                    key={t.value}
                    to={`/quarantine?type=${t.value}`}
                    className={subNavItemClasses(isQuarantineActive && activeType === t.value)}
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NavLink to="/tracking" className={navLinkClass}>
            <Activity className="size-4" />
            Tracking Center
          </NavLink>
        </nav>
      </aside>

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="pt-safe z-10 flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white/95 px-4 pb-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 lg:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              PMG Quarantine Admin <span className="text-zinc-400 dark:text-zinc-600">v{version}</span>
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-500">{user}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              Log out
            </button>
          </div>
        </header>

        <nav className="flex shrink-0 border-b border-zinc-200 dark:border-zinc-800 lg:hidden">
          <NavLink to="/dashboard" className={mobileNavLinkClass}>
            <LayoutDashboard className="size-4" />
            Dashboard
          </NavLink>

          <div className="relative flex flex-1">
            <button
              type="button"
              onClick={() => setMobileDropdownOpen((v) => !v)}
              className={`${mobileNavItemClasses(isQuarantineActive)} w-full`}
            >
              <ShieldAlert className="size-4" />
              Quarantine
            </button>
            {mobileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMobileDropdownOpen(false)}
                />
                <div className="absolute left-1/2 top-full z-30 mt-1 w-52 -translate-x-1/2 rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                  {QUARANTINE_TYPES.map((t) => (
                    <Link
                      key={t.value}
                      to={`/quarantine?type=${t.value}`}
                      onClick={() => setMobileDropdownOpen(false)}
                      className={`block px-3 py-2 text-sm ${
                        isQuarantineActive && activeType === t.value
                          ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                          : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {t.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          <NavLink to="/tracking" className={mobileNavLinkClass}>
            <Activity className="size-4" />
            Tracking Center
          </NavLink>
        </nav>

        <div className="min-h-0 flex-1">{children}</div>
      </div>

      <UpdateBanner />
    </div>
  );
}

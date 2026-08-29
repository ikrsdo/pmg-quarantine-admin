import { NavLink } from 'react-router-dom';
import { ShieldAlert, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../theme/ThemeToggle';
import { version } from '../../package.json';

const NAV_ITEMS = [
  { to: '/quarantine', label: 'Quarantine', icon: ShieldAlert },
  { to: '/tracking', label: 'Tracking Center', icon: Activity },
];

function navLinkClass({ isActive }) {
  return `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
    isActive
      ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
  }`;
}

function mobileNavLinkClass({ isActive }) {
  return `flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-2.5 text-center text-sm font-medium ${
    isActive
      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
      : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
  }`;
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="h-screen overflow-hidden bg-white dark:bg-zinc-950 lg:flex">
      <aside className="hidden lg:flex lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-zinc-200 lg:px-3 lg:py-4 lg:dark:border-zinc-800">
        <div className="px-2">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            PMG Quarantine Admin
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-600">v{version}</p>
        </div>
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
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="mt-auto truncate px-2 text-xs text-zinc-500 dark:text-zinc-500">{user}</p>
      </aside>

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="z-10 flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 lg:hidden">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              PMG Quarantine Admin <span className="text-zinc-400 dark:text-zinc-600">v{version}</span>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">{user}</p>
          </div>
          <div className="flex items-center gap-2">
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
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={mobileNavLinkClass}>
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

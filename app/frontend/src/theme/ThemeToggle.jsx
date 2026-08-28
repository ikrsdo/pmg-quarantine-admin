import { useEffect, useState } from 'react';

const STORAGE_KEY = 'pmg-quarantine-admin:theme';

function getInitialTheme() {
  return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      className="rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
      aria-label="Temayı değiştir"
    >
      {theme === 'dark' ? 'Açık tema' : 'Koyu tema'}
    </button>
  );
}

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function SearchableSelect({ value, onChange, options, allLabel = 'All' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleKeyDown(e) {
    if (e.key === 'Escape' && open) {
      e.stopPropagation();
      setOpen(false);
      setQuery('');
    }
  }

  const filtered = options.filter((email) => email.toLowerCase().includes(query.toLowerCase()));

  function select(email) {
    onChange(email);
    setOpen(false);
    setQuery('');
  }

  return (
    <div ref={rootRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-left text-sm text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
      >
        <span className="truncate">{value || allLabel}</span>
        <ChevronDown className="size-4 shrink-0 text-zinc-400 dark:text-zinc-600" />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full border-b border-zinc-200 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none dark:border-zinc-800 dark:text-zinc-100"
          />
          <div className="max-h-48 overflow-y-auto">
            <button
              type="button"
              onClick={() => select('')}
              className="block w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {allLabel}
            </button>
            {filtered.map((email) => (
              <button
                key={email}
                type="button"
                onClick={() => select(email)}
                className="block w-full truncate px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {email}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-500">No matches.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

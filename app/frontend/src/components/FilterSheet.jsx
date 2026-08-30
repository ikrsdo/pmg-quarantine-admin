import { useEffect } from 'react';

export default function FilterSheet({ open, filters, onChange, onClose, onApply, availableEmails = [] }) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      // iOS Safari silently skips backdrop-filter on a `fixed` element
      // unless it has its own compositing layer - forcing one here is what
      // makes the blur actually render on mobile Safari.
      style={{ transform: 'translateZ(0)' }}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">Filter</p>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-500">
            Recipient email
            <select
              value={filters.pmail}
              onChange={(e) => onChange({ ...filters, pmail: e.target.value })}
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
            >
              <option value="">All</option>
              {availableEmails.map((email) => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-500">
            Start
            <input
              type="datetime-local"
              value={filters.starttimeLocal}
              onChange={(e) => onChange({ ...filters, starttimeLocal: e.target.value })}
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-500">
            End
            <input
              type="datetime-local"
              value={filters.endtimeLocal}
              onChange={(e) => onChange({ ...filters, endtimeLocal: e.target.value })}
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
            />
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';

function toDatetimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Recomputes what the date preset's window would be right now and compares
// against the current filters - a proxy for "is this preset the one that's
// currently applied", since we don't store the preset choice itself.
function isWithinPreset(filters, ms) {
  return (
    filters.endtimeLocal === toDatetimeLocal(new Date()) &&
    filters.starttimeLocal === toDatetimeLocal(new Date(Date.now() - ms))
  );
}

const PRESETS = [
  {
    label: 'Last 24h',
    apply: (filters) => ({
      ...filters,
      starttimeLocal: toDatetimeLocal(new Date(Date.now() - 24 * 60 * 60 * 1000)),
      endtimeLocal: toDatetimeLocal(new Date()),
      ndr: false,
      greylist: false,
    }),
    isActive: (filters) => isWithinPreset(filters, 24 * 60 * 60 * 1000) && !filters.ndr && !filters.greylist,
  },
  {
    label: 'Last 7 days',
    apply: (filters) => ({
      ...filters,
      starttimeLocal: toDatetimeLocal(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
      endtimeLocal: toDatetimeLocal(new Date()),
      ndr: false,
      greylist: false,
    }),
    isActive: (filters) => isWithinPreset(filters, 7 * 24 * 60 * 60 * 1000) && !filters.ndr && !filters.greylist,
  },
  {
    label: 'NDR/Rejected',
    apply: (filters) => ({ ...filters, ndr: true, greylist: false }),
    isActive: (filters) => !!filters.ndr,
  },
  {
    label: 'Greylist',
    apply: (filters) => ({ ...filters, greylist: true, ndr: false }),
    isActive: (filters) => !!filters.greylist,
  },
];

export default function TrackingFilterSheet({ open, filters, onChange, onClose, onApply }) {
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

        <div className="mb-4 flex flex-col gap-1.5">
          <p className="text-xs text-zinc-500 dark:text-zinc-500">Saved Filters</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => {
              const active = preset.isActive(filters);
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onChange(preset.apply(filters))}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    active
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-500">
            From
            <input
              type="text"
              value={filters.from}
              onChange={(e) => onChange({ ...filters, from: e.target.value })}
              placeholder="you@example.com"
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-500">
            Recipient (target)
            <input
              type="text"
              value={filters.target}
              onChange={(e) => onChange({ ...filters, target: e.target.value })}
              placeholder="you@example.com"
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-500">
            Free-text filter (xfilter)
            <input
              type="text"
              value={filters.xfilter}
              onChange={(e) => onChange({ ...filters, xfilter: e.target.value })}
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
            />
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

          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={filters.ndr}
              onChange={(e) => onChange({ ...filters, ndr: e.target.checked })}
              className="rounded border-zinc-300 dark:border-zinc-700"
            />
            NDR (bounce) messages only
          </label>

          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={filters.greylist}
              onChange={(e) => onChange({ ...filters, greylist: e.target.checked })}
              className="rounded border-zinc-300 dark:border-zinc-700"
            />
            Greylisted only
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

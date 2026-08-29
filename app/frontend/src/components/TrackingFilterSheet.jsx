export default function TrackingFilterSheet({ open, filters, onChange, onClose, onApply }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-md rounded-t-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:rounded-xl">
        <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">Filter</p>

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

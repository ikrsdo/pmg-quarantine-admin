export default function SelectionBar({ count, onDeliver, onBlockRequest, onClear }) {
  return (
    <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{count} mesaj seçildi</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClear}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          Temizle
        </button>
        <button
          type="button"
          disabled={count === 0}
          onClick={onDeliver}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-40"
        >
          Deliver
        </button>
        <button
          type="button"
          disabled={count === 0}
          onClick={onBlockRequest}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-40"
        >
          Block
        </button>
      </div>
    </div>
  );
}

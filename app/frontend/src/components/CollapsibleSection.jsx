import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function CollapsibleSection({ title, right, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-3 text-left ${open ? 'mb-3 border-b border-zinc-200 pb-2 dark:border-zinc-800' : ''}`}
      >
        <span className="flex items-center gap-1.5">
          {open ? (
            <ChevronDown className="size-3.5 shrink-0 text-zinc-400 dark:text-zinc-600" />
          ) : (
            <ChevronRight className="size-3.5 shrink-0 text-zinc-400 dark:text-zinc-600" />
          )}
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</span>
        </span>
        {right && (
          <span onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5">
            {right}
          </span>
        )}
      </button>
      {open && children}
    </div>
  );
}

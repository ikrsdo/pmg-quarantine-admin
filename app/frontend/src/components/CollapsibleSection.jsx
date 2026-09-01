import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const ACCENT_BORDERS = {
  blue: 'border-l-blue-500',
  red: 'border-l-red-500',
  purple: 'border-l-purple-500',
  amber: 'border-l-amber-500',
  zinc: 'border-l-zinc-300 dark:border-l-zinc-700',
};

export default function CollapsibleSection({ title, right, defaultOpen = true, accent, children }) {
  const [open, setOpen] = useState(defaultOpen);

  const cardClasses = accent
    ? `rounded-xl border border-l-4 border-zinc-200 bg-zinc-50/60 p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40 ${ACCENT_BORDERS[accent]}`
    : 'rounded-lg border border-zinc-200 p-4 dark:border-zinc-800';

  return (
    <div className={cardClasses}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className={`flex w-full items-center justify-between gap-3 text-left cursor-pointer ${open ? 'mb-3 border-b border-zinc-200 pb-2 dark:border-zinc-800' : ''}`}
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
      </div>
      {open && children}
    </div>
  );
}

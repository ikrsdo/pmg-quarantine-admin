import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import SpamScoreBadge from './SpamScoreBadge';

const REVEAL_WIDTH = 96; // px each action panel opens to
const SWIPE_THRESHOLD = 48; // px of drag before it snaps open

function formatTime(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function QuarantineCard({ mail, selected, selectionMode, onToggleSelect, onDeliver, onBlock }) {
  const navigate = useNavigate();
  const [dragX, setDragX] = useState(0);
  const [open, setOpen] = useState(null); // 'left' | 'right' | null

  const close = () => {
    setDragX(0);
    setOpen(null);
  };

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (selectionMode) return;
      const base = open === 'left' ? REVEAL_WIDTH : open === 'right' ? -REVEAL_WIDTH : 0;
      const next = base + e.deltaX;
      setDragX(Math.max(-REVEAL_WIDTH, Math.min(REVEAL_WIDTH, next)));
    },
    onSwiped: () => {
      if (selectionMode) return;
      if (dragX > SWIPE_THRESHOLD) {
        setDragX(REVEAL_WIDTH);
        setOpen('left');
      } else if (dragX < -SWIPE_THRESHOLD) {
        setDragX(-REVEAL_WIDTH);
        setOpen('right');
      } else {
        close();
      }
    },
    trackMouse: true,
  });

  const from = mail.sender || mail.from;

  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      {/* Block panel - revealed on the left when the card is dragged right.
          Deliver and Block panels both only open the confirm dialog owned
          by the list page - the swipe is the first deliberate step, the
          dialog is the second. */}
      <button
        type="button"
        className="absolute inset-y-0 left-0 flex w-24 items-center justify-center bg-red-600 text-sm font-medium text-white"
        style={{ width: REVEAL_WIDTH }}
        onClick={() => {
          onBlock(mail.id);
          close();
        }}
      >
        Block
      </button>

      {/* Deliver panel - revealed on the right when the card is dragged left */}
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-emerald-600 text-sm font-medium text-white"
        style={{ width: REVEAL_WIDTH }}
        onClick={() => {
          onDeliver(mail.id);
          close();
        }}
      >
        Deliver
      </button>

      <div
        {...handlers}
        onClick={() => {
          if (open || dragX !== 0) {
            close();
            return;
          }
          if (selectionMode) {
            onToggleSelect(mail.id);
            return;
          }
          navigate(`/quarantine/${encodeURIComponent(mail.id)}`);
        }}
        className="relative flex items-center gap-3 bg-white px-4 py-3 dark:bg-zinc-950"
        style={{
          transform: `translateX(${dragX}px)`,
          transition: 'transform 150ms ease-out',
        }}
      >
        {selectionMode && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(mail.id)}
            onClick={(e) => e.stopPropagation()}
            className="size-4 shrink-0 accent-blue-600"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-mono text-xs text-zinc-500 dark:text-zinc-500">{from}</p>
            <SpamScoreBadge score={mail.spamlevel} />
          </div>
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {mail.subject || '(no subject)'}
          </p>
          {mail.receiver && (
            <p className="truncate font-mono text-xs text-zinc-500 dark:text-zinc-500">→ {mail.receiver}</p>
          )}
          <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
            <span>{formatTime(mail.time)}</span>
            <span>·</span>
            <span>{formatBytes(mail.bytes)}</span>
            {mail.seen === false && (
              <span className="ml-auto inline-block size-1.5 rounded-full bg-blue-500" title="Unread" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

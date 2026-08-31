// Status codes per PMG's own $statmap (src/PMG/API2/MailTracker.pm) -
// see CLAUDE.md > "PMG API Notes".
const STATUS_MAP = {
  2: { label: 'Delivered', style: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' },
  4: { label: 'Deferred', style: 'bg-amber-500/10 text-amber-400 ring-amber-500/20' },
  5: { label: 'Bounced', style: 'bg-red-500/10 text-red-400 ring-red-500/20' },
  N: { label: 'Rejected', style: 'bg-red-500/10 text-red-400 ring-red-500/20' },
  G: { label: 'Greylisted', style: 'bg-amber-500/10 text-amber-400 ring-amber-500/20' },
  A: { label: 'Accepted', style: 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20' },
  B: { label: 'Blocked', style: 'bg-red-500/10 text-red-400 ring-red-500/20' },
  Q: { label: 'Quarantined', style: 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20' },
};

export function statusLabel(status) {
  if (!status) return '';
  return STATUS_MAP[status]?.label || status;
}

export default function TrackingStatusBadge({ status }) {
  const entry = STATUS_MAP[status] || {
    label: status || '—',
    style: 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${entry.style}`}
    >
      {entry.label}
    </span>
  );
}

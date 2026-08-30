import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, ChevronsUpDown, Send, Ban } from 'lucide-react';
import SpamScoreBadge from './SpamScoreBadge';

function formatTime(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatKB(bytes) {
  if (!bytes) return '—';
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function SortableHeader({ label, sortKey, activeKey, dir, onSort, className = '' }) {
  const isActive = sortKey === activeKey;
  const Icon = isActive ? (dir === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown;
  return (
    <th className={`px-3 py-2 ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 hover:text-zinc-950 dark:hover:text-white ${
          isActive ? 'text-zinc-950 dark:text-white' : ''
        }`}
      >
        {label}
        <Icon className="size-3.5" />
      </button>
    </th>
  );
}

export default function QuarantineTable({
  mails,
  selectedIds,
  selectionMode,
  onToggleSelect,
  onToggleSelectAll,
  onDeliverRequest,
  onBlockRequest,
  sortKey,
  sortDir,
  onSort,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const allSelected = mails.length > 0 && mails.every((m) => selectedIds.has(m.id));

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900">
          <tr className="border-b-2 border-zinc-300 text-left text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
            {selectionMode && (
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="size-4 accent-blue-600"
                />
              </th>
            )}
            <SortableHeader label="From" sortKey="sender" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortableHeader label="Subject" sortKey="subject" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortableHeader label="Recipient" sortKey="receiver" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortableHeader label="Date" sortKey="time" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortableHeader label="Score" sortKey="spamlevel" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <SortableHeader label="Size" sortKey="bytes" activeKey={sortKey} dir={sortDir} onSort={onSort} />
            <th className="px-3 py-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {mails.map((mail) => (
            <tr
              key={mail.id}
              onClick={() =>
                navigate(`/quarantine/${encodeURIComponent(mail.id)}`, {
                  state: { backgroundLocation: location },
                })
              }
              className="cursor-pointer border-b border-zinc-100 odd:bg-white even:bg-zinc-50 last:border-0 hover:bg-blue-50 dark:border-zinc-900 dark:odd:bg-zinc-950 dark:even:bg-zinc-900/40 dark:hover:bg-zinc-800"
            >
              {selectionMode && (
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(mail.id)}
                    onChange={() => onToggleSelect(mail.id)}
                    className="size-4 accent-blue-600"
                  />
                </td>
              )}
              <td className="max-w-[200px] truncate px-3 py-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                {mail.sender || mail.from}
              </td>
              <td className="max-w-[280px] truncate px-3 py-2 text-zinc-900 dark:text-zinc-100">
                {mail.subject || '(no subject)'}
              </td>
              <td className="max-w-[200px] truncate px-3 py-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                {mail.receiver}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-500 dark:text-zinc-500">
                {formatTime(mail.time)}
              </td>
              <td className="px-3 py-2">
                <SpamScoreBadge score={mail.spamlevel} />
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-zinc-500 dark:text-zinc-500">
                {formatKB(mail.bytes)}
              </td>
              <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="inline-flex gap-1">
                  <button
                    type="button"
                    onClick={() => onDeliverRequest(mail.id)}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                  >
                    <Send className="size-3.5" />
                    Deliver
                  </button>
                  <button
                    type="button"
                    onClick={() => onBlockRequest(mail.id)}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-500/10 dark:text-red-400"
                  >
                    <Ban className="size-3.5" />
                    Block
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

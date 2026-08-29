import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { fetchTrackingList } from '../api/tracking';
import { useAuth } from '../hooks/useAuth';
import AppShell from '../components/AppShell';
import TrackingStatusBadge from '../components/TrackingStatusBadge';
import TrackingFilterSheet from '../components/TrackingFilterSheet';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';

function SortableHeader({ label, sortKey, activeKey, dir, onSort }) {
  const isActive = sortKey === activeKey;
  const Icon = isActive ? (dir === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown;
  return (
    <th className="py-2 pr-3">
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

function toUnixSeconds(datetimeLocal) {
  if (!datetimeLocal) return undefined;
  return Math.floor(new Date(datetimeLocal).getTime() / 1000);
}

function formatTime(unixSeconds) {
  if (!unixSeconds) return '';
  return new Date(unixSeconds * 1000).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatKB(bytes) {
  if (!bytes) return '—';
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function toDatetimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultFilters() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  return {
    from: '',
    target: '',
    xfilter: '',
    ndr: false,
    greylist: false,
    starttimeLocal: toDatetimeLocal(oneHourAgo),
    endtimeLocal: toDatetimeLocal(midnight),
  };
}

export default function TrackingListPage() {
  const { handleUnauthorized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortKey, setSortKey] = useState('time');
  const [sortDir, setSortDir] = useState('desc');

  const queryParams = useMemo(
    () => ({
      from: appliedFilters.from || undefined,
      target: appliedFilters.target || undefined,
      xfilter: appliedFilters.xfilter || undefined,
      ndr: appliedFilters.ndr || undefined,
      greylist: appliedFilters.greylist || undefined,
      starttime: toUnixSeconds(appliedFilters.starttimeLocal),
      endtime: toUnixSeconds(appliedFilters.endtimeLocal),
    }),
    [appliedFilters],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tracking', queryParams],
    queryFn: () => fetchTrackingList(queryParams),
  });

  if (isError && handleUnauthorized(error)) {
    return null;
  }

  const mails = data || [];

  const filtered = useMemo(() => {
    let result = searchTerm
      ? mails.filter((m) => {
          const haystack = `${m.from || ''} ${m.to || ''}`.toLowerCase();
          return haystack.includes(searchTerm.toLowerCase());
        })
      : mails;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...result].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [mails, searchTerm, sortKey, sortDir]);

  function toggleSort(key) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sender or recipient…"
              className="w-full rounded-md border border-zinc-300 bg-transparent py-2 pl-9 pr-3 text-sm text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
            />
          </div>
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <SlidersHorizontal className="size-4" />
            Filter
          </button>
        </div>

        <main className="flex-1 overflow-auto px-4 pb-4">
          {isLoading && <SkeletonList />}

          {!isLoading && filtered.length === 0 && (
            <EmptyState
              title="No entries found"
              description="No mail tracking entry matches your filters."
            />
          )}

          {!isLoading && filtered.length > 0 && (
            <>
              <div className="hidden lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900">
                    <tr className="border-b-2 border-zinc-300 text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                      <SortableHeader label="From" sortKey="from" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                      <SortableHeader label="Recipient" sortKey="to" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                      <SortableHeader label="Date" sortKey="time" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                      <SortableHeader label="Relay" sortKey="relay" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                      <SortableHeader label="Size" sortKey="size" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                      <th className="py-2 pr-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m) => (
                      <tr
                        key={m.id}
                        onClick={() =>
                          navigate(`/tracking/${encodeURIComponent(m.id)}`, {
                            state: { backgroundLocation: location },
                          })
                        }
                        className="cursor-pointer border-b border-zinc-100 odd:bg-white even:bg-zinc-50 hover:bg-blue-50 dark:border-zinc-900 dark:odd:bg-zinc-950 dark:even:bg-zinc-900/40 dark:hover:bg-zinc-800"
                      >
                        <td className="max-w-[16rem] truncate py-2 pr-3 font-mono text-xs text-zinc-900 dark:text-zinc-100">
                          {m.from}
                        </td>
                        <td className="max-w-[16rem] truncate py-2 pr-3 font-mono text-xs text-zinc-900 dark:text-zinc-100">
                          {m.to}
                        </td>
                        <td className="whitespace-nowrap py-2 pr-3 text-xs text-zinc-500 dark:text-zinc-500">
                          {formatTime(m.time)}
                        </td>
                        <td className="max-w-[10rem] truncate py-2 pr-3 text-xs text-zinc-500 dark:text-zinc-500">
                          {m.relay || '—'}
                        </td>
                        <td className="whitespace-nowrap py-2 pr-3 text-xs text-zinc-500 dark:text-zinc-500">
                          {formatKB(m.size)}
                        </td>
                        <td className="py-2 pr-3">
                          <TrackingStatusBadge status={m.rstatus || m.dstatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-2 py-3 lg:hidden">
                {filtered.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => navigate(`/tracking/${encodeURIComponent(m.id)}`)}
                    className="flex flex-col gap-1.5 rounded-lg border border-zinc-200 p-3 text-left dark:border-zinc-800"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-900 dark:text-zinc-100">
                        {m.from}
                      </p>
                      <TrackingStatusBadge status={m.rstatus || m.dstatus} />
                    </div>
                    <p className="truncate font-mono text-xs text-zinc-500 dark:text-zinc-500">→ {m.to}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">{formatTime(m.time)}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      <TrackingFilterSheet
        open={filterOpen}
        filters={filters}
        onChange={setFilters}
        onClose={() => setFilterOpen(false)}
        onApply={() => {
          setAppliedFilters(filters);
          setFilterOpen(false);
        }}
      />
    </AppShell>
  );
}

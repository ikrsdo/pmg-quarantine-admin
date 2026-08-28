import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchTrackingList } from '../api/tracking';
import { useAuth } from '../hooks/useAuth';
import AppShell from '../components/AppShell';
import TrackingStatusBadge from '../components/TrackingStatusBadge';
import TrackingFilterSheet from '../components/TrackingFilterSheet';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';

function toUnixSeconds(datetimeLocal) {
  if (!datetimeLocal) return undefined;
  return Math.floor(new Date(datetimeLocal).getTime() / 1000);
}

function formatTime(unixSeconds) {
  if (!unixSeconds) return '';
  return new Date(unixSeconds * 1000).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const EMPTY_FILTERS = {
  from: '',
  target: '',
  xfilter: '',
  ndr: false,
  greylist: false,
  starttimeLocal: '',
  endtimeLocal: '',
};

export default function TrackingListPage() {
  const { handleUnauthorized } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

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
  const filtered = searchTerm
    ? mails.filter((m) => {
        const haystack = `${m.from || ''} ${m.to || ''}`.toLowerCase();
        return haystack.includes(searchTerm.toLowerCase());
      })
    : mails;

  return (
    <AppShell>
      <div className="flex items-center gap-2 px-4 py-3">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Gönderen veya alıcıda ara…"
          className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
        />
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          Filtrele
        </button>
      </div>

      <main className="px-4 pb-8">
        {isLoading && <SkeletonList />}

        {!isLoading && filtered.length === 0 && (
          <EmptyState
            title="Kayıt bulunamadı"
            description="Filtrelerinize uyan bir mail izleme kaydı yok."
          />
        )}

        {!isLoading && filtered.length > 0 && (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
                    <th className="py-2 pr-3 font-medium">Gönderen</th>
                    <th className="py-2 pr-3 font-medium">Alıcı</th>
                    <th className="py-2 pr-3 font-medium">Tarih</th>
                    <th className="py-2 pr-3 font-medium">Relay</th>
                    <th className="py-2 pr-3 font-medium">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => navigate(`/tracking/${encodeURIComponent(m.id)}`)}
                      className="cursor-pointer border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/50"
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
                      <td className="py-2 pr-3">
                        <TrackingStatusBadge status={m.rstatus || m.dstatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2 lg:hidden">
              {filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => navigate(`/tracking/${encodeURIComponent(m.id)}`)}
                  className="flex flex-col gap-1.5 rounded-lg border border-zinc-200 p-3 text-left dark:border-zinc-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-mono text-xs text-zinc-900 dark:text-zinc-100">{m.from}</p>
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

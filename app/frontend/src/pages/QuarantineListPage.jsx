import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, SlidersHorizontal, CheckSquare } from 'lucide-react';
import { fetchQuarantineList, performQuarantineAction } from '../api/quarantine';
import { useAuth } from '../hooks/useAuth';
import QuarantineCard from '../components/QuarantineCard';
import QuarantineTable from '../components/QuarantineTable';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';
import FilterSheet from '../components/FilterSheet';
import SelectionBar from '../components/SelectionBar';
import ConfirmDialog from '../components/ConfirmDialog';
import AppShell from '../components/AppShell';

function toUnixSeconds(datetimeLocal) {
  if (!datetimeLocal) return undefined;
  return Math.floor(new Date(datetimeLocal).getTime() / 1000);
}

function toDatetimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultFilters() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { pmail: '', starttimeLocal: toDatetimeLocal(weekAgo), endtimeLocal: toDatetimeLocal(now) };
}

export default function QuarantineListPage() {
  const { handleUnauthorized } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [blockTarget, setBlockTarget] = useState(null); // single id or 'bulk'
  const [sortKey, setSortKey] = useState('time');
  const [sortDir, setSortDir] = useState('desc');

  const queryParams = useMemo(
    () => ({
      starttime: toUnixSeconds(appliedFilters.starttimeLocal),
      endtime: toUnixSeconds(appliedFilters.endtimeLocal),
    }),
    [appliedFilters],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['quarantine', queryParams],
    queryFn: () => fetchQuarantineList(queryParams),
  });

  const actionMutation = useMutation({
    mutationFn: ({ ids, action }) => performQuarantineAction(ids, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarantine'] });
      setSelectedIds(new Set());
    },
    onError: (err) => handleUnauthorized(err),
  });

  if (isError && handleUnauthorized(error)) {
    return null; // AuthProvider flips `user` to null, App redirects to /login
  }

  const mails = data || [];

  const emailOptions = useMemo(
    () => Array.from(new Set(mails.map((m) => m.receiver).filter(Boolean))).sort(),
    [mails],
  );

  const filtered = useMemo(() => {
    let result = mails;
    if (appliedFilters.pmail) {
      result = result.filter((m) => m.receiver === appliedFilters.pmail);
    }
    if (searchTerm) {
      result = result.filter((m) => {
        const haystack = `${m.subject || ''} ${m.sender || m.from || ''}`.toLowerCase();
        return haystack.includes(searchTerm.toLowerCase());
      });
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...result].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [mails, appliedFilters.pmail, searchTerm, sortKey, sortDir]);

  function toggleSort(key) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map((m) => m.id)),
    );
  }

  function deliver(idOrIds) {
    actionMutation.mutate({ ids: idOrIds, action: 'deliver' });
  }

  function confirmBlock() {
    const ids = blockTarget === 'bulk' ? Array.from(selectedIds) : blockTarget;
    actionMutation.mutate({ ids, action: 'blocklist' });
    setBlockTarget(null);
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
              placeholder="Search subject or sender…"
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
          <button
            type="button"
            onClick={() => {
              setSelectionMode((v) => !v);
              setSelectedIds(new Set());
            }}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium ${
              selectionMode
                ? 'bg-blue-600 text-white'
                : 'border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            <CheckSquare className="size-4" />
            Select
          </button>
        </div>

        <main className="flex-1 overflow-auto px-4 pb-4">
          {isLoading && <SkeletonList />}

          {!isLoading && filtered.length === 0 && (
            <EmptyState
              title="Quarantine is empty"
              description="No message matches your filters."
            />
          )}

          {!isLoading && filtered.length > 0 && (
            <>
              <div className="hidden lg:block">
                <QuarantineTable
                  mails={filtered}
                  selectedIds={selectedIds}
                  selectionMode={selectionMode}
                  onToggleSelect={toggleSelect}
                  onToggleSelectAll={toggleSelectAll}
                  onDeliver={deliver}
                  onBlockRequest={setBlockTarget}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
              </div>

              <div className="flex flex-col gap-2 py-3 lg:hidden">
                {filtered.map((mail) => (
                  <QuarantineCard
                    key={mail.id}
                    mail={mail}
                    selected={selectedIds.has(mail.id)}
                    selectionMode={selectionMode}
                    onToggleSelect={toggleSelect}
                    onDeliver={deliver}
                    onBlock={() => setBlockTarget(mail.id)}
                  />
                ))}
              </div>
            </>
          )}
        </main>

        {selectionMode && selectedIds.size > 0 && (
          <SelectionBar
            count={selectedIds.size}
            onDeliver={() => deliver(Array.from(selectedIds))}
            onBlockRequest={() => setBlockTarget('bulk')}
            onClear={() => setSelectedIds(new Set())}
          />
        )}
      </div>

      <FilterSheet
        open={filterOpen}
        filters={filters}
        onChange={setFilters}
        onClose={() => setFilterOpen(false)}
        onApply={() => {
          setAppliedFilters(filters);
          setFilterOpen(false);
        }}
        availableEmails={emailOptions}
      />

      <ConfirmDialog
        open={blockTarget !== null}
        title={
          blockTarget === 'bulk'
            ? `Block ${selectedIds.size} messages?`
            : 'Block this message?'
        }
        description="The sender will be added to the block list and the message(s) will be deleted. This cannot be undone."
        confirmLabel="Block"
        onConfirm={confirmBlock}
        onCancel={() => setBlockTarget(null)}
      />
    </AppShell>
  );
}

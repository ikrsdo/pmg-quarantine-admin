import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

const EMPTY_FILTERS = { pmail: '', starttimeLocal: '', endtimeLocal: '' };

export default function QuarantineListPage() {
  const { handleUnauthorized } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [blockTarget, setBlockTarget] = useState(null); // single id or 'bulk'

  const queryParams = useMemo(
    () => ({
      pmail: appliedFilters.pmail || undefined,
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
  const filtered = searchTerm
    ? mails.filter((m) => {
        const haystack = `${m.subject || ''} ${m.sender || m.from || ''}`.toLowerCase();
        return haystack.includes(searchTerm.toLowerCase());
      })
    : mails;

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
      <div className="flex items-center gap-2 px-4 py-3">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Konu veya gönderende ara…"
          className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
        />
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          Filtrele
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectionMode((v) => !v);
            setSelectedIds(new Set());
          }}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            selectionMode
              ? 'bg-blue-600 text-white'
              : 'border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900'
          }`}
        >
          Seç
        </button>
      </div>

      <main className="px-4 pb-24">
        {isLoading && <SkeletonList />}

        {!isLoading && filtered.length === 0 && (
          <EmptyState
            title="Karantina boş"
            description="Filtrelerinize uyan bir mesaj bulunamadı."
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
              />
            </div>

            <div className="flex flex-col gap-2 lg:hidden">
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

      <FilterSheet
        open={filterOpen}
        filters={filters}
        onChange={setFilters}
        onClose={() => setFilterOpen(false)}
        onApply={() => {
          setAppliedFilters(filters);
          setFilterOpen(false);
        }}
      />

      <ConfirmDialog
        open={blockTarget !== null}
        title={
          blockTarget === 'bulk'
            ? `${selectedIds.size} mesaj engellensin mi?`
            : 'Bu mesaj engellensin mi?'
        }
        description="Gönderen blocklist'e eklenecek ve mesaj(lar) silinecek. Bu işlem geri alınamaz."
        confirmLabel="Engelle"
        onConfirm={confirmBlock}
        onCancel={() => setBlockTarget(null)}
      />
    </AppShell>
  );
}

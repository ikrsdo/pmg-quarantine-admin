import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, CheckSquare, RefreshCw, Download } from 'lucide-react';
import { fetchQuarantineDetail, fetchQuarantineList, performQuarantineAction } from '../api/quarantine';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { quarantineActionToast } from '../utils/quarantineActionToast';
import { downloadCsv } from '../utils/csvExport';
import QuarantineCard from '../components/QuarantineCard';
import QuarantineTable from '../components/QuarantineTable';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';
import FilterSheet from '../components/FilterSheet';
import SelectionBar from '../components/SelectionBar';
import ConfirmDialog from '../components/ConfirmDialog';
import AppShell from '../components/AppShell';
import { DEFAULT_QUARANTINE_TYPE, quarantineTypeLabel } from '../constants/quarantineTypes';

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
  // endtimeLocal is frozen into component state at mount (see
  // QuarantineListPage's useState(defaultFilters)) and reused as-is by the
  // Refresh button's refetch(), so pinning it to "now" would hide any mail
  // that arrived after mount. Pin it to the next midnight instead (same
  // approach as TrackingListPage's defaultFilters) so it stays a wide-open
  // upper bound for the rest of the day and Refresh actually picks up new
  // mail.
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  return { pmail: '', starttimeLocal: toDatetimeLocal(weekAgo), endtimeLocal: toDatetimeLocal(midnight) };
}

function formatCsvTime(unixSeconds) {
  if (!unixSeconds) return '';
  return new Date(unixSeconds * 1000).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatCsvKB(bytes) {
  if (!bytes) return '0 KB';
  return `${(bytes / 1024).toFixed(1)} KB`;
}

// Bounded-concurrency map: envelope_sender only exists on the per-message
// detail response (see CLAUDE.md "PMG API Notes"), not on list data, so
// exporting it means one fetchQuarantineDetail() call per row. Capped at 5
// concurrent requests so a large filtered export doesn't fire hundreds of
// requests at once.
async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export default function QuarantineListPage() {
  const { handleUnauthorized } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || DEFAULT_QUARANTINE_TYPE;

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);

  // Coming from the "Search in Quarantine" cross-link button on a Tracking
  // Center entry (TrackingDetailPage.jsx) - apply its preset filters
  // immediately instead of requiring the admin to open the Filter modal.
  useEffect(() => {
    const preset = location.state?.presetFilters;
    if (!preset) return;
    const merged = { ...defaultFilters(), ...preset };
    setFilters(merged);
    setAppliedFilters(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [pendingAction, setPendingAction] = useState(null); // { type: 'deliver' | 'blocklist', target: id or 'bulk' }
  const [sortKey, setSortKey] = useState('time');
  const [sortDir, setSortDir] = useState('desc');
  const [exporting, setExporting] = useState(false);

  // Switching quarantine type (Spam/Virus/Attachment) via the nav should
  // drop any selection/search state left over from the previous type's list.
  useEffect(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
    setSearchTerm('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const queryParams = useMemo(
    () => ({
      type,
      starttime: toUnixSeconds(appliedFilters.starttimeLocal),
      endtime: toUnixSeconds(appliedFilters.endtimeLocal),
    }),
    [type, appliedFilters],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['quarantine', queryParams],
    queryFn: () => fetchQuarantineList(queryParams),
    // Don't auto-refetch every time this page remounts (e.g. navigating
    // back from a message's detail screen): the cache is already kept
    // correct by explicit updates (actionMutation invalidates it,
    // toggleSeenMutation/seenMutation patch it directly), and an implicit
    // refetch here can race a just-fired mark-seen/mark-unseen request -
    // if the refetch's response reflects the pre-action state, it
    // silently reverts the toggle right after it visibly applied. The
    // Refresh button (refetch()) still works for pulling in new mail.
    refetchOnMount: false,
    // Auto-refresh every 60s so new mail shows up without a manual tap on
    // Refresh - paused while the user has a bulk selection or a
    // confirmation dialog open, since a list reshuffling underneath would
    // silently invalidate the selection or the item being confirmed on.
    refetchInterval: selectionMode || pendingAction ? false : 60000,
  });

  const actionMutation = useMutation({
    mutationFn: ({ ids, action }) => performQuarantineAction(ids, action),
    onSuccess: (_data, { ids, action }) => {
      queryClient.invalidateQueries({ queryKey: ['quarantine'] });
      setSelectedIds(new Set());
      const count = Array.isArray(ids) ? ids.length : 1;
      const { tone, message } = quarantineActionToast(action, count);
      showToast(message, tone);
    },
    onError: (err) => {
      if (!handleUnauthorized(err)) showToast('Action failed', 'danger');
    },
  });

  // Separate from actionMutation: mark-seen/mark-unseen is a lightweight,
  // no-confirmation toggle a user can fire from anywhere in the list, and
  // shouldn't drop an in-progress bulk selection the way actionMutation's
  // onSuccess does.
  const toggleSeenMutation = useMutation({
    mutationFn: ({ id, action }) => performQuarantineAction(id, action),
    onSuccess: (_data, { id, action }) => {
      // Apply the known-correct result locally instead of invalidating and
      // refetching: this POST is fire-and-forget from the user's tap, so a
      // refetch right after can race the write actually committing
      // server-side and land a response that still shows the old value,
      // silently reverting this update (see CLAUDE.md's PMG API Notes).
      const seen = action === 'mark-seen';
      queryClient.setQueriesData(
        { queryKey: ['quarantine'], predicate: (query) => query.queryKey[1] !== 'detail' },
        (old) => (Array.isArray(old) ? old.map((m) => (m.id === id ? { ...m, seen } : m)) : old),
      );
      queryClient.setQueryData(['quarantine', 'detail', id], (old) => (old ? { ...old, seen } : old));
      const { tone, message } = quarantineActionToast(action);
      showToast(message, tone);
    },
    onError: (err) => {
      if (!handleUnauthorized(err)) showToast('Action failed', 'danger');
    },
  });

  function toggleSeen(id, currentlySeen) {
    toggleSeenMutation.mutate({ id, action: currentlySeen ? 'mark-unseen' : 'mark-seen' });
  }

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

  function confirmPendingAction() {
    const { type, target } = pendingAction;
    const ids = target === 'bulk' ? Array.from(selectedIds) : target;
    actionMutation.mutate({ ids, action: type });
    setPendingAction(null);
  }

  async function handleExportCsv() {
    setExporting(true);
    try {
      const envelopeSenders = await mapWithConcurrency(filtered, 5, async (mail) => {
        try {
          const detail = await fetchQuarantineDetail(mail.id);
          return detail?.envelope_sender || '';
        } catch {
          return '';
        }
      });
      const rows = filtered.map((mail, i) => ({
        ...mail,
        from: mail.sender || mail.from,
        envelopeSender: envelopeSenders[i],
        timeDisplay: formatCsvTime(mail.time),
        sizeDisplay: formatCsvKB(mail.bytes),
      }));
      const typeColumn =
        type === 'spam'
          ? { key: 'spamlevel', label: 'Spam Score' }
          : type === 'virus'
            ? { key: 'virusname', label: 'Virus Name' }
            : null;

      downloadCsv(`quarantine-${type}-${new Date().toISOString().slice(0, 10)}.csv`, rows, [
        { key: 'from', label: 'From' },
        { key: 'envelopeSender', label: 'Envelope Sender' },
        { key: 'receiver', label: 'Recipient' },
        { key: 'subject', label: 'Subject' },
        { key: 'timeDisplay', label: 'Time' },
        { key: 'sizeDisplay', label: 'Size' },
        ...(typeColumn ? [typeColumn] : []),
        { key: 'id', label: 'ID' },
      ]);
    } catch {
      showToast('CSV export failed', 'danger');
    } finally {
      setExporting(false);
    }
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-200 px-4 pt-3 dark:border-zinc-800">
          <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {quarantineTypeLabel(type)}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Subject or Sender…"
              className="w-full rounded-md border border-zinc-300 bg-transparent py-2 pl-9 pr-3 text-sm text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
            />
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh"
            title="Refresh"
            className="inline-flex shrink-0 items-center justify-center rounded-md border border-zinc-300 p-2 text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <SlidersHorizontal className="size-4" />
            <span className="hidden lg:inline">Filter</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filtered.length === 0 || exporting}
            title="Export CSV"
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <Download className="size-4" />
            <span className="hidden lg:inline">{exporting ? 'Exporting…' : 'CSV'}</span>
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
            <span className="hidden lg:inline">Select</span>
          </button>
        </div>

        <main className="flex-1 overflow-auto px-4 pb-4">
          {isLoading && <SkeletonList />}

          {!isLoading && filtered.length === 0 && (
            <EmptyState
              title={`${quarantineTypeLabel(type)} is empty`}
              description="No message matches your filters."
            />
          )}

          {!isLoading && filtered.length > 0 && (
            <>
              <div className="hidden lg:block">
                <QuarantineTable
                  mails={filtered}
                  type={type}
                  selectedIds={selectedIds}
                  selectionMode={selectionMode}
                  onToggleSelect={toggleSelect}
                  onToggleSelectAll={toggleSelectAll}
                  onDeliverRequest={(id) => setPendingAction({ type: 'deliver', target: id })}
                  onBlockRequest={(id) => setPendingAction({ type: 'blocklist', target: id })}
                  onToggleSeenRequest={toggleSeen}
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
                    type={type}
                    selected={selectedIds.has(mail.id)}
                    selectionMode={selectionMode}
                    onToggleSelect={toggleSelect}
                    onDeliver={() => setPendingAction({ type: 'deliver', target: mail.id })}
                    onBlock={() => setPendingAction({ type: 'blocklist', target: mail.id })}
                    onToggleSeen={toggleSeen}
                  />
                ))}
              </div>
            </>
          )}
        </main>

        {selectionMode && selectedIds.size > 0 && (
          <SelectionBar
            count={selectedIds.size}
            onDeliverRequest={() => setPendingAction({ type: 'deliver', target: 'bulk' })}
            onBlockRequest={() => setPendingAction({ type: 'blocklist', target: 'bulk' })}
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
        open={pendingAction !== null}
        title={
          pendingAction?.type === 'deliver'
            ? pendingAction.target === 'bulk'
              ? `Deliver ${selectedIds.size} messages?`
              : 'Deliver this message?'
            : pendingAction?.target === 'bulk'
              ? `Block ${selectedIds.size} messages?`
              : 'Block this message?'
        }
        description={
          pendingAction?.type === 'deliver'
            ? 'The message(s) will be delivered to the recipient inbox.'
            : 'The sender will be added to the block list and the message(s) will be deleted. This cannot be undone.'
        }
        confirmLabel={pendingAction?.type === 'deliver' ? 'Deliver' : 'Block'}
        tone={pendingAction?.type === 'deliver' ? 'primary' : 'danger'}
        onConfirm={confirmPendingAction}
        onCancel={() => setPendingAction(null)}
      />
    </AppShell>
  );
}

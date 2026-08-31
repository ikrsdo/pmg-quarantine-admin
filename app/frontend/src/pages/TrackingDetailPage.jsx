import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, X } from 'lucide-react';
import { fetchTrackingDetail } from '../api/tracking';
import { useAuth } from '../hooks/useAuth';
import TrackingStatusBadge from '../components/TrackingStatusBadge';
import MessageEventsTimeline from '../components/MessageEventsTimeline';
import CollapsibleSection from '../components/CollapsibleSection';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

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

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function toDatetimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// See the matching helper in QuarantineDetailPage.jsx - same best-effort
// approach in the other direction (no shared id between the two APIs).
function quarantineSearchFilters(entry) {
  const center = new Date(entry.time * 1000);
  const start = new Date(center.getTime() - 15 * 60 * 1000);
  const end = new Date(center.getTime() + 15 * 60 * 1000);
  return {
    pmail: entry.to || '',
    starttimeLocal: toDatetimeLocal(start),
    endtimeLocal: toDatetimeLocal(end),
  };
}

function MetaRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-zinc-500 dark:text-zinc-500">{label}</p>
      <p className="break-all font-mono text-sm text-zinc-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}

export default function TrackingDetailPage({ overlay = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleUnauthorized } = useAuth();
  const [drawerVisible, setDrawerVisible] = useState(!overlay);

  const { data: entry, isLoading, isError, error } = useQuery({
    queryKey: ['tracking', 'detail', id],
    queryFn: () => fetchTrackingDetail(id),
  });

  function close() {
    if (overlay) {
      navigate(-1);
    } else {
      navigate('/tracking');
    }
  }

  // Drawer slides in from off-screen on mount, and slides back out before
  // the route change unmounts it, instead of just popping in/out.
  useEffect(() => {
    if (!overlay) return;
    const raf = requestAnimationFrame(() => setDrawerVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [overlay]);

  useEffect(() => {
    if (!overlay) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay]);

  if (isError && handleUnauthorized(error)) {
    return null;
  }

  const body = (
    <>
      {isLoading && (
        <div className="flex flex-col gap-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!isLoading && !entry && (
        <EmptyState title="Entry not found" description="This mail tracking entry no longer exists." />
      )}

      {entry && (
        <div className={`flex flex-col gap-6 ${overlay ? '' : 'lg:flex-row lg:items-start'}`}>
          <div className={`flex flex-col gap-4 ${overlay ? '' : 'lg:w-96 lg:shrink-0'}`}>
            <CollapsibleSection
              title="Status"
              right={
                <>
                  {entry.dstatus && <TrackingStatusBadge status={entry.dstatus} />}
                  {entry.rstatus && entry.rstatus !== entry.dstatus && (
                    <TrackingStatusBadge status={entry.rstatus} />
                  )}
                </>
              }
            >
              <div className="flex flex-col gap-3">
                <MetaRow label="From" value={entry.from} />
                <MetaRow label="Recipient" value={entry.to} />
                <MetaRow label="Date" value={formatTime(entry.time)} />
                <MetaRow label="Queue ID (qid)" value={entry.qid} />
                <MetaRow label="Message-ID" value={entry.msgid} />
                <MetaRow label="Relay" value={entry.relay} />
                <MetaRow label="Client" value={entry.client} />
                <MetaRow label="Size" value={formatBytes(entry.size)} />
                <button
                  type="button"
                  onClick={() =>
                    navigate('/quarantine', { state: { presetFilters: quarantineSearchFilters(entry) } })
                  }
                  className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
                >
                  <ArrowRightLeft className="size-3.5" />
                  Search in Quarantine
                </button>
              </div>
            </CollapsibleSection>
          </div>

          <div className="min-w-0 flex-1">
            <MessageEventsTimeline logs={entry.logs} />
          </div>
        </div>
      )}
    </>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-40">
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
            drawerVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={close}
        />
        <div
          className={`absolute inset-y-0 right-0 flex w-full max-w-[720px] flex-col bg-white shadow-2xl transition-transform duration-200 ease-out dark:bg-zinc-950 ${
            drawerVisible ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <header className="flex items-start justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Mail Tracking Entry
              </p>
              <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-500">
                {entry?.from}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="shrink-0 rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
            >
              <X className="size-5" />
            </button>
          </header>

          <main className="flex-1 overflow-y-auto p-4">{body}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="pt-safe sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-200 bg-white/95 px-4 pb-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <button
          type="button"
          onClick={close}
          className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Mail Tracking Entry
        </p>
      </header>

      <main className="px-4 pb-8 pt-4">{body}</main>
    </div>
  );
}

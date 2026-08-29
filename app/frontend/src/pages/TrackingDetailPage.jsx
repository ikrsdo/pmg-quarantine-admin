import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchTrackingDetail } from '../api/tracking';
import { useAuth } from '../hooks/useAuth';
import TrackingStatusBadge from '../components/TrackingStatusBadge';
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

function MetaRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-zinc-500 dark:text-zinc-500">{label}</p>
      <p className="break-all font-mono text-sm text-zinc-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}

export default function TrackingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleUnauthorized } = useAuth();

  const { data: entry, isLoading, isError, error } = useQuery({
    queryKey: ['tracking', 'detail', id],
    queryFn: () => fetchTrackingDetail(id),
  });

  if (isError && handleUnauthorized(error)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <button
          type="button"
          onClick={() => navigate('/tracking')}
          className="rounded-md px-2 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          ← Back
        </button>
        <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Mail Tracking Entry
        </p>
      </header>

      <main className="px-4 pb-8 pt-4">
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
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex flex-col gap-4 lg:w-96 lg:shrink-0">
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500">Status</p>
                  <div className="flex items-center gap-1.5">
                    {entry.dstatus && <TrackingStatusBadge status={entry.dstatus} />}
                    {entry.rstatus && entry.rstatus !== entry.dstatus && (
                      <TrackingStatusBadge status={entry.rstatus} />
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <MetaRow label="From" value={entry.from} />
                  <MetaRow label="Recipient" value={entry.to} />
                  <MetaRow label="Date" value={formatTime(entry.time)} />
                  <MetaRow label="Queue ID (qid)" value={entry.qid} />
                  <MetaRow label="Message-ID" value={entry.msgid} />
                  <MetaRow label="Relay" value={entry.relay} />
                  <MetaRow label="Client" value={entry.client} />
                  <MetaRow label="Size" value={formatBytes(entry.size)} />
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-500">
                Syslog Entries
              </p>
              <div className="max-h-[60vh] overflow-auto rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                {entry.logs && entry.logs.length > 0 ? (
                  <pre className="whitespace-pre-wrap break-all font-mono text-xs text-zinc-700 dark:text-zinc-300">
                    {entry.logs.join('\n')}
                  </pre>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">No log entries.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

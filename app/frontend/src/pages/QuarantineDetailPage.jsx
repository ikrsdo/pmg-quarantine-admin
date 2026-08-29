import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, ShieldCheck, Ban } from 'lucide-react';
import { fetchQuarantineDetail, performQuarantineAction } from '../api/quarantine';
import { useAuth } from '../hooks/useAuth';
import SpamScoreBadge from '../components/SpamScoreBadge';
import ConfirmDialog from '../components/ConfirmDialog';
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

function SpamInfoBreakdown({ spaminfo }) {
  if (!spaminfo || spaminfo.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-500">No matching spam tests.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {spaminfo.map((test, i) => (
        <li key={`${test.name}-${i}`} className="flex items-start justify-between gap-3 text-sm">
          <div className="min-w-0">
            <p className="truncate font-mono text-xs text-zinc-700 dark:text-zinc-300">{test.name}</p>
            {test.desc && test.desc !== '-' && (
              <p className="text-xs text-zinc-500 dark:text-zinc-500">{test.desc}</p>
            )}
          </div>
          <span
            className={`shrink-0 font-mono text-xs font-medium ${
              test.score >= 0 ? 'text-red-500' : 'text-emerald-500'
            }`}
          >
            {test.score >= 0 ? '+' : ''}
            {Number(test.score).toFixed(1)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ContentTabs({ mail }) {
  const [tab, setTab] = useState('preview');

  return (
    <div>
      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {[
          { id: 'preview', label: 'Preview' },
          { id: 'headers', label: 'Headers' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm font-medium ${
              tab === t.id
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="max-h-[60vh] overflow-auto rounded-b-lg bg-zinc-50 p-3 dark:bg-zinc-900">
        <pre className="whitespace-pre-wrap break-all font-mono text-xs text-zinc-700 dark:text-zinc-300">
          {tab === 'preview' ? mail.content || '(no content)' : mail.header || '(no headers)'}
        </pre>
      </div>
    </div>
  );
}

export default function QuarantineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleUnauthorized } = useAuth();
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState(null); // 'deliver' | 'blocklist' | null

  const { data: mail, isLoading, isError, error } = useQuery({
    queryKey: ['quarantine', 'detail', id],
    queryFn: () => fetchQuarantineDetail(id),
  });

  const actionMutation = useMutation({
    mutationFn: (action) => performQuarantineAction(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarantine'] });
      navigate('/quarantine');
    },
    onError: (err) => handleUnauthorized(err),
  });

  if (isError && handleUnauthorized(error)) {
    return null;
  }

  function requestAction(action) {
    setPendingAction(action);
  }

  function confirmAction() {
    const action = pendingAction;
    setPendingAction(null);
    actionMutation.mutate(action);
  }

  function whitelist() {
    actionMutation.mutate('whitelist');
  }

  const actionButtons = mail && (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => requestAction('deliver')}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 lg:flex-none"
      >
        <Send className="size-4" />
        Deliver
      </button>
      <button
        type="button"
        onClick={whitelist}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-500/10 dark:text-blue-400 lg:flex-none"
      >
        <ShieldCheck className="size-4" />
        Whitelist
      </button>
      <button
        type="button"
        onClick={() => requestAction('blocklist')}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 lg:flex-none"
      >
        <Ban className="size-4" />
        Block
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <button
          type="button"
          onClick={() => navigate('/quarantine')}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {mail?.subject || 'Message details'}
        </p>
        <div className="ml-auto hidden lg:block">{actionButtons}</div>
      </header>

      <main className="px-4 pb-28 pt-4 lg:pb-6">
        {isLoading && (
          <div className="flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {!isLoading && !mail && (
          <EmptyState title="Message not found" description="This message is no longer in quarantine." />
        )}

        {mail && (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex flex-col gap-4 lg:w-80 lg:shrink-0">
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500">Spam Score</p>
                  <SpamScoreBadge score={mail.spamlevel} />
                </div>
                <div className="flex flex-col gap-3">
                  <MetaRow label="From" value={mail.sender || mail.from} />
                  <MetaRow label="Envelope Sender" value={mail.envelope_sender} />
                  <MetaRow label="Recipient" value={mail.receiver} />
                  <MetaRow label="Date" value={formatTime(mail.time)} />
                  <MetaRow label="Size" value={formatBytes(mail.bytes)} />
                </div>
              </div>

              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-500">
                  Spam Test Details
                </p>
                <SpamInfoBreakdown spaminfo={mail.spaminfo} />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <ContentTabs mail={mail} />
            </div>
          </div>
        )}
      </main>

      {mail && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
          {actionButtons}
        </div>
      )}

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction === 'deliver' ? 'Deliver this message?' : 'Block this message?'}
        description={
          pendingAction === 'deliver'
            ? 'The message will be delivered to the recipient’s inbox.'
            : 'The sender will be added to the block list and the message will be deleted. This cannot be undone.'
        }
        confirmLabel={pendingAction === 'deliver' ? 'Deliver' : 'Block'}
        tone={pendingAction === 'deliver' ? 'primary' : 'danger'}
        onConfirm={confirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}

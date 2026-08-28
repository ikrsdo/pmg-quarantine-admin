import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchQuarantineDetail, performQuarantineAction } from '../api/quarantine';
import { useAuth } from '../hooks/useAuth';
import SpamScoreBadge from '../components/SpamScoreBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

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
    return <p className="text-sm text-zinc-500 dark:text-zinc-500">Eşleşen spam testi yok.</p>;
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
          { id: 'preview', label: 'Önizleme' },
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
          {tab === 'preview' ? mail.content || '(içerik yok)' : mail.header || '(header yok)'}
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
        className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 lg:flex-none"
      >
        Deliver
      </button>
      <button
        type="button"
        onClick={whitelist}
        className="flex-1 rounded-md border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-500/10 dark:text-blue-400 lg:flex-none"
      >
        Whitelist
      </button>
      <button
        type="button"
        onClick={() => requestAction('blocklist')}
        className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 lg:flex-none"
      >
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
          className="rounded-md px-2 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          ← Geri
        </button>
        <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {mail?.subject || 'Mesaj Detayı'}
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
          <EmptyState title="Mesaj bulunamadı" description="Bu mesaj artık karantinada değil." />
        )}

        {mail && (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex flex-col gap-4 lg:w-80 lg:shrink-0">
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500">Spam Skoru</p>
                  <SpamScoreBadge score={mail.spamlevel} />
                </div>
                <div className="flex flex-col gap-3">
                  <MetaRow label="Gönderen" value={mail.sender || mail.from} />
                  <MetaRow label="Zarf Gönderen" value={mail.envelope_sender} />
                  <MetaRow label="Alıcı" value={mail.receiver} />
                  <MetaRow label="Tarih" value={formatTime(mail.time)} />
                  <MetaRow label="Boyut" value={formatBytes(mail.bytes)} />
                </div>
              </div>

              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-500">
                  Spam Testi Detayları
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
        title={pendingAction === 'deliver' ? 'Bu mesaj teslim edilsin mi?' : 'Bu mesaj engellensin mi?'}
        description={
          pendingAction === 'deliver'
            ? 'Mesaj alıcının gelen kutusuna teslim edilecek.'
            : "Gönderen blocklist'e eklenecek ve mesaj silinecek. Bu işlem geri alınamaz."
        }
        confirmLabel={pendingAction === 'deliver' ? 'Teslim Et' : 'Engelle'}
        tone={pendingAction === 'deliver' ? 'primary' : 'danger'}
        onConfirm={confirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}

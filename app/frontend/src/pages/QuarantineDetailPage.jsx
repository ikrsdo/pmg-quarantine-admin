import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, Send, ShieldCheck, Ban, X } from 'lucide-react';
import {
  fetchQuarantineDetail,
  fetchQuarantinePreviewHtml,
  performQuarantineAction,
} from '../api/quarantine';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { quarantineActionToast } from '../utils/quarantineActionToast';
import SpamScoreBadge from '../components/SpamScoreBadge';
import CollapsibleSection from '../components/CollapsibleSection';
import ConfirmDialog from '../components/ConfirmDialog';
import CopyButton from '../components/CopyButton';
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

// PMG's quarantine and tracking APIs don't share a common id - this jumps
// to Tracking Center pre-filtered by this mail's recipient and a time
// window around when it was quarantined, as a best-effort way to find the
// matching delivery-trail entry rather than a guaranteed exact link.
function trackingSearchFilters(mail) {
  const center = new Date(mail.time * 1000);
  const start = new Date(center.getTime() - 15 * 60 * 1000);
  const end = new Date(center.getTime() + 15 * 60 * 1000);
  return {
    from: mail.envelope_sender || mail.sender || mail.from || '',
    target: mail.receiver || '',
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

function formatSpamInfo(spaminfo) {
  return spaminfo
    .map((test) => {
      const score = Number(test.score) >= 0 ? `+${Number(test.score).toFixed(1)}` : Number(test.score).toFixed(1);
      return test.desc && test.desc !== '-' ? `${test.name} ${score} ${test.desc}` : `${test.name} ${score}`;
    })
    .join('\n');
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

function ContentTabs({ id, mail }) {
  const [tab, setTab] = useState('preview');

  const {
    data: previewHtml,
    isLoading: previewLoading,
    isError: previewError,
  } = useQuery({
    queryKey: ['quarantine', 'preview', id],
    queryFn: () => fetchQuarantinePreviewHtml(id),
    enabled: tab === 'preview',
  });

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
      {tab === 'preview' ? (
        <div className="h-[60vh] overflow-hidden rounded-b-lg border border-t-0 border-zinc-200 dark:border-zinc-800">
          {previewLoading && (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-500">
              Loading preview...
            </div>
          )}
          {previewError && (
            <div className="flex h-full items-center justify-center text-sm text-red-500">
              Failed to load preview.
            </div>
          )}
          {!previewLoading && !previewError && (
            <iframe
              title="Message preview"
              srcDoc={previewHtml || '<p>(no content)</p>'}
              sandbox=""
              className="h-full w-full bg-white"
            />
          )}
        </div>
      ) : (
        <div className="rounded-b-lg border border-t-0 border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-end border-b border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
            <CopyButton text={mail.header || ''} label="Copy" />
          </div>
          <div className="max-h-[60vh] overflow-auto bg-zinc-50 p-3 dark:bg-zinc-900">
            <pre className="whitespace-pre-wrap break-all font-mono text-xs text-zinc-700 dark:text-zinc-300">
              {mail.header || '(no headers)'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuarantineDetailPage({ overlay = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleUnauthorized } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState(null); // 'deliver' | 'blocklist' | null
  const [drawerVisible, setDrawerVisible] = useState(!overlay);

  const { data: mail, isLoading, isError, error } = useQuery({
    queryKey: ['quarantine', 'detail', id],
    queryFn: () => fetchQuarantineDetail(id),
  });

  const actionMutation = useMutation({
    mutationFn: (action) => performQuarantineAction(id, action),
    onSuccess: (_data, action) => {
      queryClient.invalidateQueries({ queryKey: ['quarantine'] });
      const { tone, message } = quarantineActionToast(action);
      showToast(message, tone);
      close();
    },
    onError: (err) => {
      if (!handleUnauthorized(err)) showToast('Action failed', 'danger');
    },
  });

  function close() {
    if (overlay) {
      navigate(-1);
    } else {
      navigate('/quarantine');
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
      // The confirmation dialog has its own Escape handler that should take
      // priority - don't also close the whole drawer underneath it.
      if (e.key === 'Escape' && pendingAction === null) close();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay, pendingAction]);

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

  function ActionButtons({ wide = false }) {
    if (!mail) return null;
    const widthClass = wide ? 'flex-1' : 'flex-1 lg:flex-none';
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => requestAction('deliver')}
          className={`flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 ${widthClass}`}
        >
          <Send className="size-4" />
          Deliver
        </button>
        <button
          type="button"
          onClick={() => requestAction('whitelist')}
          className={`flex items-center justify-center gap-1.5 rounded-md border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-500/10 dark:text-blue-400 ${widthClass}`}
        >
          <ShieldCheck className="size-4" />
          Whitelist
        </button>
        <button
          type="button"
          onClick={() => requestAction('blocklist')}
          className={`flex items-center justify-center gap-1.5 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 ${widthClass}`}
        >
          <Ban className="size-4" />
          Block
        </button>
      </div>
    );
  }

  const body = (
    <>
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
        <div className={`flex flex-col gap-6 ${overlay ? '' : 'lg:flex-row lg:items-start'}`}>
          <div className={`flex flex-col gap-4 ${overlay ? '' : 'lg:w-80 lg:shrink-0'}`}>
            <CollapsibleSection title="Spam Score" right={<SpamScoreBadge score={mail.spamlevel} />}>
              <div className="flex flex-col gap-3">
                <MetaRow label="From" value={mail.sender || mail.from} />
                <MetaRow label="Envelope Sender" value={mail.envelope_sender} />
                <MetaRow label="Recipient" value={mail.receiver} />
                <MetaRow label="Date" value={formatTime(mail.time)} />
                <MetaRow label="Size" value={formatBytes(mail.bytes)} />
                <button
                  type="button"
                  onClick={() =>
                    navigate('/tracking', { state: { presetFilters: trackingSearchFilters(mail) } })
                  }
                  className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
                >
                  <ArrowRightLeft className="size-3.5" />
                  Search in Tracking Center
                </button>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Spam Test Details" defaultOpen={false}>
              {mail.spaminfo?.length > 0 && (
                <div className="mb-3 flex items-center gap-1.5">
                  <CopyButton text={formatSpamInfo(mail.spaminfo)} label="Copy" />
                </div>
              )}
              <SpamInfoBreakdown spaminfo={mail.spaminfo} />
            </CollapsibleSection>
          </div>

          <div className="min-w-0 flex-1">
            <ContentTabs id={id} mail={mail} />
          </div>
        </div>
      )}
    </>
  );

  const CONFIRM_COPY = {
    deliver: {
      title: 'Deliver this message?',
      description: 'The message will be delivered to the recipient’s inbox.',
      confirmLabel: 'Deliver',
      tone: 'primary',
    },
    whitelist: {
      title: 'Whitelist this sender?',
      description: 'The sender will be added to the welcome list and the message will be delivered.',
      confirmLabel: 'Whitelist',
      tone: 'primary',
    },
    blocklist: {
      title: 'Block this message?',
      description:
        'The sender will be added to the block list and the message will be deleted. This cannot be undone.',
      confirmLabel: 'Block',
      tone: 'danger',
    },
  };

  const confirmCopy = pendingAction ? CONFIRM_COPY[pendingAction] : null;

  const confirmDialog = (
    <ConfirmDialog
      open={pendingAction !== null}
      title={confirmCopy?.title}
      description={confirmCopy?.description}
      confirmLabel={confirmCopy?.confirmLabel}
      tone={confirmCopy?.tone}
      onConfirm={confirmAction}
      onCancel={() => setPendingAction(null)}
    />
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
                {mail?.subject || 'Message details'}
              </p>
              <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-500">
                {mail?.sender || mail?.from}
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

          {mail && (
            <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <ActionButtons wide />
            </div>
          )}

          <main className="flex-1 overflow-y-auto p-4">{body}</main>
        </div>

        {confirmDialog}
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
          {mail?.subject || 'Message details'}
        </p>
        <div className="ml-auto hidden lg:block">
          <ActionButtons />
        </div>
      </header>

      <main className="px-4 pb-28 pt-4 lg:pb-6">{body}</main>

      {mail && (
        <div className="pb-safe fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-white px-4 pt-4 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
          <ActionButtons />
        </div>
      )}

      {confirmDialog}
    </div>
  );
}

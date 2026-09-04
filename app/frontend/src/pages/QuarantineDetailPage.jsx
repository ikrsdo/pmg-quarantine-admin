import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, ListChecks, Send, ShieldCheck, Ban, EyeOff, X, Paperclip } from 'lucide-react';
import {
  fetchQuarantineAttachments,
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
import { DEFAULT_QUARANTINE_TYPE } from '../constants/quarantineTypes';

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

function AttachmentsList({ id }) {
  const { data: attachments, isLoading } = useQuery({
    queryKey: ['quarantine', 'attachments', id],
    queryFn: () => fetchQuarantineAttachments(id),
  });

  if (isLoading) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-500">Loading attachments…</p>;
  }
  if (!attachments || attachments.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-500">No attachment details available.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {attachments.map((att) => (
        <li key={att.id} className="flex items-start gap-2 text-sm">
          <Paperclip className="mt-0.5 size-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
          <div className="min-w-0">
            <p className="truncate font-mono text-xs text-zinc-900 dark:text-zinc-100">{att.name}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              {att['content-type']} · {formatBytes(att.size)}
            </p>
          </div>
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
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || DEFAULT_QUARANTINE_TYPE;
  const { handleUnauthorized } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState(null); // 'deliver' | 'blocklist' | null
  const [drawerVisible, setDrawerVisible] = useState(!overlay);

  const { data: mail, isLoading, isError, error } = useQuery({
    queryKey: ['quarantine', 'detail', id],
    queryFn: () => fetchQuarantineDetail(id),
    // Same race as the list query's refetchOnMount:false (see
    // QuarantineListPage.jsx / CLAUDE.md's PMG API Notes): this page's own
    // mark-seen-on-open effect below fires a fire-and-forget POST right at
    // mount, and an implicit remount refetch can land a response that
    // predates that write completing server-side, reverting the seen
    // toggle right after it applied. The cache is already kept correct by
    // seenMutation's explicit setQueryData below.
    refetchOnMount: false,
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

  // Separate from actionMutation: this never closes the drawer/page (unlike
  // deliver/whitelist/blocklist), and the automatic mark-seen-on-open below
  // stays silent (no toast) so opening a message doesn't spam a
  // notification every time.
  const seenMutation = useMutation({
    mutationFn: (action) => performQuarantineAction(id, action),
    onSuccess: (_data, action) => {
      // Apply the known-correct result locally instead of invalidating:
      // this POST is fire-and-forget (fired from the auto-mark-on-open
      // effect, or the user's tap), so a refetch right after can race the
      // write actually committing server-side and land a response that
      // still shows the old value, silently reverting this update (see
      // CLAUDE.md's PMG API Notes).
      const seen = action === 'mark-seen';
      queryClient.setQueryData(['quarantine', 'detail', id], (old) => (old ? { ...old, seen } : old));
      queryClient.setQueriesData(
        { queryKey: ['quarantine'], predicate: (query) => query.queryKey[1] !== 'detail' },
        (old) => (Array.isArray(old) ? old.map((m) => (m.id === id ? { ...m, seen } : m)) : old),
      );
      if (action === 'mark-unseen') {
        const { tone, message } = quarantineActionToast(action);
        showToast(message, tone);
      }
    },
    onError: (err) => {
      if (!handleUnauthorized(err)) showToast('Action failed', 'danger');
    },
  });

  // Auto-mark-seen on open, silently - mirrors PMG's own "opening a message
  // marks it seen" behavior. Keyed on id (not mail.seen) so it fires once per
  // opened message and doesn't re-fire - and re-mark it seen - after the user
  // manually clicks "Mark unseen" on the still-open message.
  const autoMarkedIdRef = useRef(null);
  useEffect(() => {
    if (!mail || autoMarkedIdRef.current === mail.id) return;
    autoMarkedIdRef.current = mail.id;
    if (mail.seen !== true) seenMutation.mutate('mark-seen');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mail?.id]);

  function close() {
    if (overlay) {
      navigate(-1);
    } else {
      navigate(`/quarantine?type=${type}`);
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

  function handleActionsMenuSelect(action) {
    if (action === 'mark-unseen') {
      seenMutation.mutate('mark-unseen');
    } else {
      requestAction(action);
    }
  }

  const ACTIONS_MENU_ITEMS = [
    { action: 'deliver', label: 'Deliver', icon: Send, className: 'text-emerald-600 dark:text-emerald-400' },
    { action: 'whitelist', label: 'Whitelist', icon: ShieldCheck, className: 'text-blue-600 dark:text-blue-400' },
    { action: 'blocklist', label: 'Block', icon: Ban, className: 'text-red-600 dark:text-red-400' },
    {
      action: 'mark-unseen',
      label: 'Mark unseen',
      icon: EyeOff,
      className: 'text-zinc-600 dark:text-zinc-400',
      show: (m) => m.seen === true,
    },
  ];

  // Single "Actions" trigger everywhere the action set is shown (desktop
  // header, drawer header, mobile sticky bar) instead of a row/grid of
  // buttons - keeps the trigger a constant size no matter how many actions
  // exist, so adding a new action later is just one more row in the dropdown.
  // Each instance owns its own open/anchor state, so the dropdown opens
  // right next to whichever trigger was clicked rather than a single shared
  // centered modal.
  function ActionsTrigger({ full = false, direction = 'down', align = 'right' }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
      if (!open) return;
      function handleClickOutside(e) {
        if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
      }
      function handleKeyDown(e) {
        if (e.key === 'Escape') setOpen(false);
      }
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [open]);

    if (!mail) return null;

    const items = ACTIONS_MENU_ITEMS.filter((item) => !item.show || item.show(mail));

    return (
      <div ref={containerRef} className={`relative ${full ? 'w-full' : 'inline-block'}`}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`inline-flex items-center justify-center gap-1.5 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 ${full ? 'w-full' : ''}`}
        >
          <ListChecks className="size-4" />
          Actions
        </button>
        {open && (
          <div
            className={`absolute z-20 w-48 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 ${
              direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
            } ${full ? 'left-1/2 -translate-x-1/2' : align === 'left' ? 'left-0' : 'right-0'}`}
          >
            <div className="flex flex-col p-1.5">
              {items.map(({ action, label, icon: Icon, className }) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    handleActionsMenuSelect(action);
                  }}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 ${className}`}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
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
            <CollapsibleSection
              title={type === 'spam' ? 'Spam Score' : type === 'virus' ? 'Virus Details' : 'Attachment Details'}
              right={
                type === 'spam' ? (
                  <SpamScoreBadge score={mail.spamlevel} />
                ) : type === 'virus' && mail.virusname ? (
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 font-mono text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20">
                    {mail.virusname}
                  </span>
                ) : null
              }
            >
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

            {type === 'spam' && (
              <CollapsibleSection title="Spam Test Details" defaultOpen={false}>
                {mail.spaminfo?.length > 0 && (
                  <div className="mb-3 flex items-center gap-1.5">
                    <CopyButton text={formatSpamInfo(mail.spaminfo)} label="Copy" />
                  </div>
                )}
                <SpamInfoBreakdown spaminfo={mail.spaminfo} />
              </CollapsibleSection>
            )}

            {type === 'attachment' && (
              <CollapsibleSection title="Blocked Attachments">
                <AttachmentsList id={id} />
              </CollapsibleSection>
            )}
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
              <ActionsTrigger align="left" />
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
          <ActionsTrigger />
        </div>
      </header>

      <main className="px-4 pb-28 pt-4 lg:pb-6">{body}</main>

      {mail && (
        <div className="pb-safe fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-white px-4 pt-4 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
          <ActionsTrigger full direction="up" />
        </div>
      )}

      {confirmDialog}
    </div>
  );
}

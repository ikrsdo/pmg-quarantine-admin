import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchQuarantineList } from '../api/quarantine';
import { fetchTrackingList } from '../api/tracking';
import { useAuth } from '../hooks/useAuth';
import AppShell from '../components/AppShell';
import CollapsibleSection from '../components/CollapsibleSection';
import TrackingStatusBadge from '../components/TrackingStatusBadge';
import { SkeletonList } from '../components/Skeleton';

const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function BarRow({ label, count, max, tone = 'bg-blue-600 dark:bg-blue-500' }) {
  const pct = max > 0 ? Math.max((count / max) * 100, count > 0 ? 2 : 0) : 0;
  return (
    <div className="flex items-center gap-3">
      <p className="w-40 shrink-0 truncate text-xs text-zinc-600 dark:text-zinc-400" title={label}>
        {label}
      </p>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="w-10 shrink-0 text-right text-xs font-medium text-zinc-900 dark:text-zinc-100">{count}</p>
    </div>
  );
}

function VolumeChart({ mails }) {
  const [range, setRange] = useState('24h');

  const buckets = useMemo(() => {
    const now = new Date();
    if (range === '24h') {
      const hours = Array.from({ length: 24 }, (_, i) => {
        const d = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
        d.setMinutes(0, 0, 0);
        return { label: `${String(d.getHours()).padStart(2, '0')}:00`, start: d.getTime() };
      });
      return hours.map(({ label, start }, i) => {
        const end = i < hours.length - 1 ? hours[i + 1].start : start + 60 * 60 * 1000;
        const count = mails.filter((m) => m.time * 1000 >= start && m.time * 1000 < end).length;
        return { label, count };
      });
    }
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
      return { label: d.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }), start: d.getTime() };
    });
    return days.map(({ label, start }, i) => {
      const end = i < days.length - 1 ? days[i + 1].start : start + 24 * 60 * 60 * 1000;
      const count = mails.filter((m) => m.time * 1000 >= start && m.time * 1000 < end).length;
      return { label, count };
    });
  }, [mails, range]);

  const max = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <CollapsibleSection
      title="Quarantine Volume"
      right={
        <div className="flex gap-1 rounded-md border border-zinc-300 p-0.5 text-xs dark:border-zinc-700">
          {[
            { id: '24h', label: '24h' },
            { id: '7d', label: '7d' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRange(opt.id)}
              className={`rounded px-2 py-1 font-medium ${
                range === opt.id
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      }
    >
      {buckets.every((b) => b.count === 0) ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-500">No messages quarantined in this range.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {buckets.map((b) => (
            <BarRow key={b.label} label={b.label} count={b.count} max={max} />
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
}

// Shared by TopSenders/TopReceivers - both rank Tracking Center's
// overall mail traffic (not just quarantined mail) by an address field.
function TopAddresses({ trackingMails, field, title, tone, emptyText }) {
  const top = useMemo(() => {
    const counts = new Map();
    for (const m of trackingMails) {
      const address = m[field] || 'Unknown';
      counts.set(address, (counts.get(address) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [trackingMails, field]);

  const max = Math.max(1, ...top.map(([, count]) => count));

  return (
    <CollapsibleSection title={title}>
      {top.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-500">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {top.map(([address, count]) => (
            <BarRow key={address} label={address} count={count} max={max} tone={tone} />
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
}

// PMG's tracking list doesn't expose a "policy match"/rule field - only a
// delivery status code per entry (see TrackingStatusBadge.jsx). This
// distribution is the closest thing PMG's list endpoints actually offer
// without an N+1 per-message detail fetch, so it stands in for the
// "Policy Match" widget from the original brainstorm.
function StatusDistribution({ trackingMails }) {
  const counts = useMemo(() => {
    const map = new Map();
    for (const m of trackingMails) {
      const status = m.rstatus || m.dstatus || '?';
      map.set(status, (map.get(status) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [trackingMails]);

  const max = Math.max(1, ...counts.map(([, count]) => count));

  return (
    <CollapsibleSection title="Message Delivery Status (last 7 days)">
      {counts.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-500">No tracking activity in the last 7 days.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {counts.map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <div className="w-40 shrink-0">
                <TrackingStatusBadge status={status} />
              </div>
              <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                <div
                  className="h-full rounded-full bg-amber-500 dark:bg-amber-500"
                  style={{ width: `${Math.max((count / max) * 100, 2)}%` }}
                />
              </div>
              <p className="w-10 shrink-0 text-right text-xs font-medium text-zinc-900 dark:text-zinc-100">
                {count}
              </p>
            </div>
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
}

export default function DashboardPage() {
  const { handleUnauthorized } = useAuth();
  const { starttime, endtime } = useMemo(() => {
    // Rounded to the minute so remounting within the staleTime window
    // (e.g. navigating away and back) reuses the same query cache entry
    // instead of missing on a slightly different timestamp.
    const endtime = Math.floor(nowSeconds() / 60) * 60;
    return { starttime: endtime - SEVEN_DAYS_SECONDS, endtime };
  }, []);

  const quarantineQuery = useQuery({
    queryKey: ['quarantine', { starttime, endtime }],
    queryFn: () => fetchQuarantineList({ starttime, endtime }),
    staleTime: 60 * 1000,
  });

  const trackingQuery = useQuery({
    queryKey: ['tracking', { starttime, endtime, limit: 5000 }],
    queryFn: () => fetchTrackingList({ starttime, endtime, limit: 5000 }),
    staleTime: 60 * 1000,
  });

  if (quarantineQuery.isError && handleUnauthorized(quarantineQuery.error)) {
    return null;
  }
  if (trackingQuery.isError && handleUnauthorized(trackingQuery.error)) {
    return null;
  }

  const isLoading = quarantineQuery.isLoading || trackingQuery.isLoading;
  const mails = quarantineQuery.data || [];
  const trackingMails = trackingQuery.data || [];

  return (
    <AppShell>
      <div className="h-full overflow-auto px-4 py-4">
        <h1 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Overview</h1>

        {isLoading && <SkeletonList />}

        {!isLoading && (
          <div className="flex flex-col gap-4">
            <VolumeChart mails={mails} />
            <TopAddresses
              trackingMails={trackingMails}
              field="from"
              title="Top Senders (last 7 days)"
              tone="bg-red-500 dark:bg-red-500"
              emptyText="No mail activity in the last 7 days."
            />
            <TopAddresses
              trackingMails={trackingMails}
              field="to"
              title="Top Receivers (last 7 days)"
              tone="bg-purple-500 dark:bg-purple-500"
              emptyText="No mail activity in the last 7 days."
            />
            <StatusDistribution trackingMails={trackingMails} />
          </div>
        )}
      </div>
    </AppShell>
  );
}

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { parseTrackingLogEvents, EVENT_CATEGORY_COLOR } from '../utils/trackingLogEvents';

function EventRow({ event }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr
        onClick={() => setExpanded((v) => !v)}
        className="cursor-pointer border-b border-zinc-100 align-top hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/60"
      >
        <td className="w-6 py-2 pl-1 text-zinc-400 dark:text-zinc-600">
          {expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        </td>
        <td className="whitespace-nowrap py-2 pr-3 font-mono text-xs text-zinc-500 dark:text-zinc-500">
          {event.time || '—'}
        </td>
        <td className={`whitespace-nowrap py-2 pr-3 text-xs font-medium ${EVENT_CATEGORY_COLOR[event.category]}`}>
          {event.category}
        </td>
        <td className="py-2 pr-2 text-xs text-zinc-700 dark:text-zinc-300">{event.summary}</td>
      </tr>
      {expanded && (
        <tr className="border-b border-zinc-100 dark:border-zinc-900">
          <td />
          <td colSpan={3} className="whitespace-pre-wrap break-all bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            {event.raw}
          </td>
        </tr>
      )}
    </>
  );
}

export default function MessageEventsTimeline({ logs }) {
  const [structured, setStructured] = useState(true);
  const events = parseTrackingLogEvents(logs);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500">Message Events</p>
        <button
          type="button"
          onClick={() => setStructured((v) => !v)}
          className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          {structured ? 'Show raw log' : 'Show structured view'}
        </button>
      </div>

      {!logs || logs.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-500">No log entries.</p>
      ) : structured ? (
        <div className="max-h-[60vh] overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900">
              <tr className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <th className="w-6" />
                <th className="py-2 pr-3 font-semibold">Date</th>
                <th className="py-2 pr-3 font-semibold">Event</th>
                <th className="py-2 pr-2 font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <EventRow key={event.key} event={event} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-auto rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <pre className="whitespace-pre-wrap break-all font-mono text-xs text-zinc-700 dark:text-zinc-300">
            {logs.join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
}

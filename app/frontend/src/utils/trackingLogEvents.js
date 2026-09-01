// Parses PMG's raw Tracking Center syslog lines (Postfix log format,
// e.g. "Aug 29 15:10:01 host postfix/qmgr[123]: ABCDEF: from=<...>, size=..."
// or, on newer/rsyslog-configured PMG installs, ISO 8601 timestamps like
// "2026-08-30T14:34:09.659617+03:00 host postfix/qmgr[123]: ...")
// into a friendlier, categorized event list for display. The PMG API only
// guarantees `logs` is an array of plain strings (see pmg-api's
// MailTracker.pm) - there is no structured "event type" field at the
// source, so the categories below are inferred heuristically from the
// Postfix service name and common message patterns. Lines that don't match
// anything recognized fall back to a generic "Log" category rather than
// being dropped, so no information is ever hidden. The process field is
// also not always "service/subservice" (e.g. PMG's own
// "pmg-smtp-filter[pid]" has no slash) - that still parses fine, it just
// isn't matched against the Postfix-service checks below (see the
// "Policy Match" category for the one pmg-smtp-filter line that matters:
// an antispam/policy rule match).

const LINE_RE =
  /^((?:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[+-]\d{2}:\d{2}|Z)?)|(?:\w{3}\s+\d{1,2}\s+\d{1,2}:\d{2}:\d{2}))\s+(\S+)\s+([\w.-]+(?:\/[\w.-]+)?)(?:\[\d+\])?:\s*(.*)$/;

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

function formatDisplayTime(time) {
  if (!time) return null;
  if (!ISO_RE.test(time)) return time; // classic "Mon Day HH:MM:SS" is already readable
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return time;
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function extract(message, re) {
  const m = message.match(re);
  return m ? m[1] : null;
}

// pmg-smtp-filter (the content filter, not a Postfix service - its process
// field has no "service/subservice" slash) logs a line like
// "... (rule: Some Rule Name)" whenever a mail matches one of PMG's
// antispam/policy rules. That's real, useful information the categories
// above don't cover, so it's checked as a fallback and pulled out into its
// own category instead of falling into the generic "Log" bucket.
// Greedy + anchored at end of line: PMG rule names can themselves contain
// parentheses (e.g. "Whitelist - Netmak (in)"), so a non-greedy [^)]+ would
// stop at the rule name's own closing paren instead of the outer one.
const RULE_RE = /\(rule:\s*(.+)\)\s*$/i;

function classify(process, message) {
  const service = process.split('/')[1] || '';

  if (service === 'smtpd') {
    if (/^NOQUEUE: reject/.test(message) || /reject:/.test(message)) return 'Rejected';
    if (message.includes('connect from')) return 'Received';
  } else if (service === 'cleanup') {
    if (message.includes('message-id=')) return 'Processed';
  } else if (service === 'qmgr') {
    if (message.includes('from=<')) return 'Queued';
  } else if (['smtp', 'lmtp', 'local', 'pipe', 'virtual'].includes(service)) {
    if (message.includes('status=sent')) return 'Delivered';
    if (message.includes('status=bounced')) return 'Bounced';
    if (message.includes('status=deferred')) return 'Deferred';
    if (/greylist/i.test(message)) return 'Greylisted';
  } else if (service === 'bounce') {
    return 'Bounced';
  }

  if (RULE_RE.test(message)) return 'Policy Match';

  return 'Log';
}

function summarize(category, message) {
  const client = extract(message, /connect from (\S+)/);
  const from = extract(message, /from=<([^>]*)>/);
  const to = extract(message, /to=<([^>]*)>/);
  const relay = extract(message, /relay=(\S+),/);
  const size = extract(message, /size=(\d+)/);
  const reason = extract(message, /\(([^)]*)\)\s*$/);
  const rule = extract(message, RULE_RE);

  switch (category) {
    case 'Received':
      return client ? `Message received from ${client}` : 'Message received';
    case 'Queued':
      return from
        ? `Queued for delivery (from ${from}${size ? `, ${Math.round(size / 1024)} KB` : ''})`
        : 'Message queued for delivery';
    case 'Processed':
      return 'Processed by the content filter';
    case 'Delivered':
      return relay ? `Delivered via ${relay}` : to ? `Delivered to ${to}` : 'Message delivered';
    case 'Bounced':
      return to ? `Delivery to ${to} bounced${reason ? `: ${reason}` : ''}` : 'Message bounced';
    case 'Deferred':
      return `Delivery deferred${reason ? `: ${reason}` : ''}`;
    case 'Greylisted':
      return 'Greylisted - delivery will be retried';
    case 'Rejected':
      return reason ? `Message rejected: ${reason}` : 'Message rejected';
    case 'Policy Match':
      return rule ? `Matched policy rule "${rule.trim()}"` : 'Matched a content-filter policy rule';
    default:
      return message.length > 90 ? `${message.slice(0, 90)}…` : message;
  }
}

/**
 * @param {string[]} logs raw syslog lines from PMG's tracker detail endpoint
 * @returns {{ key: string, time: string|null, category: string, summary: string, raw: string }[]}
 */
export function parseTrackingLogEvents(logs) {
  return (logs || []).map((raw, i) => {
    const match = raw.match(LINE_RE);
    if (!match) {
      return { key: `${i}`, time: null, category: 'Log', summary: summarize('Log', raw), raw };
    }
    const [, time, , process, message] = match;
    const category = classify(process, message);
    return { key: `${i}`, time: formatDisplayTime(time), category, summary: summarize(category, message), raw };
  });
}

export const EVENT_CATEGORY_COLOR = {
  Received: 'text-blue-600 dark:text-blue-400',
  Queued: 'text-blue-600 dark:text-blue-400',
  Processed: 'text-blue-600 dark:text-blue-400',
  Delivered: 'text-emerald-600 dark:text-emerald-400',
  Bounced: 'text-red-600 dark:text-red-400',
  Rejected: 'text-red-600 dark:text-red-400',
  Deferred: 'text-amber-600 dark:text-amber-400',
  Greylisted: 'text-amber-600 dark:text-amber-400',
  'Policy Match': 'text-violet-600 dark:text-violet-400',
  Log: 'text-zinc-500 dark:text-zinc-400',
};

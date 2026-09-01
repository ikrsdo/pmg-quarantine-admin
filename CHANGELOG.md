# Changelog

English | [Türkçe](CHANGELOG.tr.md)

All notable changes to this project are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
versioning follows [Semantic Versioning](https://semver.org/) - while the
project is in `0.x`, minor bumps may still include breaking changes.

## [Unreleased]

### Added

- New Dashboard screen, now the landing page after login. Shows a
  quarantine volume chart (24h/7-day toggle), a top-senders list, and
  a Tracking Center status distribution widget, all built with plain
  CSS bar charts (no charting library added).
- Best-effort cross-linking between Quarantine and Tracking Center: a
  "Search in Tracking Center" button on the Quarantine detail page and
  a "Search in Quarantine" button on the Tracking Center detail page
  each jump to the other list pre-filtered by sender/recipient and a
  ±15-minute time window around the message's timestamp. This is a
  best-effort match, not a guaranteed exact link - PMG's Quarantine
  and Tracking Center APIs share no common identifier.
- Saved filter presets ("Saved Filters") inside both the Quarantine
  and Tracking Center filter modals - quick pill buttons for common
  time ranges (Quarantine: last 24h/7 days; Tracking Center: last
  24h/7 days, NDR/rejected, greylisted).
- CSV export button on both the Quarantine and Tracking Center list
  pages, exporting the currently filtered rows.
- README now includes a Screenshots section with desktop and mobile
  captures of the Login, Quarantine, and Tracking Center screens.
- README now documents how to update to the latest version
  (`git pull && docker compose up -d --build`), and the `git clone`
  command in Setup uses the actual repository URL instead of a
  placeholder.
- Dashboard now has a "Top Receivers" widget alongside "Top Senders",
  ranking the recipients that appear most often in Tracking Center's
  last 7 days.
- Tracking Center's detail page now shows a short note under the
  "From" field explaining that it is the envelope sender recorded by
  Postfix and may differ from the message's header From address (e.g.
  bounce/VERP addresses like `bounce.xxx=...@...`). Tracking Center's
  API only ever exposes this single envelope-level field - there's no
  separate header-From data available to show alongside it.
- Tracking Center's Status column is now sortable, matching the other
  columns - sorting is by the displayed status label (e.g. "Delivered",
  "Quarantined"), not the raw PMG status code.
- Tracking Center's filter modal now has a "Status" dropdown to narrow
  the list down to a single delivery/receive status (e.g. Quarantined,
  Bounced, Rejected) - this is a client-side filter over the already-
  fetched time range, since the Tracking Center API itself has no
  status query parameter.

### Changed

- Dashboard redesigned for a more modern look on both mobile and
  desktop: a new "Last 7 days" stat-card row (Quarantined, Tracked
  mail, Unique senders, Top status) above the existing widgets, a
  2-column widget grid on desktop instead of one full-width column,
  and each widget card now has a colored left-accent stripe, subtle
  background/shadow, and gradient bar fills instead of flat single-
  color bars. No data or widget content changed, only the layout and
  visual styling. "Quarantine Volume" and "Message Delivery Status"
  now sit side by side on desktop, and the "Top status" stat card now
  shows the status name as its label (e.g. "Delivered") with the
  count as its value, matching the other stat cards, instead of
  cramming "Name (count)" into the value field where it got
  truncated on narrow mobile widths.
- Dashboard's "Quarantine Volume" chart now always shows the last 7
  days and matches the "(last 7 days)" title style used by the other
  widgets; the 24h/7d toggle was removed since every other Dashboard
  widget is a fixed 7-day view too.
- Dashboard's "Top Senders" widget now ranks senders from Tracking
  Center's overall mail traffic instead of the Quarantine list, so it
  reflects who is sending the most mail overall, not just who is
  triggering quarantine most often (the new "Top Receivers" widget
  above uses the same Tracking Center source).
- Dashboard's "Tracking Center Status Distribution" section was
  renamed to "Message Delivery Status" - no behavior change, just a
  clearer title.
- Dashboard's quarantine/tracking queries now use a 60-second
  `staleTime` and a minute-rounded time window, so navigating away
  from the Dashboard and back within a minute reuses the already-
  fetched data instead of re-fetching a full 7 days of tracking data
  again. The first load after login still pays the real cost of
  fetching that data.

### Fixed

- Favicon/app-icon URLs (`favicon.svg`, `apple-touch-icon.png`, and
  the manifest's `icon-192.png`/`icon-512.png`) now carry a `?v=2`
  cache-busting query string, since mobile browsers were still
  showing a stale favicon after an icon update even after clearing
  site data.
- Tracking Center detail's "Search in Quarantine" button now only
  appears when the entry's status is actually "Quarantined" (`Q`) -
  previously it showed on every entry, including Delivered/Bounced/
  Rejected/Blocked ones that can never exist in Quarantine.
- The "Saved Filters" preset pills (Quarantine and Tracking Center) now
  highlight the currently-active preset, so it's clear at a glance
  which quick filter (if any) is applied.
- Tracking Center's date-range presets ("Last 24h"/"Last 7 days") now
  clear the NDR/Greylist checkboxes when clicked - previously, picking
  NDR or Greylist and then a date preset left NDR/Greylist silently
  still applied even though nothing in the filter sheet indicated it.
- `CollapsibleSection`'s clickable header was a `<button>` element;
  when a widget passed interactive controls into its `right` slot
  (e.g. the Dashboard volume chart's 24h/7d toggle), this produced an
  invalid `<button>` nested inside a `<button>` and a React hydration
  warning. The header is now a `role="button"` `<div>` instead.
- Quarantine CSV export's "Sender" column came out empty (it read
  PMG's often-empty `sender` field directly, without the app's usual
  `sender || from` fallback). The column is now "From" using that
  fallback, and a new "Envelope Sender" column is included alongside
  it (fetched per row, since PMG's list endpoint doesn't return that
  field - only the per-message detail does). The "Time" and "Size"
  columns are now human-readable (`dd/mm/yyyy, hh:mm:ss` and KB)
  instead of a raw unix timestamp and byte count.
- Tracking Center CSV export's "Time" and "Size" columns were also raw
  unix timestamp/bytes, now formatted the same way as Quarantine's.
  "Delivery Status"/"Receive Status" exported PMG's raw status code
  (`2`, `5`, `N`, `B`, etc.) instead of its meaning - they now export
  the same label shown in the app's status badge (e.g. "Delivered",
  "Bounced", "Blocked").
- Two remaining Turkish button tooltips ("CSV'ye Aktar" on both list
  pages) were missed by the earlier English-translation pass - fixed
  to "Export CSV".
- Dashboard's Quarantine Volume/Top Senders/Status Distribution
  widgets always showed empty, regardless of the 24h/7d range picker.
  Both widgets' queries requested `starttime` only and left `endtime`
  unset; PMG's API defaults a missing `endtime` to `starttime + 24h`
  (not "now"), so a 7-day-ago `starttime` silently queried a single
  24-hour window from a week ago instead of the intended 7-day range
  up to the present. Both queries now pass an explicit `endtime`. Also
  added the same PMG-ticket-expiry redirect the other pages already
  have - a failed Dashboard query previously rendered the misleading
  empty state instead of returning to the login screen.
- Dashboard felt very slow to load after the `endtime` fix above: its
  `starttime`/`endtime` were computed inline in the component body
  (unmemoized), so any re-render that crossed a one-second boundary
  produced a new value, which changed the query's cache key and
  triggered a brand new fetch - which caused another re-render, which
  could cross another second boundary, and so on. This bug already
  existed before the `endtime` fix, but was invisible because the old,
  accidentally-narrow queries returned almost instantly; once they
  started returning a full 7 days of real data (slower per request),
  each refetch had more time to cross a second boundary, turning it
  into a visible chain of repeated `/api/quarantine` and `/api/tracking`
  requests. `starttime`/`endtime` are now computed once via `useMemo`
  on mount instead of on every render.

## [0.4.1] - 2026-08-31

### Changed

- Tracking Center detail's "Message Events" timeline previously showed
  every content-filter (`pmg-smtp-filter`) log line as a generic "Log"
  event, even when the line recorded a mail matching one of PMG's
  antispam/policy rules (`... (rule: <rule name>)`). These now get
  their own "Policy Match" category and show the matched rule's name.
- The favicon is now a blue badge with the same Lucide Shield icon
  used on the login page, instead of an unrelated abstract logo.
- Tracking Center detail's "Message Events" timeline no longer shows
  the generic "Log" category - lines that don't match a recognized
  event type are now left out of the structured view entirely, since
  the raw log (toggle available on the same section) already has
  every line, uncategorized ones included.

## [0.4.0] - 2026-08-31

### Security

- `/api/login` is now rate-limited (20 attempts per 15 minutes per IP)
  against PMG credential brute-forcing, since login is the one endpoint
  reachable without an existing session.
- Security response headers (via [Helmet](https://helmetjs.github.io/))
  are now set on every response - `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, `X-Powered-By` removal,
  etc. (CSP is left off, since the frontend relies on inline `style`
  attributes for the iOS backdrop-blur fix and the login page's
  gradient background).
- The quarantined-mail HTML preview endpoint now also sends its own
  `Content-Security-Policy: sandbox` header, as defense-in-depth
  against someone navigating the browser directly to that URL (the
  frontend's own sandboxed-iframe usage is unaffected).
- The Docker image now runs as a non-root user instead of root.
- README now has a full "Security Notes" section documenting the
  app's credential handling, session hygiene, backend hardening, and
  network posture, and no longer carries the "early development"
  disclaimer.

### Changed

- Quarantine detail's "Spam Score" and "Spam Test Details" sections, and
  Tracking Center detail's "Status" and "Message Events" sections, are
  now collapsible accordions on both mobile and desktop (Spam Score and
  Status open by default, Spam Test Details and Message Events closed).
- The Quarantine filter modal's "Recipient email" field is now a
  searchable dropdown instead of a plain select, so a long recipient
  list can be filtered by typing instead of scrolling.
- Quarantine detail's "Spam Test Details" section now has a "Copy"
  button that copies the spam test breakdown as plain text.
- For visual consistency, all action buttons in the Quarantine and
  Tracking Center detail pages' section headers - Spam Test Details'
  "Copy", and Message Events' "Copy Log" and "Show Raw Log" - now sit
  on their own row below the heading instead of crowding it, on both
  mobile and desktop. The heading itself now shows only its title
  (plus its badge, for Spam Score and Status).
- The login page is more polished: the form now sits in an actual
  card (border, shadow, background) with a shield icon above the
  title, inputs have a visible focus ring, the password field has a
  show/hide toggle, the error message has a matching icon, and the
  "Sign in" button shows a spinner while submitting - on both mobile
  and desktop.

### Fixed

- Tracking Center detail's "Message Events" timeline showed every log
  line as a generic "Log" event with no date, on PMG installs whose
  syslog timestamps are ISO 8601 (`2026-08-30T14:34:09.659617+03:00`)
  rather than classic Postfix syslog format (`Aug 29 15:10:01`). The
  line parser's regex only recognized the classic format, so every
  line silently failed to match and fell back to the generic/no-date
  case. Fixed by recognizing both timestamp formats and formatting the
  ISO one for display (`30/08, 14:34:09`) - Received/Queued/Processed/
  Delivered etc. now categorize correctly again.
- The Quarantine filter modal's "Recipient email" searchable dropdown
  list rendered flush against the modal's bottom border, with no gap.
  The dropdown was absolutely positioned, so it didn't affect the
  modal's own (shorter) layout height, and the modal's `overflow-y-auto`
  clipped the dropdown right at that height. Fixed by having the
  dropdown render in normal document flow instead, so it pushes the
  fields below it down and the modal now grows to fit it properly.
- On Safari (mobile and desktop), selecting an email from the
  Quarantine filter modal's searchable dropdown set the value but left
  the dropdown open, blocking the Start/End date fields underneath.
  The "Recipient email" field wrapped the whole dropdown widget (its
  toggle button, search input, and every option button) in a single
  `<label>`; Safari's implicit label-to-control click forwarding then
  re-toggled the dropdown open right after the selection's own click
  handler closed it. Fixed by using a plain `<div>` instead of a
  `<label>` for that field, since it wraps a custom widget rather than
  a single form control.

## [0.3.0] - 2026-08-30

### Added

- Quarantine and Tracking Center list toolbars (mobile and desktop)
  now have a Refresh button that re-fetches the list on demand, with
  a spinning icon while the request is in flight.
- Quarantine list/detail and Tracking Center list actions now show a
  toast notification (Deliver, Block, Whitelist, and failures), fixed
  to the bottom of the screen on both mobile and desktop. Each toast
  auto-dismisses after 5 seconds and has a shrinking progress bar
  underneath so the remaining time is visible.

### Changed

- The Filter and Tracking filter modals, and the confirmation dialog,
  now blur the page behind them when open (mobile and desktop), and on
  mobile the filter modals open centered on screen instead of as a
  bottom sheet.
- Deliver and Whitelist now require confirmation via the same dialog
  already used for Block, on both the Quarantine list (table row,
  bulk-selection bar, and mobile swipe actions) and detail pages, on
  mobile and desktop. Previously only Block was confirmed.
- The Quarantine and Tracking Center search field placeholders dropped
  the redundant "Search" word - now "Subject or Sender…" and "Sender
  or Recipient…".
- On mobile, the Filter, Select, Refresh, and theme-toggle buttons on
  the Quarantine and Tracking Center list toolbars now show only their
  icon (no text label), freeing up width for the search box. Desktop
  is unaffected - labels still show there.
- The Back button on the Quarantine and Tracking Center detail pages
  is now a bordered button (matching the app's other toolbar buttons)
  instead of plain text, so it reads clearly as a tappable control.
- The mobile Quarantine card now shows the recipient address (styled
  like Tracking Center's `→ recipient@…` line), and the mobile
  Tracking Center card now shows the message size next to its
  timestamp - both previously desktop-only or absent.
- On mobile, the "Copy Log" and "Show Raw Log" buttons in the Tracking
  Center detail's Message Events section now sit on their own row
  below the "Message Events" heading instead of competing for space
  next to it; desktop keeps them inline. Both labels are now title
  case ("Copy Log", "Show Raw Log") instead of sentence case.
- The Quarantine and Tracking Center filter modals, and the Quarantine
  "Block" confirmation dialog, now close on Escape or on a click
  outside the modal, not just via their Close/Cancel button.
- On desktop, clicking a message in the Quarantine list, or an entry in
  the Tracking Center list, now opens its detail view as a right-side
  drawer over the list (closable via the X button, Escape, or a click
  outside), instead of navigating away to a full separate page. The
  list stays mounted underneath, so filters, sort, and scroll position
  are preserved when it closes. A direct link to a message/entry (or a
  page refresh) still opens the full standalone detail page as before.
- Tracking Center detail's raw syslog dump is now presented as a
  "Message Events" timeline: each line is categorized (Received,
  Queued, Processed, Delivered, Deferred, Bounced, Rejected,
  Greylisted, or a generic Log fallback) with a plain-language summary,
  and can be expanded to see the original syslog line. A "Show raw
  log" toggle switches back to the previous plain-text view.
- The "Status" and "Message Events" section headings in the Tracking
  Center drawer, and the "Spam Score" and "Spam Test Details" section
  headings in the Quarantine drawer, are now bold with a divider line
  instead of small muted text, so they read as section headings at a
  glance.
- The Tracking Center drawer's "Show raw log" toggle is now styled as
  an actual button (was a text link), and sits next to a new "Copy
  log" button that copies the full raw syslog to the clipboard.
- The Quarantine drawer's Headers tab now has a "Copy" button that
  copies the raw message headers to the clipboard.

### Fixed

- Quarantine detail's Preview tab showed the raw, still MIME-encoded
  message source (quoted-printable text, unrendered HTML/CSS) instead
  of the message as an email client would show it. Now fetched from
  PMG's own sanitized HTML rendering endpoint (`/api2/htmlmail/...`)
  and rendered in a sandboxed iframe; the raw source is no longer
  shown anywhere in the UI.
- On mobile, the app header (title/version and logged-in username) and
  the Tracking Center card list could overflow past the right edge of
  the screen and force horizontal scrolling, when the username or a
  sender/recipient address was long. Both were flex rows whose text
  elements were missing `min-w-0`, so they refused to shrink/truncate
  below their natural text width. Fixed by giving those elements
  `min-w-0` (and `truncate` where missing) so they shrink and ellipsize
  within the viewport instead of pushing it wider.
- On mobile Safari, the backdrop blur behind the Filter/Tracking
  filter modals and the confirmation dialog didn't render, even though
  the underlying CSS was correct. iOS Safari silently skips
  `backdrop-filter` on a `position: fixed` element unless that element
  has its own GPU compositing layer. Fixed by forcing one via
  `transform: translateZ(0)` on the three modal backdrops.
- On mobile, focusing any form field (login username/password, search
  boxes, filter fields) made the page appear to shift/zoom and could
  cause horizontal overflow. iOS Safari auto-zooms the viewport when a
  focused input's `font-size` is below 16px; several inputs used
  `text-sm` (14px). Fixed by forcing `font-size: 16px` on all
  `input`/`select`/`textarea` elements below the `640px` breakpoint.
- The app had no web app manifest or iOS "add to home screen" meta
  tags, so installing it via Safari's "Add to Home Screen" only
  created a bookmark that opened in a full browser tab (with the
  Safari address bar and toolbar) instead of a standalone PWA. This
  also caused the sticky bottom action bars (Quarantine bulk-selection
  bar, detail-page action bar) to sit under the browser's own bottom
  toolbar, hiding all but their top edge, and let the sticky top
  header on the Quarantine list, Tracking Center list, and both detail
  pages render underneath the iOS status bar/notch/Dynamic Island.
  Fixed by adding a web app manifest, `apple-touch-icon`, and the iOS
  PWA meta tags, plus `safe-area-inset` padding on all of those sticky
  headers and on both sticky bottom action bars so they clear the
  status bar/home indicator when running standalone. An
  already-installed Home Screen icon must be deleted and re-added for
  this to take effect, since iOS only reads these tags at install
  time.
- On desktop, hovering the Deliver and Block buttons in the Quarantine
  list table rows kept the default arrow cursor instead of a pointer.
  Tailwind v4 dropped the `button { cursor: pointer }` rule its
  preflight used to set. Fixed by restoring it globally in `index.css`.

## [0.2.0] - 2026-08-29

### Added

- App version number is now shown in the GUI itself (sidebar on
  desktop, header on mobile), sourced from `package.json`.
- Quarantine and Tracking Center desktop tables now have sortable
  columns (click a header to sort, click again to reverse), matching
  PMG's own list behavior.
- Adopted the [Lucide](https://lucide.dev) icon set across the app
  (navigation, toolbar, action buttons, theme toggle, back links) for
  a more polished, professional look.
- Quarantine and Tracking Center desktop tables now show each
  message's size in KB.

### Changed

- Desktop sidebar, and the search/filter toolbar and table headers on
  the Quarantine and Tracking Center list pages, now stay fixed in
  place - only the list/table content scrolls underneath them.
- Quarantine and Tracking Center desktop tables now use zebra-striped
  rows and a more prominent header row (shaded background, bolder
  uppercase labels, stronger bottom border) for readability.
- Tracking Center now defaults to PMG's own GUI behavior - from one
  hour before the page loads through midnight of the current day -
  instead of PMG's implicit ~24h default when no time range is
  requested.
- Quarantine list now defaults to the last 7 days (matching PMG's own
  GUI default) instead of PMG's implicit ~24h default when no time
  range is requested.
- The Quarantine "recipient email" filter is now a dropdown of "All"
  plus the distinct recipient addresses currently in quarantine,
  instead of a free-text field.
- Desktop sidebar is wider, and the logged-in account name now sits
  near the top (under the app title) instead of the bottom.

## [0.1.0] - 2026-08-29

### Added

- Initial release: quarantine management (list/search/filter, deliver,
  whitelist, block), Tracking Center (read-only lookup), per-admin PMG
  login (Help Desk role, no shared service account), dark/light theme,
  installable PWA.
- Docker packaging: single multi-stage `Dockerfile`, one Express process
  serving both `/api/*` and the built frontend.

### Fixed

- Login session cookie was never sent back to the browser when the app
  ran behind a TLS-terminating reverse proxy/tunnel (e.g. Cloudflare
  Tunnel). Express didn't trust the proxy's `X-Forwarded-Proto` header,
  so `req.secure` stayed `false` and `express-session` silently skipped
  `Set-Cookie` for the `cookie.secure: true` session cookie. Fixed by
  setting `app.set('trust proxy', 1)`.

### Changed

- Translated all frontend UI text and project documentation
  (`README.md`, `CLAUDE.md`, backend README, Docker Compose comments)
  from Turkish to English, and generalized references specific to the
  original deployment environment.

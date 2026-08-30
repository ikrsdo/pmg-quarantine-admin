# Changelog

All notable changes to this project are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
versioning follows [Semantic Versioning](https://semver.org/) - while the
project is in `0.x`, minor bumps may still include breaking changes.

## [Unreleased]

### Changed

- Quarantine detail's "Spam Score" and "Spam Test Details" sections, and
  Tracking Center detail's "Status" and "Message Events" sections, are
  now collapsible accordions on both mobile and desktop (Spam Score and
  Status open by default, Spam Test Details and Message Events closed).
- The Quarantine filter modal's "Recipient email" field is now a
  searchable dropdown instead of a plain select, so a long recipient
  list can be filtered by typing instead of scrolling.
- Quarantine detail's "Spam Test Details" section now has a "Copy"
  button (next to its heading, like Tracking Center's "Copy Log") that
  copies the spam test breakdown as plain text.

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

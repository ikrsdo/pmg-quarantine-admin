# Changelog

All notable changes to this project are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
versioning follows [Semantic Versioning](https://semver.org/) - while the
project is in `0.x`, minor bumps may still include breaking changes.

## [Unreleased]

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

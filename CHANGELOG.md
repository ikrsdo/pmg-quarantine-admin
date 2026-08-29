# Changelog

All notable changes to this project are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
versioning follows [Semantic Versioning](https://semver.org/) - while the
project is in `0.x`, minor bumps may still include breaking changes.

## [Unreleased]

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

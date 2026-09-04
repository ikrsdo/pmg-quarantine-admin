# PMG Quarantine Admin

English | [Türkçe](README.tr.md)

**Version:** 0.9.5 · [Changelog](CHANGELOG.md)

A mobile-first, fully responsive admin console for [Proxmox Mail
Gateway](https://www.proxmox.com/en/proxmox-mail-gateway) (PMG). It gives
mail/security admins a fast, dense interface for two things PMG's own web
UI doesn't do well on mobile: reviewing and acting on quarantined mail,
and looking up mail delivery status in the Tracking Center.

Runs as a single, separate Docker container - it never touches the PMG
appliance itself, only talks to it over the PMG API.

## Features

- **Dashboard** - the landing page after login: a 7-day overview with
  quarantine volume, message delivery status, and top senders/receivers.
- **Quarantine management** - covers all three PMG quarantine types
  (Spam, Virus, Attachment), switchable from the navigation. List,
  search/filter, and act on quarantined mail (deliver, whitelist,
  block), with a swipeable card list and multi-select bulk actions on
  mobile, and a dense data table on desktop. The block action requires
  a confirmation step.
- **Tracking Center** - look up a message's delivery status by sender,
  recipient, or filter, read-only. Each entry's syslog trail is shown
  as a structured, expandable Message Events timeline instead of raw
  log lines.
- **Cross-linking between Quarantine and Tracking Center** - a
  Quarantine message's detail page links to its best-effort matching
  Tracking Center entry, and back, so you don't have to search twice.
- **Saved filter presets and CSV export** on both the Quarantine and
  Tracking Center list pages.
- **Per-admin PMG login** - every admin authenticates with their own PMG
  account (Help Desk role), so PMG's own audit log correctly attributes
  actions to the individual admin instead of a shared service account. No
  PMG credentials are ever stored - only the short-lived ticket/CSRF
  token PMG issues, kept server-side in an httpOnly session cookie.
- **Dark/light theme**, installable as a PWA.
- **Update-check banner** - notifies you in-app when a newer release is
  available on GitHub, dismissible per version.
- **Demo mode** - try every screen with realistic mock data and no real
  PMG server, see [Demo mode](#demo-mode) below.

Out of scope: welcomelist/blocklist *policy* management (global or
per-domain) - use PMG's own UI for that.

## Screenshots

Captured from [demo mode](#demo-mode).

### Desktop

<table>
<tr>
<td width="50%"><img src="screenshots/desktop/01-desktop-dashboard.png" width="100%" alt="Dashboard"/><br/><sub>Dashboard</sub></td>
<td width="50%"><img src="screenshots/desktop/02-desktop-spam-quarantine-list.png" width="100%" alt="Spam quarantine list"/><br/><sub>Quarantine - spam list</sub></td>
</tr>
<tr>
<td width="50%"><img src="screenshots/desktop/03-desktop-spam-quarantine-message-details.png" width="100%" alt="Spam quarantine message details"/><br/><sub>Quarantine - spam message detail</sub></td>
<td width="50%"><img src="screenshots/desktop/04-desktop-virus-quarantine-list.png" width="100%" alt="Virus quarantine list"/><br/><sub>Quarantine - virus list</sub></td>
</tr>
<tr>
<td width="50%"><img src="screenshots/desktop/05-desktop-virus-quarantine-message-details.png" width="100%" alt="Virus quarantine message details"/><br/><sub>Quarantine - virus message detail</sub></td>
<td width="50%"><img src="screenshots/desktop/06-desktop-attachment-quarantine-list.png" width="100%" alt="Attachment quarantine list"/><br/><sub>Quarantine - attachment list</sub></td>
</tr>
<tr>
<td width="50%"><img src="screenshots/desktop/07-desktop-attachment-quarantine-message-details.png" width="100%" alt="Attachment quarantine message details"/><br/><sub>Quarantine - attachment message detail</sub></td>
<td width="50%"><img src="screenshots/desktop/08-desktop-tracking-center-list.png" width="100%" alt="Tracking Center list view"/><br/><sub>Tracking Center - list view</sub></td>
</tr>
<tr>
<td width="50%"><img src="screenshots/desktop/09-desktop-tracking-message-details.png" width="100%" alt="Tracking Center message details"/><br/><sub>Tracking Center - message detail</sub></td>
<td width="50%"><img src="screenshots/desktop/10-desktop-tracking-structured-message-events.png" width="100%" alt="Structured Message Events view"/><br/><sub>Tracking Center - structured Message Events</sub></td>
</tr>
</table>

### Mobile

<table>
<tr>
<td width="33%"><img src="screenshots/mobile/01-mobile-login.png" width="100%" alt="Login"/><br/><sub>Login</sub></td>
<td width="33%"><img src="screenshots/mobile/02-mobile-dashboard.png" width="100%" alt="Dashboard"/><br/><sub>Dashboard</sub></td>
<td width="33%"><img src="screenshots/mobile/03-mobile-quarantine-types-menu.png" width="100%" alt="Quarantine types menu"/><br/><sub>Quarantine - type menu</sub></td>
</tr>
<tr>
<td width="33%"><img src="screenshots/mobile/04-mobile-spam-quarantine-list.png" width="100%" alt="Spam quarantine list"/><br/><sub>Quarantine - spam list</sub></td>
<td width="33%"><img src="screenshots/mobile/05-mobile-spam-quarantine-message-details.png" width="100%" alt="Spam quarantine message details"/><br/><sub>Quarantine - spam message detail</sub></td>
<td width="33%"><img src="screenshots/mobile/06-mobile-virus-quarantine-list.png" width="100%" alt="Virus quarantine list"/><br/><sub>Quarantine - virus list</sub></td>
</tr>
<tr>
<td width="33%"><img src="screenshots/mobile/07-mobile-virus-quarantine-message-details.png" width="100%" alt="Virus quarantine message details"/><br/><sub>Quarantine - virus message detail</sub></td>
<td width="33%"><img src="screenshots/mobile/08-mobile-attachment-quarantine-list.png" width="100%" alt="Attachment quarantine list"/><br/><sub>Quarantine - attachment list</sub></td>
<td width="33%"><img src="screenshots/mobile/09-mobile-attachment-quarantine-message-details.png" width="100%" alt="Attachment quarantine message details"/><br/><sub>Quarantine - attachment message detail</sub></td>
</tr>
<tr>
<td width="33%"><img src="screenshots/mobile/10-mobile-swipe-left-deliver.png" width="100%" alt="Quarantine swipe to deliver"/><br/><sub>Quarantine - swipe to deliver</sub></td>
<td width="33%"><img src="screenshots/mobile/11-mobile-swipe-right-block.png" width="100%" alt="Quarantine swipe to block"/><br/><sub>Quarantine - swipe to block</sub></td>
<td width="33%"><img src="screenshots/mobile/12-mobile-tracking-center-list.png" width="100%" alt="Tracking Center list view"/><br/><sub>Tracking Center - list view</sub></td>
</tr>
<tr>
<td width="33%"><img src="screenshots/mobile/13-mobile-tracking-center-message-details.png" width="100%" alt="Tracking Center message details"/><br/><sub>Tracking Center - message detail</sub></td>
<td width="33%"><img src="screenshots/mobile/14-mobile-tracking-center-structured-message-events.png" width="100%" alt="Structured Message Events view"/><br/><sub>Tracking Center - structured Message Events</sub></td>
<td width="33%"></td>
</tr>
</table>

## Tech Stack

- **Backend:** Node.js/Express, acting as an auth + PMG API proxy
  (browser never talks to PMG directly - no CORS on the PMG API, and
  PMG's ticket/CSRF flow needs to stay server-side).
- **Frontend:** React + Tailwind CSS, mobile-first.
- **Packaging:** a single multi-stage Dockerfile - one Express process
  serves both the `/api/*` routes and the built frontend as static files.

## Prerequisites

- Docker and Docker Compose
- A PMG server reachable from wherever this container runs, and one PMG
  account per admin with the **Help Desk** role (Quarantine Manager alone
  can't access Tracking Center; Administrator/root@pam is unnecessary and
  not recommended)

## Setup

```bash
git clone https://github.com/ikrsdo/pmg-quarantine-admin.git
cd pmg-quarantine-admin
cp .env.example .env
```

Edit `.env` and set at least `PMG_BASE_URL` and `SESSION_SECRET` (see
[Configuration](#configuration) below). Then:

```bash
docker compose up -d --build
```

The app listens on port 3000 (`http://localhost:3000` for a quick local
check). Sign in with your own PMG username/password on the login screen.

## Demo mode

Want to try every screen (Quarantine spam/virus/attachment, Tracking
Center, Dashboard) without a real PMG server? Clone the repo into a
separate directory, set `DEMO_MODE=true` in that copy's own `.env`, and
run it as its own container:

```bash
git clone https://github.com/ikrsdo/pmg-quarantine-admin.git pmg-quarantine-admin-demo
cd pmg-quarantine-admin-demo
cp .env.example .env
# edit .env: set DEMO_MODE=true and your own SESSION_SECRET
docker compose up -d --build
```

Log in with `demo` / `demo`. The backend runs entirely against an
in-memory fake PMG - no `PMG_BASE_URL` is needed, nothing touches a
real PMG server or the network. The mock dataset (quarantine mail,
tracking entries) is realistic and medium-sized, and quarantine actions
(deliver/block/etc.) really mutate it, so the demo behaves like a live
system; the data resets whenever the process restarts. A "DEMO" badge
is shown in the sidebar/header so a demo instance can never be mistaken
for a real one. This is a separate, fully isolated instance - it does
not touch or interfere with a real, already-running deployment cloned
from the same repo.

> **Trying it over plain `http://` (no reverse proxy/tunnel)?** The
> session cookie requires HTTPS whenever `NODE_ENV=production` (see
> [Exposing it outside your local network](#exposing-it-outside-your-local-network))
> - without it, login won't persist. If you just want a quick local
> look at `http://<host>:3000` instead of putting the demo behind
> HTTPS, set `NODE_ENV=development` in that demo copy's `.env`. Safe to
> do only here: demo mode never holds real PMG credentials.

## Updating

To update to the latest version, run this from inside the project
directory (the one containing `docker-compose.yml`) to pull the new
code and rebuild the image:

```bash
cd pmg-quarantine-admin
sudo git pull && sudo docker compose up -d --build
```

Each rebuild leaves the previous image behind, now unreferenced
("dangling") - `docker compose up -d --build` doesn't clean those up
on its own. Remove them with:

```bash
sudo docker image prune -f
```

This only removes dangling (untagged, unused) images, so it's safe to
run after every update - it won't touch the image currently in use or
images belonging to other containers.

## Configuration

All configuration is via environment variables - see `.env.example` for
the full template.

| Variable | Description |
|---|---|
| `DEMO_MODE` | `true` to run against an in-memory fake PMG instead of a real one - see [Demo mode](#demo-mode) |
| `PMG_BASE_URL` | Base URL of your PMG server, e.g. `https://pmg.example.local:8006` (not required when `DEMO_MODE=true`) |
| `PMG_API_PATH` | PMG API path, normally `/api2/json` |
| `PMG_ALLOW_SELF_SIGNED` | `true` to accept PMG's self-signed certificate (typical for internal networks) |
| `NODE_ENV` | `production` (default, recommended) or `development` - also controls whether the session cookie requires HTTPS, see below |
| `PORT` | Port the backend listens on inside the container (default `3000`) - leave at `3000` unless you also update the port mapping in `docker-compose.yml` |
| `SESSION_SECRET` | Long random string used to sign session cookies - always set your own |

No PMG username/password ever goes in `.env` - each admin enters their
own credentials on the login screen at request time.

## Exposing it outside your local network

This project's `docker-compose.yml` only runs the `app` service - no
reverse proxy or tunnel is bundled. Put it behind whatever you already
use to expose internal services over HTTPS (Cloudflare Tunnel, nginx,
Traefik, Caddy, etc.), pointing at the container's published port.

The session cookie is marked `Secure` whenever `NODE_ENV=production`,
so the app must be accessed over HTTPS in that mode - a plain-HTTP
reverse proxy hop, or testing directly over `http://`, will cause the
login to silently fail to persist.

Adding an authentication layer (e.g. Cloudflare Access) in front of the
app, as a second factor before the PMG login screen, is recommended for
anything reachable from outside a trusted network.

## Security Notes

**Credentials and sessions**

- No PMG username/password ever touches `.env`, disk, or the browser -
  each admin's password is forwarded to PMG once at login time and
  never stored anywhere; only the short-lived ticket/CSRF token PMG
  issues is kept, server-side, tied to that admin's own httpOnly,
  `Secure` (in production), `SameSite=lax` session cookie. The session
  is regenerated on every successful login to prevent session fixation.
- Use a dedicated PMG account per admin (Help Desk role), never
  `root@pam` - see [Prerequisites](#prerequisites).
- `.env` is never committed - it holds no PMG credentials, only
  connection/session settings.

**Backend hardening**

- `/api/login` is rate-limited (20 attempts per 15 minutes per IP) to
  slow down PMG credential brute-forcing, the one endpoint reachable
  without an existing session.
- Every quarantine action is checked against a fixed whitelist of valid
  PMG actions (`deliver`, `delete`, `whitelist`, `blocklist`, etc.)
  before it's forwarded to PMG - arbitrary action strings are rejected.
  The app's current UI only exposes `deliver`, `whitelist`, and
  `blocklist`; the whitelist also allows the other PMG actions the API
  supports (`delete`, `mark-seen`, `mark-unseen`, `welcomelist`,
  `blacklist`), which may get UI buttons in a future version.
- Security headers (via [Helmet](https://helmetjs.github.io/)) are set
  on every response: `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, and removal of the `X-Powered-By` header, among
  others.
- The quarantined-mail HTML preview is rendered through PMG's own
  sanitizing formatter and loaded into a `sandbox=""` iframe on the
  frontend; the backend route that serves it also sends its own
  `Content-Security-Policy: sandbox` header as defense-in-depth against
  direct navigation to that URL.
- The Docker image runs as a non-root user, not root.
- Dependencies are checked with `npm audit` before each release (0
  known vulnerabilities as of this version).

**Network**

- Restrict network access to the PMG API to this container's network/VPN
  - don't expose the PMG API itself to the general internet.
- Treat `PMG_ALLOW_SELF_SIGNED=true` as a deliberate, documented choice
  for internal/lab networks, not a default to leave on blindly - a
  warning is logged on startup whenever it's enabled.
- See [Exposing it outside your local network](#exposing-it-outside-your-local-network)
  for HTTPS and reverse-proxy requirements.
- The one exception to "no outbound calls besides PMG": the browser
  calls the public, unauthenticated GitHub API
  (`api.github.com/repos/.../tags`) on load to check for a newer
  release and show an update banner. No credentials or app data are
  sent - only a plain `GET` request. Fails silently if GitHub is
  unreachable (e.g. an air-gapped deployment).

If you find a security issue, please open an issue (or contact the
maintainer directly for anything sensitive) rather than a public PR.

## Development

See `CLAUDE.md` for the full set of architecture decisions and PMG API
notes this project was built against, and `app/backend/README.md` for
backend-specific dev/test commands.

# PMG Quarantine Admin

A mobile-first, fully responsive admin console for [Proxmox Mail
Gateway](https://www.proxmox.com/en/proxmox-mail-gateway) (PMG). It gives
mail/security admins a fast, dense interface for two things PMG's own web
UI doesn't do well on mobile: reviewing and acting on quarantined mail,
and looking up mail delivery status in the Tracking Center.

Runs as a single, separate Docker container - it never touches the PMG
appliance itself, only talks to it over the PMG API.

## Features

- **Quarantine management** - list, search/filter, and act on quarantined
  mail (deliver, whitelist, block, delete), with a swipeable card list on
  mobile and a dense data table on desktop.
- **Tracking Center** - look up a message's delivery status and syslog
  trail by sender, recipient, or filter, read-only.
- **Per-admin PMG login** - every admin authenticates with their own PMG
  account (Help Desk role), so PMG's own audit log correctly attributes
  actions to the individual admin instead of a shared service account. No
  PMG credentials are ever stored - only the short-lived ticket/CSRF
  token PMG issues, kept server-side in an httpOnly session cookie.
- **Dark/light theme**, installable as a PWA.

Out of scope: welcomelist/blocklist *policy* management (global or
per-domain) - use PMG's own UI for that.

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
git clone <this-repo-url>
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

## Configuration

All configuration is via environment variables - see `.env.example` for
the full template.

| Variable | Description |
|---|---|
| `PMG_BASE_URL` | Base URL of your PMG server, e.g. `https://pmg.example.local:8006` |
| `PMG_API_PATH` | PMG API path, normally `/api2/json` |
| `PMG_ALLOW_SELF_SIGNED` | `true` to accept PMG's self-signed certificate (typical for internal networks) |
| `NODE_ENV` | `production` in deployment - also controls whether the session cookie requires HTTPS |
| `PORT` | Port the backend listens on (default `3000`) |
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

- Use a dedicated PMG account per admin (Help Desk role), never
  `root@pam`.
- `.env` is never committed - it holds no PMG credentials, only
  connection/session settings.
- Restrict network access to the PMG API to this container's network/VPN
  - don't expose the PMG API itself to the general internet.
- Treat `PMG_ALLOW_SELF_SIGNED=true` as a deliberate, documented choice
  for internal/lab networks, not a default to leave on blindly.

## Development

See `CLAUDE.md` for the full set of architecture decisions and PMG API
notes this project was built against, and `app/backend/README.md` for
backend-specific dev/test commands.

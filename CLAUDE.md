# PMG Quarantine Admin - Project Context

This file is meant as reference for Claude Code throughout the project.
When a new session starts, read this file and stick to the decisions
below.

## Purpose

A web interface for Proxmox Mail Gateway (PMG), mobile-first and fully
responsive, for admin use only. Scope is strictly limited to two screen
groups:

1. **Quarantine management** - primary, main screen
2. **Tracking Center (mail tracking)** - second priority, but included
   from the start (not deferred to a later phase)

**Policies (welcomelist/blocklist management screens) are OUT OF SCOPE
for this project.** This was a deliberate decision - if global/per-user
list management is needed, it will be done from PMG's own interface.
Apply this decision without re-litigating it; don't ask "should we add a
policies screen too?" again.

Target user: mail/security admins. This is NOT an end-user (mailbox
owner) interface - PMG's own `/quarantine` endpoint already covers that.

## Auth / Login Flow (settled decision)

**There is NO fixed "service account" in the env.** Each admin logs into
PMG with **their own** username/password, via the following flow:

1. The admin enters their own PMG username/password on the app's login
   screen (not env values - form input).
2. The backend sends this to PMG via `POST /access/ticket` (see "PMG API
   Notes" below).
3. The returned `ticket` + `CSRFPreventionToken` are stored in the
   backend, tied to that admin's own app session (httpOnly, secure
   session cookie). **The password itself is never stored** - only the
   ticket/CSRF token PMG returns is kept.
4. All of that admin's subsequent PMG API calls (listing quarantine,
   delivering mail, viewing tracking center, etc.) go to PMG using their
   own ticket. This keeps PMG's own audit/log entries correctly
   attributed to the individual admin instead of a shared account.
5. PMG tickets expire. When a ticket expires, the admin is shown the
   login screen again (re-enters their password) - don't try to build a
   "silent refresh" mechanism; it isn't practical here since the
   password is never stored server-side to refresh with.

**How least-privilege is enforced:** via each admin's own PMG account,
not a shared service account. Every admin should have their own PMG
account with the **Help Desk** role (NOT root@pam) - see the "PMG
account" note below. No credentials are kept in the env file; the
service-account fields that used to be in `.env.example` were removed.

## Architecture Decisions (ask before changing)

- **Runs as a separate server / Docker container** - NOT installed on
  the PMG appliance itself. PMG is only reached over the network (API).
- **Reverse proxy: bring your own** - this project's Docker Compose only
  contains the `app` service; no tunnel or reverse-proxy container is
  bundled. The app container's port is published to the host, and
  whatever reverse proxy or tunnel you already run elsewhere in your
  infrastructure (Cloudflare Tunnel, nginx, Traefik, etc.) gets a new
  ingress/hostname rule pointing at that port. The inbound port itself
  is never exposed directly to the internet. An additional
  authentication layer (e.g. Cloudflare Access) in front of the PMG
  login is a good idea, but policy details are left to the deployer.
- **Docker-authoring experience assumption:** the person maintaining
  this repo is comfortable *operating* Docker day to day (running
  containers, `docker compose up -d --build`, `logs -f`, `down`) but not
  necessarily experienced *authoring* Dockerfiles or compose files from
  scratch. So: no need to keep re-explaining basic compose commands, but
  do keep the Dockerfile/compose structure itself simple and readable -
  avoid unnecessary multi-stage complexity or image-optimization tricks
  beyond what's needed.
- **A backend proxy/API layer is required** because:
  - The PMG API has no CORS support, so the browser can't call it
    directly
  - PMG mostly uses a self-signed certificate
  - Each admin's own PMG ticket (session) + CSRF token must be kept in
    the backend, tied to that admin's app session, and never leaked to
    the frontend (see "Auth / Login Flow" above - there is no shared
    service account, each admin logs in with their own PMG account)
- **Frontend: mobile-first, responsive** - also used on desktop, but
  priority is a fast, one-handed quarantine list/detail/action flow on
  mobile. Being installable as a PWA (add to home screen) is preferred.

## Design Direction (Frontend)

Proceeding without a visual reference (Figma/Stitch mockup) - design
decisions should follow the guidance below, but start with a short plan
(color palette, typography, layout concept) before proceeding; don't
default to a generic/random admin-panel look.

- **Audience and tone:** not an end user, an IT/mail admin. Dense,
  utilitarian, trustworthy feel - professional admin-panel aesthetic
  like Linear, the Vercel dashboard, or the Cloudflare dashboard. Do NOT
  give it a playful/consumer-app feel.
- **Theme:** dark theme by default, light theme available via toggle.
- **Color coding (meaningful, must be followed exactly):**
  - Spam score / status badges: low risk = green, medium = amber,
    high = red
  - "Deliver" action = green
  - "Block sender" action = red (destructive, requires a confirmation
    step)
  - "Whitelist" action = neutral/blue
- **Typography:** a clean sans-serif body font + a monospace font for
  technical data (IP addresses, message IDs, timestamps, headers).
- **Layout - mobile (priority):**
  - Quarantine list: not a table, a card-based list. Swiping a card
    reveals "Deliver" (right/green) and "Block" (left/red) actions.
  - A search/filter bar at the top; filters open in a bottom sheet.
  - A "selection mode" toggle for bulk actions.
  - In the detail screen, a sticky bottom action bar with Deliver /
    Whitelist / Block buttons; all three require a confirmation step
    (`CONFIRM_COPY` in `QuarantineDetailPage.jsx`).
- **Layout - desktop:**
  - The quarantine list becomes a dense data table instead of mobile's
    card layout: checkbox, sender, subject, recipient, date, spam-score
    badge, quick action icons at the end of the row.
  - A fixed left-hand navigation (Quarantine / Tracking Center).
  - Two-column detail screen: metadata + spam score breakdown on the
    left, email preview/header tabs on the right. Action buttons as a
    button group at the top of the page, not a sticky bottom bar.
- **Components:** status badges, swipeable list rows, tabbed content
  views (e.g. Preview / Headers), empty states and loading (skeleton)
  states designed separately for each main screen.
- **App name:** always exactly "PMG Quarantine Admin" everywhere - do
  NOT invent a different name (e.g. "MailGuard", "Sentinel", etc.).
- **Initial screen order:** Login -> Quarantine List -> Quarantine
  Detail -> Tracking Center List -> Tracking Center Detail. No Policies
  screen, out of scope (see "Purpose").

## PMG API Notes

Base: `https://<pmg-host>:8006/api2/json`

| Function | Endpoint |
|---|---|
| Login (get ticket) | `POST /access/ticket` (form-urlencoded: username, password) |
| Version/health | `GET /version` |
| Quarantine list | `GET /quarantine/spam\|virus\|attachment` (`starttime`/`endtime` unix timestamp, `pmail` optional) |
| Quarantine content | `GET /quarantine/content?id=&raw=1` |
| Quarantine action | `POST /quarantine/content` (`id`, `action`) |
| Quarantine attachments | `GET /quarantine/listattachments?id=` (Attachment Quarantine detail; returns `[{id, size, name, content-type}]`) |
| Tracking center | `GET /nodes/{node}/tracker` (`starttime`/`endtime`, `xfilter`, `from`, `target`, `ndr`, `greylist`, `limit` optional) |
| Tracking center detail | `GET /nodes/{node}/tracker/{id}` (returns that mail's syslog entries) |
| Global welcomelist | `GET /config/welcomelist/objects`, add via `POST .../email\|domain\|regex`, delete via `DELETE .../objects/{id}` (OUT OF SCOPE - no Policies screen is being built, kept here for reference only) |
| Per-user lists | `/quarantine/welcomelist` and `/quarantine/blocklist` (via the `pmail` parameter) |

**Critical details (verified against the official source - see "Official
API reference" below):**
- `id` is not a plain number, it's a string in the `C\d+R\d+T\d+` pattern
  (e.g. `C1R2T1700000000`). Multiple IDs are joined with `;`
  (`id1;id2;id3`).
- The `action` field on `POST /quarantine/content` accepts these enum
  values: `welcomelist`, `blocklist`, `whitelist`, `blacklist`,
  `deliver`, `delete`, `mark-seen`, `mark-unseen`.
  - `welcomelist`/`whitelist` do the same thing: the sender is added to
    the welcome list AND the mail is delivered.
  - `blocklist`/`blacklist` do the same thing: the sender is added to
    the block list AND the mail is deleted (not delivered).
  - `deliver` only delivers, doesn't touch any list.
  - `delete` only deletes, doesn't touch any list.
- Each mail object returned by `GET /quarantine/spam` has `id`, `bytes`,
  `from`, `sender` (optional), `receiver`, `subject`, `time` (unix
  timestamp), `spamlevel` (spam score, number), `score-positive`/
  `score-negative` (optional), `seen` (boolean, optional).
- There's a separate formatter for a sanitized HTML mail view:
  `/api2/htmlmail/quarantine/content` (instead of the usual
  `/api2/json/...`).

**IMPORTANT CONSTRAINT - Tracking Center has NO mail subject:**
`GET /nodes/{node}/tracker` only returns: `id`, `from`, `to`, `qid`,
`time`, `dstatus`, `rstatus`, `relay`, `size`, `client`, `msgid`. There
is no subject/header information in this endpoint, and it cannot be
retrieved from the API in any way - this isn't a missing parameter, the
data simply doesn't exist at the source. Reason: Tracking Center is fed
from Postfix's syslog entries; beyond the envelope info
(from/to/time/size), Postfix never parses the mail content/headers at
all. Quarantine endpoints return a subject because that data comes from
PMG's own content filter (`pmg-smtp-filter`), which writes it to the
`CMailStore.Header` table - a table that's only populated for quarantined
mail, never for general/delivered mail.

Known alternative (OUT OF SCOPE, DO NOT IMPLEMENT, kept for information
only): if PMG's `mail.log-headers` config option (off by default) is
enabled, `pmg-smtp-filter` writes a separate syslog line with
subject/from/to for every processed mail (including non-quarantined
ones). But this is an out-of-band channel (requires reading the syslog
file directly / log forwarding), doesn't auto-correlate with Tracking
Center's own IDs, and logging every mail's subject line continuously
raises a real privacy/compliance question. This path was deliberately
rejected for now - don't add or suggest this feature unless it comes up
again explicitly.

Auth note: the `/access/ticket` response returns both `ticket` and
`CSRFPreventionToken` in the JSON body (PMG does NOT set this
automatically as a Set-Cookie - PMG's own web UI reads the ticket in JS
and sets the cookie manually). Your backend must attach this `ticket`
value as a cookie named **`PMGAuthCookie`** on subsequent requests to
PMG - this name isn't a guess, it's verified directly from the
`pmgproxy` service's source (`src/PMG/Service/pmgproxy.pm`,
`server_config => { cookie_name => 'PMGAuthCookie' }`), no need to
second-guess it. GET requests only need this cookie; POST/PUT/DELETE
requests also need the `CSRFPreventionToken` header
(`CSRFPreventionToken: <token>`).

**Official API reference - REQUIRED, primary source:** for any ambiguity
about the API, a missing parameter, or a new endpoint need, check this
repo FIRST - don't guess or rely on general web search:

https://github.com/proxmox/pmg-api

This is Proxmox's officially published source for the PMG API backend
daemon. Every `.pm` file under `src/PMG/API2/` declares that API group's
endpoints (parameters, types, required/optional, return schema,
permission requirements) as Perl-based declarative JSON Schema - i.e.
this is the actual running code, not "probably how it works". The table
and details above were derived from these files. Relevant files:
- Quarantine: `src/PMG/API2/Quarantine.pm`
- Tracking Center: `src/PMG/API2/MailTracker.pm`
- Global welcomelist/blocklist: `src/PMG/API2/SMTPWelcomelist.pm`
- All other endpoint groups: the whole `src/PMG/API2/` folder

For a new endpoint, database/config schema questions (which fields are
stored, what a given table holds) can also be checked against the
`CREATE TABLE` definitions in `src/PMG/DBTools.pm` - so "can this data
even be fetched from the API" gets answered against the real schema
instead of a guess (this is how the Tracking Center subject constraint
above was determined).

To clone and inspect this repo (if internet access is available):
`git clone --depth 1 https://github.com/proxmox/pmg-api.git`

The interactive/visual API viewer running on your own PMG server is also
a secondary reference - Claude Code can't browse it automatically (it's
JS-rendered, behind admin login), so check it manually in a browser and
update this file if needed:
- Your own PMG server's live, version-specific API viewer:
  `https://<pmg-server-address>:8006/pmg-docs/api-viewer/index.html`
- Public/general reference (sometimes incomplete):
  https://pmg.proxmox.com/pmg-docs/api-viewer/

PMG account: there is no shared/single "service account" (see "Auth /
Login Flow" above). Every admin needs their own PMG account, never
`root@pam`. Role choice matters: the **Quarantine Manager role cannot
access Tracking Center** (per official PMG docs: "Has no right to view
any other data" - quarantine/blocklist/welcomelist management only).
Since this app needs both Quarantine and Tracking Center, every admin's
account should use the **Help Desk** role - a role PMG defines that
combines Auditor (read-only general data/Tracking Center access) with
Quarantine Manager (quarantine management) permissions (available roles
are Administrator, Help Desk, Quarantine Manager, Auditor). Assume
accounts are created with this role when writing backend/auth code; if
you get a 403 with a different role, check this note first.

## Technology Choices

- Backend: Node.js/Express (proxy + ticket management + storing the
  session as an httpOnly cookie). Ask before changing this.
- Frontend: React + Tailwind CSS (mobile-first breakpoints), or adjust
  if a different preference is stated.
- Container: Docker + docker-compose, only the `app` service (no
  reverse proxy/tunnel container - see "Architecture Decisions").

## Security Requirements

- PMG credentials (username/password) must never persist in the
  frontend/browser. The password is entered once on the login form, sent
  to the backend, forwarded to PMG, and never stored anywhere after that
  - only the ticket/CSRF token PMG returns is kept in the backend.
- The backend accepts self-signed certificates on requests to PMG
  (controllable via an env var), but this should be a deliberate,
  logged/documented choice in production.
- `.env` is never committed (`.gitignore`). No PMG credentials are kept
  in `.env` (see "Auth / Login Flow") - only account-independent settings
  like `PMG_BASE_URL`, `PORT`, `SESSION_SECRET`.
- Each admin's ticket/CSRF token is kept in the backend, tied to that
  admin's own app-session cookie; the frontend only ever talks to the
  backend via its own httpOnly session cookie and never sees the ticket.
- `/api/login` is rate-limited (20 attempts / 15 min per IP,
  `server.js`) against PMG credential brute-forcing - it's the one
  endpoint reachable without an existing session.
- Security response headers are set on every response via
  [Helmet](https://helmetjs.github.io/) (`X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, `X-Powered-By` removal).
  CSP is deliberately left disabled (`contentSecurityPolicy: false` in
  `server.js`) - the frontend relies on inline `style` attributes (iOS
  backdrop-blur compositing fix, login page gradient) that a default
  CSP's `style-src` would block. Don't re-enable it without also
  reworking those inline styles.
- The quarantined-mail HTML preview (`GET /api/quarantine/:id/preview`)
  sends its own `Content-Security-Policy: sandbox` header, as
  defense-in-depth against someone navigating the browser directly to
  that URL (the frontend only ever loads it via `fetch()` into a
  sandboxed iframe's `srcDoc`).
- Every quarantine action is checked against a fixed whitelist of valid
  PMG actions before being forwarded to PMG - see "PMG API Notes"
  above for the enum. The UI only wires up `deliver`/`whitelist`/
  `blocklist` (buttons in `QuarantineDetailPage.jsx` and
  `QuarantineListPage.jsx`); the whitelist itself allows the rest of
  the enum too, in case they get UI buttons later.
- The Docker image runs as a non-root user (see `Dockerfile`).

## Status

Feature-complete per "Purpose" above and actively maintained - the
current version and full release history live in `README.md` /
`CHANGELOG.md` (and their `.tr.md` Turkish translations); don't
duplicate that history here. What follows are implementation details
worth remembering that aren't spelled out in the changelog:

- **Node name resolution:** the `{node}` value in
  `/nodes/{node}/tracker...` paths is not a fixed config value - it's
  fetched from PMG itself via `GET /nodes` (a root-level endpoint,
  `src/PMG/API2/Nodes.pm`), which returns `[{node: "<hostname>"}]`; the
  first (only) node name is used. The backend resolves this once via
  `getNodeName()` in `pmgClient.js` and caches it for the process's
  lifetime (a server-wide constant, not per-session).
- **`trust proxy` must stay set:** `app.set('trust proxy', 1)` in
  `server.js`, before the session middleware, is required for the
  session cookie to persist behind any TLS-terminating reverse proxy or
  tunnel (Cloudflare Tunnel, nginx, etc.) - without it, `req.secure`
  stays `false` and `express-session` silently skips `Set-Cookie` for
  the `cookie.secure: true` session cookie, causing a silent login
  loop. Confirmed fixed and running in production behind Cloudflare
  Tunnel. Removing this line silently reintroduces that bug.
  `PMGAuthCookie`'s cookie name (the cookie PMG itself expects) was
  verified against the official PMG source (see "Auth note" above) and
  isn't expected to change.
- **Backend test suite:** `app/backend/` has 16 tests (`npm test`),
  PMG API calls mocked with `nock` - no real PMG server needed. Also
  manually verified against a real PMG with curl (see
  `app/backend/README.md`).
- **Frontend structure:** a shared left navigation (`AppShell.jsx`)
  wraps the Quarantine List and Tracking List pages - a fixed sidebar
  on desktop, a top tab bar on mobile. On desktop, opening a
  message/entry shows its detail as a right-side drawer over the list
  instead of navigating away (list stays mounted, filters/sort/scroll
  preserved); a direct link or page refresh still opens the full
  standalone detail page. Tracking Center stays read-only (no
  swipe/bulk actions, per scope), status badges follow PMG's
  `$statmap` (2/4/5/N/G/A/B/Q), and the subject/header field is never
  shown or implied anywhere (not available in the API, see "IMPORTANT
  CONSTRAINT" above).
- **Docker packaging:** `app/Dockerfile` is two-stage - stage 1 builds
  the frontend (`npm run build`), stage 2 installs backend production
  dependencies and copies the backend code plus stage 1's `dist/`
  output into `backend/public`; a single Express process serves both
  `/api/*` routes and the static frontend (with SPA fallback) - no
  separate containers. `docker-compose.yml` has a simple healthcheck
  (`GET /api/health`).
- **Quarantine type-awareness:** the Quarantine screen group covers
  all three PMG quarantine types (spam/virus/attachment), not just
  spam. The selected type lives in the URL (`?type=spam|virus|
  attachment`, default `spam`) via `useSearchParams` on both the list
  and detail pages - not component state - so it survives navigation,
  back/forward, and refresh. `pmgClient.getQuarantineList` validates
  `type` against `VALID_QUARANTINE_TYPES` before forwarding to PMG's
  `/quarantine/spam|virus|attachment`. Desktop nav shows "Quarantine"
  as an expandable sidebar group with the three sub-links; mobile
  shows a dropdown under the "Quarantine" tab; both compute active
  state manually (`pathname` + the `type` query param) rather than
  relying on `NavLink`'s path-only matching, since that would mark all
  three type links "active" simultaneously. List/card/detail
  components branch on `type`: virus name badge, blocked-attachments
  list (via the new `listattachments` endpoint, see "PMG API Notes"),
  or the existing spam-score badge. The Dashboard is unaffected and
  stays spam-only by design.
- **Update-check banner (the one direct browser→external-API call):**
  `UpdateBanner.jsx`, mounted in `AppShell.jsx` (so it shows on
  Dashboard/Quarantine/Tracking, not the two standalone detail pages,
  whose mobile layout has its own `fixed bottom-0` action bar it would
  collide with), fetches `https://api.github.com/repos/<repo>/tags`
  directly from the browser on load - no backend proxy - since that
  endpoint is public and CORS-open (`access-control-allow-origin: *`).
  This is a deliberate, narrow exception to the "backend proxies
  everything" pattern used for PMG; don't route it through the backend
  without a reason to. It parses every tag as semver and takes the true
  max (GitHub doesn't guarantee array order), compares it to the
  running app's own `package.json` version, and fails silently on any
  fetch error (offline, rate-limited, air-gapped deployment). Dismissal
  is stored in `localStorage` keyed by the dismissed version, not a
  one-time flag, so it reappears for the next actually-newer release.
- **Demo mode:** `DEMO_MODE=true` (env var, `config.js`) swaps which
  module `pmgClient.js` exports - `mockPmgClient.js` (an in-memory fake
  PMG with the identical exported function interface) instead of the
  real client - so no route file needs to know demo mode exists. Login
  is hardcoded to `demo`/`demo`; `PMG_BASE_URL` isn't required in this
  mode. The mock dataset (quarantine mail, tracking entries) is
  generated once at process start and quarantine actions
  (deliver/delete/whitelist/blocklist/mark-seen/mark-unseen) really
  mutate it in memory, so the demo behaves like a live system - state
  resets on restart, nothing persists, nothing touches the network.
  Tracking Center's mock timestamps are deliberately skewed recent
  (`randomTrackingTime`, `mockPmgClient.js`) because its default UI
  filter is a narrow "last hour" window (unlike Quarantine's default
  7-day window) - a uniform 7-day spread would make the demo Tracking
  Center open empty most of the time. Mock syslog lines are built via
  `logLine()` (`mockPmgClient.js`), which prefixes each line with a
  classic-syslog timestamp+hostname (`Mon D HH:MM:SS pmg-demo ...`) -
  without that prefix the frontend's log parser
  (`trackingLogEvents.js`'s `LINE_RE`) can't categorize the line and
  the Message Events timeline falls back to "No recognized events".
  `buildTrackingDataset()` also seeds its first 15 entries from real
  quarantine mail (same from/to/time, status `Q`) instead of fully
  independent random data, so the Quarantine <-> Tracking Center
  cross-link (`trackingSearchFilters` in `QuarantineDetailPage.jsx`,
  which matches by sender+recipient+/-15min) actually resolves to a
  match in the demo. A `demoMode` boolean is threaded from
  `/api/auth/me` and `/api/login` through `useAuth` to `AppShell`,
  which shows an amber "DEMO" badge next to the app name on desktop
  and next to the logged-in account name on mobile, so a demo instance
  can never be mistaken for a real one. Meant to run as a fully
  separate container/instance (its own `.env`, own `docker compose
  up`), never alongside a real deployment's data - see README.md >
  "Demo mode". The README screenshots (`screenshots/desktop`,
  `screenshots/mobile`) are captured from this mode.

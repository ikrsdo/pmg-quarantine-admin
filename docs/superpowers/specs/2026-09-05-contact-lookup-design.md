# Contact Lookup ("Kişi Arama") — Design (planned, not implemented)

Status: **Planned only.** Not scheduled, not implemented. Kept here so
the design isn't lost before we decide to build it.

## Motivation

User asked for feature ideas addable to the app that create real value
beyond what PMG's own UI already offers, ideally involving cross-message
correlation. Two earlier ideas from the same brainstorm (Tracking Center
<-> Quarantine cross-linking, and a structured per-message event
timeline) are already implemented (see CLAUDE.md's "Demo mode" section,
`trackingSearchFilters` in `QuarantineDetailPage.jsx`, and
`trackingLogEvents.js`). This is the third idea, not yet built.

Postfix queue management (viewing/holding/flushing/deleting queued mail)
was researched as a candidate first and **rejected**: PMG's
`PMG::API2::Postfix` exposes full queue CRUD, but every write/read-detail
endpoint (`read_queued_mail`, `flush_queued_mail`, `delete_queued_mail`,
`queue_action`, `delete_queue`, `delete_all_queues`, `flush_queues`,
`discard_verify_cache`) requires the `admin` role specifically - `helpdesk`
(which PMG treats as `qmanager` + `audit` for permission checks, see
`PMG::RESTEnvironment::check_api2_permissions`) only passes on endpoints
whose allowed-role list contains `audit` or `qmanager`. Only the two
read-only endpoints (`mailq` list, `qshape`) qualify. Since every admin
account in this app uses the Help Desk role by design (see CLAUDE.md's
"PMG account" note), a queue management screen would only ever be able to
view queues, never act on them - not enough value to justify a new
screen. Abandoned in favor of this idea instead.

## What it is

A search screen: enter an email address, see everything PMG knows about
that address in one place - quarantine history, tracking history, and
mail volume statistics - instead of three separate searches across two
existing screens plus PMG's own UI (which has no such combined view at
all).

## Permissions check (done)

All endpoints this feature needs are confirmed reachable by the `helpdesk`
role (every admin account's role per CLAUDE.md):

| Data | Endpoint | Required role | helpdesk OK? |
|---|---|---|---|
| Quarantine (spam/virus/attachment) filtered by `pmail` | `GET /quarantine/spam\|virus\|attachment` | `admin, qmanager, audit, quser` | yes |
| Tracking Center filtered by `xfilter` | `GET /nodes/{node}/tracker` | `admin, audit` | yes |
| Mail volume/traffic/virus count for an address | `GET /statistics/contact` (`PMG::API2::Statistics`, new to this app) | `admin, qmanager, audit` | yes |

Note on `xfilter` (`PMG::API2::MailTracker`): it's a generic substring
filter over a tracker entry, not sender/receiver-specific - one call
with `xfilter=<email>` already matches the address whether it appears as
sender or receiver, so no need for two separate `from=`/`target=` calls.

## Backend changes

- New `pmgClient.getContactStatistics(session, { filter, starttime, endtime })`
  → `GET /statistics/contact` (mirrors the shape of existing
  `getTrackingList`/`getQuarantineList`; this endpoint is node-independent,
  no `getNodeName()` call needed).
- New `routes/statistics.js`: `GET /api/statistics/contact?email=&starttime=&endtime=`,
  same thin pass-through + `handlePmgError` pattern as `routes/quarantine.js`
  and `routes/tracking.js`.
- No changes needed to `getQuarantineList`/`getTrackingList` - both
  already accept the filters this feature needs (`pmail`, `xfilter`).
- No combining/aggregation endpoint on the backend - the frontend fires
  the requests in parallel and renders three independent sections, same
  as the rest of the app's "thin backend, smart frontend" pattern.

## Frontend changes

- New page `LookupPage.jsx`, new route `/lookup` (protected, like the
  others).
- One search input (email address) at the top.
- On submit, parallel React Query calls:
  - `getQuarantineList('spam'|'virus'|'attachment', { pmail: email })` x3
  - `getTrackingList({ xfilter: email })`
  - `getContactStatistics({ filter: email })`
- Summary cards at top from the statistics call: total mail count,
  traffic (bytes), virus count.
- Two result sections below, each reusing existing components as-is
  (no new list/card components):
  - Quarantine results → `QuarantineCard`/`QuarantineTable`, clicking
    opens the existing quarantine detail drawer/page.
  - Tracking results → the existing tracking list rendering, clicking
    opens the existing tracking detail page.
- Default time range: last 30 days (wider than Quarantine's 7-day and
  Tracking's 1-hour defaults, since this is a retrospective
  "investigate this address" tool, not a live monitoring view) - a date
  range picker at the top lets it be changed, consistent with the
  existing filter bottom-sheet pattern.

## Mobile navigation change (needed regardless of when this ships)

Current mobile top tab bar is at capacity: Dashboard / Quarantine
(dropdown) / Tracking already fill it (per user: "menümüz mobil ekranda
şu anki 3 sayfa ile artık tamamen doldu"). Adding a 4th always-visible
tab doesn't scale to this feature or future ones.

Proposed fix: add a 4th tab, "Diğer" (More), using the same
anchored-dropdown pattern the Quarantine tab's own submenu already uses
(and that `ActionsTrigger` uses elsewhere) - opens a small menu listing
secondary screens. Lookup would be the first item in it. This is a
one-time nav restructuring that then absorbs future additions without
touching the nav shape again.

Desktop is unaffected - the sidebar has room for a plain new `NavLink`
(no crowding problem there).

## Scope classification

Bounded, per `superpowers:brainstorming` - built entirely on existing
flows (quarantine list/detail, tracking list/detail, the dropdown-menu
pattern), plus one new thin statistics endpoint. Not architectural: no
new subsystem, no new interface other teams/consumers depend on.

## Status / next step

Approved as a design, explicitly **not** approved for implementation yet
(user: "bu özelliği planlayalım ama uygulamayalım" - let's plan this
feature but not implement it). Revisit this file when ready to build;
nothing here has been coded.

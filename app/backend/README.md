# Backend

Proxy/auth layer for the PMG API.

## Setup

```bash
cd app/backend
npm install
```

The `.env` file at the repo root (see `.env.example`) is loaded
automatically when running locally.

## Running

```bash
npm run dev     # with --watch
npm start       # normal
```

## Tests

```bash
npm test
```

PMG API calls are mocked with `nock` - no real PMG server needed.

## Manual verification against a real PMG server

```bash
# Login (gets a ticket, writes the session cookie to jar.txt)
curl -i -c jar.txt -X POST http://localhost:3000/api/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"your-pmg-username@pmg","password":"..."}'

# Quarantine list
curl -i -b jar.txt http://localhost:3000/api/quarantine

# Single message
curl -i -b jar.txt http://localhost:3000/api/quarantine/<id>

# Action (deliver/whitelist/blocklist/...)
curl -i -b jar.txt -X POST http://localhost:3000/api/quarantine/<id>/action \
  -H 'Content-Type: application/json' -d '{"action":"deliver"}'

curl -i -b jar.txt -X POST http://localhost:3000/api/logout
```

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/login` | - | `{username, password}` → logs into PMG, sets a session cookie |
| POST | `/api/logout` | - | Clears the session |
| GET | `/api/quarantine` | ✓ | Query: `starttime`, `endtime`, `pmail` (all optional) |
| GET | `/api/quarantine/:id` | ✓ | Message content + headers |
| POST | `/api/quarantine/:id/action` | ✓ | `{action}` - `deliver`, `delete`, `whitelist`, `welcomelist`, `blocklist`, `blacklist`, `mark-seen`, `mark-unseen` |

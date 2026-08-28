const https = require('https');
const axios = require('axios');
const config = require('./config');

// PMG (Proxmox) ticket cookie name follows the product's own convention
// (PVE -> PVEAuthCookie). Verify against a real PMG instance on first
// login test; if wrong, PMG will reject GET calls with 401 even though
// login succeeded.
const TICKET_COOKIE_NAME = 'PMGAuthCookie';

const httpsAgent = new https.Agent({
  rejectUnauthorized: !config.pmg.allowSelfSigned,
});

const client = axios.create({
  baseURL: `${config.pmg.baseUrl}${config.pmg.apiPath}`,
  httpsAgent,
  timeout: 15000,
  validateStatus: () => true, // we inspect status ourselves everywhere
});

class PmgApiError extends Error {
  constructor(status, body) {
    super(`PMG API error (${status})`);
    this.status = status;
    this.body = body;
  }
}

function authHeaders(session) {
  return {
    Cookie: `${TICKET_COOKIE_NAME}=${session.pmgTicket}`,
  };
}

function writeHeaders(session) {
  return {
    ...authHeaders(session),
    CSRFPreventionToken: session.pmgCsrfToken,
  };
}

async function login(username, password) {
  const body = new URLSearchParams({ username, password });
  const res = await client.post('/access/ticket', body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (res.status !== 200) {
    throw new PmgApiError(res.status, res.data);
  }
  const data = res.data?.data;
  if (!data?.ticket || !data?.CSRFPreventionToken) {
    throw new PmgApiError(502, 'PMG login response missing ticket/CSRF token');
  }
  return {
    pmgUsername: data.username || username,
    pmgTicket: data.ticket,
    pmgCsrfToken: data.CSRFPreventionToken,
    ticketIssuedAt: Date.now(),
  };
}

async function getQuarantineList(session, { starttime, endtime, pmail } = {}) {
  const params = {};
  if (starttime !== undefined) params.starttime = starttime;
  if (endtime !== undefined) params.endtime = endtime;
  if (pmail !== undefined) params.pmail = pmail;

  const res = await client.get('/quarantine/spam', {
    headers: authHeaders(session),
    params,
  });
  if (res.status !== 200) {
    throw new PmgApiError(res.status, res.data);
  }
  return res.data?.data ?? [];
}

async function getQuarantineContent(session, id) {
  const res = await client.get('/quarantine/content', {
    headers: authHeaders(session),
    params: { id, raw: 1 },
  });
  if (res.status !== 200) {
    throw new PmgApiError(res.status, res.data);
  }
  return res.data?.data;
}

// Node name isn't in config - PMG's own API requires it as a path segment
// for node-scoped endpoints (/nodes/{node}/...). It's server-wide (not
// per-user), so cache it once per backend process instead of refetching
// on every tracking request.
let cachedNodeName = null;

async function getNodeName(session) {
  if (cachedNodeName) return cachedNodeName;
  const res = await client.get('/nodes', { headers: authHeaders(session) });
  if (res.status !== 200) {
    throw new PmgApiError(res.status, res.data);
  }
  const nodes = res.data?.data ?? [];
  if (!nodes[0]?.node) {
    throw new PmgApiError(502, 'PMG /nodes response missing node name');
  }
  cachedNodeName = nodes[0].node;
  return cachedNodeName;
}

async function getTrackingList(session, { starttime, endtime, xfilter, from, target, ndr, greylist, limit } = {}) {
  const node = await getNodeName(session);
  const params = {};
  if (starttime !== undefined) params.starttime = starttime;
  if (endtime !== undefined) params.endtime = endtime;
  if (xfilter) params.xfilter = xfilter;
  if (from) params.from = from;
  if (target) params.target = target;
  if (ndr !== undefined) params.ndr = ndr;
  if (greylist !== undefined) params.greylist = greylist;
  if (limit !== undefined) params.limit = limit;

  const res = await client.get(`/nodes/${encodeURIComponent(node)}/tracker`, {
    headers: authHeaders(session),
    params,
  });
  if (res.status !== 200) {
    throw new PmgApiError(res.status, res.data);
  }
  return res.data?.data ?? [];
}

async function getTrackingDetail(session, id, { starttime, endtime } = {}) {
  const node = await getNodeName(session);
  const params = {};
  if (starttime !== undefined) params.starttime = starttime;
  if (endtime !== undefined) params.endtime = endtime;

  const res = await client.get(`/nodes/${encodeURIComponent(node)}/tracker/${encodeURIComponent(id)}`, {
    headers: authHeaders(session),
    params,
  });
  if (res.status !== 200) {
    throw new PmgApiError(res.status, res.data);
  }
  return res.data?.data;
}

const VALID_ACTIONS = new Set([
  'welcomelist',
  'whitelist',
  'blocklist',
  'blacklist',
  'deliver',
  'delete',
  'mark-seen',
  'mark-unseen',
]);

async function quarantineAction(session, id, action) {
  if (!VALID_ACTIONS.has(action)) {
    const err = new Error(`Invalid quarantine action: ${action}`);
    err.status = 400;
    throw err;
  }
  const body = new URLSearchParams({ id, action });
  const res = await client.post('/quarantine/content', body.toString(), {
    headers: {
      ...writeHeaders(session),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  if (res.status !== 200) {
    throw new PmgApiError(res.status, res.data);
  }
  return res.data?.data;
}

module.exports = {
  PmgApiError,
  VALID_ACTIONS,
  login,
  getQuarantineList,
  getQuarantineContent,
  quarantineAction,
  getTrackingList,
  getTrackingDetail,
};

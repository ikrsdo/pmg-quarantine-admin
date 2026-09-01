// Demo-mode stand-in for pmgClient.js - implements the exact same exported
// interface (see pmgClient.js's module.exports) so route files never need
// to know which one they're talking to. No network calls, no real PMG
// server involved anywhere. Data lives in memory for the life of the
// process and resets on restart; quarantine actions really mutate it so
// the demo behaves like the real thing.

class PmgApiError extends Error {
  constructor(status, body) {
    super(`PMG API error (${status})`);
    this.status = status;
    this.body = body;
  }
}

const DEMO_USERNAME = 'demo';
const DEMO_PASSWORD = 'demo';
const DEMO_NODE = 'pmg-demo';

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

const VALID_QUARANTINE_TYPES = new Set(['spam', 'virus', 'attachment']);

// --- Deterministic-ish PRNG so a given process's demo dataset is stable
// across requests within its lifetime (not crypto - just seeded variety). ---
let seed = 42;
function rand() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}
function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}
function randInt(min, max) {
  return min + Math.floor(rand() * (max - min + 1));
}

const DOMAINS = ['acme-corp.com', 'globex.io', 'initech.net', 'umbrella-co.com', 'wayne-ent.com'];
const FIRST_NAMES = ['ayse', 'mehmet', 'john', 'sarah', 'chen', 'fatma', 'david', 'elif'];
const LAST_NAMES = ['yilmaz', 'demir', 'smith', 'johnson', 'wang', 'kaya', 'brown', 'ozturk'];
const OUR_DOMAIN = 'ourcompany.com';

function internalAddress() {
  return `${pick(FIRST_NAMES)}.${pick(LAST_NAMES)}@${OUR_DOMAIN}`;
}

function spamSenderAddress() {
  const user = pick(['promo', 'noreply', 'winner', 'sales', 'newsletter', 'billing', 'info']);
  const domain = pick(['cheap-deals-xyz.top', 'mailer-blast.ru', 'super-offers.click', pick(DOMAINS)]);
  return `${user}@${domain}`;
}

const SPAM_SUBJECTS = [
  'You have WON a prize! Claim now',
  'Re: Invoice #4471 overdue - urgent action required',
  'Limited time offer - 80% OFF everything',
  'Your account will be suspended - verify now',
  'Weekly Newsletter - Special deals inside',
  'Congratulations! You are our lucky winner',
  'Password expiry notice - action needed',
  'Free consultation - book your slot today',
];

const VIRUS_NAMES = ['Eicar-Test-Signature', 'Trojan.GenericKD.12345', 'Win32/Emotet.A', 'JS/Downloader.Agent'];
const VIRUS_SUBJECTS = ['Invoice_2026_08.pdf.exe attached', 'Please see attached document', 'Shipping details enclosed'];

const ATTACHMENT_SUBJECTS = ['Blocked attachment - archive.rar', 'Executable attachment blocked', 'Script file blocked by policy'];
const BLOCKED_EXTENSIONS = [
  { name: 'invoice.exe', type: 'application/x-msdownload' },
  { name: 'archive.rar', type: 'application/x-rar-compressed' },
  { name: 'script.vbs', type: 'text/vbscript' },
  { name: 'macro.docm', type: 'application/vnd.ms-word.document.macroenabled.12' },
];

const SEVEN_DAYS = 7 * 24 * 60 * 60;

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function randomRecentTime() {
  return nowSeconds() - randInt(0, SEVEN_DAYS);
}

// The Tracking Center's default filter is a narrow "last hour" window
// (unlike Quarantine's default 7-day window), so most tracking entries
// need a recent timestamp or the demo would open to an empty list.
function randomTrackingTime(index) {
  if (index < 18) return nowSeconds() - randInt(0, 3000);
  return randomRecentTime();
}

function makeId(counter) {
  return `C${counter}R${randInt(1, 9)}T${nowSeconds() - randInt(0, SEVEN_DAYS)}`;
}

function buildHeader({ from, to, subject, time }) {
  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Date: ${new Date(time * 1000).toUTCString()}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
  ].join('\n');
}

function buildSpamInfo() {
  const tests = [
    { name: 'BAYES_99', desc: 'Bayesian spam probability is 99 to 100%' },
    { name: 'URIBL_BLACK', desc: 'Contains a URL listed in the URIBL blacklist' },
    { name: 'HTML_IMAGE_ONLY_08', desc: 'HTML: images with 400-800 bytes of words' },
    { name: 'DKIM_SIGNED', desc: 'Message has a DKIM signature' },
    { name: 'SPF_PASS', desc: 'SPF: sender matches SPF record' },
  ];
  const n = randInt(2, tests.length);
  return tests.slice(0, n).map((t) => ({ ...t, score: t.name === 'SPF_PASS' || t.name === 'DKIM_SIGNED' ? -1 * randInt(0, 2) : randInt(1, 4) }));
}

function buildQuarantineDataset() {
  const spam = [];
  const virus = [];
  const attachment = [];
  let counter = 1;

  for (let i = 0; i < 38; i += 1) {
    const time = randomRecentTime();
    const from = spamSenderAddress();
    const receiver = internalAddress();
    const subject = pick(SPAM_SUBJECTS);
    spam.push({
      id: makeId(counter++),
      time,
      bytes: randInt(2000, 80000),
      from,
      sender: from,
      envelope_sender: from,
      receiver,
      subject,
      spamlevel: randInt(3, 15),
      spaminfo: buildSpamInfo(),
      header: buildHeader({ from, to: receiver, subject, time }),
      seen: rand() > 0.4,
    });
  }

  for (let i = 0; i < 9; i += 1) {
    const time = randomRecentTime();
    const from = spamSenderAddress();
    const receiver = internalAddress();
    const subject = pick(VIRUS_SUBJECTS);
    virus.push({
      id: makeId(counter++),
      time,
      bytes: randInt(10000, 500000),
      from,
      sender: from,
      envelope_sender: from,
      receiver,
      subject,
      virusname: pick(VIRUS_NAMES),
      header: buildHeader({ from, to: receiver, subject, time }),
      seen: rand() > 0.5,
    });
  }

  for (let i = 0; i < 9; i += 1) {
    const time = randomRecentTime();
    const from = spamSenderAddress();
    const receiver = internalAddress();
    const subject = pick(ATTACHMENT_SUBJECTS);
    const blocked = pick(BLOCKED_EXTENSIONS);
    attachment.push({
      id: makeId(counter++),
      time,
      bytes: randInt(15000, 900000),
      from,
      sender: from,
      envelope_sender: from,
      receiver,
      subject,
      header: buildHeader({ from, to: receiver, subject, time }),
      seen: rand() > 0.5,
      _attachments: [
        { id: '1', name: blocked.name, size: randInt(1000, 400000), 'content-type': blocked.type },
      ],
    });
  }

  return { spam, virus, attachment };
}

const STATUS_CODES = ['2', '2', '2', '2', '4', '5', 'N', 'G', 'A', 'B', 'Q'];

function buildTrackingDataset() {
  const list = [];
  const detailById = new Map();
  for (let i = 0; i < 28; i += 1) {
    const time = randomTrackingTime(i);
    const from = rand() > 0.3 ? internalAddress() : spamSenderAddress();
    const to = rand() > 0.3 ? internalAddress() : spamSenderAddress();
    const status = pick(STATUS_CODES);
    const id = `${nowSeconds() - i}-${randInt(1000, 9999)}`;
    const qid = `${randInt(10, 99).toString(16).toUpperCase()}${randInt(1000, 9999).toString(16).toUpperCase()}`;
    const relay = pick(['mx1.ourcompany.com[10.0.0.5]', 'mx2.ourcompany.com[10.0.0.6]', 'local']);
    const client = `${pick(['mail', 'smtp', 'mx'])}.${pick(DOMAINS)}[${randInt(1, 254)}.${randInt(1, 254)}.${randInt(1, 254)}.${randInt(1, 254)}]`;
    const entry = {
      id,
      time,
      from,
      to,
      qid,
      dstatus: status,
      rstatus: rand() > 0.7 ? pick(STATUS_CODES) : status,
      relay,
      client,
      size: randInt(1500, 200000),
      msgid: `<${randInt(100000, 999999)}.${qid}@${pick(DOMAINS)}>`,
    };
    list.push(entry);

    const logs = [
      `postfix/smtpd[${randInt(1000, 9999)}]: connect from ${client}`,
      `postfix/cleanup[${randInt(1000, 9999)}]: ${qid}: message-id=${entry.msgid}`,
      `postfix/qmgr[${randInt(1000, 9999)}]: ${qid}: from=<${from}>, size=${entry.size}, nrcpt=1 (queue active)`,
    ];
    if (status === 'G') {
      logs.push(`postgrey[${randInt(1000, 9999)}]: action=greylist, reason=new, client_name=${client}, client_address=${client}, sender=${from}, recipient=${to}`);
    }
    if (status === 'N' || status === 'B') {
      logs.push(`pmg-smtp-filter[${randInt(1000, 9999)}]: ${qid}: reject: RCPT from ${client}: 554 5.7.1 blocked (rule: Blocklist - Known Spam Source)`);
    } else {
      logs.push(`pmg-smtp-filter[${randInt(1000, 9999)}]: ${qid}: (rule: Default Antispam Policy)`);
    }
    if (status === '2') {
      logs.push(`postfix/smtp[${randInt(1000, 9999)}]: ${qid}: to=<${to}>, relay=${relay}, delay=${(rand() * 2).toFixed(2)}, status=sent (250 2.0.0 Ok: queued)`);
    } else if (status === '4') {
      logs.push(`postfix/smtp[${randInt(1000, 9999)}]: ${qid}: to=<${to}>, relay=${relay}, status=deferred (connection timed out)`);
    } else if (status === '5') {
      logs.push(`postfix/smtp[${randInt(1000, 9999)}]: ${qid}: to=<${to}>, relay=${relay}, status=bounced (host ${relay} said: 550 5.1.1 unknown user)`);
    } else if (status === 'Q') {
      logs.push(`pmg-smtp-filter[${randInt(1000, 9999)}]: ${qid}: quarantine: message quarantined (rule: Default Antispam Policy)`);
    }
    detailById.set(id, { ...entry, logs });
  }
  return { list, detailById };
}

let quarantineData = buildQuarantineDataset();
let trackingData = buildTrackingDataset();

function allQuarantine() {
  return [...quarantineData.spam, ...quarantineData.virus, ...quarantineData.attachment];
}

async function login(username, password) {
  if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
    throw new PmgApiError(401, { errors: { password: 'invalid credentials' } });
  }
  return {
    pmgUsername: `${DEMO_USERNAME}@pmg`,
    pmgTicket: 'DEMO-TICKET',
    pmgCsrfToken: 'DEMO-CSRF',
    ticketIssuedAt: Date.now(),
  };
}

async function getQuarantineList(_session, { type = 'spam', starttime, endtime, pmail } = {}) {
  if (!VALID_QUARANTINE_TYPES.has(type)) {
    const err = new Error(`Invalid quarantine type: ${type}`);
    err.status = 400;
    throw err;
  }
  let list = quarantineData[type];
  if (starttime !== undefined) list = list.filter((m) => m.time >= Number(starttime));
  if (endtime !== undefined) list = list.filter((m) => m.time <= Number(endtime));
  if (pmail) list = list.filter((m) => m.receiver === pmail);
  return list.map(({ _attachments, ...rest }) => rest);
}

async function getQuarantineAttachments(_session, id) {
  const mail = quarantineData.attachment.find((m) => m.id === id);
  return mail?._attachments ?? [];
}

async function getQuarantineContent(_session, id) {
  const mail = allQuarantine().find((m) => m.id === id);
  if (!mail) return null;
  const { _attachments, ...rest } = mail;
  return rest;
}

async function getQuarantineHtmlPreview(_session, id) {
  const mail = allQuarantine().find((m) => m.id === id);
  if (!mail) return '<p>(message not found)</p>';
  return `<div style="font-family:sans-serif;padding:1rem"><p><strong>${mail.subject}</strong></p><p>This is a demo-mode preview - no real message content is available.</p></div>`;
}

let cachedNodeName = DEMO_NODE;
async function getNodeName() {
  return cachedNodeName;
}

async function getTrackingList(_session, { starttime, endtime, xfilter, from, target, ndr, greylist, limit } = {}) {
  let list = trackingData.list;
  if (starttime !== undefined) list = list.filter((m) => m.time >= Number(starttime));
  if (endtime !== undefined) list = list.filter((m) => m.time <= Number(endtime));
  if (xfilter) {
    const q = xfilter.toLowerCase();
    list = list.filter((m) => m.from.toLowerCase().includes(q) || m.to.toLowerCase().includes(q));
  }
  if (from) list = list.filter((m) => m.from.toLowerCase().includes(from.toLowerCase()));
  if (target) list = list.filter((m) => m.to.toLowerCase().includes(target.toLowerCase()));
  if (ndr !== undefined) list = list.filter((m) => (String(ndr) === '1' ? m.dstatus === '5' : true));
  if (greylist !== undefined) list = list.filter((m) => (String(greylist) === '1' ? m.dstatus === 'G' : true));
  if (limit !== undefined) list = list.slice(0, Number(limit));
  return list;
}

async function getTrackingDetail(_session, id) {
  return trackingData.detailById.get(id) ?? null;
}

async function quarantineAction(_session, id, action) {
  if (!VALID_ACTIONS.has(action)) {
    const err = new Error(`Invalid quarantine action: ${action}`);
    err.status = 400;
    throw err;
  }
  const ids = id.split(';');
  for (const type of ['spam', 'virus', 'attachment']) {
    const removeIds = new Set();
    quarantineData[type].forEach((mail) => {
      if (!ids.includes(mail.id)) return;
      if (action === 'mark-seen') mail.seen = true;
      else if (action === 'mark-unseen') mail.seen = false;
      else removeIds.add(mail.id); // deliver/delete/whitelist/welcomelist/blocklist/blacklist all remove it from the queue
    });
    if (removeIds.size > 0) {
      quarantineData[type] = quarantineData[type].filter((mail) => !removeIds.has(mail.id));
    }
  }
  return {};
}

module.exports = {
  PmgApiError,
  VALID_ACTIONS,
  VALID_QUARANTINE_TYPES,
  login,
  getQuarantineList,
  getQuarantineAttachments,
  getQuarantineContent,
  getQuarantineHtmlPreview,
  quarantineAction,
  getTrackingList,
  getTrackingDetail,
  getNodeName,
};

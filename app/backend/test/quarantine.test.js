require('./setup');
const nock = require('nock');
const request = require('supertest');
const createApp = require('../src/server');

const PMG_ORIGIN = 'https://pmg.test.local:8006';

async function loginAgent(app) {
  nock(PMG_ORIGIN)
    .post('/api2/json/access/ticket')
    .reply(200, {
      data: {
        ticket: 'PMG:someuser@pmg:TICKET',
        CSRFPreventionToken: 'csrf-token-value',
        username: 'someuser@pmg',
      },
    });

  const agent = request.agent(app);
  await agent.post('/api/login').send({ username: 'someuser@pmg', password: 'secret' });
  return agent;
}

describe('quarantine routes', () => {
  afterEach(() => nock.cleanAll());

  test('GET /api/quarantine requires auth', async () => {
    const app = createApp();
    const res = await request(app).get('/api/quarantine');
    expect(res.status).toBe(401);
  });

  test('GET /api/quarantine returns the PMG spam list', async () => {
    const app = createApp();
    const agent = await loginAgent(app);

    nock(PMG_ORIGIN)
      .get('/api2/json/quarantine/spam')
      .query(true)
      .reply(200, { data: [{ id: 'C1R2T1700000000', subject: 'Test mail' }] });

    const res = await agent.get('/api/quarantine');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].subject).toBe('Test mail');
  });

  test('GET /api/quarantine?type=virus routes to the PMG virus list', async () => {
    const app = createApp();
    const agent = await loginAgent(app);

    nock(PMG_ORIGIN)
      .get('/api2/json/quarantine/virus')
      .query(true)
      .reply(200, { data: [{ id: 'C1R2T1700000001', virusname: 'Eicar-Test-Signature' }] });

    const res = await agent.get('/api/quarantine?type=virus');
    expect(res.status).toBe(200);
    expect(res.body.data[0].virusname).toBe('Eicar-Test-Signature');
  });

  test('GET /api/quarantine?type=attachment routes to the PMG attachment list', async () => {
    const app = createApp();
    const agent = await loginAgent(app);

    nock(PMG_ORIGIN)
      .get('/api2/json/quarantine/attachment')
      .query(true)
      .reply(200, { data: [{ id: 'C1R2T1700000002', subject: 'Blocked file' }] });

    const res = await agent.get('/api/quarantine?type=attachment');
    expect(res.status).toBe(200);
    expect(res.body.data[0].subject).toBe('Blocked file');
  });

  test('GET /api/quarantine?type=invalid is rejected', async () => {
    const app = createApp();
    const agent = await loginAgent(app);

    const res = await agent.get('/api/quarantine?type=invalid');
    expect(res.status).toBe(400);
  });

  test('GET /api/quarantine/:id/attachments requires auth', async () => {
    const app = createApp();
    const res = await request(app).get('/api/quarantine/C1R2T1700000000/attachments');
    expect(res.status).toBe(401);
  });

  test('GET /api/quarantine/:id/attachments returns attachment list', async () => {
    const app = createApp();
    const agent = await loginAgent(app);

    nock(PMG_ORIGIN)
      .get('/api2/json/quarantine/listattachments')
      .query({ id: 'C1R2T1700000000' })
      .reply(200, { data: [{ id: '1', size: 1024, name: 'invoice.exe', 'content-type': 'application/x-msdownload' }] });

    const res = await agent.get('/api/quarantine/C1R2T1700000000/attachments');
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe('invoice.exe');
  });

  test('GET /api/quarantine/:id/attachments propagates PMG errors', async () => {
    const app = createApp();
    const agent = await loginAgent(app);

    nock(PMG_ORIGIN)
      .get('/api2/json/quarantine/listattachments')
      .query({ id: 'C1R2T1700000000' })
      .reply(401, {});

    const res = await agent.get('/api/quarantine/C1R2T1700000000/attachments');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('pmg_ticket_expired');
  });

  test('GET /api/quarantine/:id returns message content', async () => {
    const app = createApp();
    const agent = await loginAgent(app);

    nock(PMG_ORIGIN)
      .get('/api2/json/quarantine/content')
      .query({ id: 'C1R2T1700000000', raw: '1' })
      .reply(200, { data: { subject: 'Test mail', header: 'From: a@b.c' } });

    const res = await agent.get('/api/quarantine/C1R2T1700000000');
    expect(res.status).toBe(200);
    expect(res.body.data.subject).toBe('Test mail');
  });

  test('POST /api/quarantine/:id/action rejects invalid action', async () => {
    const app = createApp();
    const agent = await loginAgent(app);

    const res = await agent.post('/api/quarantine/C1R2T1700000000/action').send({ action: 'not-a-real-action' });
    expect(res.status).toBe(400);
  });

  test('POST /api/quarantine/:id/action delivers a message', async () => {
    const app = createApp();
    const agent = await loginAgent(app);

    nock(PMG_ORIGIN)
      .post('/api2/json/quarantine/content', { id: 'C1R2T1700000000', action: 'deliver' })
      .matchHeader('csrfpreventiontoken', 'csrf-token-value')
      .reply(200, { data: 1 });

    const res = await agent.post('/api/quarantine/C1R2T1700000000/action').send({ action: 'deliver' });
    expect(res.status).toBe(200);
  });

  test('propagates PMG 401 as pmg_ticket_expired', async () => {
    const app = createApp();
    const agent = await loginAgent(app);

    nock(PMG_ORIGIN).get('/api2/json/quarantine/spam').query(true).reply(401, {});

    const res = await agent.get('/api/quarantine');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('pmg_ticket_expired');
  });
});

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

function mockNodes() {
  nock(PMG_ORIGIN).get('/api2/json/nodes').reply(200, { data: [{ node: 'pmg-node-1' }] });
}

describe('tracking routes', () => {
  afterEach(() => nock.cleanAll());

  test('GET /api/tracking requires auth', async () => {
    const app = createApp();
    const res = await request(app).get('/api/tracking');
    expect(res.status).toBe(401);
  });

  test('GET /api/tracking resolves node name and returns the tracker list', async () => {
    const app = createApp();
    const agent = await loginAgent(app);

    mockNodes();
    nock(PMG_ORIGIN)
      .get('/api2/json/nodes/pmg-node-1/tracker')
      .query(true)
      .reply(200, { data: [{ id: 'T1', from: 'a@b.c', to: 'd@e.f', time: 1700000000, dstatus: '2' }] });

    const res = await agent.get('/api/tracking');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].dstatus).toBe('2');
  });

  test('GET /api/tracking/:id returns tracker detail with logs', async () => {
    const app = createApp();
    const agent = await loginAgent(app);

    mockNodes();
    nock(PMG_ORIGIN)
      .get('/api2/json/nodes/pmg-node-1/tracker/T1')
      .query(true)
      .reply(200, { data: { id: 'T1', from: 'a@b.c', to: 'd@e.f', logs: ['log line 1', 'log line 2'] } });

    const res = await agent.get('/api/tracking/T1');
    expect(res.status).toBe(200);
    expect(res.body.data.logs).toHaveLength(2);
  });

  test('propagates PMG 401 as pmg_ticket_expired', async () => {
    const app = createApp();
    const agent = await loginAgent(app);

    mockNodes();
    nock(PMG_ORIGIN).get('/api2/json/nodes/pmg-node-1/tracker').query(true).reply(401, {});

    const res = await agent.get('/api/tracking');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('pmg_ticket_expired');
  });
});

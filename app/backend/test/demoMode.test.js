require('./setup');
process.env.DEMO_MODE = 'true';
const request = require('supertest');
const createApp = require('../src/server');

// No nock mocks anywhere in this file - demo mode must never touch the
// network at all.

async function loginAgent(app) {
  const agent = request.agent(app);
  await agent.post('/api/login').send({ username: 'demo', password: 'demo' });
  return agent;
}

describe('demo mode', () => {
  test('POST /api/login rejects anything but demo/demo', async () => {
    const app = createApp();
    const res = await request(app).post('/api/login').send({ username: 'demo', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('POST /api/login accepts demo/demo and reports demoMode', async () => {
    const app = createApp();
    const res = await request(app).post('/api/login').send({ username: 'demo', password: 'demo' });
    expect(res.status).toBe(200);
    expect(res.body.demoMode).toBe(true);
  });

  test('GET /api/me reports demoMode', async () => {
    const app = createApp();
    const agent = await loginAgent(app);
    const res = await agent.get('/api/me');
    expect(res.status).toBe(200);
    expect(res.body.demoMode).toBe(true);
  });

  test('GET /api/quarantine returns realistic mock spam data', async () => {
    const app = createApp();
    const agent = await loginAgent(app);
    const res = await agent.get('/api/quarantine');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(10);
    const mail = res.body.data[0];
    expect(mail).toMatchObject({
      id: expect.any(String),
      subject: expect.any(String),
      from: expect.any(String),
      receiver: expect.any(String),
      time: expect.any(Number),
      spamlevel: expect.any(Number),
    });
  });

  test('GET /api/quarantine?type=virus and type=attachment return mock data', async () => {
    const app = createApp();
    const agent = await loginAgent(app);

    const virusRes = await agent.get('/api/quarantine?type=virus');
    expect(virusRes.status).toBe(200);
    expect(virusRes.body.data.length).toBeGreaterThan(0);
    expect(virusRes.body.data[0].virusname).toEqual(expect.any(String));

    const attachmentRes = await agent.get('/api/quarantine?type=attachment');
    expect(attachmentRes.status).toBe(200);
    expect(attachmentRes.body.data.length).toBeGreaterThan(0);

    const attachmentsRes = await agent.get(`/api/quarantine/${attachmentRes.body.data[0].id}/attachments`);
    expect(attachmentsRes.status).toBe(200);
    expect(attachmentsRes.body.data[0].name).toEqual(expect.any(String));
  });

  test('POST /api/quarantine/:id/action deliver really removes the message', async () => {
    const app = createApp();
    const agent = await loginAgent(app);

    const before = await agent.get('/api/quarantine');
    const id = before.body.data[0].id;

    const actionRes = await agent.post(`/api/quarantine/${id}/action`).send({ action: 'deliver' });
    expect(actionRes.status).toBe(200);

    const after = await agent.get('/api/quarantine');
    expect(after.body.data.find((m) => m.id === id)).toBeUndefined();
  });

  test('GET /api/tracking and its detail endpoint return mock data with logs', async () => {
    const app = createApp();
    const agent = await loginAgent(app);

    const listRes = await agent.get('/api/tracking');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThan(5);

    const detailRes = await agent.get(`/api/tracking/${listRes.body.data[0].id}`);
    expect(detailRes.status).toBe(200);
    expect(Array.isArray(detailRes.body.data.logs)).toBe(true);
    expect(detailRes.body.data.logs.length).toBeGreaterThan(0);
  });
});

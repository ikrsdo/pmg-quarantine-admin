require('./setup');
const nock = require('nock');
const request = require('supertest');
const createApp = require('../src/server');

const PMG_ORIGIN = 'https://pmg.test.local:8006';

describe('auth', () => {
  afterEach(() => nock.cleanAll());

  test('POST /api/login succeeds and sets a session cookie', async () => {
    nock(PMG_ORIGIN)
      .post('/api2/json/access/ticket')
      .reply(200, {
        data: {
          ticket: 'PMG:someuser@pmg:TICKET',
          CSRFPreventionToken: 'csrf-token-value',
          username: 'someuser@pmg',
        },
      });

    const app = createApp();
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'someuser@pmg', password: 'secret' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ username: 'someuser@pmg' });
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('POST /api/login returns 401 on bad credentials', async () => {
    nock(PMG_ORIGIN).post('/api2/json/access/ticket').reply(401, {});

    const app = createApp();
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'someuser@pmg', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  test('POST /api/login requires username and password', async () => {
    const app = createApp();
    const res = await request(app).post('/api/login').send({});
    expect(res.status).toBe(400);
  });

  test('POST /api/logout clears the session', async () => {
    const app = createApp();
    const res = await request(app).post('/api/logout');
    expect(res.status).toBe(204);
  });

  test('GET /api/me requires auth', async () => {
    const app = createApp();
    const res = await request(app).get('/api/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/me returns the logged-in username', async () => {
    nock(PMG_ORIGIN)
      .post('/api2/json/access/ticket')
      .reply(200, {
        data: {
          ticket: 'PMG:someuser@pmg:TICKET',
          CSRFPreventionToken: 'csrf-token-value',
          username: 'someuser@pmg',
        },
      });

    const app = createApp();
    const agent = request.agent(app);
    await agent.post('/api/login').send({ username: 'someuser@pmg', password: 'secret' });

    const res = await agent.get('/api/me');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ username: 'someuser@pmg' });
  });
});

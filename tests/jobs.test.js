const request = require('supertest');
const { connect, disconnect, clearAll } = require('./helpers/db');
const { seed } = require('./helpers/seed');
let app;

beforeAll(async () => {
  await connect();
  app = require('../src/app');
});

afterAll(async () => {
  await disconnect();
});

beforeEach(async () => {
  await clearAll();
});

describe('Jobs - API key auth', () => {
  let data;
  beforeEach(async () => { data = await seed(); });

  test('POST /api/jobs/reset-streaks - with valid API key', async () => {
    const res = await request(app)
      .post('/api/jobs/reset-streaks')
      .set('X-Api-Key', process.env.CRON_API_KEY || 'test-api-key');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });

  test('POST /api/jobs/send-reminders - with valid API key', async () => {
    const res = await request(app)
      .post('/api/jobs/send-reminders')
      .set('X-Api-Key', process.env.CRON_API_KEY || 'test-api-key');
    expect(res.status).toBe(200);
  });

  test('POST /api/jobs/send-activation-nudge - with valid API key', async () => {
    const res = await request(app)
      .post('/api/jobs/send-activation-nudge')
      .set('X-Api-Key', process.env.CRON_API_KEY || 'test-api-key');
    expect(res.status).toBe(200);
  });

  test('POST /api/jobs/send-recovery - with valid API key', async () => {
    const res = await request(app)
      .post('/api/jobs/send-recovery')
      .set('X-Api-Key', process.env.CRON_API_KEY || 'test-api-key');
    expect(res.status).toBe(200);
  });

  test('POST /api/jobs/reset-streaks - without API key', async () => {
    const res = await request(app).post('/api/jobs/reset-streaks');
    expect(res.status).toBe(401);
  });

  test('POST /api/jobs/send-reminders - wrong API key', async () => {
    const res = await request(app)
      .post('/api/jobs/send-reminders')
      .set('X-Api-Key', 'wrong-key');
    expect(res.status).toBe(401);
  });
});

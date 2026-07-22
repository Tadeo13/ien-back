const request = require('supertest');
const mongoose = require('mongoose');
const { connect, disconnect, clearAll } = require('./helpers/db');
const { seed } = require('./helpers/seed');
const PlanProgreso = require('../src/models/PlanProgreso');
const { demoledorDeRachas } = require('../src/modules/jobs/cronJobs');
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

describe('demoledorDeRachas - racha_rota_en', () => {
  beforeEach(async () => { await seed(); });

  test('setea racha_rota_en cuando racha_dias > 0', async () => {
    const ahora = new Date();
    const hace3Dias = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const uid = new mongoose.Types.ObjectId();
    await PlanProgreso.create({
      usuario_id: uid,
      tienda_id: new mongoose.Types.ObjectId(),
      codigo_utilizado: 'TEST-001',
      estado: 'activo',
      racha_dias: 5,
      ultima_fecha_actividad: hace3Dias
    });

    const res = await demoledorDeRachas();
    expect(res.modifiedCount).toBe(1);

    const plan = await PlanProgreso.findOne({ usuario_id: uid }).lean();
    expect(plan.racha_dias).toBe(0);
    expect(plan.racha_rota_en).toBeInstanceOf(Date);
  });

  test('no toca racha_rota_en si racha_dias ya es 0', async () => {
    const ahora = new Date();
    const uid = new mongoose.Types.ObjectId();
    await PlanProgreso.create({
      usuario_id: uid,
      tienda_id: new mongoose.Types.ObjectId(),
      codigo_utilizado: 'TEST-002',
      estado: 'activo',
      racha_dias: 0,
      ultima_fecha_actividad: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      racha_rota_en: null
    });

    await demoledorDeRachas();
    const plan = await PlanProgreso.findOne({ usuario_id: uid }).lean();
    expect(plan.racha_dias).toBe(0);
    expect(plan.racha_rota_en).toBeNull();
  });
});

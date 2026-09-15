const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connect, disconnect, clearAll } = require('./helpers/db');
const { seed } = require('./helpers/seed');
const { generateToken, createUsuario } = require('./helpers/auth');
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

describe('Pacientes - admin_general', () => {
  let data, token, usuario;
  beforeEach(async () => {
    data = await seed();
    token = generateToken(data.adminGeneral);
    usuario = data.usuario;
  });

  test('GET /api/admin/pacientes - list patients', async () => {
    const res = await request(app)
      .get('/api/admin/pacientes')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.pacientes).toBeDefined();
    expect(Array.isArray(res.body.pacientes)).toBe(true);
    expect(res.body.total).toBeDefined();
  });

  test('GET /api/admin/pacientes?page=1&limit=10 - pagination', async () => {
    const res = await request(app)
      .get('/api/admin/pacientes?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.pagina).toBe(1);
  });

  test('GET /api/admin/pacientes/:usuarioId/perfil - patient profile', async () => {
    const res = await request(app)
      .get(`/api/admin/pacientes/${usuario._id}/perfil`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(usuario.email);
  });

  test('GET /api/admin/pacientes/:usuarioId/perfil - not found', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .get(`/api/admin/pacientes/${fakeId}/perfil`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('GET /api/admin/pacientes/:usuarioId/progreso - newly created patient without plan returns 200 and full default shape', async () => {
    const res = await request(app)
      .get(`/api/admin/pacientes/${usuario._id}/progreso`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      estado: 'sin_iniciar',
      dia_actual: 0,
      racha_dias: 0,
      racha_maxima: 0,
      hitos_alcanzados: [],
      fecha_inicio: null,
      ultima_fecha_actividad: null,
      test_inicial: null,
      progreso_diario: []
    });
  });

  test('GET /api/admin/pacientes/:usuarioId/progreso - patient with progress returns plan data', async () => {
    const PlanProgreso = mongoose.model('PlanProgreso');
    await PlanProgreso.create({
      usuario_id: usuario._id,
      tienda_id: data.tiendas[0]._id,
      codigo_utilizado: data.codigo1,
      dia_actual: 5,
      racha_dias: 4,
      racha_maxima: 4,
      estado: 'activo'
    });

    const res = await request(app)
      .get(`/api/admin/pacientes/${usuario._id}/progreso`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('activo');
    expect(res.body.dia_actual).toBe(5);
    expect(res.body.racha_dias).toBe(4);
    expect(res.body.racha_maxima).toBe(4);
    expect(Array.isArray(res.body.progreso_diario)).toBe(true);
    expect(res.body.progreso_diario.length).toBe(30);
  });

  test('GET /api/admin/pacientes/:usuarioId/progreso - non-existent patient returns 404', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .get(`/api/admin/pacientes/${fakeId}/progreso`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('GET /api/admin/pacientes/:usuarioId/test-inicial - no test', async () => {
    const res = await request(app)
      .get(`/api/admin/pacientes/${usuario._id}/test-inicial`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('GET /api/admin/pacientes/:usuarioId/actividades - patient without plan returns empty array', async () => {
    const res = await request(app)
      .get(`/api/admin/pacientes/${usuario._id}/actividades`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ dias: [] });
  });

  test('GET /api/admin/pacientes/:usuarioId/actividades - non-existent patient returns 404', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .get(`/api/admin/pacientes/${fakeId}/actividades`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe('Pacientes - admin_negocio (scoped)', () => {
  let data, token;
  beforeEach(async () => {
    data = await seed();
    token = generateToken(data.adminNegocio);
  });

  test('GET /api/admin/pacientes - scoped to assigned stores', async () => {
    const res = await request(app)
      .get('/api/admin/pacientes')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('GET /api/admin/pacientes/:usuarioId/perfil - scoped patient', async () => {
    const res = await request(app)
      .get(`/api/admin/pacientes/${data.usuario._id}/perfil`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

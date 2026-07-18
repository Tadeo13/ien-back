const request = require('supertest');
const { connect, disconnect, clearAll } = require('./helpers/db');
const { seed } = require('./helpers/seed');
const { generateToken } = require('./helpers/auth');
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

describe('Productos - admin_general', () => {
  let data, token;
  beforeEach(async () => {
    data = await seed();
    token = generateToken(data.adminGeneral);
  });

  test('GET /api/admin/productos - list all', async () => {
    const res = await request(app)
      .get('/api/admin/productos')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  test('POST /api/admin/productos - create', async () => {
    const res = await request(app)
      .post('/api/admin/productos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Nuevo Plan', descripcion: 'Desc', tiendas: [data.tienda1Id] });
    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('Nuevo Plan');
  });

  test('POST /api/admin/productos - missing nombre', async () => {
    const res = await request(app)
      .post('/api/admin/productos')
      .set('Authorization', `Bearer ${token}`)
      .send({ descripcion: 'Sin nombre' });
    expect(res.status).toBe(400);
  });

  test('PUT /api/admin/productos/:id - update', async () => {
    const res = await request(app)
      .put(`/api/admin/productos/${data.producto1Id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Plan Actualizado' });
    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Plan Actualizado');
  });

  test('DELETE /api/admin/productos/:id - delete', async () => {
    const res = await request(app)
      .delete(`/api/admin/productos/${data.producto1Id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('DELETE /api/admin/productos/:id - not found', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .delete(`/api/admin/productos/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

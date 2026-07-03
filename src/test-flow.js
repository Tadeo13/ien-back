/**
 * Script de prueba: simula el flujo completo de un usuario
 * Uso: node src/test-flow.js
 */

const http = require('http');

const BASE = 'http://localhost:3000/api';

async function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log('\n=== 1. Validar código ===');
  let res = await request('POST', '/auth/validate-code', { codigo_activacion: 'IEN-001' });
  console.log(res.status, JSON.stringify(res.data, null, 2));

  console.log('\n=== 2. Registrar usuario ===');
  res = await request('POST', '/auth/register', {
    nombre: 'Juan Pérez',
    email: 'juan@test.com',
    password: '123456',
    codigo_activacion: 'IEN-001'
  });
  console.log(res.status, JSON.stringify(res.data, null, 2));
  const token = res.data.token;
  const authHeader = { Authorization: `Bearer ${token}` };

  console.log('\n=== 3. Setup test inicial ===');
  res = await request('POST', '/plan/setup-test', {
    respuestas: [
      { pregunta_id: 'p1', texto: '¿Cómo te sientes hoy?', respuesta_elegida: 'Bien', score: 3 },
      { pregunta_id: 'p2', texto: '¿Manejas bien el estrés?', respuesta_elegida: 'Regular', score: 2 }
    ],
    emociones_a_mejorar: ['ira', 'ansiedad']
  }, authHeader);
  console.log(res.status, JSON.stringify(res.data, null, 2));

  console.log('\n=== 4. Contenido de hoy ===');
  res = await request('GET', '/plan/today', null, authHeader);
  console.log(res.status, JSON.stringify(res.data, null, 2));

  console.log('\n=== 5. Completar día ===');
  res = await request('POST', '/plan/complete-day', null, authHeader);
  console.log(res.status, JSON.stringify(res.data, null, 2));

  console.log('\n=== 6. Login ===');
  res = await request('POST', '/auth/login', { email: 'juan@test.com', password: '123456' });
  console.log(res.status, JSON.stringify(res.data, null, 2));

  console.log('\n=== 7. Admin: métricas ===');
  const adminRes = await request('POST', '/auth/login', { email: 'admin@ien.test', password: 'admin123' });
  const adminToken = adminRes.data.token;
  res = await request('GET', '/admin/dashboard/metrics', null, { Authorization: `Bearer ${adminToken}` });
  console.log(res.status, JSON.stringify(res.data, null, 2));

  console.log('\n=== 8. Jobs: reset rachas (con API key incorrecta) ===');
  res = await request('POST', '/jobs/reset-streaks', null, { 'x-api-key': 'wrong-key' });
  console.log(res.status, JSON.stringify(res.data, null, 2));
}

main().catch(console.error);

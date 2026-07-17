# ien-back - Memoria del Proyecto

## Stack
- Node.js + Express 4.21.2
- MongoDB + Mongoose 8.9.5
- JWT (access 15m + refresh 30d)
- Jest (tests)
- Swagger (api-docs)

## Scripts
- `npm run dev` — servidor con `--watch` en `src/server.js`
- `npm start` — producción
- `npm run seed` — limpia y puebla la BD (ejecutar DESPUÉS de npm run dev)
- `npm test` — tests unitarios (Jest)

## BD
- `.env` → `MONGO_URI=mongodb://localhost:27017/ien_test`
- El servidor NO arranca sin `MONGO_URI`

## Seed
- `src/seed.js` — elimina todo (`deleteMany`) y reinserta:
  - 3 tiendas, 2 productos, 5 códigos
  - 2 admins: `admin@ien.test` / `admin123` y `admin_negocio@ien.test` / `admin123`
  - 30 contenidos diarios, 30 preguntas test, 4 contenidos especiales
- Exporta: `{ CONTENIDOS, TEST_PREGUNTAS, CONTENIDOS_ESPECIALES }`

## Estructura
```
src/
  server.js          # Conexión MongoDB + arranque Express
  app.js             # Config Express, middleware, rutas
  seed.js            # Seed data
  config/swagger.js  # OpenAPI
  models/            # 10 modelos Mongoose
    Usuario, Tienda, PlanProgreso, ContenidoDiario, TestPregunta,
    ContenidoEspecial, Producto, Codigo, RefreshToken, HistorialCorreo
  controllers/
  services/
  routes/
  middlewares/       # auth, admin, apiKey, errorHandler, scopeTienda
  utils/             # AppError, fechas.js (UTC)
  email/             # sendEmail, templates, programTimeline
scripts/test-demoledor.js  # E2E para cron job demoledorDeRachas
tests/              # Tests unitarios (fechas, rachas, hitos)
```

## Endpoints principales
- `POST /api/auth/register` — registra usuario con código de activación
- `POST /api/auth/login` — login, devuelve access_token + refresh_token
- `POST /api/auth/validate-code` — valida código
- `GET /api/plan/today` — lección del día (requiere plan activo)
- `GET /api/plan/days` — días del plan (?completados=true)
- `GET /api/plan/profile` — progreso del plan
- `POST /api/plan/setup-test` — crear plan con test
- `POST /api/plan/complete-day` — completar día
- `POST /api/plan/testing/autocomplete-test` — [DEV] crear plan con scores aleatorios
- `POST /api/plan/testing/advance` — [DEV] avanzar día
- Admin: sucursales, productos, códigos, usuarios admin-negocio
- `POST /api/jobs/send-reminders` — API-key protected
- `POST /api/jobs/reset-streaks` — API-key protected

## Fixes aplicados
- `ContenidoEspecial.tipo` → índice único (previene duplicados)
- `authService` → códigos verifican `fecha_activacion: null` y marcan `activo = false` al usarse
- `campos_respuesta` eliminado del modelo y seed (solo se usa `datos_leccion.ejercicio.pasos`)
- `respuesta_tipo: 'practica'` → `'accion'` en seed

## Auth
- Bearer token (JWT) en header `Authorization`
- `req.usuario` = `{ id, iat, exp }`
- Admin: `req.usuario.rol` y `req.tiendasPermitidas`
- Refresh token rotation: single-use, se revoca al refrescar

# IEN Backend — API de Inteligencia Emocional

API REST para el programa IEN (Inteligencia Emocional) con planes de 30 días, autenticación JWT, panel admin y cron jobs.

## Requerimientos

- **Node.js** >= 18 (usamos `node --watch`)
- **MongoDB** >= 6.0 (local o Atlas)

## Stack

| Herramienta | Uso |
|-------------|-----|
| Express 4 | Framework HTTP |
| Mongoose 8 | ODM para MongoDB |
| bcryptjs | Hash de contraseñas |
| jsonwebtoken | JWT access token (15 min) + refresh token (30 días) |
| express-rate-limit | Rate limiting en endpoints de auth |
| swagger-jsdoc + swagger-ui-express | Documentación interactiva |
| morgan | Logging de requests |
| dotenv | Variables de entorno |
| jest | Testing unitario |

## Instalación

```bash
git clone <repo-url>
cd ien-back
npm install
```

## Configuración

Crear archivo `.env` (usar `.env.example` como referencia):

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/ien
JWT_SECRET=tu_secreto_aqui
CRON_API_KEY=tu_api_key_cron
```

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (default 3000) |
| `MONGO_URI` | URI de conexión a MongoDB |
| `JWT_SECRET` | Secreto para firmar tokens JWT |
| `CRON_API_KEY` | API Key para endpoints internos (cron jobs) |

## Scripts

```bash
npm run dev      # Desarrollo con auto-reload (node --watch)
npm start        # Producción
npm run seed     # Poblar BD con datos iniciales
npm test         # Tests unitarios (Jest)
```

## Seed

El seed crea:

- **3 tiendas**: IEN-001, IEN-002, IEN-003
- **1 admin**: admin@ien.test / admin123
- **30 contenidos diarios** (días 1 al 30)

```bash
npm run seed
```

## Uso básico

### 1. Validar código y registrar usuario

```bash
curl -X POST http://localhost:3000/api/auth/validate-code \
  -H "Content-Type: application/json" \
  -d '{"codigo_activacion": "IEN-001"}'

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@test.com", "password": "123456", "nombre": "Test", "codigo_activacion": "IEN-001"}'
```

### 2. Iniciar sesión

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@test.com", "password": "123456"}'
# → { access_token: "eyJ...", refresh_token: "..." }
```

### 3. Configurar plan y avanzar

```bash
# Setup del plan (usa el código del usuario autenticado)
curl -X POST http://localhost:3000/api/plan/setup-test \
  -H "Authorization: Bearer <token>"

# Ver contenido de hoy
curl http://localhost:3000/api/plan/today \
  -H "Authorization: Bearer <token>"

# Marcar día como completado
curl -X POST http://localhost:3000/api/plan/complete-day \
  -H "Authorization: Bearer <token>"
```

### 4. Admin — Dashboard

```bash
curl http://localhost:3000/api/admin/dashboard/metrics \
  -H "Authorization: Bearer <token_admin>"
```

### 5. Cron jobs (protegidos con API Key)

```bash
curl -X POST http://localhost:3000/api/jobs/reset-streaks \
  -H "X-API-KEY: tu_api_key_cron"

curl -X POST http://localhost:3000/api/jobs/send-reminders \
  -H "X-API-KEY: tu_api_key_cron"
```

## Documentación interactiva

Una vez corriendo el servidor, abrir:

```
http://localhost:3000/api-docs
```

## Estructura del proyecto

```
ien-back/
├── src/
│   ├── app.js                 # Configuración Express
│   ├── server.js              # Conexión MongoDB + listen
│   ├── config/
│   │   └── swagger.js         # Configuración de Swagger
│   ├── controllers/           # Handlers de rutas
│   ├── middlewares/           # auth, admin, apiKey, errorHandler
│   ├── models/                # Schemas de Mongoose
│   ├── routes/                # Definición de rutas Express
│   ├── services/              # Lógica de negocio
│   ├── utils/
│   │   ├── AppError.js        # Clase de error personalizada
│   │   └── fechas.js          # Utilidades de fecha UTC
│   ├── seed.js                # Poblado inicial de BD
│   └── test-flow.js           # Script de prueba del flujo completo
├── tests/                     # Tests unitarios (Jest)
│   ├── fechas.test.js
│   ├── rachas.test.js
│   └── hitos.test.js
└── .env.example
```

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| **Auth** | | | |
| POST | `/api/auth/validate-code` | — | Validar código de activación |
| POST | `/api/auth/register` | — | Registro de usuario |
| POST | `/api/auth/login` | — | Inicio de sesión |
| POST | `/api/auth/refresh` | — | Refrescar access token (rotación completa) |
| POST | `/api/auth/logout` | — | Cerrar sesión (revoca refresh token) |
| **Plan** | | | |
| POST | `/api/plan/setup-test` | JWT | Inicializar plan de 30 días |
| GET | `/api/plan/today` | JWT | Contenido del día actual |
| POST | `/api/plan/complete-day` | JWT | Marcar día como completado |
| **Admin** | | | |
| GET | `/api/admin/dashboard/metrics` | JWT+Admin | Dashboard con métricas por tienda |
| **Jobs** | | | |
| POST | `/api/jobs/reset-streaks` | API Key | Resetear rachas vencidas |
| POST | `/api/jobs/send-reminders` | API Key | Enviar recordatorios |

## Formato de errores

Todos los errores siguen el formato:

```json
{ "error": "mensaje descriptivo" }
```

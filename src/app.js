const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authMiddleware = require('./middlewares/authMiddleware');
const authRoutes = require('./modules/auth/auth.routes');
const planRoutes = require('./modules/plan/plan.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const jobRoutes = require('./modules/jobs/job.routes');
const sucursalRoutes = require('./modules/tiendas/tienda.routes');
const productoRoutes = require('./modules/productos/producto.routes');
const codigoRoutes = require('./modules/codigos/codigo.routes');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Root route
app.get('/', (_req, res) => {
  res.send('IEN Backend API is running. Documentation available at /api-docs');
});

// Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin/sucursales', sucursalRoutes);
app.use('/api/admin/productos', productoRoutes);
app.use('/api/admin/codigos', codigoRoutes);
app.use('/api/admin', adminRoutes);

// 404 catch-all (JSON, no HTML de Express)
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use(errorHandler);

module.exports = app;

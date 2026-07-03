const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const { metrics } = require('../controllers/adminController');

const router = Router();

router.use(authMiddleware, adminMiddleware);

/**
 * @swagger
 * /api/admin/dashboard/metrics:
 *   get:
 *     summary: Obtener métricas del panel de administración
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas agrupadas por tienda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tienda_id:
 *                     type: string
 *                   nombre_tienda:
 *                     type: string
 *                   ciudad:
 *                     type: string
 *                   total_activaciones:
 *                     type: number
 *                   usuarios_activos:
 *                     type: number
 *                   completados:
 *                     type: number
 *                   abandonados:
 *                     type: number
 *                   promedio_dia_progreso:
 *                     type: number
 *                   racha_promedio:
 *                     type: number
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Acceso denegado
 */
router.get('/dashboard/metrics', metrics);

module.exports = router;

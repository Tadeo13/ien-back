const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { setupTest, today, completeDay } = require('../controllers/planController');

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/plan/setup-test:
 *   post:
 *     summary: Crear plan con test inicial
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [respuestas]
 *             properties:
 *               respuestas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     pregunta_id:
 *                       type: string
 *                     texto:
 *                       type: string
 *                     respuesta_elegida:
 *                       type: string
 *                     score:
 *                       type: number
 *               emociones_a_mejorar:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Plan creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plan_id:
 *                   type: string
 *                 dia_actual:
 *                   type: number
 *                 estado:
 *                   type: string
 *       400:
 *         description: Respuestas requeridas / Usuario sin tienda asociada
 *       404:
 *         description: Tienda no encontrada
 *       409:
 *         description: El usuario ya tiene un plan
 */
router.post('/setup-test', setupTest);

/**
 * @swagger
 * /api/plan/today:
 *   get:
 *     summary: Obtener contenido del día actual
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contenido del día
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dia:
 *                   type: number
 *                 titulo:
 *                   type: string
 *                 tipo:
 *                   type: string
 *                 emociones_objetivo:
 *                   type: array
 *                   items:
 *                     type: string
 *                 datos_leccion:
 *                   type: object
 *                 racha_dias:
 *                   type: number
 *                 estado:
 *                   type: string
 *                   enum: [activo, completado, abandonado]
 *       404:
 *         description: No hay plan activo o contenido no disponible
 */
router.get('/today', today);

/**
 * @swagger
 * /api/plan/complete-day:
 *   post:
 *     summary: Marcar día actual como completado
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Día completado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dia_completado:
 *                   type: number
 *                 dia_actual:
 *                   type: number
 *                 racha_dias:
 *                   type: number
 *                 estado:
 *                   type: string
 *       404:
 *         description: No hay plan activo
 */
router.post('/complete-day', completeDay);

module.exports = router;

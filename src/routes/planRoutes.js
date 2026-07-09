const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { setupTest, today, profile, days, completeDay, advanceDay, getTestPreguntas } = require('../controllers/planController');

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/plan/test-preguntas:
 *   get:
 *     summary: Obtener el banco de preguntas del test inicial
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de preguntas de diagnóstico ordenadas por número
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   numero:
 *                     type: number
 *                   texto:
 *                     type: string
 *                   competencia:
 *                     type: string
 *                   competencia_label:
 *                     type: string
 */
router.get('/test-preguntas', getTestPreguntas);

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
 *                   required: [numero, score]
 *                   properties:
 *                     numero:
 *                       type: number
 *                     score:
 *                       type: number
 *                       minimum: 1
 *                       maximum: 5
 *           example:
 *             respuestas:
 *               - numero: 1
 *                 score: 3
 *               - numero: 2
 *                 score: 4
 *               - numero: 3
 *                 score: 2
 *               - numero: 4
 *                 score: 5
 *               - numero: 5
 *                 score: 3
 *               - numero: 6
 *                 score: 4
 *               - numero: 7
 *                 score: 2
 *               - numero: 8
 *                 score: 3
 *               - numero: 9
 *                 score: 4
 *               - numero: 10
 *                 score: 3
 *               - numero: 11
 *                 score: 5
 *               - numero: 12
 *                 score: 2
 *     responses:
 *       201:
 *         description: Plan creado con el resultado del diagnóstico
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
 *                 puntuaciones_por_competencia:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       competencia:
 *                         type: string
 *                       competencia_label:
 *                         type: string
 *                       puntuacion:
 *                         type: number
 *                 competencias_a_mejorar:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Respuestas requeridas / Formato inválido / Faltan o sobran respuestas
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
 *     summary: Obtener la lección del día actual
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lección del día (null si ya se completó hoy)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 leccion:
 *                   type: object
 *                   nullable: true
 *                   description: Datos de la lección del día, o null si ya se completó
 *                   properties:
 *                     dia_actual:
 *                       type: number
 *                     titulo:
 *                       type: string
 *                     tipo:
 *                       type: string
 *                     emociones_objetivo:
 *                       type: array
 *                       items:
 *                         type: string
 *                     datos_leccion:
 *                       type: object
 *       404:
 *         description: No hay plan activo o contenido no disponible
 */
router.get('/today', today);

/**
 * @swagger
 * /api/plan/days:
 *   get:
 *     summary: Obtener días del plan con contenido y respuestas del usuario
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: completados
 *         schema:
 *           type: boolean
 *         description: Si es true, solo devuelve los días completados
 *     responses:
 *       200:
 *         description: Lista de días
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dias:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       dia_numero:
 *                         type: number
 *                       completado:
 *                         type: boolean
 *                       fecha_completado:
 *                         type: string
 *                         nullable: true
 *                       respuesta_usuario:
 *                         type: object
 *                         nullable: true
 *                       leccion:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           titulo:
 *                             type: string
 *                           tipo:
 *                             type: string
 *                           emociones_objetivo:
 *                             type: array
 *                             items:
 *                               type: string
 *                           respuesta_tipo:
 *                             type: string
 *                             enum: [abierta, escala, estructurado]
 *                           datos_leccion:
 *                             type: object
 *       404:
 *         description: No hay plan activo
 */
router.get('/days', days);

/**
 * @swagger
 * /api/plan/profile:
 *   get:
 *     summary: Obtener estado del progreso del plan
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado completo del progreso del plan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dia_actual:
 *                   type: number
 *                 racha_dias:
 *                   type: number
 *                 racha_maxima:
 *                   type: number
 *                 estado:
 *                   type: string
 *                   enum: [activo, completado, abandonado]
 *                 actividad_completada_hoy:
 *                   type: boolean
 *                 fecha_inicio:
 *                   type: string
 *                   format: date-time
 *                 dias_completados:
 *                   type: number
 *                 dias_totales:
 *                   type: number
 *                   example: 30
 *       404:
 *         description: No hay un plan activo
 */
router.get('/profile', profile);

/**
 * @swagger
 * /api/plan/complete-day:
 *   post:
 *     summary: Marcar día actual como completado
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               respuesta_usuario:
 *                 type: object
 *                 description: Datos del ejercicio diario completado (opcional)
 *                 properties:
 *                   reflexion:
 *                     type: string
 *                     description: Reflexión del usuario sobre la lección del día
 *                     example: Hoy aprendí a identificar mis emociones antes de reaccionar
 *                   estado_animo:
 *                     type: number
 *                     description: Estado de ánimo del usuario (1-5)
 *                     example: 4
 *                 example:
 *                   reflexion: Hoy aprendí a identificar mis emociones antes de reaccionar
 *                   estado_animo: 4
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
 *                 racha_maxima:
 *                   type: number
 *                   description: Racha máxima histórica alcanzada por el usuario
 *                 estado:
 *                   type: string
 *                 hito_alcanzado:
 *                   type: number
 *                   nullable: true
 *                   description: Hito de racha alcanzado en este completado (3, 7, 15, 30) o null si no se alcanzó ninguno nuevo
 *       404:
 *         description: No hay plan activo
 *       409:
 *         description: El usuario ya completó una actividad en el día calendario actual o ya la completó previamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Ya completaste la actividad de hoy
 */
router.post('/complete-day', completeDay);

/**
 * @swagger
 * /api/plan/testing/advance:
 *   post:
 *     summary: "[DEV] Avanzar al siguiente día sin validación"
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Día avanzado
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
 *                 racha_maxima:
 *                   type: number
 *                 estado:
 *                   type: string
 *                 hito_alcanzado:
 *                   type: number
 *                   nullable: true
 *       404:
 *         description: No hay plan activo
 */
if (process.env.NODE_ENV !== 'production') {
  router.post('/testing/advance', advanceDay);
}

module.exports = router;

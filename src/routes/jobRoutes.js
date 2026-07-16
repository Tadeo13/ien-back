  const { Router } = require('express');
  const rateLimit = require('express-rate-limit');
  const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');
  const { resetStreaks, sendReminders, sendActivationNudge, sendRecovery } = require('../controllers/jobController');

  const router = Router();

  const jobLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas llamadas a jobs, intentá de nuevo en 1 hora' }
  });

  router.use(jobLimiter, apiKeyMiddleware);

/**
 * @swagger
 * /api/jobs/reset-streaks:
 *   post:
 *     summary: Resetear rachas de usuarios inactivos (demoledor de rachas)
 *     tags: [Jobs]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Rachas reseteadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 modifiedCount:
 *                   type: number
 *       401:
 *         description: API key inválida
 */
router.post('/reset-streaks', resetStreaks);

/**
 * @swagger
 * /api/jobs/send-reminders:
 *   post:
 *     summary: Enviar recordatorios a usuarios rezagados y registrar en HistorialCorreo
 *     tags: [Jobs]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [momento_alerta]
 *             properties:
 *               momento_alerta:
 *                 type: string
 *                 enum: [mañana, recordatorio_tarde, alerta_noche]
 *                 description: Momento del día en que se envía el recordatorio
 *     responses:
 *       200:
 *         description: Resultado del envío de recordatorios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enviados:
 *                   type: number
 *                 fallidos:
 *                   type: number
 *       400:
 *         description: momento_alerta requerido o inválido
 *       401:
 *         description: API key inválida
 */
router.post('/send-reminders', sendReminders);

/**
 * @swagger
 * /api/jobs/send-activation-nudge:
 *   post:
 *     summary: Enviar nudge de activación a usuarios registrados que nunca activaron el plan
 *     tags: [Jobs]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Resultado del envío de nudges de activación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enviados:
 *                   type: number
 *                 saltados:
 *                   type: number
 *                 total:
 *                   type: number
 *       401:
 *         description: API key inválida
 */
router.post('/send-activation-nudge', sendActivationNudge);

/**
 * @swagger
 * /api/jobs/send-recovery:
 *   post:
 *     summary: Enviar correo de recuperación a usuarios inactivos por más de 7 días
 *     tags: [Jobs]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Resultado del envío de correos de recuperación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enviados:
 *                   type: number
 *                 saltados:
 *                   type: number
 *                 total:
 *                   type: number
 *       401:
 *         description: API key inválida
 */
router.post('/send-recovery', sendRecovery);

module.exports = router;

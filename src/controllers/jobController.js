const { demoledorDeRachas, sendReminders } = require('../services/jobService');
const { tryCatch } = require('../middlewares/errorHandler');
const AppError = require('../utils/AppError');

exports.resetStreaks = tryCatch(async (_req, res) => {
  const result = await demoledorDeRachas();
  res.json(result);
});

exports.sendReminders = tryCatch(async (req, res) => {
  const { momento_alerta } = req.body;

  const momentosValidos = ['mañana', 'recordatorio_tarde', 'alerta_noche'];
  if (!momento_alerta || !momentosValidos.includes(momento_alerta)) {
    throw new AppError(400, `momento_alerta requerido. Valores válidos: ${momentosValidos.join(', ')}`);
  }

  const result = await sendReminders(momento_alerta);
  res.json(result);
});

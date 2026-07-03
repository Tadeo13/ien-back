const { setupTest, getToday, completeDay } = require('../services/planService');
const { tryCatch, AppError } = require('../middlewares/errorHandler');

exports.setupTest = tryCatch(async (req, res) => {
  const { respuestas, emociones_a_mejorar } = req.body;

  if (!respuestas) {
    throw new AppError(400, 'Respuestas requeridas');
  }

  const plan = await setupTest({
    respuestas,
    emociones_a_mejorar,
    usuarioId: req.usuario.id
  });

  res.status(201).json({
    plan_id: plan._id,
    dia_actual: plan.dia_actual,
    estado: plan.estado
  });
});

exports.today = tryCatch(async (req, res) => {
  const result = await getToday(req.usuario.id);
  res.json(result);
});

exports.completeDay = tryCatch(async (req, res) => {
  const result = await completeDay(req.usuario.id);
  res.json(result);
});

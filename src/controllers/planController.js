const { setupTest, getToday, getProfile, completeDay, advanceDay, getDays, getTestPreguntas, saveDailyResponses, getDailyResponses } = require('../services/planService');
const { tryCatch } = require('../middlewares/errorHandler');
const AppError = require('../utils/AppError');

exports.getTestPreguntas = tryCatch(async (req, res) => {
  const preguntas = await getTestPreguntas();
  res.json(preguntas);
});

exports.setupTest = tryCatch(async (req, res) => {
  const { respuestas } = req.body;

  if (!respuestas) {
    throw new AppError(400, 'Respuestas requeridas');
  }

  const plan = await setupTest({
    respuestas,
    usuarioId: req.usuario.id
  });

  res.status(201).json({
    plan_id: plan._id,
    dia_actual: plan.dia_actual,
    estado: plan.estado,
    puntuaciones_por_competencia: plan.test_inicial.puntuaciones_por_competencia,
    competencias_a_mejorar: plan.test_inicial.competencias_a_mejorar
  });
});

exports.today = tryCatch(async (req, res) => {
  const result = await getToday(req.usuario.id);
  res.json(result);
});

exports.profile = tryCatch(async (req, res) => {
  const result = await getProfile(req.usuario.id);
  res.json(result);
});

exports.completeDay = tryCatch(async (req, res) => {
  const { respuesta_usuario } = req.body;
  const result = await completeDay(req.usuario.id, respuesta_usuario);
  res.json(result);
});

exports.days = tryCatch(async (req, res) => {
  const soloCompletados = req.query.completados === 'true';
  const result = await getDays(req.usuario.id, soloCompletados);
  res.json(result);
});

exports.advanceDay = tryCatch(async (req, res) => {
  const result = await advanceDay(req.usuario.id);
  res.json(result);
});

exports.responderDiario = tryCatch(async (req, res) => {
  const { dia_numero, respuestas } = req.body;
  if (!dia_numero || !respuestas || !Array.isArray(respuestas)) {
    throw new AppError(400, 'dia_numero y respuestas son requeridos');
  }
  const result = await saveDailyResponses(req.usuario.id, dia_numero, respuestas);
  res.status(201).json(result);
});

exports.respuestasDiarias = tryCatch(async (req, res) => {
  const dia_numero = parseInt(req.params.dia, 10);
  const result = await getDailyResponses(req.usuario.id, dia_numero);
  res.json(result);
});

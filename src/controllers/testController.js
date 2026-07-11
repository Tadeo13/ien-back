const { obtenerPreguntas, guardarRespuestas, obtenerResultados } = require('../services/testService');
const { tryCatch } = require('../middlewares/errorHandler');

exports.preguntas = tryCatch(async (_req, res) => {
  const preguntas = await obtenerPreguntas();
  res.json(preguntas);
});

exports.responder = tryCatch(async (req, res) => {
  const { respuestas } = req.body;
  if (!respuestas || !Array.isArray(respuestas) || respuestas.length === 0) {
    return res.status(400).json({ error: 'Respuestas requeridas' });
  }
  const resultado = await guardarRespuestas({ usuarioId: req.usuario.id, respuestas });
  res.status(201).json(resultado);
});

exports.resultados = tryCatch(async (req, res) => {
  const resultado = await obtenerResultados(req.usuario.id);
  res.json(resultado);
});

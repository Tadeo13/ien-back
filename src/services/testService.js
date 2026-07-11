const TestPregunta = require('../models/TestPregunta');
const RespuestaTest = require('../models/RespuestaTest');
const AppError = require('../utils/AppError');

exports.obtenerPreguntas = async () => {
  return TestPregunta.find().sort({ numero: 1 });
};

exports.guardarRespuestas = async ({ usuarioId, respuestas }) => {
  const existe = await RespuestaTest.findOne({ usuario: usuarioId, completado: true });
  if (existe) {
    throw new AppError(409, 'El usuario ya completó el test');
  }

  const preguntas = await TestPregunta.find().lean();
  const preguntasMap = {};
  for (const p of preguntas) {
    preguntasMap[p._id.toString()] = p;
  }

  const COMPETENCIAS = ['autoconciencia', 'autoconfianza', 'autocontrol', 'empatia', 'motivacion', 'competencia_social'];
  const respuestasProcesadas = [];
  const puntajes = { autoconciencia: 0, autoconfianza: 0, autocontrol: 0, empatia: 0, motivacion: 0, competencia_social: 0 };
  const conteo = { autoconciencia: 0, autoconfianza: 0, autocontrol: 0, empatia: 0, motivacion: 0, competencia_social: 0 };

  for (const r of respuestas) {
    const pregunta = preguntasMap[r.pregunta];
    if (!pregunta) continue;

    respuestasProcesadas.push({ pregunta: r.pregunta, valor: r.valor });

    if (pregunta.tipo_respuesta === 'escala' && typeof r.valor === 'number') {
      puntajes[pregunta.competencia] += r.valor;
      conteo[pregunta.competencia]++;
    }
  }

  for (const comp of COMPETENCIAS) {
    if (conteo[comp] > 0) {
      puntajes[comp] = Math.round((puntajes[comp] / conteo[comp]) * 10) / 10;
    }
  }

  const respuestaTest = await RespuestaTest.create({
    usuario: usuarioId,
    respuestas: respuestasProcesadas,
    puntajes,
    completado: true
  });

  return respuestaTest;
};

exports.obtenerResultados = async (usuarioId) => {
  const resultado = await RespuestaTest
    .findOne({ usuario: usuarioId, completado: true })
    .sort({ fecha: -1 })
    .populate('respuestas.pregunta', 'numero texto competencia competencia_label');

  if (!resultado) {
    throw new AppError(404, 'No hay resultados de test');
  }

  return resultado;
};

const Usuario = require('../models/Usuario');
const Tienda = require('../models/Tienda');
const PlanProgreso = require('../models/PlanProgreso');
const ContenidoDiario = require('../models/ContenidoDiario');
const AppError = require('../utils/AppError');
const { esMismoDiaCalendarioUTC } = require('../utils/fechas');

function yaCompletoActividadHoy(plan, ahora) {
  if (!plan.ultima_fecha_actividad) return false;
  if (!esMismoDiaCalendarioUTC(plan.ultima_fecha_actividad, ahora)) return false;

  // Si la última actividad coincide hoy, verificamos si de verdad hay algún día completado hoy.
  // Evita bloquear al usuario el primer día de creación del plan (donde ultima_fecha_actividad se inicializa hoy).
  return plan.progreso_diario.some(dia =>
    dia.completado && esMismoDiaCalendarioUTC(dia.fecha_completado, ahora)
  );
}

// Hitos de racha a notificar al frontend (para badge/celebración).
// No disparan correo todavía — eso queda para la fase de email.
const HITOS_RACHA = [3, 7, 15, 30];

function detectarHito(racha_dias, hitos_alcanzados = []) {
  if (HITOS_RACHA.includes(racha_dias) && !hitos_alcanzados.includes(racha_dias)) {
    return racha_dias;
  }
  return null;
}

/**
 * Marca el dia_actual del plan como completado de forma atomica:
 * - actualiza el elemento correcto de progreso_diario via operador posicional $
 * - incrementa racha_dias y avanza dia_actual con $inc
 * - actualiza racha_maxima con $max (nunca retrocede)
 * - refresca ultima_fecha_actividad
 * Devuelve { plan, hito_alcanzado } donde hito_alcanzado es el hito de racha
 * alcanzado en este completado, o null si no se alcanzó ninguno nuevo.
 */
async function marcarDiaCompletado(planId) {
  const plan = await PlanProgreso.findById(planId)
    .select('dia_actual ultima_fecha_actividad progreso_diario estado racha_dias racha_maxima hitos_alcanzados')
    .lean();
  if (!plan) throw new AppError(404, 'Plan no encontrado');

  const ahora = new Date();

  // LIMITACIÓN CONOCIDA: Comparación de día calendario en UTC.
  if (yaCompletoActividadHoy(plan, ahora)) {
    throw new AppError(409, 'Ya completaste la actividad de hoy');
  }

  // Actualización atómica con pipeline de agregación (MongoDB 4.2+).
  // Stage 1: marca el día via $map/$cond/$mergeObjects, actualiza fechas, incrementa racha/dia.
  // Stage 2: $max de racha_maxima contra $racha_dias (que ya es el valor post-incremento).
  // Todo en una sola operación atómica — no hay ventana entre $inc y $max.
  const planActualizado = await PlanProgreso.findOneAndUpdate(
    {
      _id: planId,
      progreso_diario: {
        $elemMatch: {
          dia_numero: plan.dia_actual,
          completado: false
        }
      }
    },
    [
      {
        $set: {
          progreso_diario: {
            $map: {
              input: '$progreso_diario',
              as: 'dia',
              in: {
                $cond: {
                  if: { $eq: ['$$dia.dia_numero', plan.dia_actual] },
                  then: { $mergeObjects: ['$$dia', { completado: true, fecha_completado: ahora }] },
                  else: '$$dia'
                }
              }
            }
          },
          ultima_fecha_actividad: ahora,
          racha_dias: { $add: ['$racha_dias', 1] },
          dia_actual: { $add: ['$dia_actual', 1] }
        }
      },
      {
        $set: {
          racha_maxima: { $max: ['$racha_maxima', '$racha_dias'] }
        }
      }
    ],
    { new: true }
  );

  if (!planActualizado) {
    throw new AppError(409, 'Ya completaste la actividad de hoy');
  }

  // Si ya se superó el día 30, cerramos el plan como completado
  if (planActualizado.dia_actual > 30 && planActualizado.estado === 'activo') {
    planActualizado.estado = 'completado';
    await planActualizado.save();
  }

  const hito_alcanzado = detectarHito(planActualizado.racha_dias, plan.hitos_alcanzados);
  if (hito_alcanzado !== null) {
    await PlanProgreso.updateOne(
      { _id: planId },
      { $addToSet: { hitos_alcanzados: hito_alcanzado } }
    );
  }

  return { plan: planActualizado, hito_alcanzado };
}

/**
 * Crea el plan inicial de un usuario con los resultados del test.
 */
exports.setupTest = async ({ respuestas, emociones_a_mejorar, usuarioId }) => {
  const usuario = await Usuario.findById(usuarioId).select('tienda_id codigo_activacion');
  if (!usuario || !usuario.tienda_id) {
    throw new AppError(400, 'Usuario sin tienda asociada — no se puede iniciar el plan');
  }

  const tienda = await Tienda.findById(usuario.tienda_id);
  if (!tienda) {
    throw new AppError(404, 'Tienda no encontrada');
  }

  const existe = await PlanProgreso.findOne({ usuario_id: usuarioId });
  if (existe) {
    throw new AppError(409, 'El usuario ya tiene un plan');
  }

  // DECISIÓN DE DISEÑO / REGLA DE NEGOCIO:
  // Se opta por inicializar el PlanProgreso aquí y no en el registro de usuario (register)
  // para garantizar que el plan solo se marque como "activo" una vez que el usuario complete
  // efectivamente el test inicial. Esto evita registrar planes activos "fantasma" sin datos
  // de base de diagnóstico, optimizando la precisión de las métricas de participación y racha.
  return PlanProgreso.create({
    usuario_id: usuarioId,
    tienda_id: tienda._id,
    codigo_utilizado: usuario.codigo_activacion,
    test_inicial: {
      fecha_completado: new Date(),
      respuestas,
      emociones_a_mejorar: emociones_a_mejorar || []
    }
  });
};

/**
 * Devuelve el contenido del dia actual del plan activo del usuario.
 */
exports.getToday = async (usuarioId) => {
  const plan = await PlanProgreso
    .findOne({ usuario_id: usuarioId, estado: 'activo' })
    .select('dia_actual ultima_fecha_actividad progreso_diario racha_dias racha_maxima estado');
  if (!plan) {
    throw new AppError(404, 'No hay un plan activo');
  }

  const ahora = new Date();
  if (yaCompletoActividadHoy(plan, ahora)) {
    return {
      actividad_completada_hoy: true,
      mensaje: "Ya completaste tu actividad de hoy, volvé mañana",
      dia_actual: plan.dia_actual,
      racha_dias: plan.racha_dias,
      racha_maxima: plan.racha_maxima,
      estado: plan.estado
    };
  }

  const contenido = await ContenidoDiario.findOne({ dia_numero: plan.dia_actual });
  if (!contenido) {
    throw new AppError(404, 'Contenido no disponible para este día');
  }

  return {
    dia_actual: plan.dia_actual,
    titulo: contenido.titulo_modulo,
    tipo: contenido.tipo_contenido,
    emociones_objetivo: contenido.emociones_objetivo,
    datos_leccion: contenido.datos_leccion,
    racha_dias: plan.racha_dias,
    racha_maxima: plan.racha_maxima,
    estado: plan.estado,
    actividad_completada_hoy: false
  };
};

/**
 * Completa el día actual y avanza el plan.
 */
exports.completeDay = async (usuarioId) => {
  const plan = await PlanProgreso
    .findOne({ usuario_id: usuarioId, estado: 'activo' })
    .select('_id');
  if (!plan) {
    throw new AppError(404, 'No hay un plan activo');
  }

  const { plan: planActualizado, hito_alcanzado } = await marcarDiaCompletado(plan._id);

  return {
    // BUG-01 Fix: Usar el valor incrementado (planActualizado) y restarle 1,
    // garantizando que devolvemos el día exacto que el usuario acaba de completar
    // sin basarnos en la variable 'plan' anterior que está en estado stale.
    dia_completado: planActualizado.dia_actual - 1,
    dia_actual: planActualizado.dia_actual,
    racha_dias: planActualizado.racha_dias,
    racha_maxima: planActualizado.racha_maxima,
    estado: planActualizado.estado,
    hito_alcanzado
  };
};

// Exportado para testing unitario
exports.yaCompletoActividadHoy = yaCompletoActividadHoy;
exports.detectarHito = detectarHito;

const Usuario = require('../models/Usuario');
const Tienda = require('../models/Tienda');
const PlanProgreso = require('../models/PlanProgreso');
const ContenidoDiario = require('../models/ContenidoDiario');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Marca el dia_actual del plan como completado de forma atomica:
 * - actualiza el elemento correcto de progreso_diario via operador posicional $
 * - incrementa racha_dias y avanza dia_actual con $inc
 * - refresca ultima_fecha_actividad
 */
async function marcarDiaCompletado(planId) {
  const plan = await PlanProgreso.findById(planId).select('dia_actual').lean();
  if (!plan) throw new AppError(404, 'Plan no encontrado');

  const ahora = new Date();

  const planActualizado = await PlanProgreso.findOneAndUpdate(
    { _id: planId, 'progreso_diario.dia_numero': plan.dia_actual },
    {
      $set: {
        'progreso_diario.$.completado': true,
        'progreso_diario.$.fecha_completado': ahora,
        ultima_fecha_actividad: ahora
      },
      $inc: { racha_dias: 1, dia_actual: 1 }
    },
    { new: true }
  );

  if (!planActualizado) {
    throw new AppError(500, 'No se encontró el día actual dentro de progreso_diario');
  }

  // Si ya se superó el día 30, cerramos el plan como completado
  if (planActualizado.dia_actual > 30 && planActualizado.estado === 'activo') {
    planActualizado.estado = 'completado';
    await planActualizado.save();
  }

  return planActualizado;
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
  const plan = await PlanProgreso.findOne({ usuario_id: usuarioId, estado: 'activo' });
  if (!plan) {
    throw new AppError(404, 'No hay un plan activo');
  }

  const contenido = await ContenidoDiario.findOne({ dia_numero: plan.dia_actual });
  if (!contenido) {
    throw new AppError(404, 'Contenido no disponible para este día');
  }

  return {
    dia: plan.dia_actual,
    titulo: contenido.titulo_modulo,
    tipo: contenido.tipo_contenido,
    emociones_objetivo: contenido.emociones_objetivo,
    datos_leccion: contenido.datos_leccion,
    racha_dias: plan.racha_dias,
    estado: plan.estado
  };
};

/**
 * Completa el día actual y avanza el plan.
 */
exports.completeDay = async (usuarioId) => {
  const plan = await PlanProgreso.findOne({ usuario_id: usuarioId, estado: 'activo' });
  if (!plan) {
    throw new AppError(404, 'No hay un plan activo');
  }

  const planActualizado = await marcarDiaCompletado(plan._id);

  return {
    // BUG-01 Fix: Usar el valor incrementado (planActualizado) y restarle 1,
    // garantizando que devolvemos el día exacto que el usuario acaba de completar
    // sin basarnos en la variable 'plan' anterior que está en estado stale.
    dia_completado: planActualizado.dia_actual - 1,
    dia_actual: planActualizado.dia_actual,
    racha_dias: planActualizado.racha_dias,
    estado: planActualizado.estado
  };
};

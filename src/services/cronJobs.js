const PlanProgreso = require('../models/PlanProgreso');
const { esMismoDiaCalendarioUTC, getInicioDeDiaDeAyer } = require('../utils/fechas');

async function findUsuariosRezagados() {
  const umbralMinimo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  return PlanProgreso.aggregate([
    {
      $match: {
        estado: 'activo',
        ultima_fecha_actividad: { $lte: umbralMinimo },
        $expr: {
          $eq: [
            { $arrayElemAt: ['$progreso_diario.completado', { $subtract: ['$dia_actual', 1] }] },
            false
          ]
        }
      }
    },
    { $lookup: { from: 'usuarios', localField: 'usuario_id', foreignField: '_id', as: 'usuario' } },
    { $unwind: '$usuario' },
    {
      $project: {
        usuario_id: 1,
        dia_actual: 1,
        racha_dias: 1,
        nombre: '$usuario.nombre',
        email: '$usuario.email'
      }
    }
  ]);
}

/**
 * Resetea racha_dias a 0 para planes activos cuya ultima_fecha_actividad
 * sea anterior a ayer en calendario UTC.
 *
 * LÓGICA DE DÍA CALENDARIO (alineada con complete-day):
 *   - ultima_fecha_actividad = HOY  → NO resetear (el usuario ya completó hoy).
 *   - ultima_fecha_actividad = AYER → NO resetear (el usuario todavía tiene la
 *     ventana de hoy para completar antes de que el cron vuelva a correr).
 *   - ultima_fecha_actividad < AYER → RESETEAR.
 *
 * Criterio de "ayer en UTC": calculamos el inicio del día UTC de ayer y
 * buscamos documentos cuya fecha sea estrictamente anterior a ese timestamp.
 * Esto reemplaza la vieja resta de 24*60*60*1000 que podía resetear usuarios
 * que completaron a las 23:59 UTC del día anterior dentro de la misma ventana.
 */
async function demoledorDeRachas() {
  const inicioDeDiaDeAyer = getInicioDeDiaDeAyer();
  const filtro = {
    estado: 'activo',
    ultima_fecha_actividad: { $lt: inicioDeDiaDeAyer },
    racha_dias: { $gt: 0 }
  };

  const planesAfectados = await PlanProgreso
    .find(filtro)
    .select('usuario_id racha_dias')
    .lean();

  const resultado = await PlanProgreso.updateMany(filtro, { $set: { racha_dias: 0 } });

  return {
    matchedCount: resultado.matchedCount,
    modifiedCount: resultado.modifiedCount,
    usuarios_afectados: planesAfectados.map(p => ({
      usuario_id: p.usuario_id,
      racha_rota: p.racha_dias
    }))
  };
}

module.exports = { findUsuariosRezagados, demoledorDeRachas };

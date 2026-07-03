const PlanProgreso = require('../models/PlanProgreso');

async function findUsuariosRezagados() {
  return PlanProgreso.aggregate([
    {
      $match: {
        estado: 'activo',
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

async function demoledorDeRachas() {
  const hace24hs = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return PlanProgreso.updateMany(
    { estado: 'activo', ultima_fecha_actividad: { $lt: hace24hs } },
    { $set: { racha_dias: 0 } }
  );
}

module.exports = { findUsuariosRezagados, demoledorDeRachas };

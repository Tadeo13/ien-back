const PlanProgreso = require('../models/PlanProgreso');

async function panelAdminPorTienda() {
  return PlanProgreso.aggregate([
    {
      $group: {
        _id: '$tienda_id',
        total_activaciones: { $sum: 1 },
        usuarios_activos: { $sum: { $cond: [{ $eq: ['$estado', 'activo'] }, 1, 0] } },
        completados: { $sum: { $cond: [{ $eq: ['$estado', 'completado'] }, 1, 0] } },
        abandonados: { $sum: { $cond: [{ $eq: ['$estado', 'abandonado'] }, 1, 0] } },
        promedio_dia_progreso: { $avg: '$dia_actual' },
        racha_promedio: { $avg: '$racha_dias' }
      }
    },
    { $lookup: { from: 'tiendas', localField: '_id', foreignField: '_id', as: 'tienda' } },
    { $unwind: '$tienda' },
    {
      $project: {
        _id: 0,
        tienda_id: '$_id',
        nombre_tienda: '$tienda.nombre_tienda',
        ciudad: '$tienda.ciudad',
        total_activaciones: 1,
        usuarios_activos: 1,
        completados: 1,
        abandonados: 1,
        promedio_dia_progreso: { $round: ['$promedio_dia_progreso', 2] },
        racha_promedio: { $round: ['$racha_promedio', 2] }
      }
    },
    { $sort: { total_activaciones: -1 } }
  ]);
}

module.exports = { panelAdminPorTienda };

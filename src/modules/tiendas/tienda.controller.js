const Tienda = require('../../models/Tienda');
const AppError = require('../../utils/AppError');
const { tryCatch } = require('../../middlewares/errorHandler');

// Utilidad para verificar si un id está en el scope del admin
function tiendaEnScope(id, tiendasPermitidas) {
  if (!tiendasPermitidas) return true; // admin_general
  return tiendasPermitidas.some((t) => t.toString() === id.toString());
}

/**
 * GET /admin/sucursales
 * admin_general: todas; admin_negocio: solo sus tiendas
 */
exports.listar = tryCatch(async (req, res) => {
  let filtro = {};
  if (req.tiendasPermitidas !== null) {
    filtro._id = { $in: req.tiendasPermitidas };
  }
  const incluirInactivas = req.query.incluir_inactivas === 'true' && ['admin_general', 'admin_negocio'].includes(req.usuario.rol);
  if (!incluirInactivas) {
    filtro.activo = true;
  }
  const tiendas = await Tienda.find(filtro).select('nombre_tienda ciudad activo');
  res.json(tiendas);
});

/**
 * POST /admin/sucursales — solo admin_general
 */
exports.crear = tryCatch(async (req, res) => {
  if (req.usuario.rol !== 'admin_general') {
    throw new AppError(403, 'Solo admin_general puede crear sucursales');
  }
  const { nombre_tienda, ciudad } = req.body;
  if (!nombre_tienda || !ciudad) {
    throw new AppError(400, 'nombre_tienda y ciudad son requeridos');
  }
  const tienda = await Tienda.create({ nombre_tienda, ciudad });
  res.status(201).json(tienda);
});

/**
 * PUT /admin/sucursales/:id
 * admin_general: cualquier campo; admin_negocio: solo nombre_tienda y ciudad si está en scope
 */
exports.actualizar = tryCatch(async (req, res) => {
  const { id } = req.params;

  if (!tiendaEnScope(id, req.tiendasPermitidas)) {
    throw new AppError(403, 'Sin acceso a esta sucursal');
  }

  const campos = {
    nombre_tienda: req.body.nombre_tienda,
    ciudad: req.body.ciudad
  };

  const tienda = await Tienda.findByIdAndUpdate(id, campos, { new: true, runValidators: true });
  if (!tienda) throw new AppError(404, 'Sucursal no encontrada');
  res.json(tienda);
});

/**
 * DELETE /admin/sucursales/:id — solo admin_general
 */
exports.eliminar = tryCatch(async (req, res) => {
  if (req.usuario.rol !== 'admin_general' && !(req.usuario.rol === 'admin_negocio' && tiendaEnScope(req.params.id, req.tiendasPermitidas))) {
    throw new AppError(403, 'Solo admin_general puede desactivar sucursales');
  }
  const tienda = await Tienda.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
  if (!tienda) throw new AppError(404, 'Sucursal no encontrada');
  res.json({ mensaje: 'Sucursal desactivada', tienda });
});

/**
 * PATCH /admin/sucursales/:id/reactivar — solo admin_general
 */
exports.reactivar = tryCatch(async (req, res) => {
  if (req.usuario.rol !== 'admin_general' && !(req.usuario.rol === 'admin_negocio' && tiendaEnScope(req.params.id, req.tiendasPermitidas))) {
    throw new AppError(403, 'Solo admin_general puede reactivar sucursales');
  }
  const tienda = await Tienda.findByIdAndUpdate(req.params.id, { activo: true }, { new: true });
  if (!tienda) throw new AppError(404, 'Sucursal no encontrada');
  res.json({ mensaje: 'Sucursal reactivada', tienda });
});

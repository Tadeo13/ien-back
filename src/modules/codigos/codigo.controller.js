const Codigo = require('../../models/Codigo');
const AppError = require('../../utils/AppError');
const { tryCatch } = require('../../middlewares/errorHandler');

function codigoEnScope(codigo, tiendasPermitidas) {
  if (!tiendasPermitidas) return true;
  return tiendasPermitidas.some((t) => t.toString() === codigo.tienda_id.toString());
}

/**
 * GET /admin/codigos
 */
exports.listar = tryCatch(async (req, res) => {
  let filtro = {};
  if (req.tiendasPermitidas !== null) {
    filtro.tienda_id = { $in: req.tiendasPermitidas };
  }
  const codigos = await Codigo.find(filtro)
    .populate('tienda_id', 'nombre_tienda ciudad activo')
    .populate('producto_id', 'nombre');
  res.json(codigos);
});

/**
 * POST /admin/codigos
 */
exports.crear = tryCatch(async (req, res) => {
  const { codigo, producto_id, tienda_id } = req.body;
  if (!codigo || !producto_id || !tienda_id) {
    throw new AppError(400, 'codigo, producto_id y tienda_id son requeridos');
  }

  if (req.tiendasPermitidas !== null) {
    const enScope = req.tiendasPermitidas.some((t) => t.toString() === tienda_id.toString());
    if (!enScope) throw new AppError(403, 'No puedes crear códigos para esa tienda');
  }

  const doc = await Codigo.create({ codigo, producto_id, tienda_id, activo: true });
  res.status(201).json(doc);
});

/**
 * PATCH /admin/codigos/:id/activar
 */
exports.activar = tryCatch(async (req, res) => {
  const doc = await Codigo.findById(req.params.id);
  if (!doc) throw new AppError(404, 'Código no encontrado');
  if (!codigoEnScope(doc, req.tiendasPermitidas)) {
    throw new AppError(403, 'Sin acceso a este código');
  }
  doc.activo = true;
  await doc.save();
  res.json({ mensaje: 'Código activado', codigo: doc });
});

/**
 * PATCH /admin/codigos/:id/desactivar
 */
exports.desactivar = tryCatch(async (req, res) => {
  const doc = await Codigo.findById(req.params.id);
  if (!doc) throw new AppError(404, 'Código no encontrado');
  if (!codigoEnScope(doc, req.tiendasPermitidas)) {
    throw new AppError(403, 'Sin acceso a este código');
  }
  doc.activo = false;
  await doc.save();
  res.json({ mensaje: 'Código desactivado', codigo: doc });
});

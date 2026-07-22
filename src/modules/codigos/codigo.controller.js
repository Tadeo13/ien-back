const Codigo = require('../../models/Codigo');
const Producto = require('../../models/Producto');
const AppError = require('../../utils/AppError');
const { tryCatch } = require('../../middlewares/errorHandler');

const { enScope } = require('../../utils/scope');
/**
 * GET /admin/codigos
 */
exports.listar = tryCatch(async (req, res) => {
  let filtro = {};
  if (req.tiendasPermitidas !== null) {
    filtro.tienda_id = { $in: req.tiendasPermitidas };
  }
  const codigos = await Codigo.find(filtro)
    .select('codigo producto_id tienda_id activo fecha_creacion fecha_activacion')
    .populate('tienda_id', 'nombre_tienda ciudad activo')
    .populate('producto_id', 'nombre');
  const result = codigos.map(c => {
    const obj = c.toObject();
    const { _id, ...rest } = obj;
    return { id: _id, ...rest };
  });
  res.json(result);
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
    if (!enScope(tienda_id, req.tiendasPermitidas)) throw new AppError(403, 'No puedes crear códigos para esa tienda');
  }

  const producto = await Producto.findById(producto_id).select('tienda_id').lean();
  if (!producto) throw new AppError(400, 'Producto no encontrado');
  if (producto.tienda_id.toString() !== tienda_id) {
    throw new AppError(400, 'El producto no pertenece a la tienda indicada');
  }

  const doc = await Codigo.create({ codigo, producto_id, tienda_id, activo: true });
  const { _id: cid, ...crest } = doc.toObject();
  res.status(201).json({ id: cid, ...crest });
});

/**
 * PATCH /admin/codigos/:id/activar
 */
exports.activar = tryCatch(async (req, res) => {
  const doc = await Codigo.findById(req.params.id).select('tienda_id activo codigo');
  if (!doc) throw new AppError(404, 'Código no encontrado');
  if (!enScope(doc.tienda_id, req.tiendasPermitidas)) {
    throw new AppError(403, 'Sin acceso a este código');
  }
  doc.activo = true;
  await doc.save();
  const { _id: aid, ...arest } = doc.toObject();
  res.json({ mensaje: 'Código activado', codigo: { id: aid, ...arest } });
});

/**
 * PATCH /admin/codigos/:id/desactivar
 */
exports.desactivar = tryCatch(async (req, res) => {
  const doc = await Codigo.findById(req.params.id).select('tienda_id activo codigo');
  if (!doc) throw new AppError(404, 'Código no encontrado');
  if (!enScope(doc.tienda_id, req.tiendasPermitidas)) {
    throw new AppError(403, 'Sin acceso a este código');
  }
  doc.activo = false;
  await doc.save();
  const { _id: did, ...drest } = doc.toObject();
  res.json({ mensaje: 'Código desactivado', codigo: { id: did, ...drest } });
});

const Producto = require('../../models/Producto');
const AppError = require('../../utils/AppError');
const { tryCatch } = require('../../middlewares/errorHandler');
const { enScope } = require('../../utils/scope');

/**
 * GET /admin/productos
 */
exports.listar = tryCatch(async (req, res) => {
  let filtro = {};
  if (req.tiendasPermitidas !== null) {
    filtro.tienda_id = { $in: req.tiendasPermitidas };
  }
  const productos = await Producto.find(filtro)
    .populate('tienda_id', 'nombre_tienda ciudad');
  res.json(productos);
});

/**
 * POST /admin/productos
 */
exports.crear = tryCatch(async (req, res) => {
  const { nombre, descripcion, tienda_id } = req.body;
  if (!nombre) throw new AppError(400, 'nombre es requerido');

  if (!enScope(tienda_id, req.tiendasPermitidas)) {
    throw new AppError(403, 'Solo puedes asignar una tienda dentro de tu scope');
  }

  const producto = await Producto.create({ nombre, descripcion, tienda_id });
  const { _id, ...prest } = producto.toObject();
  res.status(201).json({ id: _id, ...prest });
});

/**
 * PUT /admin/productos/:id
 */
exports.actualizar = tryCatch(async (req, res) => {
  const producto = await Producto.findById(req.params.id).select('nombre descripcion tienda_id');
  if (!producto) throw new AppError(404, 'Producto no encontrado');

  if (!enScope(producto.tienda_id, req.tiendasPermitidas)) {
    throw new AppError(403, 'Sin acceso a este producto');
  }

  const { nombre, descripcion, tienda_id } = req.body;
  if (tienda_id && !enScope(tienda_id, req.tiendasPermitidas)) {
    throw new AppError(403, 'Solo puedes asignar una tienda dentro de tu scope');
  }

  if (nombre !== undefined) producto.nombre = nombre;
  if (descripcion !== undefined) producto.descripcion = descripcion;
  if (tienda_id !== undefined) producto.tienda_id = tienda_id;
  await producto.save();

  const { _id: pid, ...prest2 } = producto.toObject();
  res.json({ id: pid, ...prest2 });
});

/**
 * DELETE /admin/productos/:id
 */
exports.eliminar = tryCatch(async (req, res) => {
  const producto = await Producto.findById(req.params.id).select('tienda_id');
  if (!producto) throw new AppError(404, 'Producto no encontrado');

  if (!enScope(producto.tienda_id, req.tiendasPermitidas)) {
    throw new AppError(403, 'Sin acceso a este producto');
  }

  await producto.deleteOne();
  res.json({ mensaje: 'Producto eliminado' });
});

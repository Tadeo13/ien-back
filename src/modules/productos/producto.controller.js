const Producto = require('../../models/Producto');
const AppError = require('../../utils/AppError');
const { tryCatch } = require('../../middlewares/errorHandler');

// ¿El producto tiene al menos una tienda dentro del scope del admin?
function productoEnScope(producto, tiendasPermitidas) {
  if (!tiendasPermitidas) return true;
  return producto.tiendas.some((t) =>
    tiendasPermitidas.some((p) => p.toString() === t.toString())
  );
}

// ¿Todas las tiendas del body están dentro del scope?
function tiendasValidas(tiendas, tiendasPermitidas) {
  if (!tiendasPermitidas) return true;
  return tiendas.every((t) =>
    tiendasPermitidas.some((p) => p.toString() === t.toString())
  );
}

/**
 * GET /admin/productos
 */
exports.listar = tryCatch(async (req, res) => {
  let filtro = {};
  if (req.tiendasPermitidas !== null) {
    filtro.tiendas = { $in: req.tiendasPermitidas };
  }
  const productos = req.tiendasPermitidas === null
    ? await Producto.find(filtro).populate('tiendas', 'nombre_tienda ciudad')
    : await Producto.find(filtro).select('-tiendas');
  res.json(productos);
});

/**
 * POST /admin/productos
 */
exports.crear = tryCatch(async (req, res) => {
  const { nombre, descripcion, tiendas = [] } = req.body;
  if (!nombre) throw new AppError(400, 'nombre es requerido');

  if (!tiendasValidas(tiendas, req.tiendasPermitidas)) {
    throw new AppError(403, 'Solo puedes asignar tiendas dentro de tu scope');
  }

  const producto = await Producto.create({ nombre, descripcion, tiendas });
  res.status(201).json(producto);
});

/**
 * PUT /admin/productos/:id
 */
exports.actualizar = tryCatch(async (req, res) => {
  const producto = await Producto.findById(req.params.id);
  if (!producto) throw new AppError(404, 'Producto no encontrado');

  if (!productoEnScope(producto, req.tiendasPermitidas)) {
    throw new AppError(403, 'Sin acceso a este producto');
  }

  const { nombre, descripcion, tiendas } = req.body;
  if (tiendas && !tiendasValidas(tiendas, req.tiendasPermitidas)) {
    throw new AppError(403, 'Solo puedes asignar tiendas dentro de tu scope');
  }

  if (nombre !== undefined) producto.nombre = nombre;
  if (descripcion !== undefined) producto.descripcion = descripcion;
  if (tiendas !== undefined) producto.tiendas = tiendas;
  await producto.save();

  res.json(producto);
});

/**
 * DELETE /admin/productos/:id
 */
exports.eliminar = tryCatch(async (req, res) => {
  const producto = await Producto.findById(req.params.id);
  if (!producto) throw new AppError(404, 'Producto no encontrado');

  if (!productoEnScope(producto, req.tiendasPermitidas)) {
    throw new AppError(403, 'Sin acceso a este producto');
  }

  await producto.deleteOne();
  res.json({ mensaje: 'Producto eliminado' });
});

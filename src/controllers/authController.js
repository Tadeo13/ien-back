const { validateCode, register, login, refreshToken, logout } = require('../services/authService');
const { tryCatch } = require('../middlewares/errorHandler');
const AppError = require('../utils/AppError');
const Usuario = require('../models/Usuario');
// Importar para registrar schemas antes de cualquier populate
require('../models/Tienda');
require('../models/Producto');

exports.validateCode = tryCatch(async (req, res) => {
  const { codigo_activacion } = req.body;

  if (!codigo_activacion) {
    throw new AppError(400, 'Código de activación requerido');
  }

  const result = await validateCode(codigo_activacion);

  res.json({
    valido: true,
    tienda: result.tienda ? { id: result.tienda._id, nombre: result.tienda.nombre_tienda, ciudad: result.tienda.ciudad } : null,
    producto: result.producto ? { id: result.producto._id, nombre: result.producto.nombre } : null
  });
});

exports.register = tryCatch(async (req, res) => {
  const { nombre, email, password, codigo_activacion } = req.body;

  if (!nombre || !email || !password || !codigo_activacion) {
    throw new AppError(400, 'Todos los campos son requeridos');
  }

  const result = await register({ nombre, email, password, codigo_activacion });

  res.status(201).json(result);
});

exports.login = tryCatch(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(400, 'Email y contraseña requeridos');
  }

  const result = await login({ email, password });

  res.json(result);
});

exports.profile = tryCatch(async (req, res) => {
  const usuario = await Usuario.findById(req.usuario.id)
    .populate('tienda_id')
    .populate('producto_id')
    .populate('tiendas_administradas', 'nombre_tienda ciudad')
    .select('nombre email rol fecha_registro tienda_id producto_id tiendas_administradas');

  if (!usuario) {
    throw new AppError(404, 'Usuario no encontrado');
  }

  res.json({
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    fecha_registro: usuario.fecha_registro,
    tienda: usuario.tienda_id ? {
      id: usuario.tienda_id._id,
      nombre_tienda: usuario.tienda_id.nombre_tienda,
      ciudad: usuario.tienda_id.ciudad
    } : null,
    producto: usuario.producto_id ? {
      id: usuario.producto_id._id,
      nombre: usuario.producto_id.nombre,
      descripcion: usuario.producto_id.descripcion
    } : null,
    tiendas_administradas: usuario.tiendas_administradas
  });
});

exports.refresh = tryCatch(async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    throw new AppError(400, 'Refresh token requerido');
  }

  const result = await refreshToken(refresh_token);
  res.json(result);
});

exports.logout = tryCatch(async (req, res) => {
  const { refresh_token } = req.body;

  const result = await logout(refresh_token);
  res.json(result);
});

const { validateCode, register, login, refreshToken, logout } = require('../services/authService');
const { tryCatch } = require('../middlewares/errorHandler');
const AppError = require('../utils/AppError');

exports.validateCode = tryCatch(async (req, res) => {
  const { codigo_activacion } = req.body;

  if (!codigo_activacion) {
    throw new AppError(400, 'Código de activación requerido');
  }

  const tienda = await validateCode(codigo_activacion);

  res.json({ valido: true, tienda: { id: tienda._id, nombre: tienda.nombre_tienda, ciudad: tienda.ciudad } });
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

const { validateCode, register, login } = require('../services/authService');
const { tryCatch, AppError } = require('../middlewares/errorHandler');

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

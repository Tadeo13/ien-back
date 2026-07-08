const Usuario = require('../models/Usuario');
const { tryCatch } = require('./errorHandler');
const AppError = require('../utils/AppError');

const adminMiddleware = tryCatch(async (req, _res, next) => {
  const usuario = await Usuario.findById(req.usuario.id).select('rol');
  if (!usuario || usuario.rol !== 'admin') {
    throw new AppError(403, 'Acceso denegado');
  }
  next();
});

module.exports = adminMiddleware;

const Usuario = require('../models/Usuario');
const { tryCatch } = require('./errorHandler');
const AppError = require('../utils/AppError');

const adminMiddleware = tryCatch(async (req, _res, next) => {
  const usuario = await Usuario.findById(req.usuario.id).select('rol tiendas_administradas');
  if (!usuario || (usuario.rol !== 'admin_general' && usuario.rol !== 'admin_negocio')) {
    throw new AppError(403, 'Acceso denegado');
  }
  // Enriquecer req.usuario con datos de rol para middlewares downstream
  req.usuario.rol = usuario.rol;
  req.usuario.tiendas_administradas = usuario.tiendas_administradas;
  next();
});

module.exports = adminMiddleware;

const AppError = require('../utils/AppError');

/**
 * Corre después de authMiddleware + adminMiddleware.
 * adminMiddleware ya enriquece req.usuario con { rol, tiendas_administradas }.
 *
 * Expone req.tiendasPermitidas:
 *   - null  → admin_general (sin restricciones)
 *   - Array → admin_negocio (ObjectIds de tiendas en su scope)
 */
function scopeTiendaMiddleware(req, _res, next) {
  if (!req.usuario?.rol) {
    return next(new AppError(403, 'Rol de usuario no disponible'));
  }

  if (req.usuario.rol === 'admin_general') {
    req.tiendasPermitidas = null;
  } else {
    // admin_negocio: usar tiendas_administradas ya cargadas por adminMiddleware
    req.tiendasPermitidas = req.usuario.tiendas_administradas || [];
  }

  next();
}

module.exports = scopeTiendaMiddleware;

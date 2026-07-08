const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const Tienda = require('../models/Tienda');
const AppError = require('../utils/AppError');
const { panelAdminPorTienda } = require('./panelAdmin');

exports.panelAdminPorTienda = panelAdminPorTienda;

exports.crearAdminNegocio = async ({ nombre, email, password, tiendas_administradas }) => {
  if (!nombre || !email || !password) {
    throw new AppError(400, 'nombre, email y password son requeridos');
  }

  if (!tiendas_administradas || !Array.isArray(tiendas_administradas) || tiendas_administradas.length === 0) {
    throw new AppError(400, 'Debe asignar al menos una tienda');
  }

  const existe = await Usuario.findOne({ email });
  if (existe) throw new AppError(409, 'El email ya está registrado');

  const tiendasExistentes = await Tienda.find({ _id: { $in: tiendas_administradas } }).lean();
  if (tiendasExistentes.length !== tiendas_administradas.length) {
    throw new AppError(400, 'Una o más tiendas no existen');
  }

  const password_hash = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({
    nombre,
    email,
    password_hash,
    rol: 'admin_negocio',
    tiendas_administradas
  });

  return {
    id: usuario._id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    tiendas_administradas: usuario.tiendas_administradas
  };
};

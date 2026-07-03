const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Tienda = require('../models/Tienda');

const JWT_SECRET = process.env.JWT_SECRET;

function generarToken(usuario) {
  return jwt.sign({ id: usuario._id, email: usuario.email }, JWT_SECRET, { expiresIn: '30d' });
}

exports.validateCode = async (codigo_activacion) => {
  const tienda = await Tienda.findOne({ codigo_activacion });
  if (!tienda) {
    const AppError = require('../middlewares/errorHandler').AppError;
    throw new AppError(404, 'Código inválido');
  }
  return tienda;
};

exports.register = async ({ nombre, email, password, codigo_activacion }) => {
  const AppError = require('../middlewares/errorHandler').AppError;

  const tienda = await Tienda.findOne({ codigo_activacion });
  if (!tienda) {
    throw new AppError(404, 'Código de activación inválido');
  }

  const existe = await Usuario.findOne({ email });
  if (existe) {
    throw new AppError(409, 'El email ya está registrado');
  }

  const password_hash = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({ nombre, email, password_hash, tienda_id: tienda._id, codigo_activacion });

  const token = generarToken(usuario);
  return { token, usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email } };
};

exports.login = async ({ email, password }) => {
  const AppError = require('../middlewares/errorHandler').AppError;

  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  const coincide = await bcrypt.compare(password, usuario.password_hash);
  if (!coincide) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  const token = generarToken(usuario);
  return { token, usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email } };
};

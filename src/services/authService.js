const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Usuario = require('../models/Usuario');
const Tienda = require('../models/Tienda');
const Codigo = require('../models/Codigo');
const RefreshToken = require('../models/RefreshToken');
const AppError = require('../utils/AppError');

const JWT_SECRET = process.env.JWT_SECRET;

function generarAccessToken(usuario) {
  return jwt.sign({ id: usuario._id }, JWT_SECRET, { expiresIn: '15m' });
}

async function generarRefreshToken(usuarioId) {
  const token = crypto.randomBytes(40).toString('hex');
  const token_hash = crypto.createHash('sha256').update(token).digest('hex');
  const fecha_expiracion = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ usuario_id: usuarioId, token_hash, fecha_expiracion });
  return token;
}

exports.validateCode = async (codigo_activacion) => {
  if (typeof codigo_activacion !== 'string') {
    throw new AppError(400, 'Código de activación inválido');
  }

  const codDoc = await Codigo.findOne({ codigo: codigo_activacion, activo: true })
    .populate('tienda_id')
    .populate('producto_id');

  if (!codDoc) {
    throw new AppError(404, 'Código inválido o ya utilizado');
  }

  return {
    tienda: codDoc.tienda_id,
    producto: codDoc.producto_id
  };
};

exports.register = async ({ nombre, email, password, codigo_activacion }) => {
  if (typeof email !== 'string' || typeof password !== 'string' || typeof codigo_activacion !== 'string') {
    throw new AppError(400, 'Todos los campos son requeridos');
  }

  const codDoc = await Codigo.findOne({ codigo: codigo_activacion, activo: true });
  if (!codDoc) {
    throw new AppError(404, 'Código de activación inválido o ya utilizado');
  }

  const existe = await Usuario.findOne({ email });
  if (existe) {
    throw new AppError(409, 'El email ya está registrado');
  }

  // Consumir el código
  codDoc.activo = false;
  codDoc.fecha_activacion = new Date();
  await codDoc.save();

  const password_hash = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({
    nombre,
    email,
    password_hash,
    tienda_id: codDoc.tienda_id,
    producto_id: codDoc.producto_id,
    codigo_activacion
  });

  const access_token = generarAccessToken(usuario);
  const refresh_token = await generarRefreshToken(usuario._id);
  return { access_token, refresh_token, usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email } };
};

exports.login = async ({ email, password }) => {
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new AppError(400, 'Email y contraseña requeridos');
  }

  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  const coincide = await bcrypt.compare(password, usuario.password_hash);
  if (!coincide) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  const access_token = generarAccessToken(usuario);
  const refresh_token = await generarRefreshToken(usuario._id);
  return { access_token, refresh_token, usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email } };
};

exports.refreshToken = async (refreshTokenPlano) => {
  if (typeof refreshTokenPlano !== 'string') {
    throw new AppError(400, 'Refresh token requerido');
  }

  const token_hash = crypto.createHash('sha256').update(refreshTokenPlano).digest('hex');
  const doc = await RefreshToken.findOne({ token_hash, revocado: false, fecha_expiracion: { $gt: new Date() } });
  if (!doc) {
    throw new AppError(401, 'Refresh token inválido o expirado');
  }

  doc.revocado = true;
  await doc.save();

  const access_token = generarAccessToken({ _id: doc.usuario_id });
  const refresh_token = await generarRefreshToken(doc.usuario_id);
  return { access_token, refresh_token };
};

exports.logout = async (refreshTokenPlano) => {
  if (typeof refreshTokenPlano !== 'string') {
    throw new AppError(400, 'Refresh token requerido');
  }

  const token_hash = crypto.createHash('sha256').update(refreshTokenPlano).digest('hex');
  const doc = await RefreshToken.findOne({ token_hash, revocado: false });
  if (doc) {
    doc.revocado = true;
    await doc.save();
  }

  return { mensaje: 'Sesión cerrada' };
};

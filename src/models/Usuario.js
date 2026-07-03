const mongoose = require('mongoose');
const { Schema } = mongoose;

const usuarioSchema = new Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  rol: { type: String, enum: ['usuario', 'admin'], default: 'usuario' },
  tienda_id: { type: Schema.Types.ObjectId, ref: 'Tienda' },
  codigo_activacion: { type: String },
  fecha_registro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Usuario', usuarioSchema, 'usuarios');

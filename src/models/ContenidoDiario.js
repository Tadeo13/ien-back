const mongoose = require('mongoose');
const { Schema } = mongoose;

const contenidoDiarioSchema = new Schema({
  dia_numero: { type: Number, required: true, unique: true },
  titulo_modulo: String,
  tipo_contenido: { type: String, required: true },
  emociones_objetivo: [String],
  datos_leccion: { type: Schema.Types.Mixed, required: true }
});

module.exports = mongoose.model('ContenidoDiario', contenidoDiarioSchema, 'contenidos_diarios');

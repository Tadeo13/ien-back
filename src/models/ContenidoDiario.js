const mongoose = require('mongoose');
const { Schema } = mongoose;

const campoRespuestaSchema = new Schema({
  id: { type: String, required: true },
  etiqueta: { type: String, required: true },
  tipo: {
    type: String,
    enum: ['texto', 'numero', 'escala', 'reflexion'],
    required: true
  },
  min: Number,
  max: Number,
  opciones: [{ valor: Schema.Types.Mixed, etiqueta: String }]
}, { _id: false });

const contenidoDiarioSchema = new Schema({
  dia_numero: { type: Number, required: true, unique: true },
  titulo_modulo: String,
  tipo_contenido: { type: String, required: true },
  emociones_objetivo: [String],
  respuesta_tipo: {
    type: String,
    enum: ['abierta', 'escala', 'estructurado'],
    default: 'abierta'
  },
  campos_respuesta: [campoRespuestaSchema],
  datos_leccion: { type: Schema.Types.Mixed, required: true },
  cabecera: { type: String, default: null }
});

module.exports = mongoose.model('ContenidoDiario', contenidoDiarioSchema, 'contenidos_diarios');

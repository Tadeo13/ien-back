const mongoose = require('mongoose');
const { Schema } = mongoose;

const campoRespuestaSchema = new Schema({
  id: { type: String, required: true },
  valor: { type: Schema.Types.Mixed, required: true },
  tipo: {
    type: String,
    enum: ['texto', 'numero', 'escala', 'reflexion'],
    default: 'texto'
  }
}, { _id: false });

const respuestaDiariaSchema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  dia_numero: { type: Number, required: true },
  respuestas: [campoRespuestaSchema],
  completado: { type: Boolean, default: false },
  fecha: { type: Date, default: Date.now }
});

respuestaDiariaSchema.index({ usuario: 1, dia_numero: 1 }, { unique: true });

module.exports = mongoose.model('RespuestaDiaria', respuestaDiariaSchema, 'respuestas_diarias');

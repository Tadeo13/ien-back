const mongoose = require('mongoose');
const { Schema } = mongoose;

const respuestaItemSchema = new Schema({
  pregunta: { type: Schema.Types.ObjectId, ref: 'TestPregunta', required: true },
  valor: { type: Schema.Types.Mixed, required: true }
}, { _id: false });

const puntajesSchema = new Schema({
  autoconciencia: { type: Number, default: 0 },
  autoconfianza: { type: Number, default: 0 },
  autocontrol: { type: Number, default: 0 },
  empatia: { type: Number, default: 0 },
  motivacion: { type: Number, default: 0 },
  competencia_social: { type: Number, default: 0 }
}, { _id: false });

const respuestaTestSchema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  respuestas: [respuestaItemSchema],
  puntajes: puntajesSchema,
  completado: { type: Boolean, default: false },
  fecha: { type: Date, default: Date.now }
});

respuestaTestSchema.index({ usuario: 1, fecha: -1 });

module.exports = mongoose.model('RespuestaTest', respuestaTestSchema, 'respuestas_test');

const mongoose = require('mongoose');
const { Schema } = mongoose;

const opcionSchema = new Schema({
  valor: { type: Schema.Types.Mixed, required: true },
  etiqueta: { type: String, required: true }
}, { _id: false });

const testPreguntaSchema = new Schema({
  numero: { type: Number, required: true, unique: true },
  texto: { type: String, required: true },
  competencia: {
    type: String,
    required: true,
    enum: ['autoconciencia', 'autoconfianza', 'autocontrol', 'empatia', 'motivacion', 'competencia_social']
  },
  competencia_label: { type: String, required: true },
  tipo_respuesta: {
    type: String,
    enum: ['escala', 'abierta'],
    default: 'escala'
  },
  opciones: [opcionSchema]
});

module.exports = mongoose.model('TestPregunta', testPreguntaSchema, 'test_preguntas');

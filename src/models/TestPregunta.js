const mongoose = require('mongoose');
const { Schema } = mongoose;

const testPreguntaSchema = new Schema({
  numero: { type: Number, required: true, unique: true },
  texto: { type: String, required: true },
  competencia: {
    type: String,
    required: true,
    enum: ['autoconciencia', 'autoconfianza', 'autocontrol', 'empatia', 'motivacion', 'competencia_social']
  },
  competencia_label: { type: String, required: true }
});

module.exports = mongoose.model('TestPregunta', testPreguntaSchema, 'test_preguntas');

const mongoose = require('mongoose');
const { Schema } = mongoose;

// datos_leccion es Mixed para soportar la estructura enriquecida del seed:
// { tipo, titulo, bloque, concepto, ejercicio, contenido, suplementacion, principio, recursos }
// El campo emociones_objetivo se mantiene para compatibilidad con el endpoint /today.
const contenidoDiarioSchema = new Schema({
  dia_numero: { type: Number, required: true, unique: true },
  titulo_modulo: String,
  tipo_contenido: { type: String, required: true },
  emociones_objetivo: [String],
  // Tipo de respuesta esperada del usuario para el ejercicio del día:
  //   'abierta'      → texto libre / reflexión
  //   'escala'       → calificación numérica o checklist binario
  //   'estructurado' → objeto con múltiples llaves definidas
  respuesta_tipo: {
    type: String,
    enum: ['abierta', 'escala', 'estructurado'],
    required: true,
    default: 'abierta'
  },
  datos_leccion: { type: Schema.Types.Mixed, required: true }
});

module.exports = mongoose.model('ContenidoDiario', contenidoDiarioSchema, 'contenidos_diarios');

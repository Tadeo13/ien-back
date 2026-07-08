const mongoose = require('mongoose');
const { Schema } = mongoose;

const respuestaSchema = new Schema({
  pregunta_id: String,
  texto: String,
  respuesta_elegida: String,
  score: Number
}, { _id: false });

const testInicialSchema = new Schema({
  fecha_completado: Date,
  respuestas: [respuestaSchema],
  emociones_a_mejorar: [String]
}, { _id: false });

const diaProgresoSchema = new Schema({
  dia_numero: { type: Number, required: true },
  completado: { type: Boolean, default: false },
  fecha_completado: { type: Date, default: null }
}, { _id: false });

const planProgresoSchema = new Schema({
  usuario_id: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tienda_id: { type: Schema.Types.ObjectId, ref: 'Tienda', required: true },
  codigo_utilizado: { type: String, required: true },
  fecha_inicio: { type: Date, default: Date.now },
  dia_actual: { type: Number, default: 1 },
  racha_dias: { type: Number, default: 0 },
  racha_maxima: { type: Number, default: 0 },
  hitos_alcanzados: { type: [Number], default: [] },
  ultima_fecha_actividad: { type: Date, default: Date.now },
  estado: { type: String, enum: ['activo', 'completado', 'abandonado'], default: 'activo' },
  test_inicial: testInicialSchema,
  progreso_diario: {
    type: [diaProgresoSchema],
    default: () => Array.from({ length: 30 }, (_, i) => ({
      dia_numero: i + 1,
      completado: false,
      fecha_completado: null
    }))
  }
});

planProgresoSchema.index({ estado: 1, dia_actual: 1 });
planProgresoSchema.index({ estado: 1, ultima_fecha_actividad: 1 });
planProgresoSchema.index({ usuario_id: 1, estado: 1 });

module.exports = mongoose.model('PlanProgreso', planProgresoSchema, 'planes_progreso');

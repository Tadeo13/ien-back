const mongoose = require('mongoose');
const { Schema } = mongoose;

const contenidoEspecialSchema = new Schema({
  tipo: {
    type: String,
    required: true,
    enum: ['bienvenida', 'presentacion', 'reflexion_15_dias', 'reflexion_30_dias']
  },
  titulo: { type: String, required: true },
  contenido: { type: Schema.Types.Mixed, required: true }
});

contenidoEspecialSchema.index({ tipo: 1 }, { unique: true });

module.exports = mongoose.model('ContenidoEspecial', contenidoEspecialSchema, 'contenidos_especiales');

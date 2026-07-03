const mongoose = require('mongoose');
const { Schema } = mongoose;

const tiendaSchema = new Schema({
  nombre_tienda: { type: String, required: true },
  ciudad: { type: String, required: true },
  codigo_activacion: { type: String, required: true, unique: true },
  fecha_creacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tienda', tiendaSchema, 'tiendas');

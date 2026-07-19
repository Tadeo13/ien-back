const mongoose = require('mongoose');
const { Schema } = mongoose;

const productoSchema = new Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  tiendas: [{ type: Schema.Types.ObjectId, ref: 'Tienda' }]
});

module.exports = mongoose.model('Producto', productoSchema, 'productos');

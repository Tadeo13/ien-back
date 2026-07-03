const mongoose = require('mongoose');
const { Schema } = mongoose;

const historialCorreoSchema = new Schema({
  usuario_id: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  email_destino: { type: String, required: true },
  momento_alerta: { type: String, enum: ['mañana', 'recordatorio_tarde', 'alerta_noche'], required: true },
  fecha_envio: { type: Date, default: Date.now, expires: 5184000 },
  estado: { type: String, enum: ['enviado', 'fallido'], required: true }
});

module.exports = mongoose.model('HistorialCorreo', historialCorreoSchema, 'historial_correos');

const { demoledorDeRachas, findUsuariosRezagados } = require('./cronJobs');
const HistorialCorreo = require('../models/HistorialCorreo');

async function sendReminders(momento_alerta) {
  const usuarios = await findUsuariosRezagados();
  if (usuarios.length === 0) {
    return { enviados: 0, fallidos: 0 };
  }

  const docs = usuarios.map(u => ({
    usuario_id: u.usuario_id,
    email_destino: u.email,
    momento_alerta,
    estado: 'enviado'
  }));

  try {
    const result = await HistorialCorreo.insertMany(docs, { ordered: false });
    return { enviados: result.length, fallidos: docs.length - result.length };
  } catch (err) {
    console.error('Error en sendReminders:', err.message);
    if (err.writeErrors) {
      return { enviados: err.insertedDocs ? err.insertedDocs.length : 0, fallidos: docs.length - (err.insertedDocs ? err.insertedDocs.length : 0) };
    }
    return { enviados: 0, fallidos: docs.length };
  }
}

module.exports = { demoledorDeRachas, sendReminders };

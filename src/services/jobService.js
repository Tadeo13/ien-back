const { demoledorDeRachas, findUsuariosRezagados } = require('./cronJobs');
const HistorialCorreo = require('../models/HistorialCorreo');

async function sendReminders(momento_alerta) {
  const usuarios = await findUsuariosRezagados();
  let enviados = 0;
  let fallidos = 0;

  for (const usuario of usuarios) {
    try {
      await HistorialCorreo.create({
        usuario_id: usuario.usuario_id,
        email_destino: usuario.email,
        momento_alerta,
        estado: 'enviado'
      });
      enviados++;
    } catch {
      fallidos++;
    }
  }

  return { enviados, fallidos };
}

module.exports = { demoledorDeRachas, sendReminders };

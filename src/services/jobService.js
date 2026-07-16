const { demoledorDeRachas, findUsuariosRezagados, findUsuariosSinActivar, findUsuariosParaRecuperar } = require('./cronJobs');
const HistorialCorreo = require('../models/HistorialCorreo');
const Usuario = require('../models/Usuario');
const { enviarCorreo, yaSeEnvio } = require('./emailService');

async function sendReminders(momento_alerta) {
  const usuarios = await findUsuariosRezagados();
  if (usuarios.length === 0) {
    return { enviados: 0, fallidos: 0 };
  }

  const docs = usuarios.map(u => ({
    usuario_id: u.usuario_id,
    email_destino: u.email,
    tipo_correo: 'recordatorio_diario',
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

async function resetStreaksYNotificar() {
  const resultado = await demoledorDeRachas();
  if (resultado.usuarios_afectados.length === 0) return { ...resultado, fallidos: 0 };

  const ids = resultado.usuarios_afectados.map(u => u.usuario_id);
  const usuarios = await Usuario.find({ _id: { $in: ids } }).select('nombre email').lean();
  const usuariosPorId = new Map(usuarios.map(u => [String(u._id), u]));

  let fallidos = 0;
  for (const afectado of resultado.usuarios_afectados) {
    try {
      const usuario = usuariosPorId.get(String(afectado.usuario_id));
      if (!usuario) continue;
      await enviarCorreo({
        usuario_id: afectado.usuario_id,
        destinatario: usuario.email,
        asunto: `${usuario.nombre}, se rompió tu racha de ${afectado.racha_rota} días`,
        html: `<p>Placeholder — racha rota: ${afectado.racha_rota} días</p>`,
        tipo_correo: 'racha_rota',
        meta: { racha_rota: afectado.racha_rota }
      });
    } catch (err) {
      console.error(`[resetStreaksYNotificar] Error con usuario ${afectado.usuario_id}:`, err.message);
      fallidos++;
    }
  }
  return { ...resultado, fallidos };
}

async function enviarActivationNudges() {
  const usuarios = await findUsuariosSinActivar();
  let enviados = 0, saltados = 0, fallidos = 0;
  for (const u of usuarios) {
    try {
      if (await yaSeEnvio(u._id, 'urgencia_activacion')) { saltados++; continue; }
      await enviarCorreo({
        usuario_id: u._id,
        destinatario: u.email,
        asunto: `${u.nombre}, tu transformación te está esperando...`,
        html: `<p>Placeholder — urgencia de activación</p>`,
        tipo_correo: 'urgencia_activacion'
      });
      enviados++;
    } catch (err) {
      console.error(`[enviarActivationNudges] Error con usuario ${u._id}:`, err.message);
      fallidos++;
    }
  }
  return { enviados, saltados, fallidos, total: usuarios.length };
}

async function enviarRecoveryEmails() {
  const usuarios = await findUsuariosParaRecuperar();
  let enviados = 0, saltados = 0, fallidos = 0;
  for (const u of usuarios) {
    try {
      if (await yaSeEnvio(u.usuario_id, 'recuperacion_inactividad')) { saltados++; continue; }
      await enviarCorreo({
        usuario_id: u.usuario_id,
        destinatario: u.email,
        asunto: `${u.nombre}, te extrañamos en tu programa`,
        html: `<p>Placeholder — recuperación por inactividad, día ${u.dia_actual}</p>`,
        tipo_correo: 'recuperacion_inactividad'
      });
      enviados++;
    } catch (err) {
      console.error(`[enviarRecoveryEmails] Error con usuario ${u.usuario_id}:`, err.message);
      fallidos++;
    }
  }
  return { enviados, saltados, fallidos, total: usuarios.length };
}

module.exports = { demoledorDeRachas, sendReminders, resetStreaksYNotificar, enviarActivationNudges, enviarRecoveryEmails };

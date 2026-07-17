const templates = require('../email/templates');
const { demoledorDeRachas, findUsuariosRezagados, findUsuariosSinActivar, findUsuariosParaRecuperar } = require('./cronJobs');
const Usuario = require('../models/Usuario');
const { enviarCorreo, yaSeEnvio } = require('./emailService');

async function sendReminders() {
  const usuarios = await findUsuariosRezagados();
  if (usuarios.length === 0) {
    return { enviados: 0, fallidos: 0, total: 0 };
  }

  let enviados = 0, fallidos = 0;

  for (const u of usuarios) {
    try {
      const resultado = await enviarCorreo({
        usuario_id: u.usuario_id,
        destinatario: u.email,
        asunto: u.nombre + ', no olvides completar tu actividad del Día ' + u.dia_actual,
        html: templates.recordatorioDiario(u.nombre, u.dia_actual),
        tipo_correo: 'recordatorio_diario',
        meta: { dia_actual: u.dia_actual, racha_dias: u.racha_dias }
      });
      if (resultado.success) {
        enviados++;
      } else {
        console.error(`[sendReminders] Fallo para usuario ${u.usuario_id}: ${resultado.error}`);
        fallidos++;
      }
    } catch (err) {
      console.error(`[sendReminders] Excepción con usuario ${u.usuario_id}:`, err.message);
      fallidos++;
    }
  }

  return { enviados, fallidos, total: usuarios.length };
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
      const resultado_envio = await enviarCorreo({
        usuario_id: afectado.usuario_id,
        destinatario: usuario.email,
        asunto: usuario.nombre + ', se rompió tu racha de ' + afectado.racha_rota + ' días',
        html: templates.rachaRota(usuario.nombre, afectado.racha_rota),
        tipo_correo: 'racha_rota',
        meta: { racha_rota: afectado.racha_rota }
      });
      if (!resultado_envio.success) {
        console.error(`[resetStreaksYNotificar] Fallo para usuario ${afectado.usuario_id}: ${resultado_envio.error}`);
        fallidos++;
      }
    } catch (err) {
      console.error(`[resetStreaksYNotificar] Excepción con usuario ${afectado.usuario_id}:`, err.message);
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
      const resultado = await enviarCorreo({
        usuario_id: u._id,
        destinatario: u.email,
        asunto: u.nombre + ', tu transformación te está esperando',
        html: templates.urgenciaActivacion(u.nombre),
        tipo_correo: 'urgencia_activacion'
      });
      if (resultado.success) {
        enviados++;
      } else {
        console.error(`[enviarActivationNudges] Fallo para usuario ${u._id}: ${resultado.error}`);
        fallidos++;
      }
    } catch (err) {
      console.error(`[enviarActivationNudges] Excepción con usuario ${u._id}:`, err.message);
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
      const resultado = await enviarCorreo({
        usuario_id: u.usuario_id,
        destinatario: u.email,
        asunto: u.nombre + ', te extrañamos en tu programa',
        html: templates.recuperacionInactividad(u.nombre, u.dia_actual),
        tipo_correo: 'recuperacion_inactividad'
      });
      if (resultado.success) {
        enviados++;
      } else {
        console.error(`[enviarRecoveryEmails] Fallo para usuario ${u.usuario_id}: ${resultado.error}`);
        fallidos++;
      }
    } catch (err) {
      console.error(`[enviarRecoveryEmails] Excepción con usuario ${u.usuario_id}:`, err.message);
      fallidos++;
    }
  }
  return { enviados, saltados, fallidos, total: usuarios.length };
}

module.exports = { demoledorDeRachas, sendReminders, resetStreaksYNotificar, enviarActivationNudges, enviarRecoveryEmails };

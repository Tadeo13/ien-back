const { demoledorDeRachas, findUsuariosRezagados, findUsuariosSinActivar, findUsuariosParaRecuperar } = require('./cronJobs');
const Usuario = require('../../models/Usuario');
const { enviarCorreo, enviarEnLote, yaSeEnvio } = require('../email/email.service');
const { recordatorioDiario, rachaRota, urgenciaActivacion, recuperacionInactividad } = require('../email/templates');

async function sendReminders() {
  const usuarios = await findUsuariosRezagados();
  if (usuarios.length === 0) {
    return { enviados: 0, fallidos: 0, saltados: 0, total: 0 };
  }
  return enviarEnLote(usuarios, {
    tipo_correo: 'recordatorio_diario',
    renderFn: (u) => ({ ...recordatorioDiario(u.nombre, u.dia_actual), meta: { dia_actual: u.dia_actual, racha_dias: u.racha_dias } })
  });
}

async function resetStreaksYNotificar() {
  const resultado = await demoledorDeRachas();
  if (resultado.usuarios_afectados.length === 0) return { ...resultado, fallidos: 0 };

  const ids = resultado.usuarios_afectados.map(u => u.usuario_id);
  const usuarios = await Usuario.find({ _id: { $in: ids } }).select('nombre email').lean();
  const usuariosPorId = new Map(usuarios.map(u => [String(u._id), u]));

  const destinatarios = resultado.usuarios_afectados
    .map(a => ({ ...usuariosPorId.get(String(a.usuario_id)), racha_rota: a.racha_rota, usuario_id: a.usuario_id }))
    .filter(u => u.email);

  const { fallidos } = await enviarEnLote(destinatarios, {
    tipo_correo: 'racha_rota',
    renderFn: (u) => ({ ...rachaRota(u.nombre, u.racha_rota), meta: { racha_rota: u.racha_rota } })
  });

  return { ...resultado, fallidos };
}

async function enviarActivationNudges() {
  const usuarios = await findUsuariosSinActivar();
  return enviarEnLote(usuarios, {
    tipo_correo: 'urgencia_activacion',
    renderFn: (u) => urgenciaActivacion(u.nombre),
    skipFn: (u) => yaSeEnvio(u._id, 'urgencia_activacion')
  });
}

async function enviarRecoveryEmails() {
  const usuarios = await findUsuariosParaRecuperar();
  return enviarEnLote(usuarios, {
    tipo_correo: 'recuperacion_inactividad',
    renderFn: (u) => ({ ...recuperacionInactividad(u.nombre, u.dia_actual), meta: { dia_actual: u.dia_actual } }),
    skipFn: (u) => yaSeEnvio(u.usuario_id, 'recuperacion_inactividad')
  });
}

module.exports = { demoledorDeRachas, sendReminders, resetStreaksYNotificar, enviarActivationNudges, enviarRecoveryEmails };

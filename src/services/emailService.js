const { Resend } = require('resend');
const HistorialCorreo = require('../models/HistorialCorreo');

async function registrarHistorial({ usuario_id, destinatario, tipo_correo, estado, meta }) {
  try {
    await HistorialCorreo.create({ usuario_id, email_destino: destinatario, tipo_correo, estado, meta });
  } catch (err) {
    console.error('[emailService] Error registrando historial:', err.message);
  }
}

async function enviarCorreo({ usuario_id, destinatario, asunto, html, tipo_correo, meta = {} }) {
  if (!process.env.RESEND_API_KEY) {
    console.error('[emailService] RESEND_API_KEY no configurada');
    await registrarHistorial({ usuario_id, destinatario, tipo_correo, estado: 'fallido', meta });
    return { success: false, error: 'RESEND_API_KEY no configurada' };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    const { data, error } = await resend.emails.send({ from, to: destinatario, subject: asunto, html });
    if (error) {
      console.error('[emailService] Error de Resend:', error.message);
      await registrarHistorial({ usuario_id, destinatario, tipo_correo, estado: 'fallido', meta });
      return { success: false, error: error.message };
    }
    await registrarHistorial({ usuario_id, destinatario, tipo_correo, estado: 'enviado', meta });
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error('[emailService] Excepción al enviar:', err.message);
    await registrarHistorial({ usuario_id, destinatario, tipo_correo, estado: 'fallido', meta });
    return { success: false, error: err.message };
  }
}

async function yaSeEnvio(usuario_id, tipo_correo) {
  const existe = await HistorialCorreo.findOne({ usuario_id, tipo_correo, estado: 'enviado' }).lean();
  return !!existe;
}

module.exports = { enviarCorreo, yaSeEnvio };

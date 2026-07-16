const { Resend } = require('resend');
const HistorialCorreo = require('../models/HistorialCorreo');

async function registrarHistorial({ usuario_id, destinatario, tipo_correo, momento_alerta, estado, meta }) {
  const datos = { usuario_id, email_destino: destinatario, tipo_correo, momento_alerta, estado, meta };
  for (let intento = 1; intento <= 2; intento++) {
    try {
      await HistorialCorreo.create(datos);
      return;
    } catch (err) {
      if (intento === 2) {
        console.error('[CRITICAL] No se pudo registrar HistorialCorreo tras reintento:', err.message, JSON.stringify(datos));
      } else {
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }
}

async function enviarCorreo({ usuario_id, destinatario, asunto, html, tipo_correo, momento_alerta, meta = {} }) {
  if (!process.env.RESEND_API_KEY) {
    console.error('[emailService] RESEND_API_KEY no configurada');
    await registrarHistorial({ usuario_id, destinatario, tipo_correo, momento_alerta, estado: 'fallido', meta });
    return { success: false, error: 'RESEND_API_KEY no configurada' };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    const { data, error } = await resend.emails.send({ from, to: destinatario, subject: asunto, html });
    if (error) {
      console.error('[emailService] Error de Resend:', error.message);
      await registrarHistorial({ usuario_id, destinatario, tipo_correo, momento_alerta, estado: 'fallido', meta });
      return { success: false, error: error.message };
    }
    await registrarHistorial({ usuario_id, destinatario, tipo_correo, momento_alerta, estado: 'enviado', meta });
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error('[emailService] Excepción al enviar:', err.message);
    await registrarHistorial({ usuario_id, destinatario, tipo_correo, momento_alerta, estado: 'fallido', meta });
    return { success: false, error: err.message };
  }
}

async function yaSeEnvio(usuario_id, tipo_correo) {
  try {
    const existe = await HistorialCorreo.findOne({ usuario_id, tipo_correo, estado: 'enviado' }).lean();
    return !!existe;
  } catch (err) {
    console.error('[yaSeEnvio] Error consultando HistorialCorreo:', err.message);
    throw err;
  }
}

module.exports = { enviarCorreo, yaSeEnvio };

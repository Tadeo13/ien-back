const { Resend } = require('resend');
const { getContentForDay } = require('./programTimeline');
const { renderTemplate } = require('./templates');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@tu-dominio.com';

if (!RESEND_API_KEY) {
  throw new Error(
    '[sendEmail] RESEND_API_KEY no está definida. ' +
    'Agrega RESEND_API_KEY=re_xxxxx a tu archivo .env para habilitar el envío de correos.'
  );
}

const resend = new Resend(RESEND_API_KEY);

function buildEmailPayload(user, day, overrides = {}) {
  const content = getContentForDay(day, overrides.isActivationPhase);

  if (!content) {
    throw new Error(`No hay contenido definido para el día ${day}`);
  }

  const templateName = overrides.template || content.template || 'daily';

  let subject;
  if (content.subject) {
    subject = content.subject
      .replace('{{nombre}}', user.nombre)
      .replace('{{dia}}', String(day));
  } else {
    subject = `Día ${day} — ${content.competencia}: ${content.tema}`;
  }

  const data = {
    nombre: user.nombre,
    email: user.email,
    dia: day,
    bloque: content.bloque,
    competencia: content.competencia,
    tema: content.tema,
    concepto: overrides.concepto || 'Concepto del día basado en la inteligencia emocional aplicada.',
    ejercicio: overrides.ejercicio || 'Ejercicio práctico de 5-10 minutos diseñado para este bloque.',
    suplementacion: overrides.suplementacion || 'Ashwagandha, Omega-3 y L-Teanina para apoyar el enfoque y la calma.',
    principio: overrides.principio || 'La neuroplasticidad permite que tu cerebro se reconfigure con la práctica constante.',
    producto: user.producto || 'Cardiosmile',
    clientes: user.clientes || 'miles de',
    body_line1: overrides.body_line1,
    body_line2: overrides.body_line2,
    mensaje_extra: overrides.mensaje_extra,
    reflexion_extra: overrides.reflexion_extra,
    _day: day
  };

  const html = renderTemplate(templateName, data);

  return {
    from: FROM_EMAIL,
    to: user.email,
    subject,
    html
  };
}

async function sendProgramEmail(user, day, overrides = {}) {
  let payload;
  try {
    payload = buildEmailPayload(user, day, overrides);
  } catch (buildErr) {
    console.error(`[EMAIL] Error construyendo payload para Día ${day} / ${user.email}:`, buildErr.message);
    return { success: false, error: buildErr.message, day, email: user.email };
  }

  try {
    const response = await resend.emails.send(payload);

    const messageId = response?.data?.id || response?.id || 'unknown';
    console.log(`[EMAIL] Enviado Día ${day} a ${user.email} — ID: ${messageId}`);
    return { success: true, messageId, day, email: user.email };
  } catch (error) {
    const statusCode = error?.statusCode || error?.status || error?.response?.status;

    if (statusCode === 401 || statusCode === 403) {
      console.error(
        `[EMAIL] Error de autenticación (${statusCode}) al enviar Día ${day} a ${user.email}: ` +
        `la RESEND_API_KEY es inválida o no tiene permisos. Verifica tu clave en https://resend.com/api-keys.`
      );
    } else if (statusCode === 429) {
      console.error(
        `[EMAIL] Rate limit excedido (429) al enviar Día ${day} a ${user.email}. ` +
        `Reintenta más tarde o reduce la frecuencia de envíos.`
      );
    } else if (error?.name === 'FetchError' || error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      console.error(
        `[EMAIL] Error de red al enviar Día ${day} a ${user.email}: ${error.message}. ` +
        `Verifica tu conexión a Internet y que resend.com sea accesible.`
      );
    } else {
      console.error(`[EMAIL] Error enviando Día ${day} a ${user.email}: ${error.message}`);
    }

    if (error?.response?.data) {
      console.error('[EMAIL] Detalle de la respuesta:', JSON.stringify(error.response.data, null, 2));
    }

    return { success: false, error: error.message, day, email: user.email };
  }
}

module.exports = {
  sendProgramEmail,
  buildEmailPayload
};

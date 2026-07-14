function wrapLayout(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    .email-container { max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background: #f9fafb; padding: 24px; }
    .email-card { background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .header { text-align: center; margin-bottom: 24px; }
    .header h1 { color: #1e293b; font-size: 24px; margin: 0 0 8px; }
    .header p { color: #64748b; font-size: 14px; margin: 0; }
    .divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
    .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px; }
    .footer a { color: #3b82f6; text-decoration: none; }
    .btn { display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .btn:hover { background: #2563eb; }
    .bullet-list { padding-left: 20px; color: #334155; line-height: 1.8; }
    .highlight-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 8px; }
    .section-label { font-weight: 700; color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 20px; margin-bottom: 6px; }
    .section-content { color: #475569; line-height: 1.7; margin: 0 0 8px; }
    .badge { display: inline-block; background: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; }
    @media only screen and (max-width: 480px) {
      .email-container { padding: 16px; }
      .email-card { padding: 20px; }
      .header h1 { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-card">
      ${bodyHtml}
      <div class="divider"></div>
      <div class="footer">
        <p>Cuidamos de tu mente y de tu corazón — Programa de Inteligencia Emocional</p>
        <p>Si prefieres no recibir estos correos, puedes <a href="{{unsubscribe_url}}">cancelar la suscripción</a>.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function templateWelcome(data) {
  return wrapLayout(`
    <div class="header">
      <h1>❤️ ¡Bienvenido, ${data.nombre}!</h1>
      <p>Tu viaje de 30 días hacia la inteligencia emocional comienza hoy</p>
    </div>
    <p style="color:#334155; line-height:1.7;">Nos alegra que hayas dado este paso. En los próximos 30 días descubrirás que el bienestar es el equilibrio entre <strong>comer bien, moverte, descansar y relacionarte</strong>.</p>
    <div class="highlight-box">
      <strong>Las 6 Competencias que desarrollarás:</strong>
      <ol style="margin:8px 0 0; padding-left:18px; color:#334155; line-height:1.8;">
        <li>Autoconciencia</li>
        <li>Autoconfianza</li>
        <li>Autocontrol</li>
        <li>Motivación</li>
        <li>Empatía</li>
        <li>Competencia Social</li>
      </ol>
    </div>
    <p style="color:#334155; line-height:1.7;">Este programa cuenta con el respaldo de <strong>Cardiosmile</strong> y <strong>Vitamin Shoppe</strong>, tus aliados en esta transformación.</p>
    <div class="divider"></div>
    <p style="color:#334155; line-height:1.7;">📬 <strong>Mañana recibirás tu primer contenido:</strong> Bloque I — Autoconciencia. Prepárate para comenzar.</p>
  `);
}

function templateUrgency(data, day) {
  const messages = {
    3: { title: 'Tu transformación te está esperando', cta: 'Activar mi programa gratuito', ctaUrl: '{{activation_url}}' },
    5: { title: 'Tu transformación te está esperando', cta: 'Reclamar Mi Bonus + Empezar Ahora', ctaUrl: '{{activation_url}}' },
    7: { title: 'Última oportunidad — tu programa gratuito expira', cta: 'Quiero mi acceso ahora', ctaUrl: '{{activation_url}}' }
  };
  const m = messages[day] || messages[3];

  return wrapLayout(`
    <div class="header">
      <h1>⏰ ${m.title}</h1>
      <p>${data.nombre}, esto es para ti</p>
    </div>
    <p style="color:#334155; line-height:1.7;">${data.body_line1 || ('Vimos que aún no has activado tu programa gratuito de inteligencia emocional.')}</p>
    <p style="color:#334155; line-height:1.7;">${data.body_line2 || ('Solo son 10 minutos al día × 30 días = una nueva versión de ti mismo.')}</p>
    <div class="highlight-box" style="text-align:center;">
      <p style="font-size:13px; color:#1e293b; margin:0 0 8px;"><strong>⏳ ${day >= 7 ? 'Oferta final' : 'Oferta por tiempo limitado'}</strong></p>
      <a href="${m.ctaUrl}" class="btn">${m.cta}</a>
    </div>
    <p style="color:#64748b; font-size:13px; line-height:1.6;">Personas que empiezan en los primeros 7 días tienen <strong>3x más probabilidad</strong> de completar la transformación.</p>
  `);
}

function templateDaily(data) {
  return wrapLayout(`
    <div class="header">
      <span class="badge">Día ${data.dia} · Bloque ${data.bloque}</span>
      <h1>${data.competencia}</h1>
      <p style="color:#475569; font-size:16px;">${data.tema}</p>
    </div>

    <div class="section-label">🧠 Concepto Clave del Día</div>
    <p class="section-content">${data.concepto}</p>

    <div class="section-label">🏋️ Ejercicio Principal (5-10 min)</div>
    <p class="section-content">${data.ejercicio}</p>

    <div class="section-label">💊 Suplementación Recomendada</div>
    <p class="section-content">${data.suplementacion}</p>

    <div class="section-label">🔬 Principio Científico</div>
    <div class="highlight-box">
      <p style="margin:0; color:#334155; line-height:1.7;">${data.principio}</p>
    </div>

    <div class="divider"></div>
    <p style="color:#64748b; font-size:13px; text-align:center;">Completa tu ejercicio del día y registra tu progreso en la plataforma.</p>
  `);
}

function templateCheckin(data) {
  const hitos = { 7: '¡Semana 1 completada!', 14: '¡Mitad de camino!', 21: '¡Tres semanas! Ya casi llegas' };

  return wrapLayout(`
    <div class="header">
      <h1>🌟 ${hitos[data.dia] || 'Check-in de progreso'}</h1>
      <p>${data.nombre}, queremos celebrar tu constancia</p>
    </div>
    <p style="color:#334155; line-height:1.7;">Llevas <strong>${data.dia} días</strong> trabajando en tu inteligencia emocional. Cada paso cuenta y ya estás viendo cambios.</p>
    <p style="color:#334155; line-height:1.7;">${data.mensaje_extra || 'Sigue así, la transformación es un proceso, no un destino.'}</p>
    <div style="text-align:center; margin:16px 0;">
      <a href="{{progreso_url}}" class="btn">Ver mi progreso</a>
    </div>
  `);
}

function templateReflection(data) {
  const isMid = data.dia === 15;
  return wrapLayout(`
    <div class="header">
      <h1>${isMid ? '🌿 Reflexión de los 15 Días' : '🎉 La Transformación de 30 Días'}</h1>
      <p>${data.nombre}, ${isMid ? 'vas por la mitad del camino' : 'has completado el programa'}</p>
    </div>
    <p style="color:#334155; line-height:1.7;">${isMid
      ? 'Has desarrollado las primeras 3 competencias: <strong>Autoconciencia, Autoconfianza y Autocontrol</strong>. Tu corteza prefrontal, ritmos circadianos y neuroplasticidad están trabajando a tu favor.'
      : 'Has integrado las 6 competencias maestras. Tu nuevo sistema operativo social integral impacta tu vida profesional, relacional y personal.'}</p>
    <p style="color:#334155; line-height:1.7;">${data.reflexion_extra || ''}</p>
    <div style="text-align:center; margin:16px 0;">
      ${isMid
        ? '<p style="color:#475569;">Prepárate para los siguientes 15 días: Motivación, Empatía y Competencia Social.</p>'
        : '<a href="{{certificado_url}}" class="btn">Descargar mi certificado</a>'}
    </div>
  `);
}

function templateGraduation(data) {
  return wrapLayout(`
    <div class="header">
      <h1>🎓 ¡Felicidades, ${data.nombre}!</h1>
      <p>Has completado tu transformación de 30 días</p>
    </div>
    <p style="color:#334155; line-height:1.7;">Has recorrido un camino extraordinario. Las 6 competencias de inteligencia emocional ahora son parte de tu vida.</p>
    <div style="text-align:center; margin:20px 0;">
      <a href="{{certificado_url}}" class="btn">Descargar certificado</a>
    </div>
    <p style="color:#334155; line-height:1.7;">📌 Te invitamos a nuestra <strong>comunidad exclusiva</strong> de mantenimiento para seguir creciendo junto a otros que como tú completaron el programa.</p>
    <p style="color:#334155; line-height:1.7;">También puedes acceder al <strong>programa de mantenimiento</strong> para seguir fortaleciendo tus habilidades.</p>
    <div style="text-align:center; margin:16px 0;">
      <a href="{{comunidad_url}}" class="btn" style="background:#10b981;">Unirme a la comunidad</a>
    </div>
  `);
}

function templateReactivation(data) {
  return wrapLayout(`
    <div class="header">
      <h1>👋 ${data.nombre}, ¿recuerdas por qué empezaste?</h1>
      <p>Ha pasado un tiempo desde que completaste el programa</p>
    </div>
    <p style="color:#334155; line-height:1.7;">Queremos hacer un check-in contigo. ¿Cómo mantienes tu transformación?</p>
    <p style="color:#334155; line-height:1.7;">Tenemos <strong>nuevos desafíos y programas avanzados</strong> diseñados para quienes ya completaron los 30 días.</p>
    <p style="color:#334155; line-height:1.7;">Además, nuestro <strong>programa de referidos</strong> te permite invitar a alguien más a transformar su vida.</p>
    <div style="text-align:center; margin:16px 0;">
      <a href="{{reactivacion_url}}" class="btn">Descubrir nuevos desafíos</a>
    </div>
  `);
}

function renderTemplate(templateName, data) {
  const templates = {
    welcome: templateWelcome,
    urgency: (d) => templateUrgency(d, data._day),
    daily: templateDaily,
    checkin: templateCheckin,
    reflection: templateReflection,
    graduation: templateGraduation,
    reactivation: templateReactivation
  };

  const fn = templates[templateName];
  if (!fn) throw new Error(`Template not found: ${templateName}`);

  let html = fn(data);

  html = html
    .replace(/\{\{nombre\}\}/g, data.nombre || '')
    .replace(/\{\{email\}\}/g, data.email || '')
    .replace(/\{\{producto\}\}/g, data.producto || 'Cardiosmile')
    .replace(/\{\{clientes\}\}/g, data.clientes || 'miles de');

  return html;
}

module.exports = { renderTemplate };

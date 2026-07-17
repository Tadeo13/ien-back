// Backend email templates — mirrors frontend/src/emails/templates.ts
// Pure HTML inline-styles, no dependencies

const C = {
  gold: "#F0BC48",
  teal: "#6DBFAA",
  red: "#E96B6B",
  text: "#3E3A38",
  muted: "#7A7270",
  bg: "#F7F5F4",
  secondary: "#F0EDEC",
  white: "#FFFFFF",
  border: "rgba(62,58,56,0.1)",
};

const LOGO_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAxMjAgMzYiPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMzYiIGZpbGw9Im5vbmUiLz48dGV4dCB4PSIwIiB5PSIyOCIgZm9udC1mYW1pbHk9IkhlbHZldGljYSBOZXVlLEhlbHZldGljYSxBcmlhbCxzYW5zLXNlcmlmIiBmb250LXNpemU9IjI4IiBmb250LXdlaWdodD0iNzAwIiBmaWxsPSIjM0UzQTM4IiBsZXR0ZXItc3BhY2luZz0iMiI+SUVOPC90ZXh0PjxjaXJjbGUgY3g9IjEwNSIgY3k9IjEwIiByPSI1IiBmaWxsPSIjRjBCQzQ4Ii8+PC9zdmc+";

const FONT = {
  lora: "'Lora', Georgia, 'Times New Roman', serif",
  inter: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'DM Mono', 'Courier New', monospace",
};

function wrap(body) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    body { margin:0; padding:0; background:${C.bg}; font-family:${FONT.inter}; color:${C.text}; -webkit-font-smoothing:antialiased; }
    img { border:0; display:block; }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        ${body}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function header() {
  return `
  <tr>
    <td style="padding:24px 32px;background:${C.white};border-radius:16px 16px 0 0;border-bottom:1px solid ${C.border};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <img src="${LOGO_SVG}" alt="IEN" width="80" style="height:auto;" />
          </td>
          <td align="right" style="vertical-align:middle;">
            <span style="font-family:${FONT.mono};font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${C.muted};font-weight:500;">IEN</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function footer() {
  return `
  <tr>
    <td style="padding:24px 32px;background:${C.white};border-radius:0 0 16px 16px;border-top:1px solid ${C.border};">
      <p style="margin:0;font-family:${FONT.inter};font-size:12px;color:${C.muted};text-align:center;font-weight:400;">Cuidamos de tu mente y de tu corazón</p>
    </td>
  </tr>`;
}

function card(content, accent) {
  accent = accent || C.gold;
  return `
  <tr>
    <td style="padding:0 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.white};border-radius:16px;border:1px solid ${C.border};overflow:hidden;">
        <tr><td style="border-left:4px solid ${accent};padding:32px;">
          ${content}
        </td></tr>
      </table>
    </td>
  </tr>`;
}

function spacer(px) {
  px = px || 16;
  return `<tr><td style="height:${px}px;"></td></tr>`;
}

function btn(label, href, bg) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
    <tr>
      <td style="background:${bg};border-radius:12px;padding:14px 32px;">
        <a href="${href}" style="font-family:${FONT.inter};font-size:14px;font-weight:600;color:${C.white};text-decoration:none;letter-spacing:0.01em;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function label(text, color) {
  return `<p style="margin:0 0 4px;font-family:${FONT.mono};font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${color};font-weight:500;">${text}</p>`;
}

function title(text) {
  return `<h1 style="margin:0 0 16px;font-family:${FONT.lora};font-size:22px;font-weight:600;color:${C.text};line-height:1.4;">${text}</h1>`;
}

function body(text) {
  return `<p style="margin:0 0 16px;font-family:${FONT.inter};font-size:15px;color:${C.text};line-height:1.7;font-weight:400;">${text}</p>`;
}

function signoff() {
  return `
  <p style="margin:0;font-family:${FONT.inter};font-size:15px;color:${C.text};line-height:1.7;">
    Con cariño,<br/>
    <span style="font-weight:500;">Equipo IEN</span>
  </p>`;
}

// ─── Bienvenida ──────────────────────────────────────────────────────────────

function bienvenida(nombre) {
  return wrap(`
    ${header()}
    ${card(`
      ${label('Día 0', C.gold)}
      ${title('Tu mente y tu corazón inician un viaje integral hoy')}
      ${body('Hola, <strong>' + nombre + '</strong>,')}
      ${body('Bienvenido/a a <strong>"Cuidamos de tu mente y de tu corazón"</strong>. Estamos muy felices de que hayas decidido dar este paso hacia una salud integral.')}
      ${body('Durante los próximos 30 días, con 5 a 10 min al día, vamos a trabajar el eslabón perdido de la vitalidad: la <strong>Inteligencia Emocional aplicada a la salud</strong>.')}
    `, C.gold)}
    ${spacer(8)}
    ${card(`
      <p style="margin:0 0 16px;font-family:${FONT.inter};font-size:15px;font-weight:500;color:${C.text};">Nuestra Hoja de Ruta de Bienestar</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${['Autoconciencia', 'Autoconfianza', 'Autocontrol', 'Automotivación', 'Empatía', 'Competencia Social'].map(function(c) {
          return '<tr><td style="padding:14px 0;border-bottom:1px solid ' + C.border + ';"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="8" valign="top"><div style="width:6px;height:6px;border-radius:50%;background:' + C.gold + ';margin-top:7px;"></div></td><td style="padding-left:10px;"><p style="margin:0;font-family:' + FONT.inter + ';font-size:14px;font-weight:500;color:' + C.text + ';">' + c + '</p></td></tr></table></td></tr>';
        }).join('')}
      </table>
    `, C.teal)}
    ${spacer(8)}
    ${card(`
      ${signoff()}
    `, C.teal)}
    ${spacer()}
    ${footer()}
  `);
}

// ─── Recordatorio Diario ─────────────────────────────────────────────────────

function recordatorioDiario(nombre, dia) {
  return wrap(`
    ${header()}
    ${card(`
      ${label('Día ' + dia, C.gold)}
      ${title('No olvides tu actividad de hoy')}
      ${body('Hola, <strong>' + nombre + '</strong>,')}
      ${body('Aún no completaste tu actividad del <strong>Día ' + dia + '</strong>. Son solo unos minutos — hacelo ahora y no pierdas tu racha.')}
      ${body('Cada día que completás es un paso más hacia tu mejor versión.')}
      ${btn('Completar ahora', 'https://ien.app/dashboard', C.gold)}
    `, C.gold)}
    ${spacer()}
    ${footer()}
  `);
}

// ─── Racha Rota ──────────────────────────────────────────────────────────────

function rachaRota(nombre, racha) {
  return wrap(`
    ${header()}
    ${card(`
      ${label('Racha', C.red)}
      ${title('Se rompió tu racha de ' + racha + ' días')}
      ${body('Hola, <strong>' + nombre + '</strong>,')}
      ${body('Lamentablemente perdiste tu racha de <strong>' + racha + ' días</strong>. Sabemos que no es fácil, y entendemos que la vida a veces se pone complicada.')}
      ${body('Pero esto no es un final — es una oportunidad para empezar de nuevo. Lo importante no es la perfección, es la constancia.')}
      ${btn('Volver a empezar hoy', 'https://ien.app/dashboard', C.teal)}
    `, C.red)}
    ${spacer()}
    ${footer()}
  `);
}

// ─── Urgencia Activación ─────────────────────────────────────────────────────

function urgenciaActivacion(nombre) {
  return wrap(`
    ${header()}
    ${card(`
      ${label('Activación', C.gold)}
      ${title('Tu transformación te está esperando')}
      ${body('Hola, <strong>' + nombre + '</strong>,')}
      ${body('Te registraste pero todavía no activaste tu programa. Los primeros 7 días son clave.')}
      ${body('Quienes empiezan en los primeros 7 días tienen <strong>3x más probabilidad</strong> de completar la transformación.')}
      ${btn('Activar mi programa', 'https://ien.app/activar', C.gold)}
    `, C.gold)}
    ${spacer()}
    ${footer()}
  `);
}

// ─── Recuperación Inactividad ────────────────────────────────────────────────

function recuperacionInactividad(nombre, dia) {
  return wrap(`
    ${header()}
    ${card(`
      ${label('Día ' + dia, C.teal)}
      ${title('Te extrañamos en tu programa')}
      ${body('Hola, <strong>' + nombre + '</strong>,')}
      ${body('Notamos que llevás varios días sin completar una actividad. Estás en el <strong>Día ' + dia + '</strong> — retomarlo hoy hace toda la diferencia.')}
      ${body('No importa cuántos días hayan pasado. Lo que importa es que hoy elegís volver.')}
      ${btn('Reanudar mi programa', 'https://ien.app/dashboard', C.teal)}
    `, C.teal)}
    ${spacer()}
    ${footer()}
  `);
}

// ─── Recuperación de Contraseña ──────────────────────────────────────────────

function recuperacionContrasena(nombre, resetUrl) {
  return wrap(`
    ${header()}
    ${card(`
      ${label('Contraseña', C.red)}
      ${title('Recuperá tu contraseña')}
      ${body('Hola, <strong>' + nombre + '</strong>,')}
      ${body('Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el botón de abajo para crear una nueva.')}
      ${btn('Restablecer contraseña', resetUrl, C.red)}
      ${body('<span style="font-size:13px;color:' + C.muted + ';">Este enlace expira en 15 minutos. Si no solicitaste este cambio, podés ignorar este mensaje.</span>')}
    `, C.red)}
    ${spacer()}
    ${footer()}
  `);
}

// ─── Hito (semanal) ─────────────────────────────────────────────────────────

var HITOS = {
  7: {
    titulo: '7 días — una semana eligiéndote a vos mismo/a',
    competencia: 'Autoconciencia',
    cuerpo: 'Una semana. Siete días eligiéndote a ti mismo/a, un poco cada día. Esta primera semana la dedicamos a la Autoconciencia: aprender a escuchar lo que tu cuerpo y tus emociones te vienen diciendo. Si sentís que ya empezás a notar esas señales un poco más claro, eso no es casualidad — es el trabajo que estás haciendo. No hace falta que sea perfecto. Solo que sea constante.',
    accent: C.gold,
  },
  14: {
    titulo: '14 días — la mitad del camino, y ya sos otra persona',
    competencia: 'Autocontrol',
    cuerpo: 'Llegaste a la mitad del viaje. Dos semanas trabajando tu Autoconfianza y tu Autocontrol: reconstruyendo la relación con vos mismo/a y aprendiendo a sostener esa "pausa poderosa" frente al estrés y los impulsos del día a día. Esto es el punto donde muchas personas dudan si vale la pena seguir. Vos ya llegaste hasta acá.',
    accent: C.red,
  },
  21: {
    titulo: '21 días — empezás a entender a los demás desde vos',
    competencia: 'Empatía',
    cuerpo: 'Tres semanas completas. Ya trabajaste tu autoconciencia, tu autoconfianza, tu autocontrol y tu automotivación. Ahora, con esa base, la Empatía se vuelve más natural. Cuando te conocés a vos mismo/a, entender a los demás deja de ser un esfuerzo — se convierte en una conexión genuina.',
    accent: C.teal,
  },
  28: {
    titulo: '28 días — casi lo lograste. Cuatro bloques, una transformación real',
    competencia: 'Competencia Social',
    cuerpo: 'Cuatro semanas completas. Autoconciencia, Autoconfianza, Autocontrol y Automotivación: todo eso ya forma parte de vos. Ahora, en la Competencia Social, vas a descubrir cómo todo lo que aprendiste se traduce en relaciones más sanas y vínculos que realmente nutren tu vida.',
    accent: C.red,
  },
};

function hito(nombre, dia) {
  var h = HITOS[dia] || HITOS[7];
  return wrap(
    header() +
    card(
      label(h.competencia + ' · Día ' + dia, h.accent) +
      title(h.titulo) +
      body('Hola, <strong>' + nombre + '</strong>,') +
      body(h.cuerpo) +
      signoff(),
      h.accent
    ) +
    spacer() +
    footer()
  );
}

module.exports = {
  bienvenida,
  hito,
  recordatorioDiario,
  rachaRota,
  urgenciaActivacion,
  recuperacionInactividad,
  recuperacionContrasena,
};

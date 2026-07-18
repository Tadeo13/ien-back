const { wrap, header, footer, card, spacer, label, heading, para, btn, muted, C } = require('./base');

function recuperacionContrasena(nombre, resetUrl) {
  return {
    asunto: 'Recuperá tu contraseña',
    html: wrap(`
  ${header()}
  ${card(`
    ${label("Contraseña", C.red)}
    ${heading("Recuperá tu contraseña")}
    ${para(`Hola, <strong>${nombre}</strong>,`)}
    ${para(`Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el botón de abajo para crear una nueva.`)}
    ${btn("Restablecer contraseña", resetUrl, C.red)}
    ${muted("Este enlace expira en 15 minutos.")}
    ${muted("Si no solicitaste este cambio, podés ignorar este mensaje. Tu contraseña permanecerá igual.")}
  `, C.red)}
  ${spacer()}
  ${footer()}
`)
  };
}

module.exports = { recuperacionContrasena };

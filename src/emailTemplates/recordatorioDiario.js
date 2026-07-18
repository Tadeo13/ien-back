const { wrap, header, footer, card, spacer, label, heading, para, btn, C } = require('./base');

function recordatorioDiario(nombre, dia) {
  return {
    asunto: `${nombre}, no olvides completar tu actividad del Día ${dia}`,
    html: wrap(`
  ${header()}
  ${card(`
    ${label(`Día ${dia}`, C.gold)}
    ${heading("No olvides tu actividad de hoy")}
    ${para(`Hola, <strong>${nombre}</strong>,`)}
    ${para(`Aún no completaste tu actividad del <strong>Día ${dia}</strong>. Son solo unos minutos — hacelo ahora y no pierdas tu racha.`)}
    ${para(`Cada día que completás es un paso más hacia tu mejor versión. Tu cuerpo y tu mente te lo van a agradecer.`)}
    ${btn("Completar ahora", `${process.env.FRONTEND_URL || "https://ien.app"}/dashboard`, C.gold)}
  `, C.gold)}
  ${spacer()}
  ${footer()}
`)
  };
}

module.exports = { recordatorioDiario };

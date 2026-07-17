const { wrap, header, footer, card, spacer, label, heading, para, btn, C } = require('./base');

function recuperacionInactividad(nombre, dia) {
  return {
    asunto: `${nombre}, te extrañamos en tu programa`,
    html: wrap(`
  ${header()}
  ${card(`
    ${label(`Día ${dia}`, C.teal)}
    ${heading("Te extrañamos en tu programa")}
    ${para(`Hola, <strong>${nombre}</strong>,`)}
    ${para(`Notamos que llevás varios días sin completar una actividad. Estás en el <strong>Día ${dia}</strong> — retomarlo hoy hace toda la diferencia.`)}
    ${para(`No importa cuántos días hayan pasado. Lo que importa es que hoy elegís volver. Y nosotros estamos acá para acompañarte.`)}
    ${btn("Reanudar mi programa", `${process.env.FRONTEND_URL || "https://ien.app"}/dashboard`, C.teal)}
  `, C.teal)}
  ${spacer()}
  ${footer()}
`)
  };
}

module.exports = { recuperacionInactividad };

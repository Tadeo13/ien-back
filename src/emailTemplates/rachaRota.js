const { wrap, header, footer, card, spacer, label, heading, para, btn, C } = require('./base');

function rachaRota(nombre, racha) {
  return {
    asunto: `${nombre}, se rompió tu racha de ${racha} días`,
    html: wrap(`
  ${header()}
  ${card(`
    ${label("Racha", C.red)}
    ${heading(`Se rompió tu racha de ${racha} días`)}
    ${para(`Hola, <strong>${nombre}</strong>,`)}
    ${para(`Lamentablemente perdiste tu racha de <strong>${racha} días</strong>. Sabemos que no es fácil, y entendemos que la vida a veces se pone complicada.`)}
    ${para(`Pero esto no es un final — es una oportunidad para empezar de nuevo, esta vez con toda la experiencia que acumulaste. Lo importante no es la perfección, es la constancia. Y vos ya demostrás que podés.`)}
    ${btn("Volver a empezar hoy", `${process.env.FRONTEND_URL || "https://ien.app"}/dashboard`, C.teal)}
  `, C.red)}
  ${spacer()}
  ${footer()}
`)
  };
}

module.exports = { rachaRota };

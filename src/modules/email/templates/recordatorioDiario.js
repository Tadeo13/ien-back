const { FONT, C, wrap, header, footer, card, spacer, btn, label, title, body } = require('./base');

function recordatorioDiario(nombre, dia) {
  const html = wrap(`
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
  return { asunto: nombre + ', no olvides completar tu actividad del Día ' + dia, html };
}

module.exports = { recordatorioDiario };

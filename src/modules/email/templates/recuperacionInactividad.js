const { C, wrap, header, footer, card, spacer, btn, label, title, body } = require('./base');

function recuperacionInactividad(nombre, dia) {
  const html = wrap(`
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
  return { asunto: nombre + ', te extrañamos en tu programa', html };
}

module.exports = { recuperacionInactividad };

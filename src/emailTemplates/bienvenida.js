const { wrap, header, footer, card, spacer, label, heading, para, signoff, C } = require('./base');

function competencia(nombre, desc, bg) {
  return `
  <tr>
    <td style="padding:14px 0;border-bottom:1px solid ${C.border};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="8" valign="top">
            <div style="width:6px;height:6px;border-radius:50%;background:${bg};margin-top:7px;"></div>
          </td>
          <td style="padding-left:10px;">
            <p style="margin:0;font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:500;color:${C.text};">${nombre}</p>
            <p style="margin:4px 0 0;font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:${C.muted};line-height:1.6;">${desc}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function bienvenida(nombre) {
  return {
    asunto: '¡Tu transformación de 30 días comienza AHORA!',
    html: wrap(`
  ${header()}
  ${card(`
    ${label("Día 0", C.gold)}
    ${heading("Tu mente y tu corazón inician un viaje integral hoy")}
    ${para(`Hola, <strong>${nombre}</strong>,`)}
    ${para(`Bienvenido/a a <strong>"Cuidamos de tu mente y de tu corazón"</strong>. Estamos muy felices de que hayas decidido dar este paso hacia una salud integral.`)}
    ${para(`Probablemente, en el pasado has intentado "hacer dieta" o "ir al gimnasio" enfocándote solo en el esfuerzo físico. Pero la salud integral conlleva que el bienestar es un equilibrio: se trata de lo que comes, cómo te mueves, cómo descansas y, sobre todo, de cómo te relacionas contigo mismo/a y con los demás.`)}
    ${para(`Durante los próximos 30 días, con 5 a 10 min al día, vamos a trabajar el eslabón perdido de la vitalidad: la <strong>Inteligencia Emocional aplicada a la salud</strong>.`)}
  `, C.gold)}
  ${spacer(8)}
  ${card(`
    <p style="margin:0 0 16px;font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;font-weight:500;color:${C.text};">Nuestra Hoja de Ruta de Bienestar</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${competencia("Autoconciencia", "Aprender a escuchar las señales de tu cuerpo y tus emociones.", C.gold)}
      ${competencia("Autoconfianza", "Reconstruir la relación con vos mismo/a y confiar en tu capacidad de cambio.", C.teal)}
      ${competencia("Autocontrol", "Sostener la pausa poderosa frente al estrés y los impulsos.", C.red)}
      ${competencia("Automotivación", "Mantener el fuego interno aunque los resultados tardén en llegar.", C.gold)}
      ${competencia("Empatía", "Entender a los demás para fortalecer tus relaciones.", C.teal)}
      ${competencia("Competencia Social", "Comunicarte con impacto y construir vínculos saludables.", C.red)}
    </table>
  `, C.teal)}
  ${spacer(8)}
  ${card(`
    <p style="margin:0 0 12px;font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;font-weight:500;color:${C.text};">Tus Aliados en el Camino</p>
    ${para(`Este viaje es más sencillo con las herramientas adecuadas. Contamos con el apoyo de <strong>Cardiosmile</strong>, para proteger tu salud cardiovascular mientras trabajas tus emociones, y <strong>Vitamin Shoppe</strong>, para brindarte el combustible y bienestar integral que tu organismo necesita para funcionar al máximo.`)}
  `, C.gold)}
  ${spacer(8)}
  ${card(`
    ${para(`Mañana recibirás el <strong>Bloque 1: Autoconciencia</strong>. Prepárate para descubrir lo que tu cuerpo realmente intenta decirte.`)}
    ${signoff()}
  `, C.teal)}
  ${spacer()}
  ${footer()}
`)
  };
}

module.exports = { bienvenida };

const { wrap, header, footer, card, spacer, label, heading, para, signoff, C } = require('./base');

const HITOS = {
  7: {
    titulo: "7 días — una semana eligiéndote a vos mismo/a",
    competencia: "Autoconciencia",
    cuerpo: `Una semana. Siete días eligiéndote a ti mismo/a, un poco cada día. Esta primera semana la dedicamos a la Autoconciencia: aprender a escuchar lo que tu cuerpo y tus emociones te vienen diciendo, muchas veces sin que les prestaras atención. Si sentís que ya empezás a notar esas señales un poco más claro, eso no es casualidad — es el trabajo que estás haciendo. No hace falta que sea perfecto. Solo que sea constante. Y hasta acá, lo estás logrando.`,
    accent: C.gold,
  },
  14: {
    titulo: "14 días — la mitad del camino, y ya sos otra persona",
    competencia: "Autocontrol",
    cuerpo: `Llegaste a la mitad del viaje. Dos semanas trabajando tu Autoconfianza y tu Autocontrol: reconstruyendo la relación con vos mismo/a y aprendiendo a sostener esa "pausa poderosa" frente al estrés y los impulsos del día a día. Esto es exactamente el punto donde muchas personas dudan si vale la pena seguir. Vos ya llegaste hasta acá. Eso ya dice algo de quién sos. Seguimos.`,
    accent: C.red,
  },
  21: {
    titulo: "21 días — empezás a entender a los demás desde vos",
    competencia: "Empatía",
    cuerpo: `Tres semanas completas. Ya trabajaste tu autoconciencia, tu autoconfianza, tu autocontrol y tu automotivación. Ahora, con esa base, la Empatía se vuelve más natural. Cuando te conocés a vos mismo/a, entender a los demás deja de ser un esfuerzo — se convierte en una conexión genuina.`,
    accent: C.teal,
  },
  28: {
    titulo: "28 días — casi lo lograste. Cuatro bloques, una transformación real",
    competencia: "Competencia Social",
    cuerpo: `Cuatro semanas completas. Autoconciencia, Autoconfianza, Autocontrol y Automotivación: todo eso ya forma parte de vos. Ahora, en la Competencia Social, vas a descubrir cómo todo lo que aprendiste se traduce en relaciones más sanas, comunicaciones más claras y vínculos que realmente nutren tu vida. Estás a un paso de completar el camino.`,
    accent: C.red,
  },
};

function hito(nombre, dia) {
  const h = HITOS[dia] || HITOS[7];

  return {
    asunto: `¡Felicidades ${nombre}! Llegaste a tu hito de ${dia} días`,
    html: wrap(`
  ${header()}
  ${card(`
    ${label(`${h.competencia} · Día ${dia}`, h.accent)}
    ${heading(h.titulo)}
    ${para(`Hola, <strong>${nombre}</strong>,`)}
    ${para(h.cuerpo)}
    ${signoff()}
  `, h.accent)}
  ${spacer()}
  ${footer()}
`)
  };
}

module.exports = { hito };

const PROGRAM_TIMELINE = {
  activation: {
    0: {
      type: 'welcome',
      subject: '❤️ Tu mente y tu corazón inician un viaje integral hoy (Día 0)',
      template: 'welcome',
      body: [
        'Dar la bienvenida al participante',
        'Explicar que el bienestar es equilibrio (comer, moverse, descansar, relacionarse)',
        'Presentar las 6 competencias clave del programa',
        'Mencionar aliados: Cardiosmile y Vitamin Shoppe',
        'Anunciar que mañana recibirá el Bloque 1: Autoconciencia'
      ]
    },
    3: {
      type: 'followUp',
      subject: '{{nombre}}, tu transformación te está esperando...',
      template: 'urgency',
      body: [
        'Vi que compraste {{producto}} - excelente elección',
        '¿Sabías que puedes potenciar 10x sus efectos con nuestro programa de inteligencia emocional?',
        'Solo 10 min/día × 30 días = Nueva versión de ti mismo',
        'CTA: Activar mi programa gratuito'
      ]
    },
    5: {
      type: 'urgency',
      subject: '{{nombre}}, tu transformación te está esperando...',
      template: 'urgency',
      body: [
        'Noté que aún no has activado tu programa gratuito',
        'Las personas que empiezan en los primeros 7 días tienen 3x más probabilidad de completar la transformación',
        'Solo por 48 horas más',
        'CTA: Reclamar Mi Bonus + Empezar Ahora'
      ]
    },
    7: {
      type: 'finalReminder',
      subject: 'Última oportunidad, {{nombre}} — tu programa gratuito expira',
      template: 'urgency',
      body: [
        'Última oportunidad para acceder a tu programa gratuito de transformación',
        'Más de {{clientes}} clientes ya están transformando sus vidas',
        'CTA: Quiero mi acceso ahora'
      ]
    }
  },

  daily: {
    1:  { bloque: 'I',   competencia: 'Autoconciencia',     tema: 'El Escáner de Energía Vital',                          contenido: 'Ejercicio diario + suplementación recomendada' },
    2:  { bloque: 'I',   competencia: 'Autoconciencia',     tema: 'Diario de las 3 Señales Vitales',                     contenido: 'Evaluación pre-comida/entrenamiento' },
    3:  { bloque: 'I',   competencia: 'Autoconciencia',     tema: 'Nombrar el "Anestésico Emocional"',                   contenido: 'Pausa del reconocimiento' },
    4:  { bloque: 'I',   competencia: 'Autoconciencia',     tema: 'Ejercicio del bloque',                                contenido: 'Ejercicio diario' },
    5:  { bloque: 'I',   competencia: 'Autoconciencia',     tema: 'Cierre del bloque',                                   contenido: 'Reflexión + integración' },
    6:  { bloque: 'II',  competencia: 'Autoconfianza',      tema: 'Cambio de Narrativa Sistémica',                       contenido: 'Reescritura de identidad' },
    7:  { bloque: 'II',  competencia: 'Autoconfianza',      tema: 'Contrato de Micro-Compromiso',                        contenido: 'Micro-compromiso diario', checkin: true },
    8:  { bloque: 'II',  competencia: 'Autoconfianza',      tema: 'Método No-Balanza',                                   contenido: 'Auditoría de bienestar integral' },
    9:  { bloque: 'II',  competencia: 'Autoconfianza',      tema: 'El Poder del "Yo Elijo"',                             contenido: 'Afirmación de elección consciente' },
    10: { bloque: 'II',  competencia: 'Autoconfianza',      tema: 'Cierre del bloque',                                   contenido: 'Reflexión + integración' },
    11: { bloque: 'III', competencia: 'Autocontrol',        tema: 'Regla de los 5 Minutos',                              contenido: 'Protocolo de pausa consciente' },
    12: { bloque: 'III', competencia: 'Autocontrol',        tema: 'Ritual de Disciplina Circadiana',                     contenido: 'Hora sagrada de regulación' },
    13: { bloque: 'III', competencia: 'Autocontrol',        tema: 'Higiene del Entorno',                                 contenido: 'Rediseño estratégico del ambiente' },
    14: { bloque: 'III', competencia: 'Autocontrol',        tema: 'Ejercicio del bloque',                                contenido: 'Ejercicio diario', checkin: true },
    15: { bloque: 'III', competencia: 'Autocontrol',        tema: 'Reflexión de los 15 días',                            contenido: 'Reflexión de mitad de programa + integración de competencias', reflection: true },
    16: { bloque: 'IV',  competencia: 'Motivación',         tema: 'Viaje al Futuro',                                    contenido: 'Visualización neuroplástica' },
    17: { bloque: 'IV',  competencia: 'Motivación',         tema: 'El Post-it de mi "Porqué"',                           contenido: 'Arqueología de valores profundos' },
    18: { bloque: 'IV',  competencia: 'Motivación',         tema: 'Ejercicio del bloque',                                contenido: 'Ejercicio diario' },
    19: { bloque: 'IV',  competencia: 'Motivación',         tema: 'Ejercicio del bloque',                                contenido: 'Ejercicio diario' },
    20: { bloque: 'IV',  competencia: 'Motivación',         tema: 'Cierre del bloque',                                   contenido: 'Reflexión + integración' },
    21: { bloque: 'V',   competencia: 'Empatía',            tema: 'Regla del Mejor Amigo',                               contenido: 'Protocolo de autocompasión', checkin: true },
    22: { bloque: 'V',   competencia: 'Empatía',            tema: 'Nota de Re-enfoque',                                  contenido: 'Protocolo sin castigo' },
    23: { bloque: 'V',   competencia: 'Empatía',            tema: 'Gratitud Cardiovascular',                             contenido: 'Ritual de gratitud' },
    24: { bloque: 'V',   competencia: 'Empatía',            tema: 'Ejercicio del bloque',                                contenido: 'Ejercicio diario' },
    25: { bloque: 'V',   competencia: 'Empatía',            tema: 'Cierre del bloque',                                   contenido: 'Reflexión + integración' },
    26: { bloque: 'VI',  competencia: 'Competencia Social', tema: 'Guion de Asertividad',                                contenido: 'Protocolo de asertividad neurológica' },
    27: { bloque: 'VI',  competencia: 'Competencia Social', tema: 'Estrategia de Pre-Carga',                             contenido: 'Preparación proactiva para eventos sociales' },
    28: { bloque: 'VI',  competencia: 'Competencia Social', tema: 'Ejercicio del bloque',                                contenido: 'Ejercicio diario' },
    29: { bloque: 'VI',  competencia: 'Competencia Social', tema: 'Ejercicio del bloque',                                contenido: 'Ejercicio diario' },
    30: { bloque: 'VI',  competencia: 'Competencia Social', tema: 'Reflexión Final',                                     contenido: 'Reflexión final de los 30 días + cierre del programa', reflection: true }
  },

  postProgram: {
    graduation: {
      type: 'graduation',
      dias: { min: 31 },
      subject: '¡Felicidades por completar tu transformación!',
      template: 'graduation',
      body: [
        'Certificado de finalización',
        'Invitación a comunidad exclusiva',
        'Programa de mantenimiento'
      ]
    },
    reactivation: {
      type: 'reactivation',
      meses: { min: 3, max: 6 },
      subject: '{{nombre}}, ¿recuerdas por qué empezaste?',
      template: 'reactivation',
      body: [
        'Check-in de bienestar',
        'Nuevos desafíos y programas avanzados',
        'Programa de referidos'
      ]
    }
  },

  supplements: [
    'Ashwagandha',
    'Omega-3',
    'L-Teanina'
  ],

  scientificPrinciples: [
    'Neuroplasticidad: el cerebro puede reconfigurarse con la práctica constante',
    'Ritmos circadianos: la regulación del sueño impacta directamente en la inteligencia emocional',
    'Corteza prefrontal: centro de control ejecutivo que se fortalece con la atención consciente',
    'Conexión corazón-cerebro: la coherencia cardíaca mejora la toma de decisiones'
  ]
};

const DAILY_SUBJECTS = {
  default: 'Día {{dia}} — {{competencia}}: {{tema}}',
  7: '🌟¡Vas por buen camino! Check-in de tu Día 7',
  14: '🌟¡Mitad de camino! Check-in de tu Día 14',
  15: '🌿 Reflexión de los 15 Días — Tu viaje hacia la transformación integral',
  21: '🌟¡Ya son 21 días! Check-in de tu progreso',
  30: '🎉 La Transformación de 30 Días — Has completado el programa'
};

const DAILY_ESTRUCTURA = [
  { label: 'Concepto Clave del Día', key: 'concepto' },
  { label: 'Ejercicio Principal (5-10 min)', key: 'ejercicio' },
  { label: 'Suplementación Recomendada', key: 'suplementacion' },
  { label: 'Principio Científico', key: 'principio' }
];

function getContentForDay(day, isActivationPhase = false) {
  if (isActivationPhase && day in PROGRAM_TIMELINE.activation) {
    return {
      phase: 'activation',
      ...PROGRAM_TIMELINE.activation[day]
    };
  }

  if (day >= 1 && day <= 30) {
    const entry = PROGRAM_TIMELINE.daily[day];
    if (!entry) return null;
    return {
      phase: 'daily',
      day,
      bloque: entry.bloque,
      competencia: entry.competencia,
      tema: entry.tema,
      contenido: entry.contenido,
      isCheckin: entry.checkin || false,
      isReflection: entry.reflection || false,
      subject: DAILY_SUBJECTS[day] || DAILY_SUBJECTS.default,
      estructura: DAILY_ESTRUCTURA
    };
  }

  if (day >= 31) {
    return {
      phase: 'postProgram',
      ...PROGRAM_TIMELINE.postProgram.graduation
    };
  }

  return null;
}

function getActivationDays() {
  return Object.keys(PROGRAM_TIMELINE.activation).map(Number);
}

function getDailyDays() {
  return Object.keys(PROGRAM_TIMELINE.daily).map(Number);
}

module.exports = {
  PROGRAM_TIMELINE,
  getContentForDay,
  getActivationDays,
  getDailyDays,
  DAILY_SUBJECTS,
  DAILY_ESTRUCTURA
};

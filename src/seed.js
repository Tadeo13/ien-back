require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Tienda = require('./models/Tienda');
const Usuario = require('./models/Usuario');
const ContenidoDiario = require('./models/ContenidoDiario');
const TestPregunta = require('./models/TestPregunta');
const ContenidoEspecial = require('./models/ContenidoEspecial');
const Producto = require('./models/Producto');
const Codigo = require('./models/Codigo');

// ---------------------------------------------------------------------------
// Mapa de competencias: slug → label legible
// ---------------------------------------------------------------------------
const COMPETENCIA_LABELS = {
  autoconciencia: 'Autoconciencia',
  autoconfianza: 'Autoconfianza',
  autocontrol: 'Autocontrol',
  empatia: 'Empatía',
  motivacion: 'Motivación',
  competencia_social: 'Competencia Social'
};

// ---------------------------------------------------------------------------
// ContenidoDiario: 30 días con estructura enriquecida y respuesta_tipo en ejercicio
// ---------------------------------------------------------------------------
const CONTENIDOS = [
  {
    dia_numero: 1, tipo_contenido: 'instructivo',
    titulo_modulo: 'Día 1: El Escáner de Energía Vital',
    emociones_objetivo: ['alegría', 'tristeza', 'ira', 'miedo'],
    datos_leccion: {
      titulo: 'El Escáner de Energía Vital',
      bloque: 'Autoconciencia',
      concepto: 'La autoconciencia es la capacidad de reconocer un sentimiento o estado físico en el momento en que aparece.',
      ejercicio: {
        nombre: 'Escaneo Corporal Matutino',
        instruccion: 'Al despertar, permanece en la cama durante 2-3 minutos adicionales escaneando tu cuerpo de pies a cabeza.',
        pasos: [
          'Observa tus niveles de energía hoy (escala 1-10)',
          'Identifica tensión en hombros, cuello o mandíbula',
          'Siente si hay ligereza en las piernas o pesadez mental',
          'Nota si tu respiración es superficial o profunda'
        ],
        tipo: 'reflexion',
        respuesta_tipo: 'abierta'
      },
      contenido: 'La inteligencia emocional consiste en poseer la capacidad de alimentar y gestionar nuestras propias emociones, así como en desarrollar la habilidad de ser observadores atentos y sensibles respecto a las emociones de quienes nos rodean.',
      suplementacion: [
        { nombre: 'Ashwagandha', dosis: '500mg', horario: 'Mañana', beneficio: 'Optimizar la respuesta al estrés cortical' }
      ],
      principio: 'No fuerces tu rutina de ejercicio si tu cuerpo pide recuperación. Aprender a escuchar tu energía es la base para evitar lesiones y el agotamiento crónico.',
      recursos: []
    }
  },
  {
    dia_numero: 2, tipo_contenido: 'cuestionario',
    titulo_modulo: 'Día 2: El Diario de las 3 Señales Vitales',
    emociones_objetivo: ['alegría', 'tristeza', 'ira', 'miedo'],
    datos_leccion: {
      titulo: 'El Diario de las 3 Señales Vitales',
      bloque: 'Autoconciencia',
      concepto: 'Distinguir entre las necesidades fisiológicas y las psicológicas es crítico para la salud global y la toma de decisiones conscientes.',
      ejercicio: {
        nombre: 'Evaluación Pre-Comida/Entrenamiento',
        instruccion: 'Antes de tu comida principal o entrenamiento, califica del 1 al 10 cada señal.',
        pasos: [
          'Hambre Física: sensaciones reales en el estómago',
          'Cansancio Corporal: fatiga muscular y energética',
          'Ansiedad Mental: tensión psicológica y preocupación'
        ],
        registro: { hambre: '___/10', cansancio: '___/10', ansiedad: '___/10' },
        tipo: 'registro',
        respuesta_tipo: 'escala'
      },
      contenido: 'Aprender a distinguir entre el hambre física real y el hambre emocional es una habilidad fundamental.',
      suplementacion: [
        { nombre: 'L-Teanina', dosis: '200mg', horario: 'Según necesidad', beneficio: 'Calma sin sedación' }
      ],
      principio: 'Si Ansiedad = 8/10 + Energía = 2/10: opta por caminata suave en lugar de entrenamiento intenso.',
      recursos: []
    }
  },
  {
    dia_numero: 3, tipo_contenido: 'instructivo',
    titulo_modulo: 'Día 3: Nombrar el "Anestésico Emocional"',
    emociones_objetivo: ['alegría', 'tristeza', 'ira', 'miedo'],
    datos_leccion: {
      titulo: 'Nombrar el "Anestésico Emocional"',
      bloque: 'Autoconciencia',
      concepto: 'Frecuentemente usamos la comida hiperpalatable o el sedentarismo como anestésico ante emociones no procesadas.',
      ejercicio: {
        nombre: 'La Pausa del Reconocimiento',
        instruccion: 'Cuando sientas la urgencia de comer algo procesado sin hambre real, aplica este protocolo de 3 pasos.',
        pasos: [
          'DETENTE por 30 segundos',
          'NOMBRA en voz alta: "No es hambre/cansancio real, lo que siento es [emoción específica]"',
          'ELIGE una acción que realmente sane esa emoción'
        ],
        tipo: 'practica',
        respuesta_tipo: 'abierta'
      },
      contenido: 'Poner nombre a la emoción le quita poder al impulso desadaptativo.',
      suplementacion: [
        { nombre: 'Magnesio Glicinato', dosis: '400mg', horario: '2 horas antes de dormir', beneficio: 'Relajación muscular y regulación del sistema nervioso' }
      ],
      principio: 'Alternativas saludables: llamar a un amigo, respiración consciente, caminata de 5 minutos.',
      recursos: []
    }
  },
  {
    dia_numero: 4, tipo_contenido: 'instructivo',
    titulo_modulo: 'Día 4: Movimiento Consciente (Mindfulness Físico)',
    emociones_objetivo: ['alegría', 'tristeza', 'ira', 'miedo'],
    datos_leccion: {
      titulo: 'Movimiento Consciente (Mindfulness Físico)',
      bloque: 'Autoconciencia',
      concepto: 'Integrar la atención plena en todas las áreas de la vida mejora la calidad de vida y la conexión mente-cuerpo.',
      ejercicio: {
        nombre: 'Entrenamiento Sin Distracciones',
        instruccion: 'Durante 10-15 minutos de tu actividad física, elimina distracciones y enfócate en las sensaciones corporales.',
        pasos: [
          'Apaga música, podcasts and notificaciones',
          'Concéntrate en el ritmo de tu respiración',
          'Siente el contacto consciente de tus pies con el suelo',
          'Percibe la contracción y relajación muscular',
          'Observa tu latido cardíaco'
        ],
        tipo: 'practica',
        respuesta_tipo: 'abierta'
      },
      contenido: 'Sentir cómo tu corazón late y tus pulmones trabajan refuerza la conexión mente-músculo.',
      suplementacion: [
        { nombre: 'Rhodiola Rosea', dosis: '500mg', horario: 'Pre-entrenamiento', beneficio: 'Energía sostenida sin estimulantes artificiales' },
        { nombre: 'Cardiosmile', dosis: '1 sachet', horario: 'Después del almuerzo', beneficio: 'Cuidar tu salud cardiovascular' }
      ],
      principio: 'Mejora de la conexión mente-músculo: aumenta la eficacia del ejercicio.',
      recursos: []
    }
  },
  {
    dia_numero: 5, tipo_contenido: 'cuestionario',
    titulo_modulo: 'Día 5: El Mapa de Ritmos Biológicos Personales',
    emociones_objetivo: ['alegría', 'tristeza', 'ira', 'miedo'],
    datos_leccion: {
      titulo: 'El Mapa de Ritmos Biológicos Personales',
      bloque: 'Autoconciencia',
      concepto: 'Comprender los patrones y disparadores que conducen a hábitos poco saludables permite una planificación estratégica del bienestar.',
      ejercicio: {
        nombre: 'Análisis de Patrones',
        instruccion: 'Revisa tus anotaciones de los días 1-4 y responde las siguientes preguntas de autoconocimiento.',
        pasos: [
          '¿A qué hora del día te sientes más fuerte para ejercitarte?',
          '¿En qué momento tu mente pide más "consuelo" a través de la comida?',
          '¿Qué emociones específicas identificaste como "anestésicos"?',
          '¿Cuáles fueron tus niveles de energía más consistentes?'
        ],
        tipo: 'reflexion',
        respuesta_tipo: 'abierta'
      },
      contenido: 'Esta semana abordamos la salud desde tres pilares fundamentales: Mente, Movimiento y Nutrición.',
      suplementacion: [
        { nombre: 'Ashwagandha', dosis: '500mg', horario: 'Mañana', beneficio: 'Reducción de cortisol y estrés' },
        { nombre: 'Magnesio Glicinato', dosis: '400mg', horario: '2 horas antes de dormir', beneficio: 'Relajación muscular y sueño' },
        { nombre: 'L-Teanina', dosis: '200mg', horario: 'Según necesidad', beneficio: 'Calma sin sedación' },
        { nombre: 'Rhodiola Rosea', dosis: '500mg', horario: 'Pre-entrenamiento', beneficio: 'Energía adaptógena' }
      ],
      principio: 'Planifica tu suplementación según tus ritmos. Programa comidas cuando tu cuerpo más lo necesita.',
      recursos: []
    }
  },
  {
    dia_numero: 6, tipo_contenido: 'instructivo',
    titulo_modulo: 'Día 6: El Cambio de Narrativa Sistémica',
    emociones_objetivo: ['alegría', 'tristeza'],
    datos_leccion: {
      titulo: 'El Cambio de Narrativa Sistémica',
      bloque: 'Autoconfianza',
      concepto: 'La autoeficacia surge al silenciar al "saboteador interno". La neuroplasticidad permite que el cerebro adopte nuevas identidades.',
      ejercicio: {
        nombre: 'Reescritura de Identidad',
        instruccion: 'Identifica una etiqueta limitante, elimínala simbólicamente y crea una nueva narrativa en presente.',
        pasos: [
          'Escribe una etiqueta limitante específica (ej: "Soy perezoso para el ejercicio")',
          'Táchala físicamente con una línea roja gruesa',
          'Redacta tu nueva identidad en presente: "Soy una persona que elige cuidar su energía y su salud cada día"'
        ],
        tipo: 'reflexion',
        respuesta_tipo: 'abierta'
      },
      contenido: 'La autoconfianza no es una cualidad mágica con la que se nace; es una competencia que se construye.',
      suplementacion: [
        { nombre: 'Complejo B', dosis: '1 cápsula', horario: 'Mañana', beneficio: 'Optimizar función cerebral y síntesis de neurotransmisores' }
      ],
      principio: 'Tu mente cree lo que le dices: hoy empezamos a decirle que sí puedes.',
      recursos: []
    }
  },
  {
    dia_numero: 7, tipo_contenido: 'cuestionario',
    titulo_modulo: 'Día 7: El Contrato de Micro-Compromiso 360°',
    emociones_objetivo: ['alegría', 'tristeza'],
    datos_leccion: {
      titulo: 'El Contrato de Micro-Compromiso 360°',
      bloque: 'Autoconfianza',
      concepto: 'La confianza se construye cumpliendo promesas pequeñas y realistas. Los microhábitos generan cambios neurológicos.',
      ejercicio: {
        nombre: 'Micro-Contrato Diario',
        instruccion: 'Elige UN solo micro-compromiso para hoy y firma tu contrato personal.',
        pasos: [
          'Tomar mi dosis de suplemento todos los días',
          'Hacer 5 minutos de estiramientos al despertar',
          'Leer una página al día de un libro de crecimiento personal',
          'Caminar 10 minutos después del almuerzo'
        ],
        tipo: 'registro',
        registro: { compromiso: '', hora: '', testigo: '', firma: '' },
        respuesta_tipo: 'estructurado'
      },
      contenido: 'Cumplir este pequeño hito le demuestra a tu cerebro que eres capaz de mantener la disciplina.',
      suplementacion: [
        { nombre: 'Proteína Whey', dosis: '25-30g', horario: 'Post-entrenamiento', beneficio: 'Refuerzo de logros físicos' }
      ],
      principio: 'Cumplir este pequeño hito le demuestra a tu cerebro que eres capaz de mantener la disciplina.',
      recursos: []
    }
  },
  {
    dia_numero: 8, tipo_contenido: 'cuestionario',
    titulo_modulo: 'Día 8: Victorias de Calidad de Vida (Método No-Balanza)',
    emociones_objetivo: ['alegría', 'tristeza'],
    datos_leccion: {
      titulo: 'Victorias de Calidad de Vida (Método No-Balanza)',
      bloque: 'Autoconfianza',
      concepto: 'La obsesión con el peso suele erosionar la confianza; buscamos éxitos en el bienestar global.',
      ejercicio: {
        nombre: 'Auditoría de Bienestar Integral',
        instruccion: 'Ignora la balanza. Evalúa estas áreas de bienestar.',
        registro: {
          energia_fisica: { pregunta: '¿Subiste escaleras con menos fatiga?', observacion: '' },
          claridad_mental: { pregunta: '¿Te sientes más enfocado/a durante el trabajo?', observacion: '' },
          fuerza_muscular: { pregunta: '¿Tus músculos se sienten más firmes?', observacion: '' },
          calidad_sueno: { pregunta: '¿Despertaste más descansado/a?', observacion: '' },
          estado_animo: { pregunta: '¿Te sientes más optimista que la semana pasada?', observacion: '' }
        },
        tipo: 'registro',
        respuesta_tipo: 'escala'
      },
      contenido: 'Reconocer que tu corazón late con más fuerza y tu cuerpo se siente más ágil es el verdadero indicador de una salud funcional.',
      suplementacion: [
        { nombre: 'Omega-3 (EPA/DHA)', dosis: '1000mg', horario: 'Con comida principal', beneficio: 'Soporte neurológico y estabilidad emocional' }
      ],
      principio: 'Celebración consciente: reconocer tu bienestar global es el verdadero indicador de salud funcional.',
      recursos: []
    }
  },
  {
    dia_numero: 9, tipo_contenido: 'instructivo',
    titulo_modulo: 'Día 9: El Poder del "Yo Elijo mi Bienestar"',
    emociones_objetivo: ['alegría', 'tristeza'],
    datos_leccion: {
      titulo: 'El Poder del "Yo Elijo mi Bienestar"',
      bloque: 'Autoconfianza',
      concepto: 'La proactividad es la responsabilidad de hacer que las cosas sucedan por convicción, no por obligación.',
      ejercicio: {
        nombre: 'Declaración de Elección Consciente',
        instruccion: 'Antes de realizar CUALQUIER acción de salud, di en voz alta la fórmula de empoderamiento.',
        pasos: [
          'En lugar de "Tengo que tomar mis suplementos" → "Yo elijo tomar mi Ashwagandha porque valoro mi tranquilidad mental"',
          'En lugar de "Debo ir al gimnasio" → "Yo elijo moverme porque valoro mi vitalidad y energía"',
          'En lugar de "No puedo comer esto" → "Yo elijo alimentos que nutren mi cuerpo porque valoro mi bienestar"'
        ],
        tipo: 'practica',
        registro: { formula: '"Yo elijo [acción] porque valoro mi [beneficio personal]"' },
        respuesta_tipo: 'abierta'
      },
      contenido: 'Eliminar el "tengo que" y convertirlo en "elijo" elimina la resistencia mental y mejora la adherencia a largo plazo.',
      suplementacion: [
        { nombre: 'Ashwagandha + Complejo B + Omega-3', dosis: '1 cápsula c/u', horario: 'Mañana', beneficio: 'Optimización mental y emocional integral' }
      ],
      principio: 'Transformación mental: eliminar el "tengo que hacer ejercicio" y convertirlo en "elijo moverme" elimina la resistencia mental.',
      recursos: []
    }
  },
  {
    dia_numero: 10, tipo_contenido: 'cuestionario',
    titulo_modulo: 'Día 10: Auditoría de la Nueva Identidad',
    emociones_objetivo: ['alegría', 'tristeza'],
    datos_leccion: {
      titulo: 'Auditoría de la Nueva Identidad',
      bloque: 'Autoconfianza',
      concepto: 'Visualizar el progreso acumulado en todas las áreas refuerza la creencia en la propia capacidad de cambio.',
      ejercicio: {
        nombre: 'Revisión de Transformación',
        instruccion: 'Haz una lista de 3 momentos específicos donde actuaste como el "protagonista" de tu salud integral.',
        registro: {
          momento_1: { situacion: '', accion: '', sentimiento: '' },
          momento_2: { situacion: '', accion: '', sentimiento: '' },
          momento_3: { situacion: '', accion: '', sentimiento: '' }
        },
        tipo: 'reflexion',
        respuesta_tipo: 'estructurado'
      },
      contenido: '¿Todavía crees que no puedes? Los hechos demuestran que ya estás transformando tu mente y tu cuerpo.',
      suplementacion: [],
      principio: 'Al enfocarse en "victorias no-balanza", mantienes motivación independientemente de fluctuaciones de peso.',
      recursos: []
    }
  },
  {
    dia_numero: 11, tipo_contenido: 'instructivo',
    titulo_modulo: 'Día 11: La Regla de los 5 Minutos (Mente y Cuerpo)',
    emociones_objetivo: ['ira', 'miedo'],
    datos_leccion: {
      titulo: 'La Regla de los 5 Minutos (Mente y Cuerpo)',
      bloque: 'Autocontrol',
      concepto: 'Crear un espacio consciente entre el estímulo y la respuesta para evitar reacciones automáticas.',
      ejercicio: {
        nombre: 'Protocolo de Pausa Consciente',
        instruccion: 'Cuando sientas un antojo, urgencia de sedentarismo, o impulso de procrastinar, aplica este protocolo.',
        pasos: [
          'DETECCIÓN: Reconoce el impulso automático',
          'CRONÓMETRO: Activa timer de 5 minutos exactos',
          'ACTIVIDAD OPUESTA: Si es antojo → bebe 500ml de agua. Si es sedentarismo → 10 estiramientos.',
          'EVALUACIÓN POST-PAUSA: Si el deseo persiste, actúa con conciencia plena.'
        ],
        tipo: 'practica',
        respuesta_tipo: 'abierta'
      },
      contenido: 'El autocontrol no es represión espartana; es la habilidad de crear un espacio consciente entre el estímulo y nuestra respuesta.',
      suplementacion: [
        { nombre: 'L-Teanina', dosis: '200mg', horario: 'Según necesidad', beneficio: 'Mantener calma durante la pausa sin sedación' }
      ],
      principio: 'Fortalece la conexión entre corteza prefrontal y autocontrol.',
      recursos: []
    }
  },
  {
    dia_numero: 12, tipo_contenido: 'instructivo',
    titulo_modulo: 'Día 12: El Ritual de la Disciplina Circadiana',
    emociones_objetivo: ['ira', 'miedo'],
    datos_leccion: {
      titulo: 'El Ritual de la Disciplina Circadiana',
      bloque: 'Autocontrol',
      concepto: 'El autocontrol se fortalece mediante rutinas que estabilizan los ritmos biológicos.',
      ejercicio: {
        nombre: 'Hora Sagrada de Regulación',
        instruccion: 'Establece una hora fija al día para tu ritual de regulación.',
        pasos: [
          'Suplementación estratégica (2 minutos)',
          'Caminata consciente (10 minutos)',
          'Hidratación mindful (3 minutos)'
        ],
        tipo: 'practica',
        registro: { horario_elegido: '', suplemento_matutino: '', suplemento_nocturno: '' },
        respuesta_tipo: 'estructurado'
      },
      contenido: 'Cumplir este horario entrena al cerebro en autoeficacia y ayuda a regular el cortisol.',
      suplementacion: [
        { nombre: 'Ashwagandha + Complejo B', dosis: '300mg + 1 cápsula', horario: 'Mañana', beneficio: 'Regulación de cortisol' },
        { nombre: 'Magnesio Glicinato + Melatonina', dosis: '400mg + 1-2mg', horario: 'Noche', beneficio: 'Recuperación y sueño reparador' }
      ],
      principio: 'Cumplir este horario entrena al cerebro en autoeficacia y ayuda a regular el cortisol.',
      recursos: []
    }
  },
  {
    dia_numero: 13, tipo_contenido: 'cuestionario',
    titulo_modulo: 'Día 13: Higiene del Entorno de Bienestar',
    emociones_objetivo: ['ira', 'miedo'],
    datos_leccion: {
      titulo: 'Higiene del Entorno de Bienestar',
      bloque: 'Autocontrol',
      concepto: 'La gestión del impulso es más efectiva cuando diseñamos un ambiente que no nos sabotea.',
      ejercicio: {
        nombre: 'Rediseño Estratégico del Ambiente',
        instruccion: 'Identifica saboteadores ambientales y reubícalos estratégicamente.',
        registro: {
          saboteador: { objeto: '', ubicacion_actual: '', frecuencia: '' },
          reubicacion: { nueva_ubicacion: '', tiempo_extra_acceso: '' },
          sustituto: { objeto_saludable: '', accion_que_promueve: '' }
        },
        tipo: 'registro',
        respuesta_tipo: 'estructurado'
      },
      contenido: 'Controlar tu entorno es la forma más eficiente de no agotar tu fuerza de voluntad.',
      suplementacion: [],
      principio: 'Controlar tu entorno es la forma más eficiente de no agotar tu fuerza de voluntad.',
      recursos: []
    }
  },
  {
    dia_numero: 14, tipo_contenido: 'instructivo',
    titulo_modulo: 'Día 14: La Pausa Respiratoria Pre-Acción',
    emociones_objetivo: ['ira', 'miedo'],
    datos_leccion: {
      titulo: 'La Pausa Respiratoria Pre-Acción',
      bloque: 'Autocontrol',
      concepto: 'Utilizar la fisiología para calmar el sistema nervioso antes de tomar decisiones de salud.',
      ejercicio: {
        nombre: 'Protocolo de Respiración Estratégica 4-6-8',
        instruccion: 'Aplica esta técnica de respiración antes de comidas, entrenamiento y suplementación.',
        pasos: [
          'Inhalación nasal: 4 segundos (expande abdomen)',
          'Retención: 6 segundos (sin tensión)',
          'Exhalación bucal: 8 segundos (activación parasimpática)'
        ],
        tipo: 'practica',
        registro: {
          pre_comida: { ciclos: 3, enfoque: '"Yo controlo mis decisiones alimentarias"' },
          pre_entrenamiento: { ciclos: 3, enfoque: '"Mi cuerpo está preparado para el movimiento"' }
        },
        respuesta_tipo: 'estructurado'
      },
      contenido: 'Yo controlo mis acciones; mis impulsos momentáneos no definen mi salud.',
      suplementacion: [
        { nombre: 'L-Teanina', dosis: '100mg', horario: '30 minutos antes', beneficio: 'Amplificar efecto calmante' },
        { nombre: 'Magnesio Glicinato', dosis: '200mg', horario: 'Pre-actividades', beneficio: 'Relajación muscular durante respiración' }
      ],
      principio: 'Yo controlo mis acciones; mis impulsos momentáneos no definen mi salud.',
      recursos: []
    }
  },
  {
    dia_numero: 15, tipo_contenido: 'instructivo',
    titulo_modulo: 'Día 15: El Observador de la Incomodidad',
    emociones_objetivo: ['ira', 'miedo'],
    datos_leccion: {
      titulo: 'El Observador de la Incomodidad',
      bloque: 'Autocontrol',
      concepto: 'Aprender a tolerar emociones incómodas sin buscar gratificación instantánea.',
      ejercicio: {
        nombre: 'Protocolo de Tolerancia Emocional "ABLANDAR-PERMITIR-AMAR"',
        instruccion: 'Cuando aparezca tensión, ansiedad o incomodidad, aplica este protocolo.',
        pasos: [
          'ABLANDAR (30s): Localiza la tensión corporal, respira hacia esa zona, relaja conscientemente',
          'PERMITIR (60s): Observa pensamientos sin juzgarlos, describe la emoción, permite que exista como "nube pasajera"',
          'AMAR (30s): Coloca mano en corazón, repite "Puedo estar con esto ahora", ofrécete compasión'
        ],
        tipo: 'practica',
        registro: { emocion: '', intensidad: '', duracion_real: '', estrategia_usada: '' },
        respuesta_tipo: 'estructurado'
      },
      contenido: 'Al finalizar estos 5 días, habrás entrenado tu capacidad de navegar el estrés sin recurrir a mecanismos de escape dañinos.',
      suplementacion: [
        { nombre: 'Omega-3 (EPA/DHA)', dosis: '1000mg', horario: 'Mañana', beneficio: 'Estabilidad del estado de ánimo' },
        { nombre: 'Ashwagandha', dosis: '300mg', horario: 'Mañana y noche', beneficio: 'Reducir reactividad al estrés' },
        { nombre: 'Magnesio Glicinato', dosis: '200mg', horario: 'Noche', beneficio: 'Relajación del sistema nervioso' }
      ],
      principio: 'La aceptación mindful reduce la evitación experiencial.',
      recursos: []
    }
  },
  {
    dia_numero: 16, tipo_contenido: 'instructivo',
    titulo_modulo: 'Día 16: El Viaje al Futuro (Visualización Neuroplástica)',
    emociones_objetivo: ['alegría', 'tristeza'],
    datos_leccion: {
      titulo: 'El Viaje al Futuro (Visualización Neuroplástica)',
      bloque: 'Motivación',
      concepto: 'La motivación intrínseca se fortalece cuando visualizamos los beneficios de una salud óptima a largo plazo.',
      ejercicio: {
        nombre: 'Técnica de Visualización Multisensorial',
        instruccion: 'Encuentra una posición cómoda y realiza esta visualización científica de 10-15 minutos.',
        pasos: [
          'Proyección Temporal (5 min): Visualízate exactamente 10 años en el futuro en un lugar específico',
          'Experiencia Sensorial Completa (5 min): Siente la fuerza de tus latidos, profundidad respiratoria, agilidad muscular',
          'Conexión Emocional (3-5 min): Siente gratitud hacia tu "yo actual", orgullo por tus decisiones'
        ],
        tipo: 'practica',
        respuesta_tipo: 'abierta'
      },
      contenido: 'La visualización repetida crea mapas neuronales que el cerebro interpreta como experiencias reales.',
      suplementacion: [
        { nombre: 'Rhodiola Rosea', dosis: '500mg', horario: '30 minutos antes', beneficio: 'Optimizar función cognitiva y visualización' },
        { nombre: 'Omega-3 (DHA/EPA)', dosis: '1000mg', horario: 'Mañana', beneficio: 'Soporte de neuroplasticidad' }
      ],
      principio: 'La visualización repetida crea mapas neuronales que el cerebro interpreta como experiencias reales.',
      recursos: []
    }
  },
  {
    dia_numero: 17, tipo_contenido: 'cuestionario',
    titulo_modulo: 'Día 17: El Post-it de mi "Porqué" Vital',
    emociones_objetivo: ['alegría', 'tristeza'],
    datos_leccion: {
      titulo: 'El Post-it de mi "Porqué" Vital',
      bloque: 'Motivación',
      concepto: 'La motivación intrínseca surge cuando nuestras acciones están alineadas con valores personales profundos.',
      ejercicio: {
        nombre: 'Arqueología de Valores Profundos',
        instruccion: 'Descubre tu "porqué" auténtico respondiendo estas preguntas progresivas.',
        pasos: [
          '¿Qué es lo más importante para ti en la vida? ¿Por qué es importante?',
          '¿Cómo se relaciona tu salud con proteger eso que valoras?',
          'Completa: "Cuido mi salud integral porque quiero _________ para/con _________"',
          'Escribe tu "porqué" en un post-it y pégalo en un lugar estratégico'
        ],
        tipo: 'reflexion',
        registro: { por_que: '', pegado_en: '' },
        respuesta_tipo: 'abierta'
      },
      contenido: 'Conectar acciones diarias con valores profundos activa el sistema de recompensa intrínseco.',
      suplementacion: [
        { nombre: 'Complejo B', dosis: '1 cápsula', horario: 'Mañana', beneficio: 'Optimizar función cognitiva y toma de decisiones' },
        { nombre: 'Ginkgo Biloba', dosis: '1 cápsula', horario: 'Mañana', beneficio: 'Mejorar circulación cerebral y claridad mental' }
      ],
      principio: 'Conectar acciones diarias con valores profundos activa el sistema de recompensa intrínseco.',
      recursos: []
    }
  },
  {
    dia_numero: 18, tipo_contenido: 'cuestionario',
    titulo_modulo: 'Día 18: Diseño de Entorno Proactivo (Arquitectura de Elección)',
    emociones_objetivo: ['alegría', 'tristeza'],
    datos_leccion: {
      titulo: 'Diseño de Entorno Proactivo (Arquitectura de Elección)',
      bloque: 'Motivación',
      concepto: 'La proactividad es la responsabilidad de diseñar las condiciones necesarias para que las decisiones saludables sean las más fáciles.',
      ejercicio: {
        nombre: 'Rediseño de Ecosistema Personal',
        instruccion: 'Identifica puntos de fricción y rediseña tu entorno para eliminar barreras.',
        registro: {
          estacion_bienestar: { ubicacion: '', elementos: '', ritual: '' },
          hidratacion_automatica: { estrategia: '', recordatorio: '', facilitador: '' },
          activacion_movimiento: { preparacion: '', ubicacion_zapatos: '', recordatorio_visual: '' }
        },
        tipo: 'registro',
        respuesta_tipo: 'estructurado'
      },
      contenido: 'Cuando las decisiones saludables requieren menos esfuerzo que las no saludables, el cambio se vuelve automático y sostenible.',
      suplementacion: [],
      principio: 'Cuando las decisiones saludables requieren menos esfuerzo que las no saludables, el cambio se vuelve automático y sostenible.',
      recursos: []
    }
  },
  {
    dia_numero: 19, tipo_contenido: 'instructivo',
    titulo_modulo: 'Día 19: Nutriendo la Energía, no la Balanza (Enfoque Metabólico)',
    emociones_objetivo: ['alegría', 'tristeza'],
    datos_leccion: {
      titulo: 'Nutriendo la Energía, no la Balanza (Enfoque Metabólico)',
      bloque: 'Motivación',
      concepto: 'La nutrición y la suplementación de calidad son el combustible para tus metas de vida.',
      ejercicio: {
        nombre: 'Auditoría Energética Consciente',
        instruccion: 'Durante tu comida principal, practica la alimentación consciente energética.',
        pasos: [
          'Preparación Mindful: 3 respiraciones, intención "Voy a nutrir mi energía celular", gratitud',
          'Identificación Nutricional: identifica proteínas, carbohidratos complejos, grasas saludables',
          'Conexión Propósito-Nutrición: "Este [alimento] proporciona [nutriente] para que mi [sistema] pueda [función]"'
        ],
        tipo: 'practica',
        respuesta_tipo: 'abierta'
      },
      contenido: 'El foco en energía genera satisfacción inmediata y sostenibilidad.',
      suplementacion: [
        { nombre: 'Coenzima Q10', dosis: '100mg', horario: 'Con desayuno', beneficio: 'Producción de ATP mitocondrial' },
        { nombre: 'Complejo B', dosis: '1 cápsula', horario: 'Mañana', beneficio: 'Metabolismo de macronutrientes' },
        { nombre: 'Magnesio Glicinato', dosis: '200mg', horario: 'Tarde', beneficio: 'Activación de ATP' },
        { nombre: 'Omega-3', dosis: '1000mg', horario: 'Con comida principal', beneficio: 'Función cerebral y energía mental' },
        { nombre: 'Rhodiola Rosea', dosis: '500mg', horario: 'Pre-actividades importantes', beneficio: 'Energía adaptógena' }
      ],
      principio: 'De "comer para perder peso" a "nutrir para vivir plenamente".',
      recursos: []
    }
  },
  {
    dia_numero: 20, tipo_contenido: 'cuestionario',
    titulo_modulo: 'Día 20: El Compromiso con el "Quiero" (Consolidación Neurológica)',
    emociones_objetivo: ['alegría', 'tristeza'],
    datos_leccion: {
      titulo: 'El Compromiso con el "Quiero" (Consolidación Neurológica)',
      bloque: 'Motivación',
      concepto: 'Consolidar el cambio de paradigma del "tengo que" al "quiero" vivir con plenitud.',
      ejercicio: {
        nombre: 'Ritual de Consolidación de Identidad',
        instruccion: 'Realiza este protocolo de cierre y compromiso futuro.',
        pasos: [
          'Revisión de Transformación: ¿cómo ha cambiado tu relación con tu cuerpo en 20 días?',
          'Declaración de Compromiso: repite 3 veces "Elijo moverme, descansar y nutrirme porque quiero disfrutar de una vida plena"',
          'Diseña tu protocolo personal futuro'
        ],
        tipo: 'reflexion',
        registro: {
          suplementacion_personalizada: [],
          practicas_no_negociables: ['', '', ''],
          recordatorio_por_que: ''
        },
        respuesta_tipo: 'estructurado'
      },
      contenido: 'No se trata de ser perfecto; se trata de ser consciente, confiado, controlado y motivado desde adentro.',
      suplementacion: [],
      principio: 'No se trata de ser perfecto; se trata de ser consciente, confiado, controlado y motivado desde adentro.',
      recursos: []
    }
  },
  {
    dia_numero: 21, tipo_contenido: 'instructivo',
    titulo_modulo: 'Día 21: La Regla del Mejor Amigo (Neurociencia de la Autocompasión)',
    emociones_objetivo: ['alegría', 'tristeza'],
    datos_leccion: {
      titulo: 'La Regla del Mejor Amigo (Neurociencia de la Autocompasión)',
      bloque: 'Empatía',
      concepto: 'La crítica interna feroz tras un fallo dispara el cortisol y sabotea el progreso.',
      ejercicio: {
        nombre: 'Protocolo de Autocompasión',
        instruccion: 'Cuando detectes autocrítica severa, aplica esta técnica.',
        pasos: [
          'Identifica el diálogo interno destructivo: pensamiento, emoción y sensación física',
          'Imagina que tu mejor amigo te confiesa el mismo fallo: ¿qué le dirías?',
          'Lée en voz alta tu respuesta compasiva dirigiéndola hacia ti'
        ],
        tipo: 'reflexion',
        registro: { pensamiento_autocritico: '', emocion: '', sensacion_fisica: '', respuesta_compasiva: '' },
        respuesta_tipo: 'estructurado'
      },
      contenido: 'Hablarte con amabilidad reduce el estrés sistémico, permitiendo que tu corazón y metabolismo funcionen mejor.',
      suplementacion: [
        { nombre: 'Ashwagandha', dosis: '300mg', horario: 'Mañana', beneficio: 'Reducción de cortisol en 27.9%' },
        { nombre: 'L-Teanina', dosis: '200mg', horario: 'Según necesidad', beneficio: 'Activación de ondas alfa sin sedación' },
        { nombre: 'Magnesio Glicinato', dosis: '400mg', horario: 'Noche', beneficio: 'Regulación del sistema nervioso parasimpático' }
      ],
      principio: 'Hablarte con amabilidad reduce el estrés sistémico, permitiendo que tu corazón y metabolismo funcionen mejor.',
      recursos: []
    }
  },
  {
    dia_numero: 22, tipo_contenido: 'cuestionario',
    titulo_modulo: 'Día 22: Nota de Re-enfoque (Protocolo Sin Castigo)',
    emociones_objetivo: ['alegría', 'tristeza'],
    datos_leccion: {
      titulo: 'Nota de Re-enfoque (Protocolo Sin Castigo)',
      bloque: 'Empatía',
      concepto: 'Un "desliz" es solo un dato, no una definición de quién eres.',
      ejercicio: {
        nombre: 'Nota de Redirección Consciente',
        instruccion: 'Cuando experimentes un desliz, completa este formulario.',
        registro: {
          fecha: '',
          situacion: '',
          mi_respuesta: '',
          dato_que_ensenia: '',
          proxima_accion_autocuidado: '',
          razon_eleccion: '',
          firma_autocompasion: ''
        },
        tipo: 'registro',
        respuesta_tipo: 'estructurado'
      },
      contenido: 'El autocuidado es un proceso continuo, no una línea recta de perfección.',
      suplementacion: [
        { nombre: 'Rhodiola Rosea', dosis: '500mg', horario: 'Según necesidad', beneficio: 'Resiliencia adaptógena ante el estrés' },
        { nombre: 'Omega-3 (EPA/DHA)', dosis: '1000mg', horario: 'Con comida', beneficio: 'Estabilización del estado de ánimo post-estrés' }
      ],
      principio: 'El autocuidado es un proceso continuo, no una línea recta de perfección.',
      recursos: []
    }
  },
  {
    dia_numero: 23, tipo_contenido: 'instructivo',
    titulo_modulo: 'Día 23: Gratitud Cardiovascular y Corporal (Oxitocina)',
    emociones_objetivo: ['alegría', 'tristeza'],
    datos_leccion: {
      titulo: 'Gratitud Cardiovascular y Corporal (Oxitocina)',
      bloque: 'Empatía',
      concepto: 'La empatía hacia el propio cuerpo es reconocer que trabaja 24/7 por nosotros.',
      ejercicio: {
        nombre: 'Ritual de Gratitud Cardiovascular',
        instruccion: 'Realiza este ritual de conexión corazón-mente de 5-7 minutos.',
        pasos: [
          'Conexión Física (2 min): mano derecha sobre el corazón, mano izquierda sobre abdomen, siente el ritmo cardíaco',
          'Gratitud Específica (3 min): agradece a tu corazón por latir sin que lo recuerdes',
          'Compromiso de Cuidado (2 min): "Cuidar mi corazón con Cardiosmile es un acto de amor propio"'
        ],
        tipo: 'practica',
        respuesta_tipo: 'abierta'
      },
      contenido: 'La gratitud activa el sistema nervioso parasimpático, mejorando la variabilidad de la frecuencia cardíaca.',
      suplementacion: [
        { nombre: 'Cardiosmile', dosis: '1 sachet', horario: 'Después del almuerzo', beneficio: 'Soporte integral cardiovascular' },
        { nombre: 'Coenzima Q10', dosis: '100mg', horario: 'Con comida principal', beneficio: 'Energía celular cardíaca' },
        { nombre: 'Omega-3', dosis: '1000mg EPA/DHA', horario: 'Con cena', beneficio: 'Protección cardiovascular' },
        { nombre: 'Magnesio', dosis: '400mg', horario: 'Noche', beneficio: 'Relajación del músculo cardíaco' }
      ],
      principio: 'La gratitud activa el sistema nervioso parasimpático.',
      recursos: []
    }
  },
  {
    dia_numero: 24, tipo_contenido: 'instructivo',
    titulo_modulo: 'Día 24: Empatía con el Entorno (Salud Social y Oxitocina)',
    emociones_objetivo: ['alegría', 'tristeza'],
    datos_leccion: {
      titulo: 'Empatía con el Entorno (Salud Social y Oxitocina)',
      bloque: 'Empatía',
      concepto: 'Los conflictos con los demás a menudo disparan la ingesta emocional como mecanismo de escape.',
      ejercicio: {
        nombre: 'Protocolo de Empatía Preventiva',
        instruccion: 'Antes de reaccionar con impaciencia o frustración, aplica esta pausa empática.',
        pasos: [
          'Pausa Fisiológica (30s): 3 ciclos de respiración 4-6-8, afloja hombros y mandíbula',
          'Reencuadre Empático (30s): "Esta persona también está lidiando con sus propias cargas"',
          'Respuesta Consciente: elige desde la calma: respuesta empática, pausa para procesar, o límites saludables'
        ],
        tipo: 'practica',
        registro: { situacion_desafiante: '', reaccion_inicial: '', pausa_empatica_aplicada: '', resultado: '' },
        respuesta_tipo: 'estructurado'
      },
      contenido: 'Cultivar relaciones sanas protege tu salud mental y evita que utilices la comida como consuelo.',
      suplementacion: [
        { nombre: 'L-Teanina', dosis: '200mg', horario: 'Según necesidad', beneficio: 'Mantener calma en interacciones estresantes' },
        { nombre: 'Complejo B', dosis: '1 cápsula', horario: 'Mañana', beneficio: 'Soporte del sistema nervioso durante estrés interpersonal' }
      ],
      principio: 'Cultivar relaciones sanas protege tu salud mental y evita la alimentación emocional.',
      recursos: []
    }
  },
  {
    dia_numero: 25, tipo_contenido: 'cuestionario',
    titulo_modulo: 'Día 25: El Permiso del Descanso Real (Neurobiología de la Recuperación)',
    emociones_objetivo: ['alegría', 'tristeza'],
    datos_leccion: {
      titulo: 'El Permiso del Descanso Real (Neurobiología de la Recuperación)',
      bloque: 'Empatía',
      concepto: 'La falta de autocompasión a menudo se disfraza de exigencia excesiva que lleva al agotamiento.',
      ejercicio: {
        nombre: 'Auditoría de Señales de Agotamiento',
        instruccion: 'Evalúa tu nivel de agotamiento y aplica el protocolo correspondiente.',
        registro: {
          fatiga_fisica: '___/10',
          niebla_mental: '___/10',
          irritabilidad_emocional: '___/10',
          total: '___/30',
          interpretacion: '',
          protocolo_elegido: ''
        },
        tipo: 'registro',
        respuesta_tipo: 'escala'
      },
      contenido: 'El bienestar incluye darte el combustible para actuar, pero también el permiso para recuperarte.',
      suplementacion: [
        { nombre: 'Magnesio Glicinato', dosis: '400mg', horario: '2 horas antes de dormir', beneficio: 'Relajación muscular y mental' },
        { nombre: 'Melatonina', dosis: '1-2mg', horario: '1 hora antes de dormir', beneficio: 'Regulación del ciclo circadiano' },
        { nombre: 'L-Teanina', dosis: '200mg', horario: 'Con magnesio', beneficio: 'Calma sin interferir con sueño' },
        { nombre: 'Ashwagandha', dosis: '300mg', horario: 'Noche', beneficio: 'Reducción de cortisol nocturno' }
      ],
      principio: 'Descansar no es pereza; es sabiduría. El descanso es productividad diferida, no tiempo perdido.',
      recursos: []
    }
  },
  {
    dia_numero: 26, tipo_contenido: 'instructivo',
    titulo_modulo: 'Día 26: El Guion de la Asertividad Saludable (Neurociencia Social)',
    emociones_objetivo: ['alegría', 'ira'],
    datos_leccion: {
      titulo: 'El Guion de la Asertividad Saludable (Neurociencia Social)',
      bloque: 'Competencia Social',
      concepto: 'La competencia social es la habilidad de mantener el estilo de vida saludable frente a la presión de grupo sin aislarse.',
      ejercicio: {
        nombre: 'Protocolo de Asertividad Neurológica',
        instruccion: 'Identifica escenarios sociales desafiantes y prepara guiones asertivos.',
        pasos: [
          'Identifica 3 situaciones sociales próximas con posible presión',
          'Desarrolla guiones con la fórmula: [Reconocimiento] + [Límite claro] + [Alternativa positiva]',
          'Practica: "Se ve delicioso, pero estoy satisfecho/a. Gracias por pensar en mí"'
        ],
        tipo: 'practica',
        registro: {
          escenario_1: '', presion_esperada: '', guion_asertivo: '',
          escenario_2: '', presion_esperada_2: '', guion_asertivo_2: ''
        },
        respuesta_tipo: 'estructurado'
      },
      contenido: 'Practicar límites claros reduce el estrés social, protegiendo tu equilibrio emocional y tu presión arterial.',
      suplementacion: [],
      principio: 'Practicar límites claros reduce el estrés social, protegiendo tu equilibrio emocional.',
      recursos: []
    }
  },
  {
    dia_numero: 27, tipo_contenido: 'cuestionario',
    titulo_modulo: 'Día 27: La "Estrategia de Pre-Carga" (Bienestar Proactivo)',
    emociones_objetivo: ['alegría', 'ira'],
    datos_leccion: {
      titulo: 'La "Estrategia de Pre-Carga" (Bienestar Proactivo)',
      bloque: 'Competencia Social',
      concepto: 'El entorno social es a menudo el mayor saboteador de los hábitos; la planificación proactiva es tu mejor defense.',
      ejercicio: {
        nombre: 'Protocolo de Pre-Carga Integral',
        instruccion: 'Prepara estratégicamente tu cuerpo y mente antes de eventos sociales.',
        registro: {
          pre_carga_nutricional: { comida: '', hidratacion: '', suplementacion: '' },
          pre_carga_mental: { guiones_revisados: '', visualizacion: '', conexion_proposito: '' },
          pre_carga_emocional: { respiracion_reguladora: '', afirmacion: '', intencion: '' },
          kit_emergencia_social: ['botella_agua', 'L-Teanina', 'snack_saludable', 'recordatorio_visual']
        },
        tipo: 'registro',
        respuesta_tipo: 'estructurado'
      },
      contenido: 'No llegar con hambre física o ansiedad al evento te permite elegir desde la razón y no desde el impulso emocional.',
      suplementacion: [
        { nombre: 'L-Teanina', dosis: '200mg', horario: 'Antes del evento', beneficio: 'Manejo de ansiedad aguda social' }
      ],
      principio: 'No llegar con hambre física o ansiedad al evento te permite elegir desde la razón y no desde el impulso emocional.',
      recursos: []
    }
  },
  {
    dia_numero: 28, tipo_contenido: 'instructivo',
    titulo_modulo: 'Día 28: Conexión Humana sobre el Consumo (Inteligencia Interpersonal)',
    emociones_objetivo: ['alegría', 'ira'],
    datos_leccion: {
      titulo: 'Conexión Humana sobre el Consumo (Inteligencia Interpersonal)',
      bloque: 'Competencia Social',
      concepto: 'Desplazar el foco del placer desde la comida hiperpalatable hacia la inteligencia interpersonal.',
      ejercicio: {
        nombre: 'Protocolo de Socialización Mindful',
        instruccion: 'Enfócate en conocer genuinamente a las personas durante eventos sociales.',
        pasos: [
          'Intención clara: "Voy a enfocarme en conocer genuinamente a las personas"',
          'Escucha activa: mantén contacto visual, haz preguntas genuinas',
          'Redirección social: si la conversación se centra en comida, transiciona a temas personales'
        ],
        tipo: 'practica',
        registro: { persona: '', algo_nuevo_aprendido: '', conexion_emocional: '' },
        respuesta_tipo: 'estructurado'
      },
      contenido: 'Disfrutar de los vínculos afectivos reduce el cortisol y fortalece tu sistema inmunológico.',
      suplementacion: [
        { nombre: 'Omega-3 (EPA/DHA)', dosis: '1000mg', horario: 'Mañana', beneficio: 'Estabilidad emocional en interacciones' },
        { nombre: 'Complejo B', dosis: '1 cápsula', horario: 'Mañana', beneficio: 'Energía mental sostenida para conversaciones' },
        { nombre: 'L-Teanina', dosis: '100mg', horario: 'Según necesidad', beneficio: 'Calma y presencia durante interacciones intensas' }
      ],
      principio: 'La comida es el contexto, la conexión es el propósito.',
      recursos: []
    }
  },
  {
    dia_numero: 29, tipo_contenido: 'instructivo',
    titulo_modulo: 'Día 29: El "No" que es un "Sí" a tu Futuro (Autoeficacia Social)',
    emociones_objetivo: ['alegría', 'ira'],
    datos_leccion: {
      titulo: 'El "No" que es un "Sí" a tu Futuro (Autoeficacia Social)',
      bloque: 'Competencia Social',
      concepto: 'La capacidad de decir "no" a las presiones externas es un ejercicio de autoeficacia y respeto hacia tus valores intrínsecos.',
      ejercicio: {
        nombre: 'Protocolo de Límites Empoderados',
        instruccion: 'Identifica saboteadores sociales y desarrolla estrategias específicas de límite.',
        pasos: [
          'Identifica personas que consistentemente presionan contra tus decisiones saludables',
          'Desarrolla límites con la fórmula: [Reconocimiento] + [Límite claro] + [Conexión con valores futuros]',
          'Visualiza cada escenario: imagina mantener tu postura con confianza'
        ],
        tipo: 'reflexion',
        registro: {
          saboteador_1: '', tipo_presion: '', frecuencia: '', estrategia: '',
          saboteador_2: '', tipo_presion_2: '', frecuencia_2: '', estrategia_2: ''
        },
        respuesta_tipo: 'estructurado'
      },
      contenido: 'Mantener tu estilo de vida frente a otros refuerza tu identidad como "protagonista" de tu propia historia.',
      suplementacion: [],
      principio: 'Cada "no" a la presión externa es un "sí" a tu futuro saludable.',
      recursos: []
    }
  },
  {
    dia_numero: 30, tipo_contenido: 'cuestionario',
    titulo_modulo: 'Día 30: Recapitulación y Compromiso de Vida',
    emociones_objetivo: ['alegría', 'ira'],
    datos_leccion: {
      titulo: 'Recapitulación y Compromiso de Vida (Consolidación de Competencia Social)',
      bloque: 'Competencia Social',
      concepto: 'La Inteligencia Emocional es una "caja de herramientas" que te servirá de por vida.',
      ejercicio: {
        nombre: 'Ritual de Graduación y Compromiso',
        instruccion: 'Realiza la auditoría final de tu transformación de 30 días y diseña tu protocolo de mantenimiento.',
        pasos: [
          'Revisa cada bloque: ¿cuál fue tu mayor victoria en cada competencia?',
          'Diseña tu protocolo personal de mantenimiento con suplementación y prácticas no-negociables',
          'Escribe una carta compromiso a tu futuro yo'
        ],
        tipo: 'reflexion',
        registro: {
          mayor_victoria_global: '',
          suplementacion_futura: [],
          practicas_no_negociables: ['', '', '', '', ''],
          carta_futuro_yo: ''
        },
        respuesta_tipo: 'estructurado'
      },
      contenido: 'Has desarrollado un protocolo interno de competencia social: RECONOCE → CENTRA → EVALÚA → COMUNICA → MANTIENE → CONECTA.',
      suplementacion: [
        { nombre: 'Ashwagandha', dosis: '300mg', horario: 'Diario', beneficio: 'Manejo sostenible del estrés social' },
        { nombre: 'Complejo B', dosis: '1 cápsula', horario: 'Diario', beneficio: 'Energía mental y emocional consistente' },
        { nombre: 'Magnesio Glicinato', dosis: '400mg', horario: 'Noche', beneficio: 'Recuperación y calidad de sueño' },
        { nombre: 'Omega-3', dosis: '1000mg', horario: 'Diario', beneficio: 'Estabilidad emocional y función cerebral' },
        { nombre: 'Cardiosmile + CoQ10', dosis: '1 sachet + 100mg', horario: 'Diario', beneficio: 'Soporte cardiovascular continuo' }
      ],
      principio: 'Que cada día de tu vida sea una expresión de tu competencia social integral.',
      recursos: []
    }
  }
];

// ---------------------------------------------------------------------------
// Test inicial: 30 preguntas, 5 por competencia
// Orden: interleaved — ciclo de 6 competencias, 5 rondas (preguntas 1-30)
// ---------------------------------------------------------------------------
const TEST_PREGUNTAS = [
  { numero: 1,  competencia: 'autoconciencia',    texto: 'Soy consciente de las reacciones físicas (gestos, dolores, cambios súbitos) que indican una "reacción visceral".' },
  { numero: 2,  competencia: 'autoconfianza',     texto: 'Admito de buena gana mis errores y me disculpo.' },
  { numero: 3,  competencia: 'autocontrol',       texto: 'No me aferro a los problemas, enfados o heridas del pasado, soy capaz de dejarlos atrás para avanzar.' },
  { numero: 4,  competencia: 'empatia',           texto: 'Normalmente tengo una idea exacta de cómo me percibe la otra persona durante una interacción específica.' },
  { numero: 5,  competencia: 'motivacion',        texto: 'Hay varias cosas importantes en mi vida que me entusiasman, y lo hago patente.' },
  { numero: 6,  competencia: 'competencia_social',texto: 'Tengo facilidad para conocer e iniciar conversaciones con personas desconocidas cuando tengo que hacerlo.' },
  { numero: 7,  competencia: 'autoconciencia',    texto: 'Me tomo un descanso o utilizo otro método activo para incrementar mi energía cuando percibo que mi nivel energético decae.' },
  { numero: 8,  competencia: 'autoconfianza',     texto: 'No me cuesta demasiado asumir riesgos prudentes.' },
  { numero: 9,  competencia: 'autocontrol',       texto: 'Me "abro" a las personas en la medida adecuada, no demasiado, pero lo suficiente como para no dar la impresión de ser frío y distante.' },
  { numero: 10, competencia: 'empatia',           texto: 'Puedo participar en una interacción con otra persona y captar bastante bien cuál es su estado de ánimo en base a las señales no verbales que me envía.' },
  { numero: 11, competencia: 'motivacion',        texto: 'Normalmente, otros se sienten inspirados y animados después de hablar conmigo.' },
  { numero: 12, competencia: 'competencia_social',texto: 'No tengo ningún problema a la hora de hacer una presentación a un grupo o dirigir una reunión.' },
  { numero: 13, competencia: 'autoconciencia',    texto: 'Cada día dedico algo de tiempo a la reflexión.' },
  { numero: 14, competencia: 'autoconfianza',     texto: 'Yo tomo la iniciativa y sigo adelante con las tareas que es necesario hacer.' },
  { numero: 15, competencia: 'autocontrol',       texto: 'Me abstengo de formarme una opinión sobre los temas y de expresar esa opinión hasta que no conozco todos los hechos.' },
  { numero: 16, competencia: 'empatia',           texto: 'Cuento con varias personas a las que puedo recurrir y pedir ayuda cuando lo necesito.' },
  { numero: 17, competencia: 'motivacion',        texto: 'Intento encontrar el lado positivo en cualquier situación.' },
  { numero: 18, competencia: 'competencia_social',texto: 'Soy capaz de afrontar con calma, sensibilidad y de manera proactiva las manifestaciones y los despliegues emocionales de otras personas.' },
  { numero: 19, competencia: 'autoconciencia',    texto: 'Normalmente soy capaz de identificar el tipo de emoción que siento en un momento dado.' },
  { numero: 20, competencia: 'autoconfianza',     texto: 'Por lo general me siento cómodo ante situaciones nuevas.' },
  { numero: 21, competencia: 'autocontrol',       texto: 'No escondo mi enfado pero tampoco lo pago con otros.' },
  { numero: 22, competencia: 'empatia',           texto: 'Puedo demostrar empatía y acoplar mis sentimientos a los de la otra persona en una interacción.' },
  { numero: 23, competencia: 'motivacion',        texto: 'Puedo perseguir un objetivo a largo plazo, haciendo el esfuerzo necesario para lograrlo.' },
  { numero: 24, competencia: 'competencia_social',texto: 'Cuando hablo con alguien, siempre le escucho atentamente y le dejo que acabe de hablar antes de responder.' },
  { numero: 25, competencia: 'autoconciencia',    texto: 'Soy capaz de identificar lo que siento cuando una emoción cambia de una a otra.' },
  { numero: 26, competencia: 'autoconfianza',     texto: 'Creo en mis capacidades y confío en mis decisiones aunque los demás no estén de acuerdo.' },
  { numero: 27, competencia: 'autocontrol',       texto: 'Mantengo la calma y actúo de forma reflexiva incluso en situaciones de alta presión o conflicto.' },
  { numero: 28, competencia: 'empatia',           texto: 'Reconozco y comprendo los sentimientos de los demás incluso cuando no los expresan abiertamente.' },
  { numero: 29, competencia: 'motivacion',        texto: 'Me recupero rápidamente de los contratiempos y mantengo el rumbo hacia mis objetivos.' },
  { numero: 30, competencia: 'competencia_social',texto: 'Soy capaz de crear un ambiente positivo y motivador que influye favorablemente en las personas que me rodean.' }
];

// ---------------------------------------------------------------------------
// Contenidos especiales: bienvenida, presentación, reflexión 15 y 30 días
// ---------------------------------------------------------------------------
const CONTENIDOS_ESPECIALES = [
  {
    tipo: 'bienvenida',
    titulo: 'Bienvenido al Programa IEN',
    contenido: {
      mensaje: 'Bienvenido a tu programa de Inteligencia Emocional y Nutrición. Durante 30 días trabajarás 6 competencias clave que transformarán tu relación con tus emociones y tu bienestar.',
      competencias: [
        { nombre: 'Autoconciencia', descripcion: 'Días 1-5: Reconocer tus emociones y estados físicos en tiempo real.' },
        { nombre: 'Autoconfianza', descripcion: 'Días 6-10: Construir una narrativa de identidad saludable.' },
        { nombre: 'Autocontrol', descripcion: 'Días 11-15: Crear espacio entre el estímulo y la respuesta.' },
        { nombre: 'Motivación', descripcion: 'Días 16-20: Conectar acciones con valores profundos.' },
        { nombre: 'Empatía', descripcion: 'Días 21-25: Cultivar compasión hacia ti mismo y los demás.' },
        { nombre: 'Competencia Social', descripcion: 'Días 26-30: Mantener hábitos saludables en entornos sociales.' }
      ],
      llamada_a_accion: 'Completa el test inicial para personalizar tu experiencia.'
    }
  },
  {
    tipo: 'presentacion',
    titulo: 'Presentación del Programa IEN',
    contenido: {
      descripcion: 'El Programa IEN integra la neurociencia de las emociones con estrategias de nutrición y suplementación para generar cambios sostenibles en tu estilo de vida.',
      metodologia: 'Cada día recibirás contenido instructivo o un cuestionario de reflexión, acompañado de recomendaciones de suplementación específicas para cada competencia emocional.',
      estructura: {
        duracion: '30 días',
        bloques: 6,
        dias_por_bloque: 5,
        tipos_contenido: ['instructivo', 'cuestionario'],
        suplementacion_integrada: true
      },
      equipo: 'Desarrollado por especialistas en inteligencia emocional, neurociencia aplicada y nutrición integrativa.'
    }
  },
  {
    tipo: 'reflexion_15_dias',
    titulo: 'Reflexión de Mitad de Programa (Día 15)',
    contenido: {
      mensaje: '¡Felicidades! Has completado la primera mitad del programa. Es momento de reflexionar sobre tu transformación.',
      preguntas_reflexion: [
        '¿Qué competencia emocional has sentido que más ha crecido en ti?',
        '¿Cuál ha sido tu mayor victoría no-balanza de estas dos semanas?',
        '¿Qué suplemento ha tenido mayor impacto en tu energía y bienestar?',
        '¿Cómo ha cambiado tu diálogo interno respecto al inicio del programa?'
      ],
      recordatorio: 'Llevas 15 días de práctica consistente. Tu cerebro está literalmente recableándose para adoptar nuevos patrones más saludables.',
      proximos_pasos: 'Las siguientes dos semanas profundizarán en empatía y competencia social: las habilidades que impactan directamente tus relaciones y tu bienestar interpersonal.'
    }
  },
  {
    tipo: 'reflexion_30_dias',
    titulo: 'Reflexión de Cierre del Programa (Día 30)',
    contenido: {
      mensaje: '¡Lo lograste! Has completado los 30 días del Programa IEN. Eres parte de un grupo selecto de personas comprometidas con su transformación integral.',
      logros_posibles: [
        'Mayor conciencia de tus estados emocionales y físicos',
        'Narrativa de identidad saludable consolidada',
        'Herramientas de autocontrol ante impulsos desadaptativos',
        'Motivación intrínseca alineada con tus valores profundos',
        'Práctica de autocompasión y empatía activa',
        'Competencia social para mantener hábitos en cualquier entorno'
      ],
      protocolo_mantenimiento: 'Continúa con tu suplementación personalizada, tus 3 prácticas no-negociables y tu conexión diaria con tu "porqué".',
      mensaje_final: 'La inteligencia emocional no es un destino, es un camino. Que cada día sea una nueva oportunidad de elegir tu bienestar.'
    }
  }
];

// ---------------------------------------------------------------------------
// Función principal
// ---------------------------------------------------------------------------
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado a MongoDB');

  // Limpiar todas las colecciones dropeándolas físicamente para limpiar índices obsoletos
  await Promise.all([
    Tienda.collection.drop().catch(() => {}),
    Usuario.collection.drop().catch(() => {}),
    ContenidoDiario.collection.drop().catch(() => {}),
    TestPregunta.collection.drop().catch(() => {}),
    ContenidoEspecial.collection.drop().catch(() => {}),
    Producto.collection.drop().catch(() => {}),
    Codigo.collection.drop().catch(() => {})
  ]);
  console.log('Colecciones y sus índices limpiados');

  // 1. Tiendas (sin campo codigo_activacion)
  const tiendas = await Tienda.insertMany([
    { nombre_tienda: 'Tienda Centro', ciudad: 'Ciudad de México' },
    { nombre_tienda: 'Tienda Norte', ciudad: 'Monterrey' },
    { nombre_tienda: 'Tienda Sur', ciudad: 'Guadalajara' }
  ]);
  console.log(`${tiendas.length} tiendas creadas`);
  const tCentro = tiendas[0];
  const tNorte = tiendas[1];
  const tSur = tiendas[2];

  // 2. Productos
  const productos = await Producto.insertMany([
    {
      nombre: 'Programa 30 días Cardiosmile',
      descripcion: 'Plan cardiovascular completo',
      tiendas: [tCentro._id, tNorte._id, tSur._id]
    },
    {
      nombre: 'Programa Especial Ashwagandha',
      descripcion: 'Plan de autogestión y reducción de estrés',
      tiendas: [tCentro._id, tNorte._id]
    }
  ]);
  console.log(`${productos.length} productos creados`);
  const prodCardio = productos[0];
  const prodAshwa = productos[1];

  // 3. Códigos
  const codigos = await Codigo.insertMany([
    { codigo: 'IEN-001', producto_id: prodCardio._id, tienda_id: tCentro._id, activo: true },
    { codigo: 'IEN-002', producto_id: prodCardio._id, tienda_id: tNorte._id, activo: true },
    { codigo: 'IEN-003', producto_id: prodCardio._id, tienda_id: tSur._id, activo: true },
    { codigo: 'IEN-004', producto_id: prodAshwa._id, tienda_id: tCentro._id, activo: true },
    { codigo: 'IEN-005', producto_id: prodAshwa._id, tienda_id: tNorte._id, activo: true }
  ]);
  console.log(`${codigos.length} códigos de activación creados`);

  // 4. Usuarios Administradores
  const password_hash = await bcrypt.hash('admin123', 10);
  
  // admin_general
  await Usuario.create({
    nombre: 'Admin General',
    email: 'admin@ien.test',
    password_hash,
    rol: 'admin_general'
  });
  console.log('Admin General creado: admin@ien.test / admin123');

  // admin_negocio asociado a Centro y Norte
  await Usuario.create({
    nombre: 'Admin Negocio Centro-Norte',
    email: 'admin_negocio@ien.test',
    password_hash,
    rol: 'admin_negocio',
    tiendas_administradas: [tCentro._id, tNorte._id]
  });
  console.log('Admin Negocio creado: admin_negocio@ien.test / admin123 (tiendas: Centro, Norte)');

  // 5. Contenidos diarios: extrae respuesta_tipo desde datos_leccion.ejercicio al nivel raíz
  const contenidosConTipo = CONTENIDOS.map(c => ({
    ...c,
    respuesta_tipo: c.datos_leccion?.ejercicio?.respuesta_tipo ?? 'abierta'
  }));
  await ContenidoDiario.insertMany(contenidosConTipo);
  console.log(`${CONTENIDOS.length} contenidos diarios creados`);

  // 6. Test preguntas (30 preguntas, 5 por competencia)
  const preguntasConLabel = TEST_PREGUNTAS.map(p => ({
    ...p,
    competencia_label: COMPETENCIA_LABELS[p.competencia]
  }));
  await TestPregunta.insertMany(preguntasConLabel);
  console.log(`${preguntasConLabel.length} preguntas de test creadas`);

  // 7. Contenidos especiales (4 registros)
  await ContenidoEspecial.insertMany(CONTENIDOS_ESPECIALES);
  console.log(`${CONTENIDOS_ESPECIALES.length} contenidos especiales creados`);

  // Verificación de conteos
  const [countPreguntas, countEspeciales, countProductos, countCodigos] = await Promise.all([
    TestPregunta.countDocuments(),
    ContenidoEspecial.countDocuments(),
    Producto.countDocuments(),
    Codigo.countDocuments()
  ]);
  console.log(`\n--- Verificación de conteos ---`);
  console.log(`TestPregunta.countDocuments() = ${countPreguntas}`);
  console.log(`ContenidoEspecial.countDocuments() = ${countEspeciales}`);
  console.log(`Producto.countDocuments() = ${countProductos}`);
  console.log(`Codigo.countDocuments() = ${countCodigos}`);

  console.log('\nSeed completado exitosamente');
  await mongoose.disconnect();
  process.exit(0);
}

if (require.main === module) {
  seed().catch((err) => {
    console.error('Error en seed:', err);
    process.exit(1);
  });
}

module.exports = { CONTENIDOS, TEST_PREGUNTAS, CONTENIDOS_ESPECIALES };

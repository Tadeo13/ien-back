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
const PlanProgreso = require('./models/PlanProgreso');
const HistorialCorreo = require('./models/HistorialCorreo');


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
    cabecera: `Bloque 1: Autoconciencia (Días 1-5)\n\nTema: "Reconociendo mis señales internas: El Despertar del Observador".\n\nLa famosa cita de Lao Tzu habla del poder de nuestros pensamientos para moldear nuestras vidas. "Vigila tus pensamientos, se convierten en tus palabras; vigila tus palabras, se convierten en tus acciones; vigila tus acciones, se convierten en tus hábitos; vigila tus hábitos, se convierten en tu carácter; vigila tu carácter, se convierte en tu destino".\n\nLa ciencia confirma que nos convertimos en lo que pensamos. Por término medio, tenemos unos 70.000 pensamientos al día, y los pensamientos que entran en nuestra conciencia están influidos por nuestras experiencias, percepciones y educación.\n\nTener un alto nivel de autoconciencia es crucial para comprender los diversos pensamientos y sistemas de creencias que tenemos sobre nosotros mismos y el mundo. Observar nuestras acciones y hábitos puede proporcionarnos información valiosa sobre lo que pensamos y creemos.`,
    datos_leccion: {
      titulo: 'El Escáner de Energía Vital',
      bloque: 'Autoconciencia',
      concepto: 'La autoconciencia es la capacidad de reconocer un sentimiento o estado físico en el momento en que aparece.',
      ejercicio: {
        nombre: 'Escaneo Corporal Matutino',
        instruccion: 'Al despertar, permanece en la cama durante 2-3 minutos adicionales escaneando tu cuerpo de pies a cabeza.',
        pasos: [
          { texto: 'Observa tus niveles de energía hoy', respuesta_tipo: 'escala', min: 1, max: 10 },
          { texto: 'Identifica tensión en hombros, cuello o mandíbula', respuesta_tipo: 'abierta' },
          { texto: 'Siente si hay ligereza en las piernas o pesadez mental', respuesta_tipo: 'abierta' },
          { texto: 'Nota si tu respiración es superficial o profunda', respuesta_tipo: 'abierta' }
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
          { texto: 'Hambre Física: sensaciones reales en el estómago', respuesta_tipo: 'escala', min: 1, max: 10 },
          { texto: 'Cansancio Corporal: fatiga muscular y energética', respuesta_tipo: 'escala', min: 1, max: 10 },
          { texto: 'Ansiedad Mental: tensión psicológica y preocupación', respuesta_tipo: 'escala', min: 1, max: 10 }
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
          { texto: 'DETENTE por 30 segundos', respuesta_tipo: 'accion' },
          { texto: 'NOMBRA en voz alta: "No es hambre/cansancio real, lo que siento es [emoción específica]"', respuesta_tipo: 'accion' },
          { texto: 'ELIGE una acción que realmente sane esa emoción', respuesta_tipo: 'accion' }
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
          { texto: 'Apaga música, podcasts and notificaciones', respuesta_tipo: 'accion' },
          { texto: 'Concéntrate en el ritmo de tu respiración', respuesta_tipo: 'accion' },
          { texto: 'Siente el contacto consciente de tus pies con el suelo', respuesta_tipo: 'accion' },
          { texto: 'Percibe la contracción y relajación muscular', respuesta_tipo: 'accion' },
          { texto: 'Observa tu latido cardíaco', respuesta_tipo: 'accion' }
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
          { texto: '¿A qué hora del día te sientes más fuerte para ejercitarte?', respuesta_tipo: 'abierta' },
          { texto: '¿En qué momento tu mente pide más "consuelo" a través de la comida?', respuesta_tipo: 'abierta' },
          { texto: '¿Qué emociones específicas identificaste como "anestésicos"?', respuesta_tipo: 'abierta' },
          { texto: '¿Cuáles fueron tus niveles de energía más consistentes?', respuesta_tipo: 'abierta' }
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
    cabecera: `Bloque 2: Autoconfianza (Días 6-10)\n\nTema Central: "Creer en mi propia capacidad de cambio: De la Víctima al Protagonista"\n\nMuchos de nosotros llegamos a este punto con una mochila cargada de lo que llamamos "fracasos" dietéticos o rutinas de ejercicio abandonadas. Esa historia ha erosionado nuestra confianza, haciéndonos creer que no tenemos "fuerza de voluntad".\n\nSin embargo, la autoconfianza en la salud integral no es una cualidad mágica con la que se nace; es una competencia que se construye. En estos próximos 5 días, vamos a dejar atrás la identidad del "dietante fallido o el perezoso" para convertirnos en los autores de nuestra propia historia.\n\nConstruir autoconfianza y autoeficacia significa entender que eres capaz de nutrir tu cuerpo y moverte con decisiones inteligentes, celebrando cada pequeña victoria como una prueba real de tu poder de transformación. Tu mente cree lo que le dices: hoy empezamos a decirle que sí puedes.`,
    datos_leccion: {
      titulo: 'El Cambio de Narrativa Sistémica',
      bloque: 'Autoconfianza',
      concepto: 'La autoeficacia surge al silenciar al "saboteador interno". La neuroplasticidad permite que el cerebro adopte nuevas identidades.',
      ejercicio: {
        nombre: 'Reescritura de Identidad',
        instruccion: 'Identifica una etiqueta limitante, elimínala simbólicamente y crea una nueva narrativa en presente.',
        pasos: [
          { texto: 'Escribe una etiqueta limitante específica (ej: "Soy perezoso para el ejercicio")', respuesta_tipo: 'abierta' },
          { texto: 'Táchala físicamente con una línea roja gruesa', respuesta_tipo: 'abierta' },
          { texto: 'Redacta tu nueva identidad en presente: "Soy una persona que elige cuidar su energía y su salud cada día"', respuesta_tipo: 'abierta' }
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
          { texto: 'Tomar mi dosis de suplemento todos los días', respuesta_tipo: 'accion' },
          { texto: 'Hacer 5 minutos de estiramientos al despertar', respuesta_tipo: 'accion' },
          { texto: 'Leer una página al día de un libro de crecimiento personal', respuesta_tipo: 'accion' },
          { texto: 'Caminar 10 minutos después del almuerzo', respuesta_tipo: 'accion' }
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
        nombre: 'Auditor�a de Bienestar Integral',
        instruccion: 'Ignora la balanza. Eval�a estas �reas de bienestar.',
        pasos: [
          { texto: 'Energ�a F�sica: �Subiste escaleras con menos fatiga?', respuesta_tipo: 'abierta' },
          { texto: 'Claridad Mental: �Te sientes m�s enfocado/a durante el trabajo?', respuesta_tipo: 'abierta' },
          { texto: 'Fuerza Muscular: �Tus m�sculos se sienten m�s firmes?', respuesta_tipo: 'abierta' },
          { texto: 'Calidad de Sue�o: �Despertaste m�s descansado/a?', respuesta_tipo: 'abierta' },
          { texto: 'Estado de �nimo: �Te sientes m�s optimista que la semana pasada?', respuesta_tipo: 'abierta' }
        ],
        tipo: 'reflexion',
        respuesta_tipo: 'abierta',
        registro: {
          energia_fisica: { pregunta: '�Subiste escaleras con menos fatiga?', observacion: '' },
          claridad_mental: { pregunta: '�Te sientes m�s enfocado/a durante el trabajo?', observacion: '' },
          fuerza_muscular: { pregunta: '�Tus m�sculos se sienten m�s firmes?', observacion: '' },
          calidad_sueno: { pregunta: '�Despertaste m�s descansado/a?', observacion: '' },
          estado_animo: { pregunta: '�Te sientes m�s optimista que la semana pasada?', observacion: '' }
        },
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
          { texto: 'En lugar de "Tengo que tomar mis suplementos" → "Yo elijo tomar mi Ashwagandha porque valoro mi tranquilidad mental"', respuesta_tipo: 'accion' },
          { texto: 'En lugar de "Debo ir al gimnasio" → "Yo elijo moverme porque valoro mi vitalidad y energía"', respuesta_tipo: 'accion' },
          { texto: 'En lugar de "No puedo comer esto" → "Yo elijo alimentos que nutren mi cuerpo porque valoro mi bienestar"', respuesta_tipo: 'accion' }
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
        nombre: 'Revisi�n de Transformaci�n',
        instruccion: 'Haz una lista de 3 momentos espec�ficos donde actuaste como el "protagonista" de tu salud integral.',
        pasos: [
          { texto: 'Identifica un momento donde actuaste como protagonista de tu salud: �qu� situaci�n, qu� acci�n tomaste y c�mo te sentiste?', respuesta_tipo: 'abierta' },
          { texto: 'Reconoce un segundo momento de transformaci�n: �qu� hiciste diferente esta vez?', respuesta_tipo: 'abierta' },
          { texto: 'Identifica un tercer momento: �qu� patr�n de cambio positivo empiezas a notar?', respuesta_tipo: 'abierta' }
        ],
        tipo: 'reflexion',
        respuesta_tipo: 'abierta',
        registro: {
          momento_1: { situacion: '', accion: '', sentimiento: '' },
          momento_2: { situacion: '', accion: '', sentimiento: '' },
          momento_3: { situacion: '', accion: '', sentimiento: '' }
        },
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
    cabecera: `Bloque 3: Autocontrol y Gestión Integral (Días 11-15)\n\nTema Central: "La Pausa Poderosa: Gestión vs. Represión"\n\nTransformación Clave: Este bloque transforma la teoría en disciplina consciente. El autocontrol no se limita a la comida, sino que abarca la gestión integral del estrés, sedentarismo y calidad del sueño, factores que impactan directamente en la salud cardiovascular y metabólica.\n\nA menudo confundimos el autocontrol con una "represión espartana" o una lucha agotadora contra nuestros deseos. Sin embargo, la verdadera Inteligencia Emocional nos enseña que el control nace de la capacidad de gestionar los impulsos y las emociones conflictivas, no de negarlas.\n\nEn este bloque, aprenderemos que el autocontrol es, en realidad, la habilidad de crear un espacio consciente entre el estímulo (un antojo, el estrés o la pereza) y nuestra respuesta. No se trata de prohibir, sino de elegir con libertad.\n\nAl integrar esta "Pausa Poderosa" en tu nutrición, en tu movimiento y en tu descanso, dejas de ser un pasajero de tus impulsos para convertirte en el conductor de tu bienestar.`,
    datos_leccion: {
      titulo: 'La Regla de los 5 Minutos (Mente y Cuerpo)',
      bloque: 'Autocontrol',
      concepto: 'Crear un espacio consciente entre el estímulo y la respuesta para evitar reacciones automáticas.',
      ejercicio: {
        nombre: 'Protocolo de Pausa Consciente',
        instruccion: 'Cuando sientas un antojo, urgencia de sedentarismo, o impulso de procrastinar, aplica este protocolo.',
        pasos: [
          { texto: 'DETECCIÓN: Reconoce el impulso automático', respuesta_tipo: 'accion' },
          { texto: 'CRONÓMETRO: Activa timer de 5 minutos exactos', respuesta_tipo: 'accion' },
          { texto: 'ACTIVIDAD OPUESTA: Si es antojo → bebe 500ml de agua. Si es sedentarismo → 10 estiramientos.', respuesta_tipo: 'accion' },
          { texto: 'EVALUACIÓN POST-PAUSA: Si el deseo persiste, actúa con conciencia plena.', respuesta_tipo: 'accion' }
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
          { texto: 'Suplementación estratégica (2 minutos)', respuesta_tipo: 'accion' },
          { texto: 'Caminata consciente (10 minutos)', respuesta_tipo: 'accion' },
          { texto: 'Hidratación mindful (3 minutos)', respuesta_tipo: 'accion' }
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
        nombre: 'Redise�o Estrat�gico del Ambiente',
        instruccion: 'Identifica saboteadores ambientales y reub�calos estrat�gicamente.',
        pasos: [
          { texto: 'Identifica un objeto o alimento en tu entorno que sabotea tus decisiones saludables', respuesta_tipo: 'accion' },
          { texto: 'Reubica ese elemento en un lugar menos accesible o visible', respuesta_tipo: 'accion' },
          { texto: 'Coloca un sustituto saludable en el lugar original para facilitar tu mejor elecci�n', respuesta_tipo: 'accion' }
        ],
        tipo: 'practica',
        respuesta_tipo: 'abierta',
        registro: {
          saboteador: { objeto: '', ubicacion_actual: '', frecuencia: '' },
          reubicacion: { nueva_ubicacion: '', tiempo_extra_acceso: '' },
          sustituto: { objeto_saludable: '', accion_que_promueve: '' }
        },
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
          { texto: 'Inhalación nasal: 4 segundos (expande abdomen)', respuesta_tipo: 'accion' },
          { texto: 'Retención: 6 segundos (sin tensión)', respuesta_tipo: 'accion' },
          { texto: 'Exhalación bucal: 8 segundos (activación parasimpática)', respuesta_tipo: 'accion' }
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
          { texto: 'ABLANDAR (30s): Localiza la tensión corporal, respira hacia esa zona, relaja conscientemente', respuesta_tipo: 'accion' },
          { texto: 'PERMITIR (60s): Observa pensamientos sin juzgarlos, describe la emoción, permite que exista como "nube pasajera"', respuesta_tipo: 'accion' },
          { texto: 'AMAR (30s): Coloca mano en corazón, repite "Puedo estar con esto ahora", ofrécete compasión', respuesta_tipo: 'accion' }
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
    cabecera: `Bloque 4: Motivación y Proactividad (Días 16-20)\n\nTema Central: "Encontrando el Motor Interno: Del 'Tengo que' al 'Quiero'"\n\nTransformación Definitiva: Este bloque consolida la transición de la motivación externa volátil hacia un motor interno sostenible. Basado en la neurociencia de la motivación intrínseca, desarrollarás la capacidad de mantener el compromiso con tu bienestar desde valores profundos, no desde presión externa.\n\nLa motivación basada únicamente en la estética o en la presión social es volátil y suele desvanecerse ante el primer obstáculo. Para lograr un cambio de paradigma real en tu salud, necesitamos anclar tus acciones en valores intrínsecos profundos.\n\nEn este bloque, dejaremos atrás el "tengo que adelgazar" para abrazar el "quiero vivir con energía". La automotivación no es esperar a tener ganas de cuidarte; es la proactividad de asumir la responsabilidad de hacer que las cosas sucedan.`,
    datos_leccion: {
      titulo: 'El Viaje al Futuro (Visualización Neuroplástica)',
      bloque: 'Motivación',
      concepto: 'La motivación intrínseca se fortalece cuando visualizamos los beneficios de una salud óptima a largo plazo.',
      ejercicio: {
        nombre: 'Técnica de Visualización Multisensorial',
        instruccion: 'Encuentra una posición cómoda y realiza esta visualización científica de 10-15 minutos.',
        pasos: [
          { texto: 'Proyección Temporal (5 min): Visualízate exactamente 10 años en el futuro en un lugar específico', respuesta_tipo: 'accion' },
          { texto: 'Experiencia Sensorial Completa (5 min): Siente la fuerza de tus latidos, profundidad respiratoria, agilidad muscular', respuesta_tipo: 'accion' },
          { texto: 'Conexión Emocional (3-5 min): Siente gratitud hacia tu "yo actual", orgullo por tus decisiones', respuesta_tipo: 'accion' }
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
          { texto: '¿Qué es lo más importante para ti en la vida? ¿Por qué es importante?', respuesta_tipo: 'abierta' },
          { texto: '¿Cómo se relaciona tu salud con proteger eso que valoras?', respuesta_tipo: 'abierta' },
          { texto: 'Completa: "Cuido mi salud integral porque quiero _________ para/con _________"', respuesta_tipo: 'abierta' },
          { texto: 'Escribe tu "porqué" en un post-it y pégalo en un lugar estratégico', respuesta_tipo: 'abierta' }
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
        nombre: 'Redise�o de Ecosistema Personal',
        instruccion: 'Identifica puntos de fricci�n y redise�a tu entorno para eliminar barreras.',
        pasos: [
          { texto: 'Crea tu estaci�n de bienestar matutina con suplementos organizados, agua y tu recordatorio visual del porqu�', respuesta_tipo: 'accion' },
          { texto: 'Dise�a un sistema de hidrataci�n autom�tica colocando tu botella de agua en un lugar visible y estrat�gico', respuesta_tipo: 'accion' },
          { texto: 'Prepara tu espacio para activar el movimiento sin fricci�n: deja ropa y zapatos listos', respuesta_tipo: 'accion' }
        ],
        tipo: 'practica',
        respuesta_tipo: 'abierta',
        registro: {
          estacion_bienestar: { ubicacion: '', elementos: '', ritual: '' },
          hidratacion_automatica: { estrategia: '', recordatorio: '', facilitador: '' },
          activacion_movimiento: { preparacion: '', ubicacion_zapatos: '', recordatorio_visual: '' }
        },
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
          { texto: 'Preparación Mindful: 3 respiraciones, intención "Voy a nutrir mi energía celular", gratitud', respuesta_tipo: 'accion' },
          { texto: 'Identificación Nutricional: identifica proteínas, carbohidratos complejos, grasas saludables', respuesta_tipo: 'accion' },
          { texto: 'Conexión Propósito-Nutrición: "Este [alimento] proporciona [nutriente] para que mi [sistema] pueda [función]"', respuesta_tipo: 'accion' }
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
          { texto: 'Revisión de Transformación: ¿cómo ha cambiado tu relación con tu cuerpo en 20 días?', respuesta_tipo: 'abierta' },
          { texto: 'Declaración de Compromiso: repite 3 veces "Elijo moverme, descansar y nutrirme porque quiero disfrutar de una vida plena"', respuesta_tipo: 'abierta' },
          { texto: 'Diseña tu protocolo personal futuro', respuesta_tipo: 'abierta' }
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
    cabecera: `Bloque 5: Empatía y Autocompasión\n\n"Autocompasión y Conexión con el Otro"\n\nTransformación Final: La empatía no solo se aplica a las personas, sino a aceptar que habrá días sin entrenamiento o noches de mal descanso. Lo importante es retomar con amor propio, no con castigo. Este bloque integra la neurociencia de la autocompasión con estrategias de conexión social y descanso reparador.\n\nEn el camino hacia una salud integral, la perfección es el enemigo de la constancia. La falta de autocompasión tras un error dietético o un día sin ejercicio suele conducir al "efecto de tirar la toalla", donde la culpa nos empuja a abandonar todo nuestro progreso.\n\nEn este bloque, aprenderemos que la empatía tiene una doble dirección: hacia los demás y, fundamentalmente, hacia uno mismo. Ser amable contigo cuando las cosas no salen según lo planeado es la herramienta más poderosa para retomar el rumbo con sabiduría en lugar de castigo.`,
    datos_leccion: {
      titulo: 'La Regla del Mejor Amigo (Neurociencia de la Autocompasión)',
      bloque: 'Empatía',
      concepto: 'La crítica interna feroz tras un fallo dispara el cortisol y sabotea el progreso.',
      ejercicio: {
        nombre: 'Protocolo de Autocompasión',
        instruccion: 'Cuando detectes autocrítica severa, aplica esta técnica.',
        pasos: [
          { texto: 'Identifica el diálogo interno destructivo: pensamiento, emoción y sensación física', respuesta_tipo: 'abierta' },
          { texto: 'Imagina que tu mejor amigo te confiesa el mismo fallo: ¿qué le dirías?', respuesta_tipo: 'abierta' },
          { texto: 'Lée en voz alta tu respuesta compasiva dirigiéndola hacia ti', respuesta_tipo: 'abierta' }
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
        nombre: 'Nota de Redirecci�n Consciente',
        instruccion: 'Cuando experimentes un desliz, aplica este protocolo de re-enfoque.',
        pasos: [
          { texto: 'Reconoce la situaci�n del desliz sin juzgarte: �qu� pas�, cu�ndo y c�mo respondiste?', respuesta_tipo: 'abierta' },
          { texto: 'Extrae un aprendizaje compasivo: �qu� te ense�a esta experiencia sobre ti?', respuesta_tipo: 'abierta' },
          { texto: 'Elige una acci�n concreta de autocuidado como pr�ximo paso para retomar tu rumbo', respuesta_tipo: 'accion' },
          { texto: 'Firma un compromiso de autocompasi�n para recordarte que un desliz no define tu camino', respuesta_tipo: 'accion' }
        ],
        tipo: 'reflexion',
        respuesta_tipo: 'abierta',
        registro: {
          fecha: '',
          situacion: '',
          mi_respuesta: '',
          dato_que_ensenia: '',
          proxima_accion_autocuidado: '',
          razon_eleccion: '',
          firma_autocompasion: ''
        },
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
          { texto: 'Conexión Física (2 min): mano derecha sobre el corazón, mano izquierda sobre abdomen, siente el ritmo cardíaco', respuesta_tipo: 'accion' },
          { texto: 'Gratitud Específica (3 min): agradece a tu corazón por latir sin que lo recuerdes', respuesta_tipo: 'accion' },
          { texto: 'Compromiso de Cuidado (2 min): "Cuidar mi corazón con Cardiosmile es un acto de amor propio"', respuesta_tipo: 'accion' }
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
          { texto: 'Pausa Fisiológica (30s): 3 ciclos de respiración 4-6-8, afloja hombros y mandíbula', respuesta_tipo: 'accion' },
          { texto: 'Reencuadre Empático (30s): "Esta persona también está lidiando con sus propias cargas"', respuesta_tipo: 'accion' },
          { texto: 'Respuesta Consciente: elige desde la calma: respuesta empática, pausa para procesar, o límites saludables', respuesta_tipo: 'accion' }
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
        nombre: 'Auditor�a de Se�ales de Agotamiento',
        instruccion: 'Eval�a tu nivel de agotamiento y aplica el protocolo correspondiente.',
        pasos: [
          { texto: 'Eval�a tu nivel de fatiga f�sica hoy', respuesta_tipo: 'escala', min: 1, max: 10 },
          { texto: 'Eval�a tu nivel de niebla mental', respuesta_tipo: 'escala', min: 1, max: 10 },
          { texto: 'Eval�a tu nivel de irritabilidad emocional', respuesta_tipo: 'escala', min: 1, max: 10 },
          { texto: 'Eval�a tu nivel de motivaci�n reducida', respuesta_tipo: 'escala', min: 1, max: 10 },
          { texto: 'Suma tus puntuaciones totales y aplica el protocolo de descanso correspondiente', respuesta_tipo: 'accion' }
        ],
        tipo: 'registro',
        respuesta_tipo: 'escala',
        registro: {
          fatiga_fisica: '___/10',
          niebla_mental: '___/10',
          irritabilidad_emocional: '___/10',
          motivacion_reducida: '___/10',
          total: '___/40',
          interpretacion: '',
          protocolo_elegido: ''
        },
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
    cabecera: `Bloque 6: Competencia Social y Asertividad\n\n"Navegando el Entorno Social: Límites y Celebración"\n\nTransformación Social Definitiva: Aquí es donde demuestras que tu cambio es sólido, aprendiendo a convivir en entornos sociales (fiestas, cenas familiares, reuniones de trabajo) sin que el entorno sabotee tu salud cardiovascular, nutrición o bienestar mental. La competencia social es la habilidad de mantener tu estilo de vida saludable frente a la presión de grupo sin aislarte.\n\nA menudo, el entorno social se convierte en el mayor saboteador de nuestros hábitos saludables. Sin embargo, la verdadera salud integral no consiste en aislarse para "cumplir", sino en desarrollar las habilidades sociales necesarias para disfrutar de la vida sin descuidar tu bienestar.\n\nEn estos últimos 5 días, aprenderemos que puedes socializar, celebrar y compartir con los demás manteniendo tus límites con asertividad y sin rastro de culpa.`,
    datos_leccion: {
      titulo: 'El Guion de la Asertividad Saludable (Neurociencia Social)',
      bloque: 'Competencia Social',
      concepto: 'La competencia social es la habilidad de mantener el estilo de vida saludable frente a la presión de grupo sin aislarse.',
      ejercicio: {
        nombre: 'Protocolo de Asertividad Neurológica',
        instruccion: 'Identifica escenarios sociales desafiantes y prepara guiones asertivos.',
        pasos: [
          { texto: 'Identifica 3 situaciones sociales próximas con posible presión', respuesta_tipo: 'accion' },
          { texto: 'Desarrolla guiones con la fórmula: [Reconocimiento] + [Límite claro] + [Alternativa positiva]', respuesta_tipo: 'accion' },
          { texto: 'Practica: "Se ve delicioso, pero estoy satisfecho/a. Gracias por pensar en mí"', respuesta_tipo: 'accion' }
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
        instruccion: 'Prepara estrat�gicamente tu cuerpo y mente antes de eventos sociales.',
        pasos: [
          { texto: 'Pre-carga nutricional: consume comida equilibrada + hidrataci�n + suplementaci�n 2-3 horas antes del evento', respuesta_tipo: 'accion' },
          { texto: 'Pre-carga mental: revisa tus guiones asertivos, visualiza el evento con confianza y conecta con tu porqu�', respuesta_tipo: 'accion' },
          { texto: 'Pre-carga emocional: realiza 5 ciclos de respiraci�n 4-6-8 y repite tu afirmaci�n de bienestar', respuesta_tipo: 'accion' },
          { texto: 'Prepara tu kit de emergencia social: agua, L-Teanina, snack saludable y recordatorio visual', respuesta_tipo: 'accion' }
        ],
        tipo: 'practica',
        respuesta_tipo: 'abierta',
        registro: {
          pre_carga_nutricional: { comida: '', hidratacion: '', suplementacion: '' },
          pre_carga_mental: { guiones_revisados: '', visualizacion: '', conexion_proposito: '' },
          pre_carga_emocional: { respiracion_reguladora: '', afirmacion: '', intencion: '' },
          kit_emergencia_social: ['botella_agua', 'L-Teanina', 'snack_saludable', 'recordatorio_visual']
        },
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
          { texto: 'Intención clara: "Voy a enfocarme en conocer genuinamente a las personas"', respuesta_tipo: 'accion' },
          { texto: 'Escucha activa: mantén contacto visual, haz preguntas genuinas', respuesta_tipo: 'accion' },
          { texto: 'Redirección social: si la conversación se centra en comida, transiciona a temas personales', respuesta_tipo: 'accion' }
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
          { texto: 'Identifica personas que consistentemente presionan contra tus decisiones saludables', respuesta_tipo: 'abierta' },
          { texto: 'Desarrolla límites con la fórmula: [Reconocimiento] + [Límite claro] + [Conexión con valores futuros]', respuesta_tipo: 'abierta' },
          { texto: 'Visualiza cada escenario: imagina mantener tu postura con confianza', respuesta_tipo: 'abierta' }
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
          { texto: 'Revisa cada bloque: ¿cuál fue tu mayor victoria en cada competencia?', respuesta_tipo: 'abierta' },
          { texto: 'Diseña tu protocolo personal de mantenimiento con suplementación y prácticas no-negociables', respuesta_tipo: 'abierta' },
          { texto: 'Escribe una carta compromiso a tu futuro yo', respuesta_tipo: 'abierta' }
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
  { numero: 23, competencia: 'motivacion',        texto: 'Soy capaz de seguir adelante en un proyecto importante a pesar de los obstáculos.' },
  { numero: 24, competencia: 'competencia_social',texto: 'Los demás me respetan y les caigo bien, incluso cuando no están de acuerdo conmigo.' },
  { numero: 25, competencia: 'autoconciencia',    texto: 'Tengo muy claro cuáles son mis propias metas y valores.' },
  { numero: 26, competencia: 'autoconfianza',     texto: 'Expreso mis puntos de vista con honestidad y ponderación, sin agobiar.' },
  { numero: 27, competencia: 'autocontrol',       texto: 'Puedo controlar mis estados de ánimo y muy raras veces llevo las emociones negativas al trabajo.' },
  { numero: 28, competencia: 'empatia',           texto: 'Centro toda mi atención en la otra persona cuando estoy escuchándolo.' },
  { numero: 29, competencia: 'motivacion',        texto: 'Creo que el trabajo que hago cada día tiene sentido y aporta valor a la sociedad.' },
  { numero: 30, competencia: 'competencia_social',texto: 'Puedo persuadir eficazmente a otros para que adopten mi punto de vista sin coaccionarles.' }
];

// ---------------------------------------------------------------------------
// Contenidos especiales: bienvenida, presentación, reflexión 15 y 30 días
// ---------------------------------------------------------------------------
const CONTENIDOS_ESPECIALES = [
  {
    tipo: 'bienvenida',
    titulo: 'Bienvenido al Programa IEN',
    contenido: {
      programa: {
        nombre: 'Cuidamos de tu mente y de tu corazón',
        subtitulo: '30 días de Inteligencia Emocional con Cardiosmile y Vitamin Shoppe'
      },
      introduccion: 'En solo 30 días, puedes transformar completamente tu relación contigo mismo y con el mundo que te rodea. No se trata de cambios superficiales o promesas vacías; se trata de una revolución interna respaldada por la ciencia y diseñada para durar toda la vida.',
      viaje_transformacion: {
        titulo: 'Tu Viaje de Transformación',
        intro: 'Imagínate dentro de 30 días:',
        puntos: [
          'Despertando cada mañana con claridad mental y energía auténtica',
          'Navegando cualquier situación social con confianza y asertividad',
          'Tomando decisiones desde tus valores más profundos, no desde impulsos',
          'Siendo tu mejor aliado en lugar de tu peor crítico',
          'Manteniendo tu bienestar sin sacrificar conexiones genuinas'
        ]
      },
      competencias_maestras: {
        titulo: 'Más que un Programa: Una Nueva Forma de Vivir',
        descripcion: 'Este no es otro programa de bienestar temporal. Es el desarrollo de seis competencias maestras de la inteligencia emocional que transformarán cada área de tu vida:',
        cita: 'No se trata de ser perfecto; se trata de ser consciente, confiado, controlado, motivado, empático y socialmente competente.',
        nota: 'Cada día construye sobre el anterior. Cada técnica se integra naturalmente en tu vida. Cada suplemento tiene un propósito específico respaldado por ciencia. Cada ejercicio te acerca a la versión más auténtica y poderosa de ti mismo.'
      },
      momento_es_ahora: {
        titulo: 'Tu Momento es Ahora',
        descripcion: 'En un mundo que constantemente te invita a buscar soluciones externas, tienes la oportunidad de elegir el camino más revolucionario: entrenar tu inteligencia emocional',
        frases_impacto: [
          '30 días para transformar 30 años de patrones automáticos',
          '30 días para construir la confianza que siempre has deseado',
          '30 días para convertirte en el protagonista de tu propia historia'
        ],
        pregunta: '¿Estás listo para descubrir quién puedes llegar a ser?'
      },
      cierre: 'Tu transformación integral comienza con una sola decisión: elegir invertir en ti mismo. Bienvenido a tu nueva vida. Bienvenido a tu verdadero poder.',
      cita_final: 'El momento en que decides transformarte es el momento en que todo cambia. No esperes el momento perfecto; crélalo.'
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
      titulo: 'El Viaje de 15 Días hacia la Transformación Integral',
      progresion_consciente: {
        texto: 'Al completar la mitad de este programa, has emprendido un viaje extraordinario que va mucho más allá de simples cambios en la dieta o rutinas de ejercicio. Has desarrollado las tres competencias fundamentales que distinguen a las personas que logran transformaciones duraderas.',
        cita: 'La verdadera transformación no ocurre cuando cambias lo que haces, sino cuando cambias quién eres.'
      },
      evolucion_etapas: [
        {
          titulo: 'Días 1-5: Del Piloto Automático al Observador Consciente',
          texto: 'Has aprendido a reconocer tus señales internas antes de que se conviertan en acciones automáticas. Esta autoconciencia es el fundamento sobre el cual se construye toda transformación auténtica.'
        },
        {
          titulo: 'Días 6-10: De la Víctima al Protagonista de tu Historia',
          texto: 'Has reescrito tu narrativa interna, transformando etiquetas limitantes en identidades empoderadas. Los micro-compromisos cumplidos han demostrado a tu cerebro que eres capaz de mantener promesas contigo mismo.'
        },
        {
          titulo: 'Días 11-15: Del Impulso al Dominio Consciente',
          texto: 'Has desarrollado la capacidad más sofisticada del ser humano: el autocontrol inteligente. Has aprendido a navegar la incomodidad emocional sin recurrir a mecanismos de escape.'
        }
      ],
      ciencia_transformacion: [
        'Tu corteza prefrontal se ha fortalecido a través de la práctica repetida del autocontrol',
        'Tus ritmos circadianos se han estabilizado mediante rutinas consistentes',
        'Tu sistema nervioso ha aprendido a alternar eficientemente entre activación y relajación',
        'Tu identidad neurológica se ha reorganizado a través de la neuroplasticidad dirigida'
      ],
      agradecimiento: {
        titulo: 'Un Agradecimiento Especial',
        puntos: [
          'A tu valentía por comprometerte con este proceso cuando hubiera sido más fácil seguir en piloto automático.',
          'A tu constancia por elegir la práctica diaria incluso en días difíciles.',
          'A tu apertura por permitir que la ciencia y la sabiduría se encuentren en tu experiencia personal.'
        ]
      },
      cita_final: 'No se trata de ser perfecto; se trata de ser consciente. No se trata de no caer nunca; se trata de levantarse con sabiduría.',
      firma: 'Lic. Gladys C. Patiño - Nutricionista Funcional. Int Emocional en Nut y Salud. Nut y Salud Mental. Neurociencias'
    }
  },
  {
    tipo: 'reflexion_30_dias',
    titulo: 'Reflexión de Cierre del Programa (Día 30)',
    contenido: {
      titulo: 'La Transformación de 30 Días: El Viaje Completo',
      cita_apertura: 'La verdadera transformación no es solo cambiar lo que haces en privado, sino mantener esos cambios con gracia y confianza en cualquier entorno social.',
      evolucion_dimensiones: [
        { dias: '1-5', competencia: 'AUTOCONCIENCIA', transformacion: 'Del piloto automático a la elección consciente', resultado: 'Capacidad de reconocer señales internas antes de actuar' },
        { dias: '6-10', competencia: 'AUTOCONFIANZA', transformacion: 'De "no puedo" a "elijo conscientemente"', resultado: 'Identidad empoderada basada en evidencia de capacidad' },
        { dias: '11-15', competencia: 'AUTOCONTROL', transformacion: 'Del impulso al dominio consciente', resultado: 'Gestión inteligente de emociones y estímulos' },
        { dias: '16-20', competencia: 'MOTIVACIÓN', transformacion: 'De "tengo que" a "quiero vivir plenamente"', resultado: 'Motivación intrínseca alineada con valores profundos' },
        { dias: '21-25', competencia: 'EMPATÍA INTEGRAL', transformacion: 'De autocrítica destructiva a autocompasión nutritiva', resultado: 'Capacidad de ser tu mejor aliado y conectar empáticamente' },
        { dias: '26-30', competencia: 'COMPETENCIA SOCIAL', transformacion: 'De aislamiento o capitulación a asertividad empática', resultado: 'Habilidad de mantener tu bienestar conectando auténticamente' }
      ],
      ciencia_transformacion: {
        cambios_neurologicos: [
          'Corteza prefrontal fortalecida: Mayor capacidad de planificación y autocontrol social',
          'Circuitos de asertividad activados: Comunicación clara sin agresividad ni pasividad',
          'Redes de empatía social optimizadas: Mejor regulación emocional en interacciones complejas'
        ],
        optimizacion_bioquimica: [
          'Regulación del cortisol social: Mejor respuesta al estrés interpersonal',
          'Liberación de oxitocina por conexión: Mejora en vínculos sociales y salud cardiovascular',
          'Estabilización de neurotransmisores: Estado de ánimo equilibrado en entornos sociales'
        ]
      },
      sistema_operativo_social: {
        titulo: 'Tu Nuevo Sistema Operativo Social Integral',
        ciclo: [
          { paso: 'RECONOCE', descripcion: 'Identifica presión social o conflicto interpersonal', competencia_base: 'Autoconciencia' },
          { paso: 'CENTRA', descripcion: 'Conecta con tu respiración y valores', competencia_base: 'Autoconfianza' },
          { paso: 'EVALÚA', descripcion: 'Considera opciones desde tu identidad empoderada', competencia_base: 'Autocontrol' },
          { paso: 'COMUNICA', descripcion: 'Expresa límites o necesidades con asertividad empática', competencia_base: 'Competencia Social' },
          { paso: 'MANTIENE', descripcion: 'Sostiene tu posición desde amor propio', competencia_base: 'Empatía Integral' },
          { paso: 'CONECTA', descripcion: 'Busca puntos de conexión auténtica', competencia_base: 'Automotivación' }
        ]
      },
      legado: 'Es posible ser auténtico en cualquier entorno. Es posible cuidarse sin aislarse. Es posible conectar genuinamente sin comprometer tu bienestar.',
      compromiso_sagrado: 'Prometo honrar mi autenticidad en cualquier entorno social. Prometo comunicar mis límites con claridad y compasión. Prometo buscar conexión genuina, no aprobación superficial. Prometo recordar que mi bienestar es un regalo que ofrezco al mundo, no un lujo que debo sacrificar.',
      firma: 'Lic. Gladys C. Patiño - Nutricionista Funcional. Int Emocional en Nut y Salud. Nut y Salud Mental. Neurociencias'
    }
  }
];

// ---------------------------------------------------------------------------
// Función principal
// ---------------------------------------------------------------------------
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado a MongoDB');

  await Promise.all([
    Tienda.deleteMany({}),
    Usuario.deleteMany({}),
    ContenidoDiario.deleteMany({}),
    TestPregunta.deleteMany({}),
    ContenidoEspecial.deleteMany({}),
    Producto.deleteMany({}),
    Codigo.deleteMany({}),
    PlanProgreso.deleteMany({}),
    HistorialCorreo.deleteMany({})
  ]);
  console.log('Colecciones limpiadas');

  // 1. Tiendas
  const tiendas = await Tienda.insertMany([
    { nombre_tienda: 'CardioSmille', ciudad: 'Asunción, Paraguay' },
    { nombre_tienda: 'The Vitamin Shoppe', ciudad: 'Asunción, Paraguay' },
    { nombre_tienda: 'Lic. Gladys', ciudad: 'Asunción, Paraguay' }
  ]);
  console.log(`${tiendas.length} tiendas creadas`);
  const tCardio = tiendas[0];
  const tVitamin = tiendas[1];
  const tGladys = tiendas[2];

  // 2. Productos
  const productos = await Producto.insertMany([
    {
      nombre: 'Programa 30 días Cardiosmile',
      descripcion: 'Plan cardiovascular completo',
      tiendas: [tCardio._id, tVitamin._id, tGladys._id]
    },
    {
      nombre: 'Programa Especial Ashwagandha',
      descripcion: 'Plan de autogestión y reducción de estrés',
      tiendas: [tCardio._id, tVitamin._id]
    }
  ]);
  console.log(`${productos.length} productos creados`);
  const prodCardio = productos[0];
  const prodAshwa = productos[1];

  // 3. Códigos
  const codigos = await Codigo.insertMany([
    { codigo: 'IEN-001', producto_id: prodCardio._id, tienda_id: tCardio._id, activo: true },
    { codigo: 'IEN-002', producto_id: prodCardio._id, tienda_id: tVitamin._id, activo: true },
    { codigo: 'IEN-003', producto_id: prodCardio._id, tienda_id: tGladys._id, activo: true },
    { codigo: 'IEN-004', producto_id: prodAshwa._id, tienda_id: tCardio._id, activo: true },
    { codigo: 'IEN-005', producto_id: prodAshwa._id, tienda_id: tVitamin._id, activo: true }
  ]);
  console.log(`${codigos.length} códigos de activación creados`);

  // 4. Usuarios Administradores
  const password_hash = await bcrypt.hash('admin123', 10);

  await Usuario.create({
    nombre: 'Admin General',
    email: 'admin@ien.test',
    password_hash,
    rol: 'admin_general'
  });
  console.log('Admin General creado: admin@ien.test / admin123');

  await Usuario.create({
    nombre: 'Admin Negocio Cardio-Vitamin',
    email: 'admin_negocio@ien.test',
    password_hash,
    rol: 'admin_negocio',
    tiendas_administradas: [tCardio._id, tVitamin._id]
  });
  console.log('Admin Negocio creado: admin_negocio@ien.test / admin123');

  await Usuario.create({
    nombre: 'Moderador CardioSmille',
    email: 'moderador@ien.test',
    password_hash,
    rol: 'moderador_tienda',
    tienda_moderada: tCardio._id
  });
  console.log('Moderador Tienda creado: moderador@ien.test / admin123');

  // 5. Usuarios regulares (12 usuarios paraguayos con distribución variada de progreso)
  const userPassword = await bcrypt.hash('demo123', 10);

  const usuariosDemo = [
    { nombre: 'Liz Román',      email: 'liz.roman@demo.com',      tienda: tCardio,  producto: prodCardio, codigo: 'IEN-001' },
    { nombre: 'Carlos Benítez', email: 'carlos.benitez@demo.com', tienda: tVitamin, producto: prodCardio, codigo: 'IEN-002' },
    { nombre: 'María Ferreira', email: 'maria.ferreira@demo.com', tienda: tGladys,  producto: prodCardio, codigo: 'IEN-003' },
    { nombre: 'Juan Rojas',     email: 'juan.rojas@demo.com',     tienda: tCardio,  producto: prodAshwa,  codigo: 'IEN-004' },
    { nombre: 'Ana López',      email: 'ana.lopez@demo.com',      tienda: tVitamin, producto: prodAshwa,  codigo: 'IEN-005' },
    { nombre: 'Pedro Martínez', email: 'pedro.martinez@demo.com',  tienda: tGladys,  producto: prodCardio, codigo: 'IEN-003' },
    { nombre: 'Lucía González', email: 'lucia.gonzalez@demo.com',  tienda: tCardio,  producto: prodCardio, codigo: 'IEN-001' },
    { nombre: 'Diego Agüero',   email: 'diego.aguero@demo.com',   tienda: tVitamin, producto: prodAshwa,  codigo: 'IEN-005' },
    { nombre: 'Carla Duarte',   email: 'carla.duarte@demo.com',   tienda: tGladys,  producto: prodCardio, codigo: 'IEN-003' },
    { nombre: 'José Riveros',   email: 'jose.riveros@demo.com',   tienda: tCardio,  producto: prodAshwa,  codigo: 'IEN-004' },
    { nombre: 'Natalia Ruiz',   email: 'natalia.ruiz@demo.com',   tienda: tVitamin, producto: prodCardio, codigo: 'IEN-002' },
    { nombre: 'Ricardo Vera',   email: 'ricardo.vera@demo.com',   tienda: tGladys,  producto: prodAshwa,  codigo: 'IEN-005' },
    { nombre: 'Sofía Cáceres',  email: 'sofia.caceres@demo.com',  tienda: tCardio,  producto: prodCardio, codigo: 'IEN-001' },
    { nombre: 'Miguel Ayala',   email: 'miguel.ayala@demo.com',   tienda: tVitamin, producto: prodAshwa,  codigo: 'IEN-002' },
    { nombre: 'Raquel Insfrán', email: 'raquel.insfran@demo.com', tienda: tGladys,  producto: prodCardio, codigo: 'IEN-003' }
  ];

  const usuariosCreados = [];
  const createdDates = [];

  const today = new Date('2026-07-20');
  for (let i = 0; i < usuariosDemo.length; i++) {
    const u = usuariosDemo[i];
    const fechaReg = new Date('2026-07-20');
    fechaReg.setDate(fechaReg.getDate() - (14 - i));
    createdDates.push(fechaReg);

    const usuario = await Usuario.create({
      nombre: u.nombre,
      email: u.email,
      password_hash: userPassword,
      rol: 'usuario',
      tienda_id: u.tienda._id,
      producto_id: u.producto._id,
      codigo_activacion: u.codigo,
      fecha_registro: fechaReg
    });
    usuariosCreados.push(usuario);
    console.log(`Usuario creado: ${u.email} / demo123`);
  }

  // 6. Planes de Progreso (distribución variada)
  const COMPETENCIA_KEYS = ['autoconciencia', 'autoconfianza', 'autocontrol', 'empatia', 'motivacion', 'competencia_social'];

  const planesConfig = [
    { idx: 0,  dia_actual: 4,  fecha_inicio: '2026-07-17', estado: 'activo',     racha_max: 4,  hitos: [], ultima_fecha: '2026-07-20' },
    { idx: 1,  dia_actual: 5,  fecha_inicio: '2026-07-16', estado: 'activo',     racha_max: 5,  hitos: [5], ultima_fecha: '2026-07-19' },
    { idx: 2,  dia_actual: 10, fecha_inicio: '2026-07-11', estado: 'activo',     racha_max: 8,  hitos: [5, 10], ultima_fecha: '2026-07-18' },
    { idx: 3,  dia_actual: 12, fecha_inicio: '2026-07-09', estado: 'activo',     racha_max: 10, hitos: [5, 10], ultima_fecha: '2026-07-17' },
    { idx: 4,  dia_actual: 16, fecha_inicio: '2026-07-05', estado: 'activo',     racha_max: 12, hitos: [5, 10, 15], ultima_fecha: '2026-07-16' },
    { idx: 5,  dia_actual: 18, fecha_inicio: '2026-07-03', estado: 'activo',     racha_max: 14, hitos: [5, 10, 15], ultima_fecha: '2026-07-15' },
    { idx: 6,  dia_actual: 23, fecha_inicio: '2026-06-28', estado: 'activo',     racha_max: 16, hitos: [5, 10, 15, 20], ultima_fecha: '2026-07-14' },
    { idx: 7,  dia_actual: 25, fecha_inicio: '2026-06-26', estado: 'activo',     racha_max: 18, hitos: [5, 10, 15, 20, 25], ultima_fecha: '2026-07-20' },
    { idx: 8,  dia_actual: 28, fecha_inicio: '2026-06-23', estado: 'activo',     racha_max: 20, hitos: [5, 10, 15, 20, 25], ultima_fecha: '2026-07-19' },
    { idx: 9,  dia_actual: 29, fecha_inicio: '2026-06-22', estado: 'activo',     racha_max: 22, hitos: [5, 10, 15, 20, 25], ultima_fecha: '2026-07-18' },
    { idx: 10, dia_actual: 30, fecha_inicio: '2026-06-21', estado: 'completado', racha_max: 24, hitos: [5, 10, 15, 20, 25, 30], ultima_fecha: '2026-07-17' },
    { idx: 11, dia_actual: 30, fecha_inicio: '2026-06-21', estado: 'completado', racha_max: 26, hitos: [5, 10, 15, 20, 25, 30], ultima_fecha: '2026-07-16' },
    { idx: 12, dia_actual: 2,  fecha_inicio: '2026-07-19', estado: 'activo',     racha_max: 2,  hitos: [], ultima_fecha: '2026-07-20' },
    { idx: 13, dia_actual: 1,  fecha_inicio: '2026-07-20', estado: 'activo',     racha_max: 1,  hitos: [], ultima_fecha: '2026-07-20' },
    { idx: 14, dia_actual: 3,  fecha_inicio: '2026-07-18', estado: 'activo',     racha_max: 3,  hitos: [], ultima_fecha: '2026-07-20' }
  ];

  function diaFecha(dia, fechaInicioStr) {
    const d = new Date(fechaInicioStr);
    d.setDate(d.getDate() + dia - 1);
    return d;
  }

  function generarRespuesta(dia, userIdx, diaActual) {
    const nivel = diaActual >= 25 ? 'avanzado' : diaActual >= 15 ? 'intermedio' : 'principiante';
    const nombres = ['Liz', 'Carlos', 'María', 'Juan', 'Ana', 'Pedro', 'Lucía', 'Diego', 'Carla', 'José', 'Natalia', 'Ricardo', 'Sofía', 'Miguel', 'Raquel'];
    const n = nombres[userIdx % nombres.length];
    const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Tipos de cada paso por día (mismo mapping que mapContenidoALeccion en plan.service.js)
    // respuesta_tipo → tipo: escala→escala, accion→accion, demás→texto
    const tiposPorDia = {
      1:  ['escala','texto','texto','texto'],
      2:  ['escala','escala','escala'],
      3:  ['accion','accion','accion'],
      4:  ['accion','accion','accion','accion','accion'],
      5:  ['texto','texto','texto','texto'],
      6:  ['texto','texto','texto'],
      7:  ['accion','accion','accion','accion'],
      8:  ['texto','texto','texto','texto','texto'],
      9:  ['accion','accion','accion'],
      10: ['texto','texto','texto'],
      11: ['accion','accion','accion','accion'],
      12: ['accion','accion','accion'],
      13: ['accion','accion','accion'],
      14: ['accion','accion','accion'],
      15: ['accion','accion','accion'],
      16: ['accion','accion','accion'],
      17: ['texto','texto','texto','texto'],
      18: ['accion','accion','accion'],
      19: ['accion','accion','accion'],
      20: ['texto','texto','texto'],
      21: ['texto','texto','texto'],
      22: ['texto','texto','accion','accion'],
      23: ['accion','accion','accion'],
      24: ['accion','accion','accion'],
      25: ['escala','escala','escala','escala','accion'],
      26: ['accion','accion','accion'],
      27: ['accion','accion','accion','accion'],
      28: ['accion','accion','accion'],
      29: ['texto','texto','texto'],
      30: ['texto','texto','texto']
    };

    // Valores crudos por día
    const raw = {
      1:  [rnd(5,9), 'Sentí tensión moderada en hombros al despertar', 'Ligereza en piernas, cierta pesadez mental por el calor', 'Respiración algo superficial, mejoró tras unos minutos'],
      2:  [rnd(3,7), rnd(4,8), rnd(3,6)],
      3:  [true, true, true],
      4:  [true, true, true, true, true],
      5:  ['Generalmente entre 8 y 10 AM, antes del calor fuerte', 'Después del almuerzo, entre 2-4 PM cuando baja la energía', 'Ansiedad cuando hay presión laboral, y aburrimiento en la tarde', 'Energía más alta por la mañana (7-8/10), baja al mediodía'],
      6:  ['"No tengo disciplina para mantener una rutina"', 'La taché y escribí al lado mi nueva identidad', '"Soy una persona que elige cuidar su energía y salud cada día, incluso empezando con pasos pequeños"'],
      7:  [true, true, true, true],
      8:  ['Sí, noté menos fatiga al subir las escaleras del trabajo', 'Un poco más de concentración, aunque todavía me distraigo', 'Los brazos y piernas se sienten un poco más tonificados', 'Dormí mejor esta semana, me desperté más renovado', 'Más optimista, siento que estoy avanzando'],
      9:  [true, true, true],
      10: ['En la cena familiar del sábado, elegí una porción consciente y me sentí orgulloso al servirme lo justo', 'En el trabajo rechacé amablemente el postre de cumpleaños sin sentir culpa, fue liberador', 'Que estoy aprendiendo a decir "no" sin dureza y "sí" con gratitud'],
      11: [true, true, true, true],
      12: [true, true, true],
      13: [true, true, true],
      14: [true, true, true],
      15: [true, true, true],
      16: [true, true, true],
      17: ['Mi familia y mi salud, porque sin salud no puedo disfrutar de los míos', 'Cuidarme me permite estar presente y activo para mis hijos y nietos', 'quiero vivir con energía plena para disfrutar de mi familia y mis proyectos', 'Lo pegué en el espejo del baño, lo veo cada mañana'],
      18: [true, true, true],
      19: [true, true, true],
      20: ['Noto más energía, menos antojos compulsivos y más confianza al decidir', 'Repetí la declaración en voz alta frente al espejo, me emocionó', 'Mantendré Ashwagandha en la mañana, Cardiosmile después del almuerzo, y caminata consciente cada tarde'],
      21: ['"Otra vez fallé, no tengo voluntad para esto"', 'Te diría que un tropezón no borra el camino, que sos humano y que cada día es una nueva oportunidad', 'Me dije: ' + n + ', un día difícil no define tu proceso; mañana retomás con amor y paciencia'],
      22: ['Ayer comí de más en el almuerzo familiar, me sentí culpable y casi abandono', 'Que no necesito castigarme; puedo reconocerlo, aprender y seguir sin culpa', true, true],
      23: [true, true, true],
      24: [true, true, true],
      25: [rnd(2,6), rnd(1,5), rnd(1,5), rnd(2,5), true],
      26: [true, true, true],
      27: [true, true, true, true],
      28: [true, true, true],
      29: ['Mi compañero de oficina siempre ofrece facturas y dice que "uno no hace nada"', '"Gracias por pensar en mí, pero estoy cuidando mi salud y me hace bien. Acompañame con un café sin culpa."', 'Me visualicé firme pero amable, y después en la práctica real salió natural'],
      30: ['Autoconciencia: aprendí a escuchar mi cuerpo antes de comer. Motivación: mi porqué es mi familia', 'Ashwagandha mañana, Cardiosmile almuerzo, Omega-3 cena, caminata diaria, gratitud antes de dormir', 'Querido yo del futuro: hoy elegiste cuidarte. Nunca olvides que merecés salud y bienestar pleno. Seguí eligiéndote.']
    };

    const indices = tiposPorDia[dia] || [];
    const valores = raw[dia] || [];
    const result = [];

    for (let i = 0; i < indices.length; i++) {
      const tipo = indices[i];
      let valor = valores[i];

      if (tipo === 'escala' && typeof valor === 'number') {
        if (dia === 1 && nivel === 'principiante') valor = rnd(3, 6);
        if (dia === 5 && nivel === 'avanzado') {
          if (typeof raw[5][0] === 'number') raw[5][0] = rnd(7, 9);
          valor = i === 0 ? rnd(7, 9) : raw[5][i] || valor;
        }
      }

      result.push({ id: 'paso_' + (i + 1), valor, tipo });
    }

    return result;
  }

  for (const cfg of planesConfig) {
    const usuario = usuariosCreados[cfg.idx];
    const userDemo = usuariosDemo[cfg.idx];
    const fechaInicio = new Date(cfg.fecha_inicio);

    const progresoDiario = [];
    for (let d = 1; d <= 30; d++) {
      const completado = d <= cfg.dia_actual;
      progresoDiario.push({
        dia_numero: d,
        completado,
        fecha_completado: completado ? diaFecha(d, cfg.fecha_inicio) : null,
        respuesta_usuario: completado ? generarRespuesta(d, cfg.idx, cfg.dia_actual) : null
      });
    }

    // Generar puntuaciones de test_inicial (5 preguntas por competencia, score 1-5)
    const testRespuestas = [];
    let preguntaNum = 0;
    const puntuacionesPorCompetencia = [];

    for (const comp of COMPETENCIA_KEYS) {
      let sumScore = 0;
      for (let r = 0; r < 5; r++) {
        preguntaNum++;
        const score = 2 + Math.floor(Math.random() * 4);
        sumScore += score;
        testRespuestas.push({
          pregunta_numero: preguntaNum,
          competencia: comp,
          score
        });
      }
      puntuacionesPorCompetencia.push({
        competencia: comp,
        competencia_label: COMPETENCIA_LABELS[comp],
        puntuacion: sumScore
      });
    }

    const competenciasMejora = puntuacionesPorCompetencia
      .filter(p => p.puntuacion < 20)
      .map(p => p.competencia_label);

    const rachaDias = Math.min(cfg.racha_max, cfg.dia_actual);
    const ultima = cfg.ultima_fecha ? new Date(cfg.ultima_fecha) : diaFecha(cfg.dia_actual, cfg.fecha_inicio);
    if (ultima > today) ultima.setTime(today.getTime());

    await PlanProgreso.create({
      usuario_id: usuario._id,
      tienda_id: userDemo.tienda._id,
      codigo_utilizado: userDemo.codigo,
      fecha_inicio: fechaInicio,
      dia_actual: cfg.dia_actual,
      racha_dias: rachaDias,
      racha_maxima: cfg.racha_max,
      hitos_alcanzados: cfg.hitos,
      ultima_fecha_actividad: ultima > today ? today : ultima,
      estado: cfg.estado,
      test_inicial: {
        fecha_completado: diaFecha(1, cfg.fecha_inicio),
        respuestas: testRespuestas,
        puntuaciones_por_competencia: puntuacionesPorCompetencia,
        competencias_a_mejorar: competenciasMejora
      },
      progreso_diario: progresoDiario
    });
    console.log(`PlanProgreso creado para ${usuario.nombre} (día ${cfg.dia_actual}, ${cfg.estado})`);
  }

  // 7. Historial de Correos
  const historialData = [];

  for (let i = 0; i < usuariosCreados.length; i++) {
    const u = usuariosCreados[i];
    const cfg = planesConfig[i];

    historialData.push({
      usuario_id: u._id,
      email_destino: u.email,
      tipo_correo: 'bienvenida',
      meta: { programa: 'IEN 30 Días', tienda: usuariosDemo[i].tienda.nombre_tienda },
      fecha_envio: new Date(cfg.fecha_inicio),
      estado: 'enviado'
    });

    if (cfg.hitos.length > 0) {
      const ultimoHito = cfg.hitos[cfg.hitos.length - 1];
      historialData.push({
        usuario_id: u._id,
        email_destino: u.email,
        tipo_correo: 'hito',
        meta: { dia: ultimoHito, racha: cfg.racha_max },
        fecha_envio: diaFecha(ultimoHito, cfg.fecha_inicio),
        estado: 'enviado'
      });
    }
  }

  // Correos de esta semana (14-20 Julio 2026) – mucha actividad
  // Recordatorio diario: 2-3 usuarios por día de la semana
  const semana = [
    { dia: 14, usuarios: [2, 5, 8] },
    { dia: 15, usuarios: [0, 3, 6, 9] },
    { dia: 16, usuarios: [1, 4, 7, 10] },
    { dia: 17, usuarios: [2, 5, 8, 11] },
    { dia: 18, usuarios: [0, 3, 6, 9] },
    { dia: 19, usuarios: [1, 4, 7, 10, 12] },
    { dia: 20, usuarios: [0, 2, 3, 6, 8, 9, 13] }
  ];

  for (const s of semana) {
    for (const uid of s.usuarios) {
      const userCfg = planesConfig.find(p => p.idx === uid);
      if (userCfg) {
        historialData.push({
          usuario_id: usuariosCreados[uid]._id,
          email_destino: usuariosCreados[uid].email,
          tipo_correo: 'recordatorio_diario',
          meta: { dia: userCfg.dia_actual },
          fecha_envio: new Date(`2026-07-${String(s.dia).padStart(2, '0')}T10:00:00`),
          estado: 'enviado'
        });
      }
    }
  }

  // Otros tipos de correo esta semana
  historialData.push(
    { usuario_id: usuariosCreados[1]._id, email_destino: usuariosCreados[1].email, tipo_correo: 'racha_rota',             meta: { dia: 3 },  fecha_envio: new Date('2026-07-14T09:00:00'), estado: 'enviado' },
    { usuario_id: usuariosCreados[3]._id, email_destino: usuariosCreados[3].email, tipo_correo: 'racha_rota',             meta: { dia: 7 },  fecha_envio: new Date('2026-07-15T09:00:00'), estado: 'enviado' },
    { usuario_id: usuariosCreados[6]._id, email_destino: usuariosCreados[6].email, tipo_correo: 'racha_rota',             meta: { dia: 14 }, fecha_envio: new Date('2026-07-16T09:00:00'), estado: 'enviado' },
    { usuario_id: usuariosCreados[7]._id, email_destino: usuariosCreados[7].email, tipo_correo: 'urgencia_activacion',    meta: { inactivo: '3 días' }, fecha_envio: new Date('2026-07-17T11:00:00'), estado: 'enviado' },
    { usuario_id: usuariosCreados[8]._id, email_destino: usuariosCreados[8].email, tipo_correo: 'recuperacion_inactividad', meta: { inactivo: '5 días' }, fecha_envio: new Date('2026-07-18T11:00:00'), estado: 'enviado' },
    { usuario_id: usuariosCreados[4]._id, email_destino: usuariosCreados[4].email, tipo_correo: 'hito',                  meta: { dia: 15 }, fecha_envio: new Date('2026-07-19T08:00:00'), estado: 'enviado' },
    { usuario_id: usuariosCreados[5]._id, email_destino: usuariosCreados[5].email, tipo_correo: 'hito',                  meta: { dia: 15 }, fecha_envio: new Date('2026-07-17T08:00:00'), estado: 'enviado' },
    { usuario_id: usuariosCreados[9]._id, email_destino: usuariosCreados[9].email, tipo_correo: 'hito',                  meta: { dia: 25 }, fecha_envio: new Date('2026-07-14T08:00:00'), estado: 'enviado' },
    { usuario_id: usuariosCreados[10]._id, email_destino: usuariosCreados[10].email, tipo_correo: 'hito',                meta: { dia: 30 }, fecha_envio: new Date('2026-07-19T08:00:00'), estado: 'enviado' },
    { usuario_id: usuariosCreados[11]._id, email_destino: usuariosCreados[11].email, tipo_correo: 'hito',                meta: { dia: 30 }, fecha_envio: new Date('2026-07-20T08:00:00'), estado: 'enviado' },
    { usuario_id: usuariosCreados[12]._id, email_destino: usuariosCreados[12].email, tipo_correo: 'recordatorio_diario', meta: { dia: 1 },  fecha_envio: new Date('2026-07-19T10:00:00'), estado: 'enviado' },
    { usuario_id: usuariosCreados[13]._id, email_destino: usuariosCreados[13].email, tipo_correo: 'bienvenida',          meta: { programa: 'IEN 30 Días' }, fecha_envio: new Date('2026-07-20T08:00:00'), estado: 'enviado' }
  );

  await HistorialCorreo.insertMany(historialData);
  console.log(`${historialData.length} correos de historial creados`);

  // 8. Contenidos diarios
  const ESCALA_LIKERT = [
    { valor: 1, etiqueta: 'Nunca' },
    { valor: 2, etiqueta: 'Raramente' },
    { valor: 3, etiqueta: 'A veces' },
    { valor: 4, etiqueta: 'Frecuentemente' },
    { valor: 5, etiqueta: 'Siempre' }
  ];

  function inferirTipoPaso(texto, ejercicioTipo) {
    if (ejercicioTipo === 'practica') {
      return { respuesta_tipo: 'accion' };
    }
    const match = texto.match(/\(escala\s*(\d+)\s*[-–]\s*(\d+)\)/i);
    if (match) {
      return { respuesta_tipo: 'escala', min: parseInt(match[1]), max: parseInt(match[2]) };
    }
    if (/escala\s*1-10/i.test(texto) || /nivel\s*1-10/i.test(texto) || /___\/10/.test(texto)) {
      return { respuesta_tipo: 'escala', min: 1, max: 10 };
    }
    if (ejercicioTipo === 'reflexion') {
      return { respuesta_tipo: 'abierta' };
    }
    return { respuesta_tipo: 'abierta' };
  }

  const contenidosConTipo = CONTENIDOS.map(c => {
    const ejercicio = c.datos_leccion?.ejercicio;

    if (ejercicio?.pasos && Array.isArray(ejercicio.pasos)) {
      ejercicio.pasos = ejercicio.pasos.map(p => {
        if (typeof p === 'string') {
          const tipo = inferirTipoPaso(p, ejercicio.tipo);
          return { texto: p, ...tipo };
        }
        return p;
      });
    }

    return {
      ...c,
      respuesta_tipo: ejercicio?.respuesta_tipo ?? 'abierta'
    };
  });

  const preguntasConLabel = TEST_PREGUNTAS.map(p => ({
    ...p,
    competencia_label: COMPETENCIA_LABELS[p.competencia],
    tipo_respuesta: 'escala',
    opciones: ESCALA_LIKERT
  }));
  await TestPregunta.insertMany(preguntasConLabel);
  console.log(`${preguntasConLabel.length} preguntas de test creadas`);

  await ContenidoDiario.insertMany(contenidosConTipo);
  console.log(`${CONTENIDOS.length} contenidos diarios creados`);

  await ContenidoEspecial.insertMany(CONTENIDOS_ESPECIALES);
  console.log(`${CONTENIDOS_ESPECIALES.length} contenidos especiales creados`);

  // Verificación de conteos
  const [countPreguntas, countEspeciales, countProductos, countCodigos, countPlanes, countUsuarios, countHistorial] = await Promise.all([
    TestPregunta.countDocuments(),
    ContenidoEspecial.countDocuments(),
    Producto.countDocuments(),
    Codigo.countDocuments(),
    PlanProgreso.countDocuments(),
    Usuario.countDocuments(),
    HistorialCorreo.countDocuments()
  ]);
  console.log('\n--- Verificación de conteos ---');
  console.log(`Usuarios = ${countUsuarios}`);
  console.log(`TestPregunta = ${countPreguntas}`);
  console.log(`ContenidoEspecial = ${countEspeciales}`);
  console.log(`Producto = ${countProductos}`);
  console.log(`Código = ${countCodigos}`);
  console.log(`PlanProgreso = ${countPlanes}`);
  console.log(`HistorialCorreo = ${countHistorial}`);

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








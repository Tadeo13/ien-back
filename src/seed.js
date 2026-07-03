require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Tienda = require('./models/Tienda');
const Usuario = require('./models/Usuario');
const ContenidoDiario = require('./models/ContenidoDiario');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado a MongoDB');

  // Limpiar colecciones
  await Promise.all([
    Tienda.deleteMany({}),
    Usuario.deleteMany({}),
    ContenidoDiario.deleteMany({})
  ]);
  console.log('Colecciones limpiadas');

  // Tiendas
  const tiendas = await Tienda.insertMany([
    { nombre_tienda: 'Tienda Centro', ciudad: 'Ciudad de México', codigo_activacion: 'IEN-001' },
    { nombre_tienda: 'Tienda Norte', ciudad: 'Monterrey', codigo_activacion: 'IEN-002' },
    { nombre_tienda: 'Tienda Sur', ciudad: 'Guadalajara', codigo_activacion: 'IEN-003' }
  ]);
  console.log(`${tiendas.length} tiendas creadas`);

  // Admin
  const password_hash = await bcrypt.hash('admin123', 10);
  const admin = await Usuario.create({
    nombre: 'Admin',
    email: 'admin@ien.test',
    password_hash,
    rol: 'admin'
  });
  console.log(`Admin creado: admin@ien.test / admin123`);

  // Contenidos diarios (30 días)
  const contenidos = [];
  const titulos = [
    'Autoconciencia emocional',
    'Identificación de emociones básicas',
    'El semáforo emocional',
    'Gestión de la ira',
    'Empatía básica',
    'Comunicación asertiva',
    'Manejo del estrés',
    'Respiración consciente',
    'Pensamiento positivo',
    'Resiliencia',
    'Autoestima',
    'Lenguaje corporal',
    'Escucha activa',
    'Solución de conflictos',
    'Toma de decisiones',
    'Automotivación',
    'Gratitud',
    'Mindfulness',
    'Gestión del tiempo',
    'Metas personales',
    'Relaciones saludables',
    'Asertividad avanzada',
    'Regulación emocional',
    'Flexibilidad cognitiva',
    'Tolerancia a la frustración',
    'Compasión',
    'Liderazgo emocional',
    'Trabajo en equipo',
    'Inteligencia social',
    'Cierre del programa'
  ];

  for (let i = 0; i < 30; i++) {
    contenidos.push({
      dia_numero: i + 1,
      titulo_modulo: `Día ${i + 1}: ${titulos[i]}`,
      tipo_contenido: i % 2 === 0 ? 'instructivo' : 'cuestionario',
      emociones_objetivo: ['alegría', 'tristeza', 'ira', 'miedo'].slice(0, (i % 4) + 1),
      datos_leccion: {
        contenido: `Lección para el día ${i + 1}: ${titulos[i]}. Explora los conceptos clave y realiza las actividades propuestas.`,
        recursos: [`https://ejemplo.com/dia-${i + 1}`]
      }
    });
  }

  await ContenidoDiario.insertMany(contenidos);
  console.log(`${contenidos.length} contenidos diarios creados`);

  console.log('\nSeed completado exitosamente');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});

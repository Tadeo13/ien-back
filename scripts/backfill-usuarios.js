/**
 * Backfill de usuarios existentes sin tienda_id/codigo_activacion.
 *
 * Busca usuarios sin tienda_id y, si tienen un PlanProgreso con codigo_utilizado,
 * resuelve la tienda y persiste los campos. Idempotente.
 *
 * Uso: node scripts/backfill-usuarios.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Usuario = require('../src/models/Usuario');
const PlanProgreso = require('../src/models/PlanProgreso');
const Tienda = require('../src/models/Tienda');

async function backfill() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado a MongoDB');

  const usuarios = await Usuario.find({ tienda_id: { $exists: false } });
  console.log(`Usuarios sin tienda_id: ${usuarios.length}`);

  let actualizados = 0;
  let sinPlan = 0;

  for (const u of usuarios) {
    const plan = await PlanProgreso.findOne({ usuario_id: u._id }).sort({ fecha_inicio: -1 }).lean();

    if (plan && plan.codigo_utilizado) {
      const tienda = await Tienda.findOne({ codigo_activacion: plan.codigo_utilizado }).lean();
      if (tienda) {
        u.tienda_id = tienda._id;
        u.codigo_activacion = plan.codigo_utilizado;
        await u.save();
        actualizados++;
        console.log(`  ✓ ${u.email} → tienda: ${tienda.nombre_tienda} (${plan.codigo_utilizado})`);
      }
    } else {
      sinPlan++;
      console.log(`  ✗ ${u.email} → sin plan, sin tienda (omitiendo)`);
    }
  }

  console.log(`\nResumen: ${actualizados} actualizados, ${sinPlan} sin plan (sin cambios)`);
  await mongoose.disconnect();
  process.exit(0);
}

backfill().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

const { panelAdminPorTienda, crearAdminNegocio } = require('../services/adminService');
const { tryCatch } = require('../middlewares/errorHandler');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const PlanProgreso = require('../models/PlanProgreso');
const { getInicioDeDiaDeHoy, getFechaHaceDias } = require('../utils/fechas');

// ─── Existente ────────────────────────────────────────────────────────────────

exports.metrics = tryCatch(async (req, res) => {
  const data = await panelAdminPorTienda(req.tiendasPermitidas);
  res.json(data);
});

// ─── Fase C — Pacientes ───────────────────────────────────────────────────────

/**
 * Verifica que el paciente exista y que el admin tenga scope sobre su tienda.
 * Devuelve el documento de usuario con tienda_id y producto_id poblados.
 */
async function obtenerPacienteConScope(usuarioId, tiendasPermitidas) {
  if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
    throw new AppError(400, 'ID de usuario inválido');
  }

  const usuario = await Usuario.findById(usuarioId)
    .select('-password_hash')
    .populate('tienda_id', 'nombre_tienda ciudad')
    .populate('producto_id', 'nombre descripcion');

  if (!usuario) throw new AppError(404, 'Paciente no encontrado');

  if (tiendasPermitidas !== null && usuario.tienda_id) {
    const enScope = tiendasPermitidas.some(
      (t) => t.toString() === usuario.tienda_id._id.toString()
    );
    if (!enScope) throw new AppError(404, 'Paciente no encontrado');
  }

  return usuario;
}

/**
 * GET /admin/pacientes/:usuarioId/perfil
 * Retorna identidad del paciente + tienda/producto.
 */
exports.perfilPaciente = tryCatch(async (req, res) => {
  const usuario = await obtenerPacienteConScope(req.params.usuarioId, req.tiendasPermitidas);

  res.json({
    id: usuario._id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    fecha_registro: usuario.fecha_registro,
    tienda: usuario.tienda_id ?? null,
    producto: usuario.producto_id ?? null
  });
});

/**
 * GET /admin/pacientes/:usuarioId/progreso
 * Retorna el plan de progreso activo (o el más reciente) del paciente.
 */
exports.progresoPaciente = tryCatch(async (req, res) => {
  await obtenerPacienteConScope(req.params.usuarioId, req.tiendasPermitidas);

  const plan = await PlanProgreso.findOne({ usuario_id: req.params.usuarioId })
    .sort({ fecha_inicio: -1 })
    .select('estado dia_actual racha_dias racha_maxima hitos_alcanzados fecha_inicio ultima_fecha_actividad test_inicial progreso_diario');

  if (!plan) throw new AppError(404, 'El paciente no tiene plan de progreso');

  res.json(plan);
});

// ─── Fase C — Reportes ────────────────────────────────────────────────────────

/**
 * Construye el filtro de tienda según el scope del admin.
 */
function filtroTiendas(tiendasPermitidas) {
  return tiendasPermitidas === null ? {} : { tienda_id: { $in: tiendasPermitidas } };
}

/**
 * GET /admin/reportes/usuarios
 * Conteos de usuarios registrados y planes activos en distintos períodos.
 */
exports.reporteUsuarios = tryCatch(async (req, res) => {
  const hoy = getInicioDeDiaDeHoy();
  const hace7dias = getFechaHaceDias(7);

  // Filtro base por scope de tienda
  const baseFiltro = filtroTiendas(req.tiendasPermitidas);

  const [
    totalRegistrados,
    registradosHoy,
    registradosSemanal,
    planesActivos,
    planesActivosHoy,
    planesActivosSemanal
  ] = await Promise.all([
    // Registrados
    Usuario.countDocuments({ ...baseFiltro, rol: 'usuario' }),
    Usuario.countDocuments({ ...baseFiltro, rol: 'usuario', fecha_registro: { $gte: hoy } }),
    Usuario.countDocuments({ ...baseFiltro, rol: 'usuario', fecha_registro: { $gte: hace7dias } }),
    // Planes activos (usuarios que completaron al menos un día)
    PlanProgreso.countDocuments({ ...filtroTiendas(req.tiendasPermitidas), estado: 'activo' }),
    PlanProgreso.countDocuments({ ...filtroTiendas(req.tiendasPermitidas), estado: 'activo', ultima_fecha_actividad: { $gte: hoy } }),
    PlanProgreso.countDocuments({ ...filtroTiendas(req.tiendasPermitidas), estado: 'activo', ultima_fecha_actividad: { $gte: hace7dias } })
  ]);

  res.json({
    registrados: {
      total: totalRegistrados,
      hoy: registradosHoy,
      semanal: registradosSemanal
    },
    activos: {
      total: planesActivos,
      hoy: planesActivosHoy,
      semanal: planesActivosSemanal
    }
  });
});

/**
 * GET /admin/reportes/usuarios/grafica-semanal
 * Retorna [{ fecha: 'YYYY-MM-DD', cantidad: N }] para los últimos 7 días.
 * Cuenta planes con ultima_fecha_actividad en ese día calendario (UTC).
 */
exports.graficaSemanal = tryCatch(async (req, res) => {
  const hoy = getInicioDeDiaDeHoy();
  const scopeFiltro = filtroTiendas(req.tiendasPermitidas);

  // Generar los 7 días (de 6 días atrás hasta hoy)
  const dias = Array.from({ length: 7 }, (_, i) => {
    const inicio = new Date(hoy.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const fin = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);
    return { inicio, fin };
  });

  const resultados = await Promise.all(
    dias.map(async ({ inicio, fin }) => {
      const cantidad = await PlanProgreso.countDocuments({
        ...scopeFiltro,
        ultima_fecha_actividad: { $gte: inicio, $lt: fin }
      });
      const fecha = inicio.toISOString().split('T')[0];
      return { fecha, cantidad };
    })
  );

  res.json(resultados);
});

// ─── Admin General — Usuarios ─────────────────────────────────────────────────

/**
 * POST /admin/usuarios/admin-negocio — solo admin_general
 */
exports.crearAdminNegocio = tryCatch(async (req, res) => {
  if (req.usuario.rol !== 'admin_general') {
    throw new AppError(403, 'Solo admin_general puede crear administradores de negocio');
  }

  const result = await crearAdminNegocio(req.body);
  res.status(201).json(result);
});

// ─── Admin — Listar pacientes ─────────────────────────────────────────────────

/**
 * GET /admin/pacientes
 * Lista pacientes con scoping de tienda y estado del plan.
 */
exports.listarPacientes = tryCatch(async (req, res) => {
  const pagina = Math.max(parseInt(req.query.page) || 1, 1);
  const limite = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const skip = (pagina - 1) * limite;

  const filtro = { ...filtroTiendas(req.tiendasPermitidas), rol: 'usuario' };

  const [usuarios, total] = await Promise.all([
    Usuario.find(filtro)
      .populate('tienda_id', 'nombre_tienda ciudad')
      .select('nombre email fecha_registro tienda_id')
      .sort({ fecha_registro: -1 })
      .skip(skip)
      .limit(limite)
      .lean(),
    Usuario.countDocuments(filtro)
  ]);

  const ids = usuarios.map(u => u._id);
  const planes = await PlanProgreso.find({ usuario_id: { $in: ids } })
    .sort({ fecha_inicio: -1 })
    .select('usuario_id estado dia_actual racha_dias')
    .lean();

  const planesMap = new Map();
  for (const p of planes) {
    if (!planesMap.has(p.usuario_id.toString())) {
      planesMap.set(p.usuario_id.toString(), p);
    }
  }

  res.json({
    pacientes: usuarios.map(u => ({
      id: u._id,
      nombre: u.nombre,
      email: u.email,
      fecha_registro: u.fecha_registro,
      tienda: u.tienda_id ? { id: u.tienda_id._id, nombre: u.tienda_id.nombre_tienda } : null,
      plan: planesMap.has(u._id.toString())
        ? {
            estado: planesMap.get(u._id.toString()).estado,
            dia_actual: planesMap.get(u._id.toString()).dia_actual,
            racha_dias: planesMap.get(u._id.toString()).racha_dias
          }
        : null
    })),
    total,
    pagina
  });
});

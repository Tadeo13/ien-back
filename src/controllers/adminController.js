const { panelAdminPorTienda } = require('../services/adminService');
const { tryCatch } = require('../middlewares/errorHandler');

exports.metrics = tryCatch(async (_req, res) => {
  const data = await panelAdminPorTienda();
  res.json(data);
});

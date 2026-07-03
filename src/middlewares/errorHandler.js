const AppError = require('../utils/AppError');

function tryCatch(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: 'Error del servidor' });
}

module.exports = { tryCatch, errorHandler, AppError };

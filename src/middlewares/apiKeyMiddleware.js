const AppError = require('../utils/AppError');

function apiKeyMiddleware(req, _res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.CRON_API_KEY) {
    return next(new AppError(401, 'API key requerida o inválida'));
  }

  next();
}

module.exports = apiKeyMiddleware;

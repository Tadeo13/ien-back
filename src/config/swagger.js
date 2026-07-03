const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IEN API',
      version: '1.0.0',
      description: 'API del programa IEN (Inteligencia Emocional)'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local' }
    ],
    tags: [
      { name: 'Auth', description: 'Autenticación y registro' },
      { name: 'Plan', description: 'Plan del usuario' },
      { name: 'Admin', description: 'Panel de administración' },
      { name: 'Jobs', description: 'Tareas internas (cron)' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido al login/registro'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key para endpoints internos (cron jobs)'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);

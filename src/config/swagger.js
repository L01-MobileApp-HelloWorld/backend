const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Load file swagger.yaml
const swaggerDocument = YAML.load(path.join(__dirname, '../../swagger.yaml'));

// Cấu hình Swagger UI
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { 
      background-color: #0D0D14; 
    }
    .swagger-ui .topbar .download-url-wrapper .select-label {
      color: #fff;
    }
    .swagger-ui .info .title {
      color: #9B5DE5;
    }
    .swagger-ui .scheme-container {
      background-color: #1a1a2e;
    }
  `,
  customSiteTitle: 'Bận hay Lười? API Docs',
  customfavIcon: 'https://emojicdn.elk.sh/🤔',
};

/**
 * Setup Swagger cho Express app
 * @param {Express} app
 */
const setupSwagger = (app) => {
  // Swagger UI endpoint
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, swaggerOptions)
  );

  // Endpoint để lấy raw swagger JSON (cho Postman import)
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });

  console.log('📚 Swagger docs available at /api-docs');
  console.log('📄 Swagger JSON available at /api-docs.json');
};

module.exports = setupSwagger;
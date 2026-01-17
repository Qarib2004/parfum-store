import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Application } from 'express';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Perfume Shop API',
      version: '1.0.0',
      description: 'API documentation',
      contact: {
        name: 'API Support',
        email: 'support@perfumeshop.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT || 5000}`,
        description: 'Development server',
      },
      {
        url: env.FRONTEND_URL,
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            username: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['USER', 'OWNER', 'ADMIN'],
            },
            avatar: {
              type: 'string',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            brand: {
              type: 'string',
            },
            slug: {
              type: 'string',
            },
            volume: {
              type: 'number',
            },
            fragranceType: {
              type: 'string',
            },
            quantity: {
              type: 'number',
            },
            price: {
              type: 'number',
            },
            description: {
              type: 'string',
              nullable: true,
            },
            imageUrl: {
              type: 'string',
              nullable: true,
            },
            ownerId: {
              type: 'string',
              format: 'uuid',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Shop: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            slug: {
              type: 'string',
            },
            description: {
              type: 'string',
              nullable: true,
            },
            address: {
              type: 'string',
              nullable: true,
            },
            logoUrl: {
              type: 'string',
              nullable: true,
            },
            ownerId: {
              type: 'string',
              format: 'uuid',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Application) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Perfume Shop API Docs',
  }));

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`📚 Swagger docs available at http://localhost:${env.PORT || 5000}/api-docs`);
};

export default swaggerSpec;
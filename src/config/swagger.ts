import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Cotação - API',
      version: '1.0.0',
      description: 'API para gerenciamento de cotações, fornecedores e pedidos de compra',
      contact: {
        name: 'Suporte',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1',
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
        PharmacyQuantities: {
          type: 'object',
          properties: {
            JR: { type: 'number' },
            GS: { type: 'number' },
            BARAO: { type: 'number' },
            LB: { type: 'number' },
          },
        },
        QuotationItem: {
          type: 'object',
          properties: {
            productId: { type: 'number' },
            quantities: { $ref: '#/components/schemas/PharmacyQuantities' },
            totalQuantity: { type: 'number' },
          },
        },
        QuotationRequest: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'open', 'closed', 'completed'] },
            deadline: { type: 'string', format: 'date-time' },
            items: { type: 'array', items: { $ref: '#/components/schemas/QuotationItem' } },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        SupplierQuotation: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            accessToken: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'in_progress', 'submitted'] },
            supplier: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                supplier_name: { type: 'string' },
              },
            },
          },
        },
        PurchaseOrder: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            orderNumber: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'confirmed', 'sent', 'delivered'] },
            totalValue: { type: 'number' },
            supplier: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                supplier_name: { type: 'string' },
              },
            },
          },
        },
        ComparisonSummary: {
          type: 'object',
          properties: {
            quotationId: { type: 'number' },
            quotationName: { type: 'string' },
            totalProducts: { type: 'number' },
            respondedSuppliers: { type: 'number' },
            totalSuppliers: { type: 'number' },
            maxSavings: { type: 'number' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autenticação' },
      { name: 'Quotations', description: 'Gerenciamento de cotações' },
      { name: 'Orders', description: 'Gerenciamento de pedidos' },
      { name: 'Public', description: 'Rotas públicas para fornecedores' },
      { name: 'Products', description: 'Gerenciamento de produtos' },
      { name: 'Suppliers', description: 'Gerenciamento de fornecedores' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/docs/*.yaml'],
};

export const swaggerSpec = swaggerJsdoc(options);
